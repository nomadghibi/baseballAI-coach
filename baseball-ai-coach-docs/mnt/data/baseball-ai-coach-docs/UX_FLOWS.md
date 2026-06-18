# UX Flows — BaseballAI Coach MVP

## 1. UX goal
Make the app simple enough for a parent to use after practice without technical knowledge.

## 2. Main screens

### Public landing page
Purpose:
Explain the product.

Sections:
- Hero: “AI pitching feedback from a phone video.”
- How it works: Record → Upload → Analyze → Improve
- Privacy message: “Private by default. Parent-controlled.”
- MVP call-to-action: Sign up / Log in

### Register/Login
Simple email/password.

### Dashboard
Shows:
- Athlete cards
- Recent sessions
- Latest score
- Upload new video button

### Athlete profile
Shows:
- Athlete info
- Session history
- Progress chart
- Common coaching focus areas

### Upload flow
Steps:
1. Select athlete
2. Add session details
3. Upload video
4. Recording guide reminders
5. Wait for analysis

### Analysis status page
States:
- Uploading
- Uploaded
- Queued
- Processing
- Completed
- Failed

### Analysis report page
Shows:
- Video player with overlay toggle
- Overall score
- Metric score cards
- Coaching notes
- Pitching phase timeline
- Add parent/coach note
- Compare with previous session

### Settings/privacy page
Shows:
- Account info
- Data export placeholder
- Delete video/session
- Delete account placeholder

## 3. Upload recording guide
Show before upload:

```txt
For best analysis:
1. Use landscape mode.
2. Keep full body visible.
3. Record from the side first.
4. Use good lighting.
5. Record one pitch per clip.
6. Keep camera still.
```

## 4. Analysis report layout

```txt
[Video player with overlay toggle]

Overall Mechanics Score: 82/100

Score Cards:
- Balance: 90
- Head Stability: 74
- Stride: 80
- Arm Slot: 78
- Follow-through: 86
- Video Quality: 88

Coaching Focus:
1. Keep head stable through release.
2. Maintain same side-view recording angle.
3. Balance during leg lift looked strong.

Pitch Timeline:
Set → Leg Lift → Stride → Release → Follow-through

Session Notes:
[Add note]
```

## 5. UI component list

### Shared
- AppShell
- Navbar
- PageHeader
- EmptyState
- LoadingState
- ErrorState
- ConfirmDeleteDialog

### Athlete
- AthleteCard
- AthleteProfileForm
- AthleteStatsSummary

### Video
- VideoUploadDropzone
- UploadProgress
- VideoPlayer
- PoseOverlayCanvas
- PhaseTimeline

### Analysis
- OverallScoreGauge
- ScoreCard
- FeedbackList
- MetricExplanation
- QualityWarning
- ProgressTrend

### Notes
- NotesList
- NoteEditor

## 6. Tone of feedback
Use encouraging language.

Good:
- “Good stability during leg lift.”
- “One area to focus on: head movement near release.”
- “Try recording from the same angle next time for better comparison.”

Avoid:
- “Bad mechanics.”
- “Incorrect throwing motion.”
- “High injury risk.”

## 7. Empty states

### No athletes
“Create your first athlete profile to start tracking pitching progress.”

### No sessions
“Upload a short pitching video to create the first analysis.”

### No analysis yet
“Analysis is being prepared. This may take a little time depending on video length.”

### Poor video quality
“We could not confidently analyze this video. Try again with full body visible, side view, and steady camera.”

## 8. Mobile-first notes
Most uploads will come from phones. Prioritize:
- Large buttons
- Simple upload flow
- Clear progress state
- Responsive video player
- Avoid dense charts on mobile

## 9. Dashboard V1 wireframe

```txt
------------------------------------------------
BaseballAI Coach                         Account
------------------------------------------------
Welcome back

[Upload New Pitching Video]

Athletes
[Player Card]
  Latest Score: 82
  Last Session: Jun 18, 2026
  [View Profile]

Recent Sessions
Date        Athlete     Score   Status
Jun 18      Player      82      Completed
Jun 12      Player      78      Completed
------------------------------------------------
```

## 10. Report V1 wireframe

```txt
------------------------------------------------
Back to Athlete
Pitching Analysis — Jun 18, 2026
------------------------------------------------
[Video Player                    ]
[Overlay: ON/OFF]

Overall Score
82/100

Metrics
[Balance 90] [Head Stability 74] [Stride 80]
[Arm Slot 78] [Follow-through 86] [Quality 88]

Coaching Notes
- Balance looked stable during leg lift.
- Head movement increased near release.
- Follow-through direction looked consistent.

Pitching Phases
| Set | Leg Lift | Stride | Release | Follow-through |

Parent/Coach Notes
[ Add note text box ] [Save]
------------------------------------------------
```
