import React, { useState } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

interface IdpConfig {
  issuer: string;
  client_id: string;
  redirect_uri: string;
  scopes: string;
  idp_identifier?: string; // optional
}

export default function App() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await fetch('https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/lookup-idp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        setError('No identity provider found for this email.');
        return;
      }

      const idpConfig: IdpConfig = await res.json();

      // Store config in sessionStorage for use during the callback
      sessionStorage.setItem('lastIdpConfig', JSON.stringify(idpConfig));

      const userManager = new UserManager({
        authority: idpConfig.issuer,
        client_id: idpConfig.client_id,
        redirect_uri: idpConfig.redirect_uri,
        response_type: 'code',
        scope: idpConfig.scopes,
        userStore: new WebStorageStateStore({ store: window.sessionStorage })
      });

      await userManager.signinRedirect({
        extraQueryParams: idpConfig.idp_identifier
          ? { idp_identifier: idpConfig.idp_identifier }
          : undefined
      });
    } catch (err) {
      console.error(err);
      setError('Something went wrong during login.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Sign In</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        style={{ padding: '0.5rem', width: '300px' }}
      />
      <button onClick={handleLogin} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
        Sign In
      </button>
      {error && <div style={{ marginTop: '1rem', color: 'red' }}>{error}</div>}
    </div>
  );
}