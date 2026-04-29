import api from './api';

/**
 * Fetch traffic records from the backend.
 * @param {object} params - { limit, location }
 */
export async function getTrafficData(params = {}) {
  const { data } = await api.get('/traffic', { params });
  return data;
}

/**
 * Run a single policy simulation.
 * @param {object} policyParams - { policy_type, capacity_increase_pct, ... }
 */
export async function runSimulation(policyParams) {
  const { data } = await api.post('/simulate', policyParams);
  return data;
}

/**
 * Compare multiple policy scenarios.
 * @param {Array} scenarios - Array of policy param objects
 */
export async function compareScenarios(scenarios) {
  const { data } = await api.post('/compare', { scenarios });
  return data;
}

/**
 * Fetch aggregated chart-ready data.
 * @param {object} params - { metric, hours, location }
 */
export async function getVisualizationData(params = {}) {
  const { data } = await api.get('/visualize', { params });
  return data;
}
