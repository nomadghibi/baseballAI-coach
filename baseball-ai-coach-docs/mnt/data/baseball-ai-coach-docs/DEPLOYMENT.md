# Deployment — BaseballAI Coach MVP

## 1. MVP deployment target
Keep deployment simple.

Recommended:
- Frontend: Vercel
- Backend: Render, Fly.io, Railway, or similar
- Database: Managed PostgreSQL
- Storage: Cloudflare R2 or Supabase Storage
- Optional Redis: Upstash or provider Redis

## 2. Environments

### local
- Local Next.js
- Local FastAPI
- Local Postgres via Docker Compose
- Local file storage or dev bucket

### staging
- Hosted frontend
- Hosted backend
- Staging DB
- Staging storage bucket

### production
- Hosted frontend
- Hosted backend
- Production DB
- Production private storage bucket

## 3. Required environment variables

See `.env.example`.

Categories:
- Database
- Auth secrets
- Storage credentials
- CORS/frontend URL
- Upload limits
- Worker settings

## 4. Deployment sequence

1. Deploy Postgres.
2. Create private storage bucket.
3. Deploy backend API.
4. Run migrations.
5. Deploy frontend.
6. Test auth.
7. Test upload.
8. Test analysis job.
9. Test playback signed URL.
10. Test delete workflow.

## 5. Backend deployment notes

The CV stack may need system dependencies.

For Docker backend image, include:
- Python runtime
- OpenCV dependencies
- MediaPipe dependencies
- ffmpeg if using video metadata/processing

## 6. Worker deployment options

### Option A — MVP simple
Run analysis as FastAPI background task.

Pros:
- Easy
- Fast to build

Cons:
- Not reliable for long jobs
- Can timeout depending on platform

### Option B — Better MVP
Use Redis queue and separate worker process.

Pros:
- More reliable
- Better scaling

Cons:
- More setup

Recommended path:
Start with Option A locally. Move to Option B before production users.

## 7. Storage bucket rules

- Bucket must be private.
- Public access disabled.
- Backend generates signed URLs.
- Separate dev/staging/prod buckets.

## 8. Production hardening checklist

- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] CORS restricted
- [ ] Secrets in environment variables
- [ ] Private storage bucket
- [ ] DB migrations run
- [ ] Error logging enabled
- [ ] Upload size limit enforced
- [ ] Delete workflow tested
- [ ] Privacy disclaimer visible
- [ ] Backup strategy for DB

## 9. Cost control

MVP cost can stay low by:
- Processing short clips only
- Sampling frames at 15 FPS
- Rendering overlay in browser
- Storing keypoints JSON instead of annotated videos
- Using object storage for raw video
- Avoiding custom model training

## 10. Monitoring MVP

Track:
- API errors
- Failed analysis jobs
- Average analysis time
- Storage usage
- Upload failures
- Login failures
