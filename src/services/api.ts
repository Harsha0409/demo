import { trackGTMEvent } from '../utils/gtm';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    mobile: string;
  };
}

// Simplified global state - no more testAuth
let profileCache: { data: any; timestamp: number } | null = null;
let profileRequestInProgress = false;
let refreshTokenRequestInProgress = false;

const PROFILE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PROFILE_REQUEST_THROTTLE = 2000; // 2 seconds between requests

// Simplified request queues
const requestQueues = {
  profile: [] as Array<{ resolve: Function; reject: Function }>,
  refreshToken: [] as Array<{ resolve: Function; reject: Function }>
};

export const authService = {
  // Send OTP
  async sendOTP(mobile: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/auth/sendotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  // Verify OTP
  async verifyOTP(mobile: string, otp: string): Promise<LoginResponse & { profile?: any }> {
    try {
      const response = await fetch(`/api/auth/verifyotp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: parseInt(otp, 10), deviceId: 'web' }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to verify OTP');

      // Clear any existing cache since we have new authentication
      profileCache = null;
      profileRequestInProgress = false;
      refreshTokenRequestInProgress = false;

      // Wait for HttpOnly cookies to be set, then fetch profile ONCE
      setTimeout(async () => {
        try {
          const profile = await this.getProfile(true); // Force fetch, bypass cache
          
          if (profile) {
            trackGTMEvent('login', {
              method: 'otp',
              userId: profile.id || profile.user_id || 'unknown'
            });

            // Store user data in localStorage
            const userObj = {
              id: profile.id || profile.user_id || data.user?.id,
              mobile: profile.mobile || profile.phone || data.user?.mobile || mobile,
              name: profile.name || data.user?.name || null,
              gender: profile.gender || data.user?.gender || null
            };
            
            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('auth_validated', 'true');
            
            // Trigger auth success events
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('auth:success'));
            
          } else {
            if (data.user) {
              const fallbackUserObj = {
                id: data.user.id,
                mobile: data.user.mobile || data.user.phone || mobile,
                name: data.user.name || null,
                gender: data.user.gender || null
              };
              localStorage.setItem('user', JSON.stringify(fallbackUserObj));
              localStorage.setItem('auth_validated', 'true');
              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new CustomEvent('auth:success'));
            }
          }
        } catch (profileError) {
          if (data.user) {
            const fallbackUserObj = {
              id: data.user.id,
              mobile: data.user.mobile || data.user.phone || mobile,
              name: data.user.name || null,
              gender: data.user.gender || null
            };
            localStorage.setItem('user', JSON.stringify(fallbackUserObj));
            localStorage.setItem('auth_validated', 'true');
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('auth:success'));
          }
        }
      }, 300);

      return { ...data, profile: data.user };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  },

  // Resend OTP
  async resendOTP(mobile: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/auth/resendotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend OTP');
      }

      return { success: true, message: 'OTP resent successfully' };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend OTP');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      const user = this.getUser();
      trackGTMEvent('logout', { userId: user?.id || 'unknown' });

      // Clear cache and reset states
      profileCache = null;
      profileRequestInProgress = false;
      refreshTokenRequestInProgress = false;
      
      await fetch(`/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      
    } catch (error) {
      // Error handling without console logs
    } finally {
      this.clearAuth();
    }
  },

  // Get Profile with request deduplication
  async getProfile(forceRefresh: boolean = false): Promise<any> {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && profileCache && Date.now() - profileCache.timestamp < PROFILE_CACHE_DURATION) {
      return profileCache.data;
    }

    // Throttle requests if not forcing refresh
    if (!forceRefresh && profileCache && Date.now() - profileCache.timestamp < PROFILE_REQUEST_THROTTLE) {
      return profileCache.data;
    }

    // If request is already in progress, queue this request
    if (profileRequestInProgress) {
      return new Promise((resolve, reject) => {
        requestQueues.profile.push({ resolve, reject });
      });
    }

    try {
      profileRequestInProgress = true;
      
      const response = await this.fetchWithRefresh('/api/auth/profile', {
        method: 'GET',
      });

      const profile = await response.json();
      
      // Cache the profile
      profileCache = {
        data: profile,
        timestamp: Date.now()
      };
      
      // Store/update user data
      const userObj = {
        id: profile.id || profile.user_id,
        mobile: profile.mobile || profile.phone,
        name: profile.name || null,
        gender: profile.gender || profile.sex || null
      };
      
      if (userObj.id && userObj.mobile) {
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('auth_validated', 'true');
      }

      // Resolve all queued requests
      requestQueues.profile.forEach(({ resolve }) => resolve(profile));
      requestQueues.profile = [];

      profileRequestInProgress = false;
      return profile;
    } catch (error: any) {
      // Reject all queued requests
      requestQueues.profile.forEach(({ reject }) => reject(error));
      requestQueues.profile = [];
      
      profileRequestInProgress = false;
      
      if (error.message === 'Session expired' || error.message.includes('Session expired')) {
        this.clearAuth();
        profileCache = null;
      }
      throw error;
    }
  },

  // Clear Authentication Data
  clearAuth() {
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('auth_validated');
    profileCache = null;
    profileRequestInProgress = false;
    refreshTokenRequestInProgress = false;
    
    // Clear all queues
    Object.keys(requestQueues).forEach(key => {
      requestQueues[key as keyof typeof requestQueues] = [];
    });
  },

  // Get User from LocalStorage
  getUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  },

  // Check if user is authenticated (only checks localStorage)
  isAuthenticated(): boolean {
    const user = this.getUser();
    const authValidated = localStorage.getItem('auth_validated') === 'true';
    const result = !!(user && user.id && authValidated);
    
    return result;
  },

  // Refresh token with request deduplication
  async refreshToken(): Promise<boolean> {
    // If refresh is already in progress, queue this request
    if (refreshTokenRequestInProgress) {
      return new Promise((resolve, reject) => {
        requestQueues.refreshToken.push({ resolve, reject });
      });
    }

    try {
      refreshTokenRequestInProgress = true;
      
      const refreshResponse = await fetch('/api/auth/refresh-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (refreshResponse.ok) {
        // Clear cache so next request fetches fresh data with new token
        profileCache = null;
        
        // Resolve all queued requests
        requestQueues.refreshToken.forEach(({ resolve }) => resolve(true));
        requestQueues.refreshToken = [];
        
        refreshTokenRequestInProgress = false;
        return true;
      } else {
        let success = false;
        // Handle specific error codes
        if (refreshResponse.status === 403) {
          this.clearAuth();
        } else if (refreshResponse.status === 401) {
          this.clearAuth();
        }
        
        // Resolve all queued requests with false
        requestQueues.refreshToken.forEach(({ resolve }) => resolve(success));
        requestQueues.refreshToken = [];
        
        refreshTokenRequestInProgress = false;
        return success;
      }
    } catch (error) {
      // Reject all queued requests
      requestQueues.refreshToken.forEach(({ reject }) => reject(error));
      requestQueues.refreshToken = [];
      
      refreshTokenRequestInProgress = false;
      return false;
    }
  },

  // fetchWithRefresh remains the same
  async fetchWithRefresh(url: string, opts: RequestInit = {}): Promise<Response> {
    const options: RequestInit = { 
      ...opts, 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...opts.headers,
      }
    };
    
    // First attempt
    let response = await fetch(url, options);

    // Handle 401 (unauthorized) - token might be expired
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      
      if (refreshed) {
        response = await fetch(url, options);
        
        if (response.status === 401) {
          this.clearAuth();
          window.dispatchEvent(new CustomEvent('auth:required'));
          throw new Error('Session expired - please login again');
        }
      } else {
        this.clearAuth();
        window.dispatchEvent(new CustomEvent('auth:required'));
        throw new Error('Session expired - please login again');
      }
    }

    return response;
  },

  // Simplified initialization - uses getProfile() directly
  async initializeAuth(): Promise<boolean> {
    const user = this.getUser();
    const authValidated = localStorage.getItem('auth_validated') === 'true';

    // If we have user data and validation flag, test with server using getProfile
    if (user && user.id && authValidated) {
      // Only test with server if cache is old or missing
      if (!profileCache || Date.now() - profileCache.timestamp > PROFILE_CACHE_DURATION) {
        try {
          await this.getProfile(); // This will handle token refresh automatically
          return true;
        } catch (error: any) {
          if (error.message.includes('Session expired')) {
            return false;
          }
          this.clearAuth();
          return false;
        }
      } else {
        return true;
      }
    }

    // Only test for existing session if no local data
    if (!user && !authValidated) {
      try {
        await this.getProfile(true); // Force fetch to test session
        const updatedUser = this.getUser();
        if (updatedUser && updatedUser.id) {
          return true;
        }
      } catch (error: any) {
        // This is expected if no valid session exists
      }
    }

    return false;
  },
};

// Utility functions
export async function apiCall(url: string, options: RequestInit = {}): Promise<Response> {
  return authService.fetchWithRefresh(url, options);
}

export async function apiCallJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await authService.fetchWithRefresh(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return response.json();
}