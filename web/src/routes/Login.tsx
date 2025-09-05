import React, { useState } from 'react';
import { sendOtp, login } from '../services/auth';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone'|'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSendOtp = async () => {
    setLoading(true);
    try { await sendOtp(phone); setStep('otp'); setMessage('OTP sent'); }
    catch { setMessage('Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const onVerify = async () => {
    setLoading(true);
    try { await login(phone, otp); window.location.href = '/'; }
    catch { setMessage('Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth: 360, margin: '64px auto', padding: 16}}>
      <h2>Login</h2>
      {step === 'phone' ? (
        <>
          <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%',padding:8}} />
          <button onClick={onSendOtp} disabled={loading || !phone} style={{marginTop:12}}>Send OTP</button>
        </>
      ) : (
        <>
          <input placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} style={{width:'100%',padding:8}} />
          <button onClick={onVerify} disabled={loading || !otp} style={{marginTop:12}}>Verify</button>
        </>
      )}
      <p>{message}</p>
    </div>
  );
}
