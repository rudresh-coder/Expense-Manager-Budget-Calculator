import { useState, useEffect } from 'react';
import "./ConnectBank.css"; 

export default function ConnectBank() {
  const [linkToken, setLinkToken] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/bank/link-token`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => setLinkToken(data.linkToken));
  }, []);

  if (!linkToken) return <p>Loading...</p>;

  return (
    <div className="connect-bank-card">
      <h2 className="connect-bank-title">Link Your Bank Account</h2>
      <p className="connect-bank-desc">
        Securely connect your bank for automatic transaction import. Your data is encrypted and never shared.
      </p>
      <div className="connect-bank-btn-wrapper">
        <LinkButton
          linkToken={linkToken}
          onSuccess={({ publicToken }: { publicToken: string }) => {
            fetch(`${import.meta.env.VITE_API_URL}/api/bank/complete-link`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ publicToken }),
            });
          }}
          onError={(err: unknown) => console.error(err)}
        >
          Connect Bank Account
        </LinkButton>
      </div>
    </div>
  );
}