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
