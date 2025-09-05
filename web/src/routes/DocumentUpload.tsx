import React, { useState } from 'react';
import { uploadDocument } from '../services/documents';

export default function DocumentUpload() {
  const [type, setType] = useState('aadhaar');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const onUpload = async () => {
    if (!file) { setMessage('Select a file'); return; }
    try { const res = await uploadDocument(file, type); setMessage(`Uploaded: ${res?.documentId || 'OK'}`); }
    catch { setMessage('Upload failed'); }
  };

  return (
    <div style={{maxWidth: 480, margin: '32px auto', padding: 16}}>
      <h3>Upload Documents</h3>
      <label>Type</label>
      <select value={type} onChange={e=>setType(e.target.value)} style={{width:'100%',padding:8}}>
        <option value="aadhaar">Aadhaar</option>
        <option value="pan">PAN</option>
        <option value="income_proof">Income Proof</option>
        <option value="address_proof">Address Proof</option>
      </select>
      <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} style={{display:'block',marginTop:12}} />
      <button onClick={onUpload} style={{marginTop:16}}>Upload</button>
      <p>{message}</p>
    </div>
  );
}
