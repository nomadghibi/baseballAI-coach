# Data Model — BaseballAI Coach MVP

## 1. Data model goals

- Keep MVP simple.
- Support multiple athletes per parent account.
- Support future coaches/teams without major rewrite.
- Store video metadata separately from video files.
- Store analysis results in queryable format.
- Store large keypoint arrays in JSON/object storage if needed.

## 2. Core entities

```txt
User
  owns many Athletes

Athlete
  has many PitchingSessions

PitchingSession
  has one Video
  has one AnalysisJob
  has one AnalysisResult
  has many Notes

Video
  stores storage key and metadata only

AnalysisJob
  tracks processing status

AnalysisResult
  stores scores, phases, metrics, feedback

KeypointData
  stores body landmarks per frame or pointer to JSON file
```

## 3. Tables

## users

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| email | text | unique |
| password_hash | text | bcrypt/argon2 |
| full_name | text | optional |
| role | text | parent/admin now; coach later |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

## athletes

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| owner_user_id | uuid | FK users.id |
| first_name | text | use first name/nickname only if preferred |
| birth_year | int | avoid full DOB for privacy in MVP |
| height_in | numeric | optional |
| weight_lb | numeric | optional |
| throwing_hand | text | right/left |
| batting_side | text | optional |
| primary_position | text | pitcher/infielder/etc. |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

## pitching_sessions

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| athlete_id | uuid | FK athletes.id |
| title | text | e.g. “Backyard bullpen 2026-06-18” |
| session_date | date |  |
| location_type | text | backyard/field/cage/game/other |
| camera_angle | text | side/rear/front/unknown |
| notes | text | optional parent note |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

## videos

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK pitching_sessions.id |
| owner_user_id | uuid | FK users.id |
| storage_provider | text | r2/s3/supabase/local |
| storage_key | text | private object path |
| original_filename | text | sanitized |
| content_type | text | video/mp4, video/quicktime |
| size_bytes | bigint |  |
| duration_seconds | numeric | optional after processing |
| fps | numeric | optional after processing |
| width | int | optional |
| height | int | optional |
| status | text | uploading/uploaded/processing/analyzed/failed/deleted |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

## analysis_jobs

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| video_id | uuid | FK videos.id |
| status | text | queued/processing/completed/failed |
| error_code | text | optional |
| error_message | text | optional sanitized |
| started_at | timestamptz | optional |
| completed_at | timestamptz | optional |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

## analysis_results

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| video_id | uuid | FK videos.id |
| session_id | uuid | FK pitching_sessions.id |
| athlete_id | uuid | FK athletes.id |
| overall_score | numeric | 0–100 |
| balance_score | numeric | 0–100 |
| head_stability_score | numeric | 0–100 |
| stride_score | numeric | 0–100 |
| arm_slot_score | numeric | 0–100 |
| follow_through_score | numeric | 0–100 |
| video_quality_score | numeric | 0–100 |
| metrics_json | jsonb | detailed computed values |
| phases_json | jsonb | phase names and timestamps |
| feedback_json | jsonb | structured feedback notes |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

## keypoint_data

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| analysis_result_id | uuid | FK analysis_results.id |
| storage_key | text | optional pointer to compressed JSON |
| keypoints_json | jsonb | optional for short clips only |
| frame_count | int |  |
| sample_rate_fps | numeric | e.g. 15 fps analysis |
| created_at | timestamptz |  |

Recommendation: for MVP, store sampled keypoints in `jsonb` if clips are short. For production, store compressed keypoints JSON in object storage and keep only pointer in DB.

## coach_notes

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK pitching_sessions.id |
| author_user_id | uuid | FK users.id |
| note | text | manual note |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

## 4. Example metrics_json

```json
{
  "stride_length_estimate": {
    "value": 42.3,
    "unit": "relative_pixels",
    "confidence": 0.72,
    "note": "Relative estimate from side-view video. Not real-world inches unless calibration exists."
  },
  "head_movement": {
    "max_displacement_px": 38,
    "release_window_displacement_px": 21,
    "confidence": 0.81
  },
  "arm_slot": {
    "release_angle_degrees": 57,
    "confidence": 0.69
  },
  "balance": {
    "centerline_deviation_px": 29,
    "confidence": 0.76
  }
}
```

## 5. Example phases_json

```json
[
  { "name": "set_position", "start_sec": 0.2, "end_sec": 0.8, "confidence": 0.74 },
  { "name": "leg_lift", "start_sec": 0.8, "end_sec": 1.4, "confidence": 0.78 },
  { "name": "stride", "start_sec": 1.4, "end_sec": 1.9, "confidence": 0.71 },
  { "name": "release", "start_sec": 1.9, "end_sec": 2.1, "confidence": 0.63 },
  { "name": "follow_through", "start_sec": 2.1, "end_sec": 3.2, "confidence": 0.77 }
]
```

## 6. Example feedback_json

```json
[
  {
    "category": "balance",
    "severity": "positive",
    "message": "Balance looked stable during leg lift.",
    "suggestion": "Keep recording from the same side angle to compare progress."
  },
  {
    "category": "head_stability",
    "severity": "focus",
    "message": "Head movement increased near release.",
    "suggestion": "Practice keeping the head centered through the stride and release."
  }
]
```

## 7. Status enums

### video.status
- uploading
- uploaded
- processing
- analyzed
- failed
- deleted

### analysis_jobs.status
- queued
- processing
- completed
- failed

### camera_angle
- side
- rear
- front
- unknown

## 8. Privacy design

- Use `owner_user_id` on sensitive rows.
- Always check ownership before returning video/athlete/analysis.
- Signed video URLs should expire quickly.
- Deleting video should delete storage object and mark metadata deleted.
- Avoid full birthdate for minors in MVP.
