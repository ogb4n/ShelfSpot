// HTTP interceptor for automatic token refresh
import { backendApi } from './backend-api';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

export const setupHttpInterceptor = () => {
  // Monkey patch fetch to add automatic refresh
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);
    
    if (response.status === 401 && !isRefreshing) {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        if (isRefreshing) {
          // Wait for the current refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry the original request
            const newToken = localStorage.getItem('access_token');
            if (newToken && init?.headers) {
              const headers = new Headers(init.headers);
              headers.set('Authorization', `Bearer ${newToken}`);
              return originalFetch(input, { ...init, headers });
            }
            return originalFetch(input, init);
          });
        }
        
        isRefreshing = true;
        
        try {
          const refreshResponse = await backendApi.refreshToken(refreshToken);
          
          localStorage.setItem('access_token', refreshResponse.access_token);
          localStorage.setItem('refresh_token', refreshResponse.refresh_token);
          document.cookie = `access_token=${refreshResponse.access_token}; path=/; max-age=${refreshResponse.expires_in}`;
          
          processQueue(null, refreshResponse.access_token);
          
          // Retry the original request with new token
          if (init?.headers) {
            const headers = new Headers(init.headers);
            headers.set('Authorization', `Bearer ${refreshResponse.access_token}`);
            return originalFetch(input, { ...init, headers });
          }
          
          return originalFetch(input, init);
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          // Clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login';
          
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    return response;
  };
};
