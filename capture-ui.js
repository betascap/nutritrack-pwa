/* Reader flows use app callbacks, keeping the stored diary independent of camera/OCR. */
"use strict";
window.createCaptureUI = function ({
  showModal,
  closeModal,
  onBarcode,
  onLabel,
  onManual,
  esc,
}) {
  const $ = (selector) => document.querySelector(selector);
  let dispose = () => {};
  function cleanup() {
    const previous = dispose;
    dispose = () => {};
    previous();
  }
  function barcodeModal() {
    showModal(
      '<div class="row between"><h2>Escanear código de barras</h2><button class="iconbtn" id="closeModal">×</button></div><p class="small muted">Enquadre o código inteiro, com as barras na vertical. A imagem fica neste aparelho; somente o código será usado para consultar o produto.</p><div class="camera-frame"><video id="barcodeVideo" autoplay muted playsinline aria-label="Prévia da câmera para código de barras"></video><div class="scan-guide" aria-hidden="true"></div></div><p class="note" id="scanStatus" role="status">Preparando câmera…</p><div class="capture-actions"><button class="primary" id="startScan">Ativar câmera</button><button class="secondary" id="barcodePhoto">Usar foto do código</button><button class="secondary" id="barcodeManual">Digitar código</button></div><input class="hidden" id="barcodeFile" type="file" accept="image/*"><button class="linkbtn" id="labelInstead">Fotografar tabela nutricional</button>',
    );
    const video = $("#barcodeVideo"),
      status = $("#scanStatus"),
      button = $("#startScan");
    let controller = new AbortController(),
      accepted = false,
      busy = false;
    const stop = () => controller.abort();
    dispose = stop;
    const accept = (code) => {
      if (accepted) return;
      accepted = true;
      stop();
      onBarcode(code);
    };
    const start = async () => {
      if (busy) return;
      stop();
      controller = new AbortController();
      const current = controller;
      busy = true;
      button.disabled = true;
      try {
        await window.NutriCapture.scanBarcode(video, {
          signal: current.signal,
          onResult: accept,
          onStatus: (text) => {
            if (status.isConnected && !current.signal.aborted) {
              status.textContent = text;
              button.textContent = "Reiniciar câmera";
            }
          },
        });
      } catch (error) {
        if (status.isConnected && error.name !== "AbortError")
          status.textContent =
            error.message ||
            "Não foi possível abrir a câmera. Use uma foto ou digite o código.";
      } finally {
        busy = false;
        if (button.isConnected) button.disabled = false;
      }
    };
    $("#closeModal").onclick = closeModal;
    button.onclick = start;
    $("#barcodePhoto").onclick = () => {
      stop();
      $("#barcodeFile").click();
    };
    $("#barcodeManual").onclick = () => {
      stop();
      onManual();
    };
    $("#labelInstead").onclick = () => labelModal();
    $("#barcodeFile").onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      controller = new AbortController();
      const current = controller;
      status.textContent = "Lendo a foto do código…";
      try {
        const code = await window.NutriCapture.barcodeImage(file, {
          signal: current.signal,
        });
        if (!current.signal.aborted) accept(code);
      } catch (error) {
        if (status.isConnected && error.name !== "AbortError")
          status.textContent =
            "Não consegui ler o código. Use uma foto mais nítida e enquadre todas as barras, ou digite os números.";
      } finally {
        event.target.value = "";
      }
    };
    const pause = () => {
      if (document.hidden) {
        stop();
        if (status.isConnected)
          status.textContent =
            "Câmera pausada. Toque em Ativar câmera para continuar.";
      }
    };
    document.addEventListener("visibilitychange", pause);
    window.addEventListener("pagehide", stop);
    dispose = () => {
      stop();
      document.removeEventListener("visibilitychange", pause);
      window.removeEventListener("pagehide", stop);
    };
    start();
  }
  function labelModal({ barcode, name = "" } = {}) {
    showModal(
      '<div class="row between"><h2>Fotografar tabela nutricional</h2><button class="iconbtn" id="closeModal">×</button></div><p class="small muted">Fotografe a tabela de perto, sem reflexos e com os números legíveis. A leitura acontece neste aparelho. A primeira leitura precisa de conexão para preparar o leitor.</p><div class="capture-actions"><button class="primary" id="takeLabelPhoto">Tirar foto da tabela</button><button class="secondary" id="chooseLabelPhoto">Escolher imagem</button></div><input class="hidden" id="labelCameraFile" type="file" accept="image/*" capture="environment"><input class="hidden" id="labelPhotoFile" type="file" accept="image/*"><div id="labelPhotoArea" class="hidden"><p class="small muted">Você pode arrastar sobre a foto para selecionar só a tabela.</p><div class="photo-stage" id="photoStage"><canvas id="labelCanvas" aria-label="Foto da tabela; arraste para recortar"></canvas><div class="crop-box hidden" id="cropBox" aria-hidden="true"></div></div><div class="capture-actions"><button class="secondary" id="rotateLabel">Girar foto</button><button class="secondary" id="resetCrop">Usar imagem inteira</button></div><p id="cropStatus" class="small muted" role="status">Será lida a imagem inteira.</p><button class="primary" id="readLabel" style="width:100%">Ler tabela nutricional</button></div><p id="labelStatus" class="note" role="status">Nenhuma foto selecionada.</p><button class="secondary hidden" id="cancelLabel">Cancelar leitura</button><details class="more-options"><summary>Usar texto da tabela</summary><div class="field"><label>Texto copiado ou digitado da tabela</label><textarea id="pasteLabelText" rows="5" placeholder="Valor energético (kcal) 120&#10;Carboidratos (g) 20&#10;Proteínas (g) 4&#10;Gorduras totais (g) 3"></textarea></div><button class="secondary" id="useLabelText">Conferir texto</button></details>',
    );
    const status = $("#labelStatus"),
      area = $("#labelPhotoArea"),
      stage = $("#photoStage"),
      preview = $("#labelCanvas"),
      box = $("#cropBox");
    let source = null,
      rect = null,
      controller = new AbortController(),
      busy = false,
      startPoint = null;
    dispose = () => {
      controller.abort();
      source = null;
      preview.width = preview.height = 1;
    };
    $("#closeModal").onclick = closeModal;
    $("#takeLabelPhoto").onclick = () => $("#labelCameraFile").click();
    $("#chooseLabelPhoto").onclick = () => $("#labelPhotoFile").click();
    const controls = (disabled) => {
      for (const id of [
        "takeLabelPhoto",
        "chooseLabelPhoto",
        "rotateLabel",
        "resetCrop",
        "readLabel",
        "useLabelText",
      ])
        if ($("#" + id)) $("#" + id).disabled = disabled;
      stage.style.pointerEvents = disabled ? "none" : "";
      $("#cancelLabel").classList.toggle("hidden", !disabled);
    };
    const draw = () => {
      preview.width = source.width;
      preview.height = source.height;
      preview.getContext("2d").drawImage(source, 0, 0);
      rect = null;
      box.classList.add("hidden");
      $("#cropStatus").textContent = "Será lida a imagem inteira.";
    };
    const selected = () => {
      if (!rect) return;
      Object.assign(box.style, {
        left: rect.x * 100 + "%",
        top: rect.y * 100 + "%",
        width: rect.width * 100 + "%",
        height: rect.height * 100 + "%",
      });
      box.classList.remove("hidden");
      $("#cropStatus").textContent =
        "Área selecionada. A leitura usará somente este recorte.";
    };
    const point = (event) => {
      const bounds = preview.getBoundingClientRect();
      return {
        x: Math.max(
          0,
          Math.min(1, (event.clientX - bounds.left) / bounds.width),
        ),
        y: Math.max(
          0,
          Math.min(1, (event.clientY - bounds.top) / bounds.height),
        ),
      };
    };
    stage.onpointerdown = (event) => {
      if (!source || busy) return;
      startPoint = point(event);
      stage.setPointerCapture(event.pointerId);
    };
    stage.onpointermove = (event) => {
      if (!startPoint) return;
      const end = point(event);
      rect = {
        x: Math.min(startPoint.x, end.x),
        y: Math.min(startPoint.y, end.y),
        width: Math.abs(end.x - startPoint.x),
        height: Math.abs(end.y - startPoint.y),
      };
      selected();
    };
    stage.onpointerup = () => {
      startPoint = null;
      if (rect && (rect.width < 0.04 || rect.height < 0.04)) {
        rect = null;
        box.classList.add("hidden");
        $("#cropStatus").textContent =
          "Recorte muito pequeno. Será lida a imagem inteira.";
      }
    };
    stage.onpointercancel = () => {
      startPoint = null;
    };
    const fileChanged = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      controller.abort();
      controller = new AbortController();
      const current = controller;
      status.textContent = "Preparando a foto…";
      try {
        const image = await window.NutriCapture.imageCanvas(file);
        if (current.signal.aborted) return;
        source = image;
        draw();
        area.classList.remove("hidden");
        status.textContent =
          "Confira a orientação e selecione a área da tabela, se necessário.";
      } catch (error) {
        if (status.isConnected && !current.signal.aborted)
          status.textContent = error.message;
      } finally {
        event.target.value = "";
      }
    };
    $("#labelCameraFile").onchange = fileChanged;
    $("#labelPhotoFile").onchange = fileChanged;
    $("#rotateLabel").onclick = () => {
      source = window.NutriCapture.rotateCanvas(source);
      draw();
    };
    $("#resetCrop").onclick = () => {
      rect = null;
      box.classList.add("hidden");
      $("#cropStatus").textContent = "Será lida a imagem inteira.";
    };
    $("#cancelLabel").onclick = () => {
      controller.abort();
      status.textContent = "Leitura cancelada. Você pode tentar outra foto.";
    };
    $("#readLabel").onclick = async () => {
      if (!source || busy) return;
      busy = true;
      controller.abort();
      controller = new AbortController();
      const current = controller;
      controls(true);
      try {
        const cropped = window.NutriCapture.cropCanvas(
          source,
          rect || undefined,
        );
        const result = await window.NutriCapture.recognizeLabel(cropped, {
          signal: current.signal,
          onProgress: (text) => {
            if (status.isConnected) status.textContent = text;
          },
        });
        if (current.signal.aborted) return;
        if (!result.text.trim()) {
          status.textContent =
            "Não encontrei texto. Tente uma foto mais nítida ou use o texto da tabela.";
          return;
        }
        reviewLabel(result.text, { barcode, name, image: cropped });
      } catch (error) {
        if (status.isConnected)
          status.textContent = current.signal.aborted
            ? "Leitura cancelada. Você pode tentar outra foto."
            : error.message ||
              "Não foi possível ler a tabela. Tente outra foto ou use o texto.";
      } finally {
        busy = false;
        if (status.isConnected) controls(false);
      }
    };
    $("#useLabelText").onclick = () => {
      const text = $("#pasteLabelText").value;
      if (!text.trim()) {
        status.textContent = "Cole ou digite o texto da tabela.";
        return;
      }
      reviewLabel(text, { barcode, name });
    };
  }
  function reviewLabel(text, { barcode, name = "", image } = {}) {
    showModal(
      '<div class="row between"><h2>Conferir leitura da tabela</h2><button class="iconbtn" id="closeModal">×</button></div><div class="note">Confira os números com a embalagem. Escolha a coluna de nutrientes e a base correspondente. <b>Não use a coluna %VD.</b> Nada foi salvo ainda.</div><div class="field"><label>Nome do alimento</label><input id="labelFoodName" value="' +
        esc(name) +
        '" placeholder="Ex.: Iogurte natural da marca"></div><div id="labelReference"></div><div class="field"><label>Qual coluna de valores deseja usar?</label><select id="labelColumn"><option value="">Escolha a coluna da tabela</option></select></div><div id="parsedLabelTable" class="label-table-scroll"></div><div id="labelWarnings" class="small muted" role="status"></div><div class="field"><label>A coluna escolhida corresponde a</label><select id="labelBaseMode"><option value="">Confirme a base no rótulo</option><option value="100g">100 g de alimento</option><option value="100ml">100 ml de bebida</option><option value="portion">Uma porção com outra quantidade</option></select></div><div id="labelPortion" class="grid2 hidden"><div class="field"><label>Quantidade da porção do rótulo</label><input id="labelServing" type="number" min="0.1" step="any" placeholder="Ex.: 30"></div><div class="field"><label>Unidade da porção</label><select id="labelUnit"><option value="g">g</option><option value="ml">ml</option></select></div></div><details class="more-options"><summary>Conferir ou corrigir texto reconhecido</summary><div class="field"><label>Texto reconhecido da tabela</label><textarea id="labelRawText" rows="8">' +
        esc(text) +
        '</textarea></div><button class="secondary" id="reparseLabel">Reinterpretar texto</button></details><p id="reviewLabelStatus" class="small muted" role="status"></p><button class="primary" id="confirmLabel" style="width:100%;margin-top:14px">Conferir valores do alimento</button><button class="linkbtn" id="retryLabelPhoto">Tentar outra foto</button>',
    );
    $("#closeModal").onclick = closeModal;
    $("#retryLabelPhoto").onclick = () =>
      labelModal({ barcode, name: $("#labelFoodName").value });
    if (image) {
      image.className = "label-reference";
      image.setAttribute("aria-label", "Foto da tabela usada na leitura");
      $("#labelReference").append(image);
    }
    let parsed;
    const draw = () => {
      parsed = window.NutriLabel.parseLabelText($("#labelRawText").value);
      const count = Math.min(
          4,
          Math.max(1, ...Object.values(parsed.rows).map((row) => row.length)),
        ),
        select = $("#labelColumn"),
        old = select.value;
      select.innerHTML =
        '<option value="">Escolha a coluna da tabela</option>' +
        Array.from(
          { length: count },
          (_, i) =>
            '<option value="' +
            i +
            '">' +
            (i + 1) +
            "ª coluna de valores</option>",
        ).join("");
      select.value = old;
      $("#parsedLabelTable").innerHTML =
        '<table class="label-table"><thead><tr><th>Nutriente</th>' +
        Array.from(
          { length: count },
          (_, i) => "<th>" + (i + 1) + "ª coluna</th>",
        ).join("") +
        "</tr></thead><tbody>" +
        [
          ["kcal", "Energia (kcal)"],
          ["p", "Proteína (g)"],
          ["c", "Carboidratos (g)"],
          ["f", "Gorduras totais (g)"],
        ]
          .map(
            ([key, title]) =>
              "<tr><th>" +
              title +
              "</th>" +
              Array.from(
                { length: count },
                (_, i) =>
                  '<td data-label-column="' +
                  i +
                  '">' +
                  (parsed.rows[key][i] === undefined ||
                  parsed.rows[key][i] === null
                    ? "—"
                    : new Intl.NumberFormat("pt-BR", {
                        maximumFractionDigits: 2,
                      }).format(parsed.rows[key][i])) +
                  "</td>",
              ).join("") +
              "</tr>",
          )
          .join("") +
        "</tbody></table>";
      $("#labelWarnings").textContent = parsed.warnings.join(" ");
      highlight();
    };
    const highlight = () =>
      document
        .querySelectorAll("[data-label-column]")
        .forEach((cell) =>
          cell.classList.toggle(
            "chosen-column",
            cell.dataset.labelColumn === $("#labelColumn").value,
          ),
        );
    $("#labelColumn").onchange = highlight;
    $("#labelBaseMode").onchange = () =>
      $("#labelPortion").classList.toggle(
        "hidden",
        $("#labelBaseMode").value !== "portion",
      );
    $("#reparseLabel").onclick = draw;
    draw();
    $("#confirmLabel").onclick = () => {
      const column = $("#labelColumn").value,
        mode = $("#labelBaseMode").value,
        status = $("#reviewLabelStatus");
      if (column === "" || !mode) {
        status.textContent = "Escolha a coluna e confirme a base no rótulo.";
        return;
      }
      try {
        const food = window.NutriLabel.labelFood(parsed, {
          column: Number(column),
          serving: mode === "portion" ? Number($("#labelServing").value) : 100,
          unit:
            mode === "portion"
              ? $("#labelUnit").value
              : mode === "100ml"
                ? "ml"
                : "g",
          name: $("#labelFoodName").value.trim(),
          barcode,
        });
        food.captureMethod = image ? "photo" : "text";
        if (!image) {
          food.source = "Tabela nutricional (texto conferido)";
          food.category = "Rótulos conferidos";
          food.note = food.note.replace(
            "Tabela nutricional fotografada",
            food.source,
          );
        }
        onLabel(food);
      } catch (error) {
        status.textContent = error.message;
      }
    };
  }
  return { cleanup, barcodeModal, labelModal };
};
