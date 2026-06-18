# Claude Code Prompts — BaseballAI Coach

## 1. Master project prompt
Use this at the beginning of the repo build.

```txt
You are building BaseballAI Coach, a private youth baseball pitching analysis web app.

MVP: parent login, athlete profile, pitching video upload, server-side pose analysis, mechanics metrics, feedback report, session history, and delete video/session.

Read only these files first:
- docs/README.md
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/IMPLEMENTATION_PLAN.md
- docs/CLAUDE.md

Do not build team accounts, payments, native mobile app, public sharing, face recognition, live edge AI, or custom ML training.

First task: create the repo structure for apps/web and apps/api with basic health checks and local development instructions.
```

## 2. Scaffold prompt

```txt
Read docs/ARCHITECTURE.md, docs/IMPLEMENTATION_PLAN.md, and docs/CLAUDE.md.

Create the initial monorepo structure:
- apps/web for Next.js TypeScript frontend
- apps/api for FastAPI backend
- docs folder
- .env.example
- local development README

Implement only:
- frontend home page placeholder
- backend /health endpoint
- basic local run instructions

Do not implement auth, video upload, or CV yet.
```

## 3. Database models prompt

```txt
Read docs/DATA_MODEL.md, docs/PRIVACY_SECURITY.md, and docs/CLAUDE.md.

Implement backend database models and migrations for:
- users
- athletes
- pitching_sessions
- videos
- analysis_jobs
- analysis_results
- keypoint_data
- coach_notes

Use UUID primary keys, timestamps, and ownership fields. Do not create frontend screens yet. Add a short note explaining how to run migrations.
```

## 4. Auth prompt

```txt
Read docs/API_SPEC.md, docs/PRIVACY_SECURITY.md, and docs/CLAUDE.md.

Implement MVP auth in FastAPI:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

Use secure password hashing. Keep the auth implementation simple. Add tests for register/login/me. Do not implement athlete routes in this task.
```

## 5. Athlete CRUD prompt

```txt
Read docs/API_SPEC.md, docs/DATA_MODEL.md, docs/PRIVACY_SECURITY.md, and docs/CLAUDE.md.

Implement athlete CRUD endpoints:
- POST /api/v1/athletes
- GET /api/v1/athletes
- GET /api/v1/athletes/{athlete_id}
- PATCH /api/v1/athletes/{athlete_id}
- DELETE /api/v1/athletes/{athlete_id}

Every endpoint must enforce current user ownership. Add backend tests for ownership protection.
```

## 6. Video upload prompt

```txt
Read docs/API_SPEC.md, docs/ARCHITECTURE.md, docs/PRIVACY_SECURITY.md, and docs/CLAUDE.md.

Implement session and video upload flow:
- create pitching session
- init upload
- complete upload
- playback URL
- delete video

For local dev, support local file storage or mock signed URLs if object storage is not configured. Keep storage provider behind an interface so R2/S3 can be added later.
```

## 7. CV local pipeline prompt

```txt
Read docs/AI_CV_PIPELINE.md, docs/DATA_MODEL.md, and docs/CLAUDE.md.

Implement the CV pipeline as local pure Python functions first:
- extract_video_metadata(video_path)
- extract_pose_keypoints(video_path, sample_fps)
- calculate_video_quality(keypoints)
- detect_pitching_phases(keypoints, athlete_throwing_hand)
- calculate_pitching_metrics(keypoints, phases)
- generate_feedback(scores, metrics, quality_score)

Add a CLI command that accepts a local video path and writes analysis JSON. Do not connect it to the API yet.
```

## 8. Analysis job prompt

```txt
Read docs/API_SPEC.md, docs/AI_CV_PIPELINE.md, docs/DATA_MODEL.md, and docs/CLAUDE.md.

Connect the CV pipeline to video analysis jobs:
- create analysis job when upload completes
- process job using background task for MVP
- save analysis_result and keypoint_data
- expose job status endpoint
- expose video analysis endpoint
- handle failure states safely

Do not build the frontend report yet.
```

## 9. Frontend auth/dashboard prompt

```txt
Read docs/UX_FLOWS.md, docs/API_SPEC.md, and docs/CLAUDE.md.

Implement frontend pages:
- register
- login
- dashboard
- create athlete
- athlete profile

Use TypeScript and simple API client. Include loading and error states. Keep mobile-first layout.
```

## 10. Frontend upload/report prompt

```txt
Read docs/UX_FLOWS.md, docs/API_SPEC.md, docs/AI_CV_PIPELINE.md, and docs/CLAUDE.md.

Implement frontend upload and analysis report:
- upload page with recording guide
- upload progress
- analysis status polling
- report page with video player
- score cards
- feedback notes
- phase timeline
- parent/coach notes

For pose overlay, create a placeholder component first if keypoint rendering is not ready.
```

## 11. Pose overlay prompt

```txt
Read docs/AI_CV_PIPELINE.md and docs/UX_FLOWS.md.

Implement browser pose overlay:
- VideoPlayer component emits current time
- PoseOverlayCanvas draws skeleton landmarks from keypoints
- Match nearest keypoint frame by timestamp
- Add overlay on/off toggle

Do not generate annotated MP4. Render overlay in browser only.
```

## 12. Privacy review prompt

```txt
Read docs/PRIVACY_SECURITY.md, docs/API_SPEC.md, and docs/DATA_MODEL.md.

Review the current implementation for privacy/security issues involving youth athlete videos. Focus on:
- ownership checks
- signed URLs
- delete workflow
- CORS
- secret leakage
- public access risks

Return a prioritized fix list and implement only critical fixes after approval.
```

## 13. Release checklist prompt

```txt
Read docs/TESTING_QA.md, docs/DEPLOYMENT.md, and docs/IMPLEMENTATION_PLAN.md.

Create a release checklist for MVP and identify blockers. Run available tests, summarize failures, and propose the smallest fixes needed for a demo release.
```
