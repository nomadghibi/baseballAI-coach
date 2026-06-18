# Implementation Plan — BaseballAI Coach MVP

## 1. Build strategy
Build in phases. Do not start with the full AI platform. Start with upload, analysis, and report.

## 2. Phase 0 — Repo setup

### Goal
Create clean project structure and local dev environment.

### Tasks
1. Create repo.
2. Create `/apps/web` for Next.js.
3. Create `/apps/api` for FastAPI.
4. Add root README.
5. Add `.env.example`.
6. Add Docker Compose for local Postgres.
7. Add basic lint/format scripts.

### Done when
- Web app runs locally.
- API runs locally.
- API health endpoint works.
- Postgres runs locally.

## 3. Phase 1 — Auth and athlete profiles

### Goal
User can register, log in, and create athlete profile.

### Backend
- User model
- Auth routes
- Password hashing
- Athlete model/routes
- Ownership checks

### Frontend
- Register page
- Login page
- Dashboard shell
- Athlete create/edit page

### Done when
- User logs in.
- User creates athlete.
- User sees athlete on dashboard.
- Another user cannot access athlete.

## 4. Phase 2 — Session and video upload

### Goal
User can create pitching session and upload video.

### Backend
- Session model/routes
- Video model/routes
- Signed upload URL flow or local storage for dev
- Complete upload endpoint

### Frontend
- Upload page
- Recording guide
- Upload progress
- Session detail page

### Done when
- User uploads video.
- Video metadata is saved.
- Playback URL works for owner.

## 5. Phase 3 — CV pipeline CLI

### Goal
Analyze a local video file outside the web app first.

### Backend/CV
- `extract_video_metadata()`
- `extract_pose_keypoints()`
- `calculate_video_quality()`
- `detect_pitching_phases()`
- `calculate_pitching_metrics()`
- `generate_feedback()`

### Done when
- Running a script on a sample video outputs JSON analysis.

## 6. Phase 4 — Analysis job integration

### Goal
Connect video upload to analysis job.

### Backend
- Analysis job table
- Job status endpoint
- Background task or queue worker
- Save results to database

### Frontend
- Analysis status polling
- Failed state
- Retry button

### Done when
- Uploaded video automatically becomes analyzed.
- User sees completed status and score.

## 7. Phase 5 — Analysis dashboard

### Goal
Show useful report.

### Frontend
- Video player
- Pose overlay canvas
- Score cards
- Feedback list
- Phase timeline
- Notes

### Backend
- Analysis result endpoint
- Keypoint data endpoint or embedded response for short clips
- Notes endpoints

### Done when
- User can watch video and see overlay.
- User can read metrics and notes.

## 8. Phase 6 — Progress tracking

### Goal
Show improvement over time.

### Backend
- Athlete progress endpoint

### Frontend
- Trend chart
- Previous session comparison
- Recent sessions table

### Done when
- User can compare latest score against previous session.

## 9. Phase 7 — Privacy hardening

### Goal
Make MVP safer for private use.

### Tasks
- Verify all ownership checks.
- Add delete session/video.
- Add signed URL expiration.
- Add production CORS config.
- Add privacy/disclaimer UI.
- Add file size/type restrictions.

### Done when
- Private data cannot be accessed by another user.
- Video deletion works.

## 10. Recommended development order for Claude Code

Do not ask Claude to build everything at once. Use this order:

1. Scaffold repo and health checks.
2. Create database models and migrations.
3. Build auth.
4. Build athlete CRUD.
5. Build session CRUD.
6. Build upload flow.
7. Build local CV script.
8. Build analysis job system.
9. Build analysis dashboard.
10. Build pose overlay.
11. Build progress dashboard.
12. Harden privacy/security.

## 11. MVP milestone definition

MVP is complete when:

- A parent can register.
- A parent can create an athlete.
- A parent can upload one short pitching video.
- App analyzes the video.
- App shows scores and feedback.
- App saves session history.
- Parent can delete the video.

## 12. Avoid these early mistakes

- Do not build mobile app first.
- Do not train custom AI model first.
- Do not build team accounts first.
- Do not add payment first.
- Do not chase pitch velocity first.
- Do not generate annotated MP4 first.
- Do not add social sharing.

## 13. Suggested MVP demo script

1. Open app.
2. Login.
3. Select athlete.
4. Upload pitching clip.
5. Wait for analysis.
6. Show score cards.
7. Play video with overlay.
8. Show coaching notes.
9. Compare with previous session.
