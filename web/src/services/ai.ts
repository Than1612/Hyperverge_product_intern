import { aiApi } from './http';

export async function underwrite(applicationId: string, payload: any) {
  const { data } = await aiApi.post('/underwrite', { applicationId, ...payload });
  return data.data || data;
}
