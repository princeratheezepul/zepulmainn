import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Read the latest userInfo from localStorage each time, so we always pick up
// tokens written by the last successful login or refresh.
const readStoredTokens = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      accessToken: parsed?.data?.accessToken || null,
      refreshToken: parsed?.data?.refreshToken || null,
    };
  } catch {
    return {};
  }
};

const writeUpdatedTokens = ({ accessToken, refreshToken }) => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed?.data) return;
    if (accessToken) parsed.data.accessToken = accessToken;
    if (refreshToken) parsed.data.refreshToken = refreshToken;
    localStorage.setItem('userInfo', JSON.stringify(parsed));
  } catch {
    // ignore — non-fatal
  }
};

export const useApi = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const refreshToken = async () => {
    try {
      const userType = user?.type || 'manager';
      const refreshEndpoints = {
        'admin': '/api/admin/refresh-token',
        'manager': '/api/manager/refresh-token',
        'accountmanager': '/api/accountmanager/refresh-token',
        'recruiter': '/api/recruiter/refresh-token'
      };

      const endpoint = refreshEndpoints[userType] || '/api/manager/refresh-token';
      const { refreshToken: storedRefreshToken } = readStoredTokens();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        // Cross-origin cookies are unreliable in production (SameSite=None + third-party
        // cookie blocking), so also pass the refresh token in the body — the server reads
        // `req.cookies.refreshToken || req.body.refreshToken`.
        body: JSON.stringify(storedRefreshToken ? { refreshToken: storedRefreshToken } : {}),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccess = data?.data?.accessToken;
        const newRefresh = data?.data?.refreshToken;
        if (newAccess) writeUpdatedTokens({ accessToken: newAccess, refreshToken: newRefresh });
        return newAccess || null;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  const buildHeaders = (overrides = {}) => {
    const { accessToken } = readStoredTokens();
    return {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...overrides,
    };
  };

  const apiCall = async (url, options = {}) => {
    const finalOptions = {
      credentials: 'include',
      ...options,
      headers: buildHeaders(options.headers),
    };

    try {
      let response = await fetch(url, finalOptions);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        const newToken = await refreshToken();

        if (newToken) {
          // Rebuild headers so the freshly stored Bearer token is picked up.
          const retryOptions = { ...finalOptions, headers: buildHeaders(options.headers) };
          response = await fetch(url, retryOptions);
          
          if (response.status === 401) {
            // Still getting 401 after refresh, logout user
            logout();
            const userType = user?.type || 'manager';
            const loginRoutes = {
              'admin': '/admin/login',
              'manager': '/manager/login',
              'accountmanager': '/accountmanager/login',
              'recruiter': '/signin/recruiter'
            };
            navigate(loginRoutes[userType] || '/manager/login');
            throw new Error('Session expired. Please login again.');
          }
        } else {
          // Refresh failed, logout user
          logout();
          const userType = user?.type || 'manager';
          const loginRoutes = {
            'admin': '/admin/login',
            'manager': '/manager/login',
            'accountmanager': '/accountmanager/login',
            'recruiter': '/signin/recruiter'
          };
          navigate(loginRoutes[userType] || '/manager/login');
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const get = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  };

  const post = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const put = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  const del = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  };

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
  };
}; 