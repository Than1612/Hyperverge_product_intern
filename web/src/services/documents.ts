import { api } from './http';

export async function uploadDocument(file: File, type: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('type', type);
  const { data } = await api.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function getDocumentStatus(documentId: string) {
  const { data } = await api.get(`/documents/${documentId}/status`);
  return data.data;
}

export async function listDocuments() {
  const { data } = await api.get('/documents/list');
  return data.data;
}
