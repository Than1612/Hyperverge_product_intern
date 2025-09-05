import React, { useState } from 'react';
import { applyLoan } from '../services/loans';

export default function LoanApply() {
  const [amount, setAmount] = useState(10000);
  const [purpose, setPurpose] = useState('agriculture');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [message, setMessage] = useState('');

  const onSubmit = async () => {
    try {
      const res = await applyLoan({ amount, purpose, monthlyIncome });
      setMessage(`Submitted: ${res?.applicationId || 'OK'}`);
    } catch {
      setMessage('Failed to submit');
    }
  };

  return (
    <div style={{maxWidth: 480, margin: '32px auto', padding: 16}}>
      <h3>Loan Application</h3>
      <label>Amount</label>
      <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} style={{width:'100%',padding:8}} />
      <label style={{marginTop:12,display:'block'}}>Purpose</label>
      <select value={purpose} onChange={e=>setPurpose(e.target.value)} style={{width:'100%',padding:8}}>
        <option value="agriculture">Agriculture</option>
        <option value="business">Business</option>
        <option value="education">Education</option>
      </select>
      <label style={{marginTop:12,display:'block'}}>Monthly Income</label>
      <input type="number" value={monthlyIncome} onChange={e=>setMonthlyIncome(Number(e.target.value))} style={{width:'100%',padding:8}} />
      <button onClick={onSubmit} style={{marginTop:16}}>Submit</button>
      <p>{message}</p>
    </div>
  );
}
