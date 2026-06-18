# BaseballAI Coach MVP Documentation Pack

This repo documentation pack is designed for Claude Code / VS Code development with token discipline.

## Product concept
BaseballAI Coach is a private youth baseball video-analysis web app. A parent or coach uploads a short pitching video, the system extracts pose/keypoint data, detects the main pitching phases, calculates simple mechanics metrics, and returns easy-to-understand coaching notes and progress tracking.

## MVP goal
Build the smallest useful version:

1. Parent account login
2. Athlete profile
3. Upload short pitching video
4. Server-side pose analysis
5. Save analysis metrics and keypoints
6. Dashboard with score cards, feedback, and video replay with pose overlay
7. Session history and basic progress comparison
8. Private video storage and delete option

## Recommended stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend API: FastAPI + Python
- Database: PostgreSQL
- ORM: SQLAlchemy or SQLModel
- Storage: Cloudflare R2, Supabase Storage, or S3-compatible storage
- Computer Vision: MediaPipe Pose + OpenCV
- Optional queue: Redis + RQ/Celery for async video jobs
- Auth: email/password + secure HTTP-only cookies or JWT
- Deployment: Vercel frontend, Render/Fly.io/Railway backend, managed Postgres, R2/S3 storage

## Token-saving usage pattern for Claude Code

Do not ask Claude Code to read every file for every task.
Use this loading pattern:

- Product decisions: read `PRD.md`
- Architecture decisions: read `ARCHITECTURE.md`
- Database work: read `DATA_MODEL.md`
- Backend endpoints: read `API_SPEC.md`
- CV/video analysis: read `AI_CV_PIPELINE.md`
- Frontend screens: read `UX_FLOWS.md`
- Privacy/minor safety: read `PRIVACY_SECURITY.md`
- Build sequence: read `IMPLEMENTATION_PLAN.md`
- Prompt templates: read `prompts/CLAUDE_CODE_PROMPTS.md`
- Coding standards: read `CLAUDE.md`

## Suggested repo layout

```txt
baseball-ai-coach/
  apps/
    web/                  # Next.js frontend
    api/                  # FastAPI backend
  packages/
    shared/               # shared TypeScript types, optional
  docs/                   # copy these markdown files here
  infra/                  # docker, deployment, IaC later
  storage/                # local dev sample files only, not production videos
  README.md
```

## V1 guardrails

This product is for private family/coaching use only. It is not medical advice, not injury diagnosis, and not a guarantee of athletic performance. For a 10-year-old athlete, privacy and parental control are mandatory.
