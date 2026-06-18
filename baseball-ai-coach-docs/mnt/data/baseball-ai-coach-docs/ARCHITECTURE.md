# Architecture — BaseballAI Coach MVP

## 1. Architecture goal
Build a simple, modular web app that can start as a single-athlete/family product and later expand into teams, coaches, facilities, and mobile apps.

## 2. Architecture principles

1. Keep video storage separate from application database.
2. Store extracted keypoints and metrics, not only raw videos.
3. Use async processing for video analysis.
4. Render pose overlay in the browser using stored keypoints to avoid expensive annotated-video generation.
5. Keep MVP private and single-tenant per user account.
6. Design data model so future team/facility accounts can be added without rewrite.
7. Avoid premature Kubernetes and microservices for MVP.
8. Use clear module boundaries so code can later split into services.

## 3. High-level system

```txt
Phone / Browser
   |
   | upload video
   v
Next.js Web App  ---> FastAPI Backend ---> PostgreSQL
   |                     |
   |                     | signed upload/download URLs
   |                     v
   |                 Object Storage
   |                     |
   |                     v
   |               CV Analysis Worker
   |                     |
   | keypoints/metrics   v
   +<---------------- PostgreSQL
```

## 4. Main components

### Web frontend
Responsible for:
- Authentication screens
- Athlete profile screens
- Video upload flow
- Analysis status polling
- Dashboard and score cards
- Video player with canvas pose overlay
- Session history

Recommended stack:
- Next.js
- TypeScript
- Tailwind CSS
- React Query or TanStack Query
- Zod for validation

### Backend API
Responsible for:
- Auth
- Athlete CRUD
- Video record creation
- Signed upload/download URL generation
- Analysis job creation/status
- Metrics retrieval
- Delete workflows

Recommended stack:
- FastAPI
- SQLAlchemy/SQLModel
- Alembic migrations
- Pydantic schemas
- PostgreSQL

### CV worker
Responsible for:
- Downloading video from object storage or local path
- Running frame extraction
- Running MediaPipe Pose
- Creating per-frame keypoints
- Detecting pitching phases
- Calculating metrics
- Saving analysis results

Recommended stack:
- Python
- OpenCV
- MediaPipe
- NumPy/Pandas for metric calculations

### Storage
Responsible for:
- Original videos
- Optional thumbnails
- Optional generated preview frames

Recommended options:
- Cloudflare R2
- Supabase Storage
- AWS S3

### Database
Responsible for:
- Users
- Athletes
- Videos metadata
- Analysis jobs
- Keypoint summaries
- Metrics
- Coaching feedback
- Notes

Do not store raw video bytes in PostgreSQL.

## 5. MVP deployment model

```txt
Vercel: Next.js web
Render/Fly.io/Railway: FastAPI backend + worker
Managed Postgres: Supabase/Neon/Railway
Cloudflare R2/Supabase Storage: videos
Redis: optional queue
```

For first local development, the worker can run inside the FastAPI app as a background task. Move to Redis queue after MVP works.

## 6. Backend module boundaries

```txt
api/
  app/
    main.py
    core/
      config.py
      security.py
      storage.py
    auth/
      routes.py
      service.py
      models.py
      schemas.py
    athletes/
      routes.py
      service.py
      models.py
      schemas.py
    videos/
      routes.py
      service.py
      models.py
      schemas.py
    analysis/
      routes.py
      service.py
      worker.py
      metrics.py
      phase_detection.py
      feedback.py
      schemas.py
    notes/
      routes.py
      service.py
      models.py
```

## 7. Frontend module boundaries

```txt
web/
  app/
    page.tsx
    login/page.tsx
    register/page.tsx
    dashboard/page.tsx
    athletes/[athleteId]/page.tsx
    athletes/[athleteId]/sessions/[sessionId]/page.tsx
    upload/page.tsx
  components/
    video/
      VideoPlayer.tsx
      PoseOverlay.tsx
    dashboard/
      ScoreCard.tsx
      MetricTrend.tsx
      FeedbackList.tsx
    athlete/
      AthleteProfileForm.tsx
  lib/
    api.ts
    auth.ts
    types.ts
```

## 8. Analysis flow

```txt
POST /videos/init-upload
  -> creates video row with status UPLOADING
  -> returns signed upload URL

Browser uploads video to storage

POST /videos/{video_id}/complete-upload
  -> verifies object exists
  -> updates status UPLOADED
  -> creates analysis job

Worker processes job
  -> status PROCESSING
  -> extracts frames/keypoints
  -> calculates phases/metrics
  -> saves analysis
  -> status COMPLETED or FAILED

GET /videos/{video_id}/analysis
  -> returns metrics, phase timestamps, keypoints URL/data, feedback notes
```

## 9. Key design decision: browser overlay instead of annotated video

MVP should not generate a new annotated MP4 unless needed. Instead:

- Store original video in object storage.
- Store keypoints as compressed JSON.
- Frontend plays video.
- Frontend canvas draws skeleton overlay based on timestamp.

Benefits:
- Faster MVP
- Lower compute cost
- Less storage
- Easier to toggle overlay

## 10. Scaling path

### Stage 1: Family MVP
- One account owns athletes.
- Manual upload.
- Async analysis.

### Stage 2: Coach/team version
- Add organizations.
- Add coach roles.
- Share athlete sessions with permission.

### Stage 3: Facility version
- Multi-camera capture.
- Edge device ingestion.
- Real-time capture.

### Stage 4: Mobile version
- Native camera capture.
- Guided recording angle.
- Offline upload queue.

## 11. Main risks

### CV accuracy risk
Phone video angle, lighting, and occlusion may reduce pose accuracy.

Mitigation:
- Provide recording guide.
- Add quality score.
- Tell user when video is not suitable.

### Privacy risk
Videos involve minors.

Mitigation:
- Private by default.
- Parent-owned account.
- Delete option.
- No public sharing in MVP.

### Overclaiming risk
Sports mechanics feedback could be mistaken for professional coaching or injury advice.

Mitigation:
- Clear disclaimers.
- Use “suggested coaching focus,” not medical claims.

## 12. Architecture non-goals for MVP

- Kubernetes
- Multi-camera live streaming
- Real-time edge AI
- Complex team permissions
- Payment subscriptions
- Native mobile apps
- Custom ML training pipeline
