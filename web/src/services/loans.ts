import { api } from './http';

export async function applyLoan(payload: any) {
  const { data } = await api.post('/loans/apply', payload);
  return data.data;
}

export async function getLoanStatus(applicationId: string) {
  const { data } = await api.get(`/loans/status/${applicationId}`);
  return data.data;
}

export async function getLoanHistory() {
  const { data } = await api.get('/loans/applications');
  return data.data;
}
