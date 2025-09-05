import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLoanStatus } from '../services/loans';

export default function LoanStatus() {
  const { id } = useParams();
  const [status, setStatus] = useState<any>(null);

  useEffect(()=>{
    if (id) getLoanStatus(id).then(setStatus).catch(()=>{});
  },[id]);

  return (
    <div style={{maxWidth: 600, margin: '32px auto', padding: 16}}>
      <h3>Loan Status</h3>
      {status ? (
        <pre style={{background:'#f5f5f5', padding:12}}>{JSON.stringify(status, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
