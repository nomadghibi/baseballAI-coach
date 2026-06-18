import type { Athlete, AthleteCreate, AuthResponse, User } from "@/lib/types"

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1`

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("baseball_ai_token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body?.detail ?? `HTTP ${res.status}`)
  }
  return body as T
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; full_name?: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<User>("/auth/me"),
    logout: () => request("/auth/logout", { method: "POST" }),
  },
  athletes: {
    list: () => request<Athlete[]>("/athletes"),
    get: (id: string) => request<Athlete>(`/athletes/${id}`),
    create: (data: AthleteCreate) =>
      request<Athlete>("/athletes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<AthleteCreate>) =>
      request<Athlete>(`/athletes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/athletes/${id}`, { method: "DELETE" }),
  },
}
