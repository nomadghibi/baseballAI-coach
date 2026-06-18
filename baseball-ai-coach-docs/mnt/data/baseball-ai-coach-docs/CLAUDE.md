# CLAUDE.md — Coding Guidance for BaseballAI Coach

## Project mission
Build a private web app for youth baseball pitching video analysis. The MVP lets a parent upload a short pitching video, runs pose estimation, calculates simple mechanics metrics, and shows a clear analysis dashboard.

## Current MVP scope
Only build:
- Parent auth
- Athlete profile
- Pitching session
- Video upload
- Pose/keypoint analysis
- Mechanics metrics
- Feedback report
- Session history
- Delete video/session

Do not build unless explicitly requested:
- Batting analysis
- Team accounts
- Payments
- Native mobile app
- Public sharing
- Face recognition
- Live edge AI
- Custom ML training

## Token-saving rule
Before coding, inspect only the files relevant to the task.

Use this context map:
- Product behavior: `docs/PRD.md`
- Architecture: `docs/ARCHITECTURE.md`
- DB: `docs/DATA_MODEL.md`
- API: `docs/API_SPEC.md`
- CV: `docs/AI_CV_PIPELINE.md`
- UI: `docs/UX_FLOWS.md`
- Security/privacy: `docs/PRIVACY_SECURITY.md`
- Plan: `docs/IMPLEMENTATION_PLAN.md`

If a task can be completed by reading one file, do not read all docs.

## Engineering principles

1. Prefer simple working code over complex architecture.
2. Keep backend business logic in services, not route handlers.
3. Keep CV pipeline modular and testable.
4. Validate all API input.
5. Enforce ownership checks on every resource.
6. Keep videos private.
7. Store video files outside the database.
8. Store keypoints and metrics in structured format.
9. Use deterministic feedback rules before adding LLM feedback.
10. Never make medical or injury claims.

## Backend standards

- Use FastAPI routers by domain.
- Use Pydantic schemas for request/response.
- Use SQLAlchemy/SQLModel models.
- Use Alembic for migrations.
- Use dependency injection for current user.
- Centralize auth and ownership checks.
- Return consistent error format.

## Frontend standards

- Use TypeScript.
- Use simple server/API client wrapper.
- Keep components small.
- Keep upload flow mobile-friendly.
- Use clear loading/error states.
- Avoid dense dashboard UI in MVP.

## CV standards

- Keep pose extraction separate from metric calculation.
- Save intermediate keypoints for debugging.
- Add confidence scores.
- If confidence is low, show quality warning instead of strong feedback.
- Use side-view pitching as the first supported angle.

## Security rules

- Never expose videos publicly.
- Use signed URLs.
- Do not log signed URLs.
- Do not commit secrets.
- Do not store raw card/payment data; payments are out of scope.
- Use secure password hashing.
- Restrict CORS.
- Validate file type and size.

## Child privacy rules

- Parent/guardian account owns data.
- No public sharing in MVP.
- No face recognition.
- Avoid full date of birth.
- Delete must remove video and analysis.
- Do not use videos for training without explicit consent.

## Definition of done for any feature

A feature is done only when:
- Backend route/service exists if needed.
- Frontend UI exists if needed.
- Ownership/security check exists.
- Basic tests or manual verification steps are added.
- Error state is handled.
- Documentation updated if behavior changed.

## Response style for Claude Code
When asked to implement:
1. Briefly list files you will edit.
2. Implement minimal complete change.
3. Show how to run/test.
4. Mention any assumptions.

Do not rewrite large unrelated files.
