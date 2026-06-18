# Testing and QA — BaseballAI Coach MVP

## 1. Testing goals
- Protect private data.
- Verify upload and analysis workflow.
- Make CV pipeline reliable enough for MVP.
- Prevent regressions in auth and ownership checks.

## 2. Backend tests

### Auth
- Register succeeds with valid email/password.
- Register rejects duplicate email.
- Login succeeds with correct password.
- Login fails with wrong password.
- `/auth/me` returns current user.

### Athlete
- Authenticated user can create athlete.
- User can list own athletes.
- User cannot access another user’s athlete.
- User can update own athlete.

### Sessions
- User can create session for own athlete.
- User cannot create session for another user’s athlete.
- User can list sessions.

### Video upload
- Init upload rejects unsupported file type.
- Init upload rejects oversized file.
- Complete upload creates analysis job.
- Playback URL requires ownership.

### Analysis
- Job status returns queued/processing/completed/failed.
- Completed analysis returns scores and feedback.
- Failed analysis returns user-safe error.

### Delete
- Delete video requires ownership.
- Delete session removes/marks related video and analysis.

## 3. CV tests

### Unit tests
- Video metadata extraction handles valid file.
- Pose extraction returns expected schema.
- Metrics functions handle missing keypoints.
- Feedback generator avoids strong claims when confidence is low.

### Golden sample tests
Use 2–3 short sample videos:
- Good side-view clip
- Poor quality clip
- Partial body/occluded clip

Expected behavior:
- Good clip has quality score above threshold.
- Poor clip returns quality warning.
- Partial body clip does not crash.

## 4. Frontend tests/manual checks

### Dashboard
- Shows empty state when no athletes.
- Shows athlete card after creation.

### Upload
- Mobile layout works.
- Upload progress visible.
- Unsupported file error visible.

### Report
- Score cards display.
- Feedback list display.
- Video player loads signed URL.
- Overlay toggle does not break video playback.

## 5. Security QA checklist

- [ ] User A cannot access User B athlete by changing URL.
- [ ] User A cannot access User B session by changing URL.
- [ ] User A cannot access User B video playback URL.
- [ ] Upload URL expires.
- [ ] Playback URL expires.
- [ ] Secrets are not in frontend bundle.
- [ ] CORS is restricted in production.
- [ ] Delete removes private video object.

## 6. Acceptance test script

1. Register User A.
2. Create athlete.
3. Create session.
4. Upload video.
5. Confirm job is queued.
6. Confirm job completes.
7. View analysis report.
8. Add note.
9. Register User B.
10. Try to access User A resources and confirm denied.
11. Delete User A video.
12. Confirm playback URL no longer works.

## 7. Performance targets for MVP

- Upload starts within 2 seconds after file selection.
- API basic endpoints under 500ms locally.
- Analysis completes for a 10-second video in reasonable local/dev time.
- Dashboard loads latest analysis under 2 seconds after API response.

Do not optimize before workflow works end to end.
