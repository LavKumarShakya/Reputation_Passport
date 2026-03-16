import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * This page handles the redirect from GitHub OAuth.
 * It receives the JWT token from the URL params, stores it, and redirects to /profile.
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const displayName = searchParams.get('displayName');
        const handle = searchParams.get('handle');
        const avatar = searchParams.get('avatar');
        const walletAddress = searchParams.get('walletAddress');
        const errorCode = searchParams.get('error');

        if (token) {
            // Store the JWT token
            localStorage.setItem('auth_token', token);

            // Store basic user info for immediate use
            // Note: We don't store connectedProviders here; useAuth will fetch the full profile
            localStorage.setItem('auth_user', JSON.stringify({
                id: userId,
                displayName,
                handle,
                avatar,
                walletAddress,
            }));

            // Redirect to profile with a hard reload to ensure `useAuth` hook natively picks up the new localStorage values
            window.location.href = '/profile';
        } else {
            // Forward the backend error code (or fall back to no_token) so the AuthPage can show a specific message
            const code = errorCode || 'no_token';
            navigate(`/auth?error=${encodeURIComponent(code)}`, { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Completing GitHub login...</p>
            </div>
        </div>
    );
}
