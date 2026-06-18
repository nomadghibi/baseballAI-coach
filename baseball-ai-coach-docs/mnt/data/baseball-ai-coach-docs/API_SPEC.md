# API Spec — BaseballAI Coach MVP

## 1. API style
REST JSON API using FastAPI.

Base path:

```txt
/api/v1
```

Authentication:
- MVP: JWT access token in secure HTTP-only cookie or Authorization header.
- Do not expose private video URLs permanently. Use short-lived signed URLs.

## 2. Auth endpoints

### POST /auth/register
Create a parent account.

Request:
```json
{
  "email": "parent@example.com",
  "password": "StrongPassword123",
  "full_name": "Parent Name"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "parent@example.com",
    "full_name": "Parent Name"
  }
}
```

### POST /auth/login

Request:
```json
{
  "email": "parent@example.com",
  "password": "StrongPassword123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "parent@example.com"
  }
}
```

### POST /auth/logout
Clear auth cookie/token.

### GET /auth/me
Return current user.

## 3. Athlete endpoints

### POST /athletes
Create athlete profile.

Request:
```json
{
  "first_name": "Player",
  "birth_year": 2016,
  "height_in": 54,
  "weight_lb": 75,
  "throwing_hand": "right",
  "batting_side": "right",
  "primary_position": "pitcher"
}
```

### GET /athletes
Return athletes owned by current user.

### GET /athletes/{athlete_id}
Return one athlete if owned by current user.

### PATCH /athletes/{athlete_id}
Update athlete.

### DELETE /athletes/{athlete_id}
Soft delete or archive athlete. MVP may block delete if videos exist unless user confirms deletion cascade.

## 4. Session endpoints

### POST /athletes/{athlete_id}/sessions
Create pitching session.

Request:
```json
{
  "title": "Backyard bullpen",
  "session_date": "2026-06-18",
  "location_type": "backyard",
  "camera_angle": "side",
  "notes": "Working on balance and follow-through"
}
```

### GET /athletes/{athlete_id}/sessions
List sessions.

### GET /sessions/{session_id}
Return session with video and analysis status.

### DELETE /sessions/{session_id}
Delete session, associated video object, analysis, and notes.

## 5. Video upload endpoints

### POST /sessions/{session_id}/videos/init-upload
Create a video record and signed upload URL.

Request:
```json
{
  "filename": "pitching.mov",
  "content_type": "video/quicktime",
  "size_bytes": 52428800
}
```

Response:
```json
{
  "video_id": "uuid",
  "upload_url": "signed-url",
  "storage_key": "private/path/video.mov",
  "max_size_bytes": 104857600
}
```

### POST /videos/{video_id}/complete-upload
Mark upload complete and queue analysis.

Response:
```json
{
  "video_id": "uuid",
  "status": "uploaded",
  "analysis_job_id": "uuid"
}
```

### GET /videos/{video_id}/playback-url
Return short-lived signed playback URL.

Response:
```json
{
  "video_id": "uuid",
  "playback_url": "signed-url",
  "expires_in_seconds": 900
}
```

### DELETE /videos/{video_id}
Delete video and related analysis.

## 6. Analysis endpoints

### POST /videos/{video_id}/analyze
Manually trigger or retry analysis.

Response:
```json
{
  "analysis_job_id": "uuid",
  "status": "queued"
}
```

### GET /analysis-jobs/{job_id}
Return job status.

Response:
```json
{
  "id": "uuid",
  "status": "processing",
  "progress": 45,
  "error_message": null
}
```

### GET /videos/{video_id}/analysis
Return completed analysis.

Response:
```json
{
  "video_id": "uuid",
  "status": "completed",
  "overall_score": 82,
  "scores": {
    "balance": 90,
    "head_stability": 74,
    "stride": 80,
    "arm_slot": 78,
    "follow_through": 86,
    "video_quality": 88
  },
  "phases": [
    { "name": "leg_lift", "start_sec": 0.8, "end_sec": 1.4, "confidence": 0.78 }
  ],
  "metrics": {},
  "feedback": [
    {
      "category": "head_stability",
      "severity": "focus",
      "message": "Head movement increased near release.",
      "suggestion": "Try keeping the head centered through release."
    }
  ],
  "keypoints_url": null,
  "keypoints": []
}
```

## 7. Notes endpoints

### POST /sessions/{session_id}/notes

Request:
```json
{
  "note": "Worked on keeping glove side stable."
}
```

### GET /sessions/{session_id}/notes

### PATCH /notes/{note_id}

### DELETE /notes/{note_id}

## 8. Progress endpoints

### GET /athletes/{athlete_id}/progress
Return trend data for dashboard.

Response:
```json
{
  "athlete_id": "uuid",
  "sessions_count": 8,
  "trends": [
    {
      "date": "2026-06-01",
      "overall_score": 68,
      "balance_score": 75,
      "head_stability_score": 62
    }
  ],
  "latest_summary": {
    "overall_score": 82,
    "change_from_previous": 4
  }
}
```

## 9. Error format

Use consistent error shape:

```json
{
  "error": {
    "code": "VIDEO_TOO_LARGE",
    "message": "Video must be under 100 MB.",
    "details": null
  }
}
```

## 10. Security rules

- Every endpoint must check current user ownership.
- Never return raw storage keys unless needed internally.
- Playback URLs expire.
- Upload URLs expire.
- Validate content type and max upload size.
- Sanitize filenames.
- Do not log signed URLs.
