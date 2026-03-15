import client from './client';

// Monitoring Stations
export const getStations = () => client.get('/stations');
export const getStationById = (id) => client.get(`/stations/${id}`);
export const createStation = (data) => client.post('/stations', data);
export const updateStation = (id, data) => client.put(`/stations/${id}`, data);
export const deleteStation = (id) => client.delete(`/stations/${id}`);

// Industries
export const getIndustries = () => client.get('/industries');
export const getIndustryById = (id) => client.get(`/industries/${id}`);
export const createIndustry = (data) => client.post('/industries', data);
export const updateIndustry = (id, data) => client.put(`/industries/${id}`, data);
export const deleteIndustry = (id) => client.delete(`/industries/${id}`);

// Water Sources
export const getWaterSources = () => client.get('/water-sources');
export const getWaterSourceById = (id) => client.get(`/water-sources/${id}`);
export const createWaterSource = (data) => client.post('/water-sources', data);
export const updateWaterSource = (id, data) => client.put(`/water-sources/${id}`, data);
export const deleteWaterSource = (id) => client.delete(`/water-sources/${id}`);

// Entities (Organization Management)
export const getEntities = () => client.get('/entities');
export const getEntityById = (id) => client.get(`/entities/${id}`);
export const createEntity = (data) => client.post('/entities', data);
export const updateEntity = (id, data) => client.put(`/entities/${id}`, data);
export const deleteEntity = (id) => client.delete(`/entities/${id}`);

// Other Monitoring data
export const submitPollutionData = (data) => client.post('/pollution', data);
export const getPollutionReadings = () => client.get('/pollution');
export const submitComplaint = (data) => client.post('/complaints', data);
export const getComplaints = () => client.get('/complaints');

// Compliance Reports
export const getComplianceReports = () => client.get('/reports/compliance');
export const submitComplianceStatus = (data) => client.post('/reports/compliance', data);
export const exportCompliancePDF = () => client.get('/reports/compliance/export', { responseType: 'blob' });
