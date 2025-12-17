import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authService } from '../api/services/AuthService';

/**
 * This component handles the Google OAuth callback.
 * It's loaded in a popup window after Google redirects back.
 * It fetches user data from /api/identity/me and sends it back to the opener window.
 */
export function GoogleAuthCallback() {
  const [status, setStatus] = useState<string>('Completing sign in...');
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for error in URL
      const error = urlParams.get('error');
      if (error) {
        setStatus(`Error: ${error}`);
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error },
            window.location.origin
          );
        }
        setTimeout(() => window.close(), 2000);
        return;
      }
      
      // Fetch user data from /api/identity/me
      try {
        setStatus('Fetching user data...');
        const userData = await authService.getCurrentUser();
        
        if (userData && userData.userId && userData.role) {
          setStatus('Success! Redirecting...');
          // Send data back to opener window
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_SUCCESS', payload: userData },
              window.location.origin
            );
          }
          setTimeout(() => window.close(), 500);
        } else {
          setStatus('Invalid user data received');
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_ERROR', error: 'Invalid user data from server' },
              window.location.origin
            );
          }
          setTimeout(() => window.close(), 2000);
        }
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setStatus(`Error: ${err.message || 'Failed to fetch user data'}`);
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error: err.message || 'Failed to fetch user data' },
            window.location.origin
          );
        }
        setTimeout(() => window.close(), 2000);
      }
    };
    
    // Small delay to ensure cookies are set
    setTimeout(handleCallback, 500);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}