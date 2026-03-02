import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * OAuthCallbackPage
 * This page is loaded after Google redirects back to the frontend.
 * It reads the JWT from the URL query parameter (?token=...) and
 * stores it using the AuthContext, then redirects to the dashboard.
 */
const OAuthCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error || !token) {
            navigate('/admin/login?error=google_failed');
            return;
        }

        loginWithToken(token)
            .then(() => navigate('/admin/dashboard'))
            .catch(() => navigate('/admin/login?error=google_failed'));
    }, []);

    return (
        <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
                <p className="text-cyan-400 text-sm">Signing you in with Google...</p>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;
