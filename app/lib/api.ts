export const BASE_URL = "https://tsakamaki4.pythonanywhere.com";
//export const BASE_URL = "http://127.0.0.1:8000";

/**
 * Enterprise API Request Wrapper
 * Centralizes URL management, headers, and automatic Token injection.
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  // 1. Clean the endpoint and ensure a trailing slash for Django production
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  if (!cleanEndpoint.endsWith('/')) {
    cleanEndpoint += '/';
  }

  // 2. Build the absolute URL to PythonAnywhere
  const url = `${BASE_URL}/${cleanEndpoint}`;
  
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
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = {};
    }
    throw { status: response.status, ...errorData };
  }

  if (response.status === 204) return {} as T;

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  return response.json();
}