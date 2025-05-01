import { useEffect } from 'react';
import { UserManager } from 'oidc-client-ts';

export default function Callback() {
  useEffect(() => {
    const storedConfig = JSON.parse(sessionStorage.getItem('lastIdpConfig') || '{}');

    const userManager = new UserManager({
      authority: storedConfig.issuer,
      client_id: storedConfig.client_id,
      redirect_uri: storedConfig.redirect_uri,
      response_type: 'code',
      scope: storedConfig.scopes,
    });

    userManager.signinRedirectCallback().then((user) => {
      console.log('User logged in:', user.profile);
      window.location.href = '/'; // redirect after login
    }).catch(err => {
      console.error('OIDC callback error:', err);
    });
  }, []);

  return <div>Processing login...</div>;
}