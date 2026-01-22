//export const BASE_URL = "https://tsakamaki4.pythonanywhere.com";
export const BASE_URL = "http://127.0.0.1:8000";

/**
 * Enterprise API Request Wrapper
 * Centralizes URL management, headers, and automatic Token injection.
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  // Retrieve token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Inject Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Error Responses
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // If parsing fails (e.g., error with no body), use an empty object
      errorData = {};
    }
    
    // Auto-redirect to login if unauthorized (optional but recommended)
    if (response.status === 401 && typeof window !== 'undefined') {
      // localStorage.removeItem('token'); 
      // window.location.href = '/login';
    }

    throw { status: response.status, ...errorData };
  }

  /**
   * GLOBAL FIX: Handling Empty Responses (204 No Content)
   * If the status is 204 or the content length is 0, return null/empty 
   * to avoid "Unexpected end of JSON input" errors.
   */
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  return response.json();
}