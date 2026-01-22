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
  // 1. Separate the path from the query string (if any)
  const [path, queryString] = endpoint.split('?');
  
  // 2. Clean the path and ensure it ends with a slash
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (!cleanPath.endsWith('/')) {
    cleanPath += '/';
  }

  // 3. Reconstruct the URL: BASE + PATH + / + ?QUERY
  const finalEndpoint = queryString ? `${cleanPath}?${queryString}` : cleanPath;
  const url = `${BASE_URL}/${finalEndpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = {};
    try { errorData = await response.json(); } catch (e) { errorData = {}; }
    throw { status: response.status, ...errorData };
  }

  if (response.status === 204) return {} as T;
  return response.json();
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++