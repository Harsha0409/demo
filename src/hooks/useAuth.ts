import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

// Cache for auth state to prevent unnecessary re-authentication
let authStateCache = {
  isAuthenticated: false,
  lastChecked: 0,
  isValid: false
};

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            if (!isMounted) return;
            
            // Check if we have a valid cached auth state (less than 5 minutes old)
            const now = Date.now();
            if (authStateCache.isValid && (now - authStateCache.lastChecked) < 300000) {
                setIsAuthenticated(authStateCache.isAuthenticated);
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            
            try {
                // Perform authentication check (this will test the server)
                const authenticated = await authService.initializeAuth();
                
                if (!isMounted) return;
                
                setIsAuthenticated(authenticated);
                
                // Update cache
                authStateCache = {
                    isAuthenticated: authenticated,
                    lastChecked: now,
                    isValid: true
                };
                
                // Handle navigation after auth check
                if (authenticated) {
                    const sessionId = localStorage.getItem('sessionId');
                    const isHomePage = location.pathname === '/';
                    
                    if (isHomePage && sessionId) {
                        navigate(`/c/${sessionId}`, { replace: true });
                    }
                } else {
                    if (location.pathname.startsWith('/c/')) {
                        navigate('/', { replace: true });
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setIsAuthenticated(false);
                    // Invalidate cache on error
                    authStateCache.isValid = false;
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Initialize auth check
        initializeAuth();

        // Listen for storage changes (user data updates)
        const handleStorageChange = () => {
            if (!isMounted) return;
            
            const authenticated = authService.isAuthenticated();
            setIsAuthenticated(authenticated);
            
            // Update cache
            authStateCache = {
                isAuthenticated: authenticated,
                lastChecked: Date.now(),
                isValid: true
            };
        };

        // Listen for custom auth events
        const handleAuthRequired = () => {
            if (!isMounted) return;
            
            setIsAuthenticated(false);
            // Invalidate cache
            authStateCache.isValid = false;
            window.dispatchEvent(new CustomEvent('login:required'));
        };

        // Listen for successful auth events
        const handleAuthSuccess = async () => {
            if (!isMounted) return;
            
            // Small delay to ensure everything is processed
            setTimeout(async () => {
                if (!isMounted) return;
                
                try {
                    const authenticated = await authService.initializeAuth();
                    if (isMounted) {
                        setIsAuthenticated(authenticated);
                        // Update cache
                        authStateCache = {
                            isAuthenticated: authenticated,
                            lastChecked: Date.now(),
                            isValid: true
                        };
                        setIsLoading(false);
                    }
                } catch (error) {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            }, 500);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth:required', handleAuthRequired);
        window.addEventListener('auth:success', handleAuthSuccess);

        return () => {
            isMounted = false;
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth:required', handleAuthRequired);
            window.removeEventListener('auth:success', handleAuthSuccess);
        };
    }, [navigate, location.pathname]);

    return { isAuthenticated, isLoading };
};