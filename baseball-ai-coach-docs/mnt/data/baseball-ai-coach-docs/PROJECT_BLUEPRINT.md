# Complete Blueprint — BaseballAI Coach

## 1. Concept summary
BaseballAI Coach is a private AI-assisted youth baseball training web app. The first product analyzes pitching videos uploaded by a parent or coach. It uses computer vision to extract body pose, estimate pitching phases, calculate basic mechanics metrics, and display friendly coaching feedback with progress over time.

## 2. MVP product statement
A parent records a 3–10 second side-view pitching clip on a phone, uploads it to the web app, and receives an analysis report with scores, video overlay, feedback, and session history.

## 3. Why this is a strong first product
- The problem is easy to understand.
- Parents already record sports videos.
- Youth baseball is large and emotionally important to families.
- MVP can start with phone upload, not expensive hardware.
- The same architecture later expands to batting, fielding, running, teams, and facilities.

## 4. Target MVP user
Fred uses it privately for his 10-year-old grandson first. After validation, it can be adapted for parents, coaches, and youth baseball training facilities.

## 5. MVP feature set

### Account
- Register/login
- Parent-owned account

### Athlete
- Create athlete profile
- Store age/birth year, throwing hand, height, position

### Session
- Create pitching session
- Add date, location type, camera angle, notes

### Video
- Upload short video
- Store privately
- Playback with signed URL
- Delete

### Analysis
- Run pose estimation
- Extract keypoints
- Detect phases
- Score mechanics
- Generate feedback

### Report
- Video player
- Pose overlay
- Score cards
- Feedback notes
- Timeline
- Progress history

## 6. Architecture pattern

```txt
Web App -> API -> DB
             -> Object Storage
             -> CV Worker -> DB/Object Storage
```

## 7. MVP technical decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend | Next.js + TypeScript | Fast SaaS build |
| Backend | FastAPI | Best fit for Python CV |
| Database | PostgreSQL | Reliable relational data |
| Storage | R2/S3/Supabase | Private video files |
| CV | MediaPipe + OpenCV | Fast MVP without custom model |
| Overlay | Browser canvas | Avoid expensive annotated video generation |
| Auth | JWT/cookie | Simple MVP |
| Deployment | Vercel + hosted API | Fast deployment |

## 8. MVP workflow

```txt
Register/Login
  -> Create athlete
  -> Create pitching session
  -> Upload video
  -> Queue analysis
  -> Process pose/keypoints
  -> Save metrics
  -> View report
  -> Track progress
```

## 9. AI/CV MVP logic

### Input
One side-view pitching video.

### Processing
- Extract frames
- Detect pose landmarks
- Smooth keypoints
- Estimate video quality
- Identify phase timestamps
- Calculate metrics
- Generate feedback

### Output
- Overall score
- Balance score
- Head stability score
- Stride score
- Arm slot score
- Follow-through score
- Video quality score
- Coaching notes

## 10. Key limitations to be honest about

- Phone video is not a full biomechanics lab.
- Stride length is relative unless calibrated.
- Ball release is approximate without ball tracking.
- Pitch speed cannot be accurately measured from normal phone video.
- Feedback is general coaching guidance, not medical/injury diagnosis.

## 11. Expansion roadmap

### V1 — Pitching MVP
Single athlete, upload, analysis, dashboard.

### V2 — Better comparison
Compare side-by-side videos, progress trends, printable reports.

### V3 — Batting
Swing phase detection and hitting mechanics.

### V4 — Coach/team accounts
Coach dashboard for multiple athletes.

### V5 — Training facility version
White-label portal, multiple cameras, more athletes.

### V6 — Edge/live version
On-device processing during training.

## 12. Build order

1. Repo scaffold
2. Auth
3. Athlete profile
4. Session/video upload
5. CV local CLI
6. Analysis job system
7. Report dashboard
8. Pose overlay
9. Progress trends
10. Privacy hardening

## 13. Claude Code operating rule
Each task should load only the relevant document. Example:

- Building auth: API_SPEC + PRIVACY_SECURITY + CLAUDE
- Building CV: AI_CV_PIPELINE + DATA_MODEL + CLAUDE
- Building frontend upload: UX_FLOWS + API_SPEC + CLAUDE

## 14. First demo goal
The first demo should show:

1. Fred logs in.
2. Creates grandson athlete profile.
3. Uploads one pitching video.
4. System analyzes video.
5. Report shows score and 3 coaching notes.
6. Video plays with optional skeleton overlay.
7. Session appears in history.

## 15. MVP success definition
This product is successful if a parent says:

“I can clearly see what changed in his pitching from last week, and I know one thing to practice next.”
