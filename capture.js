/* Browser-only camera/OCR adapters. Images stay on this device. Engines are self-hosted. */
(() => {
  "use strict";
  const scripts = new Map();
  function loadScript(file, global) {
    if (window[global]) return Promise.resolve(window[global]);
    if (scripts.has(file)) return scripts.get(file);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = file;
      script.async = true;
      const timer = setTimeout(() => fail(), 30000);
      const fail = () => {
        clearTimeout(timer);
        script.remove();
        scripts.delete(file);
        reject(
          Error(
            "Não foi possível preparar o leitor. Conecte-se à internet e tente novamente.",
          ),
        );
      };
      script.onload = () => {
        clearTimeout(timer);
        if (window[global]) resolve(window[global]);
        else fail();
      };
      script.onerror = fail;
      document.head.append(script);
    });
    scripts.set(file, promise);
    return promise;
  }
  const abortError = () => new DOMException("Leitura cancelada", "AbortError");
  async function scanBarcode(video, { signal, onResult, onStatus = () => {} }) {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
      throw Error(
        "A câmera precisa de HTTPS e de um navegador com acesso à câmera. Use uma foto ou digite o código.",
      );
    let closed = false,
      stream,
      controls,
      timer,
      playbackTimer;
    const stop = () => {
      closed = true;
      clearTimeout(timer);
      clearTimeout(playbackTimer);
      try {
        controls?.stop();
      } catch {}
      stream?.getTracks().forEach((t) => t.stop());
      video.pause();
      video.srcObject = null;
    };
    signal?.addEventListener("abort", stop, { once: true });
    try {
      if (signal?.aborted) throw abortError();
      onStatus("Permita o acesso à câmera para continuar.");
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (closed || signal?.aborted) {
        stop();
        throw abortError();
      }
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      onStatus("Abrindo a câmera…");
      await Promise.race([
        video.play(),
        new Promise((resolve, reject) => {
          playbackTimer = setTimeout(
            () =>
              reject(
                Error(
                  "A câmera não iniciou. Tente novamente ou use uma foto/código digitado.",
                ),
              ),
            12000,
          );
        }),
      ]);
      clearTimeout(playbackTimer);
      if (closed) {
        stop();
        throw abortError();
      }
      const found = (raw, format) => {
        const value = window.NutriLabel.barcodeValue(raw, format);
        if (!closed && value) {
          stop();
          onResult(value);
        }
      };
      const ZXing = await loadScript(
        "./vendor/zxing-browser.min.js",
        "ZXingBrowser",
      );
      if (closed) throw abortError();
      onStatus(
        "Aponte para o código de barras. Mantenha a embalagem firme e bem iluminada.",
      );
      const reader = new ZXing.BrowserMultiFormatOneDReader();
      controls = await reader.decodeFromVideoElement(video, (result) => {
        if (result) found(result.getText(), result.getBarcodeFormat());
      });
      if (closed) {
        controls.stop();
        return stop;
      }
      timer = setTimeout(() => {
        if (!closed) {
          stop();
          onStatus(
            "Não encontrei um código. Tente outra posição, envie uma foto ou digite os números.",
          );
        }
      }, 45000);
      return stop;
    } catch (error) {
      stop();
      signal?.removeEventListener("abort", stop);
      if (error.name === "NotAllowedError")
        throw Error(
          "A câmera não foi permitida. Libere o acesso nas configurações do navegador ou use uma foto/código digitado.",
        );
      if (error.name === "NotFoundError")
        throw Error(
          "Não encontrei uma câmera. Use uma foto ou digite o código.",
        );
      throw error;
    }
  }
  async function imageCanvas(file) {
    if (!file || file.size > 20 * 1024 * 1024)
      throw Error("Escolha uma imagem de até 20 MB.");
    const url = URL.createObjectURL(file),
      image = new Image();
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () =>
          reject(
            Error(
              "Não consegui abrir essa imagem. Tente uma foto em JPEG ou PNG.",
            ),
          );
        image.src = url;
      });
      if (image.naturalWidth * image.naturalHeight > 50000000)
        throw Error(
          "A imagem é muito grande. Recorte a tabela e tente novamente.",
        );
      const scale = Math.min(
          1,
          2200 / Math.max(image.naturalWidth, image.naturalHeight),
        ),
        canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  function cropCanvas(source, rect = { x: 0, y: 0, width: 1, height: 1 }) {
    const x = Math.max(0, Math.min(0.98, rect.x)),
      y = Math.max(0, Math.min(0.98, rect.y)),
      width = Math.min(1 - x, rect.width),
      height = Math.min(1 - y, rect.height);
    if (width <= 0 || height <= 0)
      throw Error("Selecione uma área válida da imagem.");
    const cropped = document.createElement("canvas");
    cropped.width = Math.max(1, Math.round(source.width * width));
    cropped.height = Math.max(1, Math.round(source.height * height));
    cropped
      .getContext("2d")
      .drawImage(
        source,
        source.width * x,
        source.height * y,
        source.width * width,
        source.height * height,
        0,
        0,
        cropped.width,
        cropped.height,
      );
    return cropped;
  }
  function rotateCanvas(source) {
    const rotated = document.createElement("canvas");
    rotated.width = source.height;
    rotated.height = source.width;
    const context = rotated.getContext("2d");
    context.translate(rotated.width, 0);
    context.rotate(Math.PI / 2);
    context.drawImage(source, 0, 0);
    return rotated;
  }
  async function barcodeImage(file, { signal } = {}) {
    const canvas = await imageCanvas(file),
      ZXing = await loadScript("./vendor/zxing-browser.min.js", "ZXingBrowser");
    if (signal?.aborted) throw abortError();
    const result = new ZXing.BrowserMultiFormatOneDReader().decodeFromCanvas(
      canvas,
    );
    const code = window.NutriLabel.barcodeValue(
      result.getText(),
      result.getBarcodeFormat(),
    );
    if (!code)
      throw Error(
        "Não identifiquei um código de produto válido. Tente uma foto mais nítida ou digite os números.",
      );
    return code;
  }
  async function recognizeLabel(
    canvas,
    { signal, onProgress = () => {} } = {},
  ) {
    if (signal?.aborted) throw abortError();
    onProgress("Preparando o leitor no aparelho…");
    const Tesseract = await loadScript(
      "./vendor/tesseract.min.js",
      "Tesseract",
    );
    if (signal?.aborted) throw abortError();
    // Confirm full assets are available before spawning the OCR worker. This also
    // prepares both CPU variants for later offline use and makes failures cancellable.
    try {
      await Promise.all(
        [
          "./vendor/core/tesseract-core-lstm.wasm.js",
          "./vendor/core/tesseract-core-simd-lstm.wasm.js",
          "./vendor/lang/por.traineddata.gz",
        ].map(async (file) => {
          const response = await fetch(file, {
            signal,
            credentials: "same-origin",
          });
          if (!response.ok) throw Error("Leitor indisponível");
          await response.arrayBuffer();
        }),
      );
    } catch (error) {
      if (signal?.aborted) throw abortError();
      throw Error(
        "Não foi possível preparar o leitor. Conecte-se à internet e tente novamente. A foto não foi enviada.",
      );
    }
    let worker,
      stopped = false,
      creation,
      rejectCancel;
    const cancelled = new Promise((resolve, reject) => {
      rejectCancel = reject;
    });
    const terminate = () => {
      stopped = true;
      worker?.terminate().catch(() => {});
      rejectCancel(abortError());
    };
    signal?.addEventListener("abort", terminate, { once: true });
    const timeout = setTimeout(() => {
      stopped = true;
      worker?.terminate().catch(() => {});
      rejectCancel(
        Error(
          "A leitura demorou muito. Tente um recorte menor ou use o texto da tabela.",
        ),
      );
    }, 90000);
    try {
      creation = Tesseract.createWorker("por", 1, {
        workerPath: new URL("./vendor/tesseract-worker.min.js", location.href)
          .href,
        corePath: new URL("./vendor/core/", location.href).href,
        langPath: new URL("./vendor/lang", location.href).href,
        workerBlobURL: false,
        errorHandler: () =>
          rejectCancel(
            Error(
              "Não foi possível ler a imagem. Tente outra foto ou use o texto da tabela.",
            ),
          ),
        logger: (message) => {
          if (!stopped)
            onProgress(
              message.status === "recognizing text"
                ? "Lendo a tabela… " + Math.round(message.progress * 100) + "%"
                : "Preparando o leitor no aparelho…",
            );
        },
      });
      creation
        .then((created) => {
          if (stopped) created.terminate().catch(() => {});
        })
        .catch(() => {});
      worker = await Promise.race([creation, cancelled]);
      if (stopped || signal?.aborted) throw abortError();
      await worker.setParameters({
        preserve_interword_spaces: "1",
        user_defined_dpi: "300",
      });
      const { data } = await Promise.race([
        worker.recognize(canvas),
        cancelled,
      ]);
      if (stopped || signal?.aborted) throw abortError();
      return { text: data.text, confidence: data.confidence };
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", terminate);
      stopped = true;
      if (worker) await worker.terminate();
    }
  }
  window.NutriCapture = {
    scanBarcode,
    barcodeImage,
    imageCanvas,
    cropCanvas,
    rotateCanvas,
    recognizeLabel,
  };
})();
