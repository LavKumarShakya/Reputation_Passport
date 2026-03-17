import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * This page handles the redirect from GitHub OAuth.
 * It receives the JWT token from the URL params, stores it, fetches the full
 * profile (so connectedProviders is available immediately), then redirects to /home.
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const errorCode = searchParams.get('error');

        if (token) {
            // 1. Store the JWT token first so API calls can authenticate
            localStorage.setItem('auth_token', token);

            // 2. Fetch the full user profile (includes connectedProviders, techStack, etc.)
            fetch(`${API_BASE}/profile/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    const userData = data.user || data;
                    const fullUser = {
                        ...userData,
                        id: userData._id || userData.id,
                    };
                    // 3. Store the COMPLETE user object — no missing fields
                    localStorage.setItem('auth_user', JSON.stringify(fullUser));
                })
                .catch(() => {
                    // Fallback: store minimal info from URL params if API call fails
                    localStorage.setItem('auth_user', JSON.stringify({
                        id: searchParams.get('userId'),
                        displayName: searchParams.get('displayName'),
                        handle: searchParams.get('handle'),
                        avatar: searchParams.get('avatar'),
                        walletAddress: searchParams.get('walletAddress'),
                    }));
                })
                .finally(() => {
                    // 4. Hard redirect to /home — ensures useAuth re-reads fresh localStorage
                    window.location.href = '/home';
                });
        } else {
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
