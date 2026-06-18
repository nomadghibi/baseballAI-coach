import type {
  AnalysisJob,
  AnalysisResult,
  Athlete,
  AthleteCreate,
  AuthResponse,
  CompleteUploadResponse,
  InitUploadResponse,
  Note,
  PlaybackUrlResponse,
  ProgressData,
  Session,
  SessionCreate,
  SessionListItem,
  User,
} from "@/lib/types"

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
    // Support both legacy {"detail": "..."} and new {"error": {"message": "..."}} shapes
    const msg = body?.error?.message ?? body?.detail ?? `HTTP ${res.status}`
    throw new Error(msg)
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
    progress: (id: string) => request<ProgressData>(`/athletes/${id}/progress`),
  },
  sessions: {
    list: (athleteId: string) =>
      request<SessionListItem[]>(`/athletes/${athleteId}/sessions`),
    get: (sessionId: string) => request<Session>(`/sessions/${sessionId}`),
    create: (athleteId: string, data: SessionCreate) =>
      request<Session>(`/athletes/${athleteId}/sessions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (sessionId: string, data: Partial<SessionCreate>) =>
      request<Session>(`/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (sessionId: string) => request(`/sessions/${sessionId}`, { method: "DELETE" }),
  },
  videos: {
    initUpload: (
      sessionId: string,
      data: { filename: string; content_type: string; size_bytes: number }
    ) =>
      request<InitUploadResponse>(`/sessions/${sessionId}/videos/init-upload`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    completeUpload: (videoId: string) =>
      request<CompleteUploadResponse>(`/videos/${videoId}/complete-upload`, { method: "POST" }),
    playbackUrl: (videoId: string) =>
      request<PlaybackUrlResponse>(`/videos/${videoId}/playback-url`),
    delete: (videoId: string) => request(`/videos/${videoId}`, { method: "DELETE" }),
  },
  analysis: {
    getJob: (jobId: string) => request<AnalysisJob>(`/analysis-jobs/${jobId}`),
    getLatestJob: (videoId: string) =>
      request<AnalysisJob>(`/videos/${videoId}/analysis-job`),
    getResult: (videoId: string) =>
      request<AnalysisResult>(`/videos/${videoId}/analysis`),
    trigger: (videoId: string) =>
      request<AnalysisJob>(`/videos/${videoId}/analyze`, { method: "POST" }),
  },
  notes: {
    list: (sessionId: string) => request<Note[]>(`/sessions/${sessionId}/notes`),
    create: (sessionId: string, note: string) =>
      request<Note>(`/sessions/${sessionId}/notes`, {
        method: "POST",
        body: JSON.stringify({ note }),
      }),
    update: (noteId: string, note: string) =>
      request<Note>(`/notes/${noteId}`, { method: "PATCH", body: JSON.stringify({ note }) }),
    delete: (noteId: string) => request(`/notes/${noteId}`, { method: "DELETE" }),
  },
}
