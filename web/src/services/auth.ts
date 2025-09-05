import { api } from './http';

export async function sendOtp(phoneNumber: string) {
  const { data } = await api.post('/auth/send-otp', { phoneNumber });
  return data;
}

export async function login(phoneNumber: string, otp: string) {
  const { data } = await api.post('/auth/login', { phoneNumber, otp });
  const { token } = data.data || {};
  if (token) localStorage.setItem('auth_token', token);
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/users/profile');
  return data.data;
}
