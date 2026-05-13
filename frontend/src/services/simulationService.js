import api from './api';

/** Fetch traffic records from the backend. */
export async function getTrafficData(params = {}) {
  const { data } = await api.get('/traffic', { params });
  return data;
}

/** Run a single policy simulation. */
export async function runSimulation(policyParams) {
  const { data } = await api.post('/simulate', policyParams);
  return data;
}

/** Compare multiple policy scenarios side-by-side. */
export async function compareScenarios(scenarios) {
  const { data } = await api.post('/compare', { scenarios });
  return data;
}

/** Fetch aggregated chart-ready visualization data. */
export async function getVisualizationData(params = {}) {
  const { data } = await api.get('/visualize', { params });
  return data;
}

/** Fetch saved simulation history. */
export async function getHistory(params = {}) {
  const { data } = await api.get('/history', { params });
  return data;
}

/** Clear all simulation history. */
export async function clearHistory() {
  const { data } = await api.delete('/history');
  return data;
}

/** Fetch ML model feature importances. */
export async function getFeatureImportance() {
  const { data } = await api.get('/feature-importance');
  return data;
}
