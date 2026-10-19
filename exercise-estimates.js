/* Estimativa local de energia para atividades registradas. Sem transmissão de dados. */
window.estimateExerciseCalories = function ({ type, minutes, distanceKm, effort, weightKg }) {
  const duration = Number(minutes);
  const weight = Number(weightKg);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(weight) || weight <= 0) return null;

  const rawEffort = Number(effort);
  const exertion = Number.isFinite(rawEffort) && rawEffort > 0 ? Math.min(10, Math.max(1, rawEffort)) : null;
  let met;
  if (type === 'Corrida') {
    const distance = Number(distanceKm);
    if (Number.isFinite(distance) && distance > 0) {
      const speed = distance / (duration / 60); // km/h
      if (speed < 6) met = 3.3;
      else if (speed < 6.8) met = 6.5;
      else if (speed < 7.8) met = 7.8;
      else if (speed < 8.9) met = 8.5;
      else if (speed < 9.7) met = 9;
      else if (speed < 10.8) met = 9.3;
      else if (speed < 11.6) met = 10.5;
      else if (speed < 12.7) met = 11;
      else if (speed < 13.8) met = 11.8;
      else if (speed < 14.5) met = 12;
      else met = 12.5;
    } else met = 7.5; // ritmo autoescolhido quando a distância não foi informada
  } else if (type === 'Musculação') {
    met = !exertion || exertion <= 6 ? 3.5 : exertion <= 8 ? 5 : 6;
  } else if (type === 'Jiu-jítsu') {
    met = !exertion ? 7.8 : exertion <= 3 ? 5.3 : exertion <= 6 ? 7.8 : 10.3;
  } else return null;

  // Aproximação por MET × 3,5 × peso (kg) × minutos / 200.
  return { kcal: Math.round(met * 3.5 * weight * duration / 200), met, weightKg: weight };
};
