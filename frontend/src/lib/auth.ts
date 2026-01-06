// key for storing jwt in local storage
const TOKEN_KEY = 'fynd_admin_token'

// saves jwt token to local storage
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

// retrieves jwt token from local storage
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// removes jwt token from local storage
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// checks if user is currently logged in
export function isAuthenticated(): boolean {
  return !!getToken()
}
