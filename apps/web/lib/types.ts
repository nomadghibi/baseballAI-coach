export interface User {
  id: string
  email: string
  full_name: string | null
  role: string
}

export interface AuthResponse {
  user: User
  access_token: string
  token_type: string
}

export interface Athlete {
  id: string
  owner_user_id: string
  first_name: string
  birth_year: number | null
  height_in: number | null
  weight_lb: number | null
  throwing_hand: string | null
  batting_side: string | null
  primary_position: string | null
}

export interface AthleteCreate {
  first_name: string
  birth_year?: number | null
  height_in?: number | null
  weight_lb?: number | null
  throwing_hand?: string | null
  batting_side?: string | null
  primary_position?: string | null
}

export interface VideoSummary {
  id: string
  status: string
  size_bytes: number | null
  content_type: string
  created_at: string
}

export interface Session {
  id: string
  athlete_id: string
  title: string
  session_date: string
  location_type: string | null
  camera_angle: string | null
  notes: string | null
  created_at: string
  updated_at: string
  video: VideoSummary | null
}

export interface SessionListItem {
  id: string
  title: string
  session_date: string
  location_type: string | null
  camera_angle: string | null
  created_at: string
  video_status: string | null
}

export interface SessionCreate {
  title: string
  session_date: string
  location_type?: string | null
  camera_angle?: string | null
  notes?: string | null
}

export interface InitUploadResponse {
  video_id: string
  upload_url: string
  storage_provider: string
  max_size_bytes: number
}

export interface CompleteUploadResponse {
  video_id: string
  status: string
  analysis_job_id: string | null
}

export interface PlaybackUrlResponse {
  video_id: string
  playback_url: string
  expires_in_seconds: number
}
