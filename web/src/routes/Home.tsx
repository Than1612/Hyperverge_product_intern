import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../services/auth';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getProfile().then(setUser).catch(()=>{});
  }, []);

  return (
    <div style={{maxWidth: 800, margin: '32px auto', padding: 16}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>RuralLoan AI</h2>
        <nav style={{display:'flex',gap:12}}>
          <Link to="/apply">Apply</Link>
          <Link to="/documents">Documents</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <section style={{marginTop:24}}>
        <h3>Welcome{user?.user?.name ? `, ${user.user.name}`:''}!</h3>
        <div style={{display:'flex',gap:16,marginTop:16}}>
          <Link to="/apply"><button>Apply for Loan</button></Link>
          <Link to="/status/APP-123456"><button>Check Status</button></Link>
        </div>
      </section>
    </div>
  );
}
