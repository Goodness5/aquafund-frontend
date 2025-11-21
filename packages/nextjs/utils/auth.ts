/**
 * Authentication utility functions
 */

export const AUTH_TOKEN_KEY = "aquafund-auth-token";
export const USER_ROLE_KEY = "aquafund-user-role";
export const USER_ID_KEY = "aquafund-user-id";
export const USER_EMAIL_KEY = "aquafund-user-email";

/**
 * Check if user is authenticated (has a valid token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
}

/**
 * Get the current user's role
 */
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ROLE_KEY);
}

/**
 * Check if the current user is an ADMIN
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === "ADMIN";
}

/**
 * Check if user is authenticated AND is an ADMIN
 */
export function isAdminAuthenticated(): boolean {
  return isAuthenticated() && isAdmin();
}

/**
 * Get the authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

