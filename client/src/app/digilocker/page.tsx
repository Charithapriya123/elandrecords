'use client';
import { useState, useEffect } from 'react';

interface VaultDoc {
  _id: string;
  documentType: 'aadhaar_card' | 'land_deed';
  ipfsHash: string;
  fileName: string;
  isVerified: boolean;
  verifiedAt: string;
  citizenName: string;
}

export default function CitizenDigiLocker() {
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      // Get current user profile to get aadhar
      const profileRes = await fetch('/api/users/profile');
      const profileData = await profileRes.json();
      if (!profileData.user?.aadhar) {
        setMessage('No Aadhaar number found in your profile');
        return;
      }
      const res = await fetch(`/api/digilocker-vault?aadhar=${profileData.user.aadhar}`);
      const data = await res.json();
      if (data.success) setDocs(data.data);
    } catch (err) {
      setMessage('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const docLabel = (type: string) => type === 'aadhaar_card' ? '🪪 Aadhaar Card' : '📜 Land Deed';

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', padding: '20px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>🔐 My DigiLocker</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>Your verified government documents</p>
          </div>
          <a href="/user-dashboard" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</a>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        {/* Info Box */}
        <div style={{ background: '#1e3a8a22', border: '1px solid #1e40af', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px' }}>ℹ️ About DigiLocker</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            These documents have been verified and uploaded by the Government Authority. 
            They are stored on IPFS (decentralized storage) and cannot be tampered with.
            Use these documents when applying for land registration.
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#38bdf8', padding: '40px' }}>Loading your documents...</div>}
        {message && <div style={{ textAlign: 'center', color: '#f59e0b', padding: '40px' }}>{message}</div>}

        {!loading && docs.length === 0 && !message && (
          <div style={{ textAlign: 'center', background: '#1e293b', borderRadius: '12px', padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No documents found</div>
            <div style={{ fontSize: '13px' }}>Contact the government authority to upload your documents</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {docs.map((doc) => (
            <div key={doc._id} style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #22c55e44' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{docLabel(doc.documentType)}</span>
                <span style={{ background: '#22c55e22', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>✅ VERIFIED</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>📄 {doc.fileName}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', wordBreak: 'break-all' }}>
                🔗 IPFS: <span style={{ color: '#38bdf8' }}>{doc.ipfsHash}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
                🕐 Verified: {new Date(doc.verifiedAt).toLocaleDateString('en-IN')}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} target="_blank"
                  style={{ flex: 1, background: '#1e40af', color: 'white', padding: '8px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontSize: '13px' }}>
                  👁️ View
                </a>
                <a href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`} download
                  style={{ flex: 1, background: '#334155', color: 'white', padding: '8px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontSize: '13px' }}>
                  ⬇️ Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {docs.length > 0 && (
          <div style={{ marginTop: '24px', background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#e2e8f0' }}>Ready to apply for land registration?</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Your DigiLocker documents will be used automatically</div>
            <a href="/user-dashboard" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', color: 'white', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
              📋 Apply for Land Registration →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
