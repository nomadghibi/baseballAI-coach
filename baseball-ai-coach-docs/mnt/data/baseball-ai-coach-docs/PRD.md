# PRD — BaseballAI Coach MVP

## 1. Product name
BaseballAI Coach

## 2. One-line description
A private AI-powered web app that analyzes youth baseball pitching videos and gives simple mechanics feedback, progress tracking, and coaching notes.

## 3. Target user

### Primary user
Parent or guardian of a youth baseball player.

### Secondary user
Youth baseball coach, private trainer, or small training facility.

### Initial athlete profile
Youth baseball player, age 8–14, starting with pitching mechanics.

## 4. Problem
Parents and youth coaches can record pitching videos, but they often do not know what to look for or how to track progress over time. Professional biomechanical analysis is expensive and usually aimed at elite athletes. Youth players need a simple, private, understandable tool that shows what changed from one session to the next.

## 5. Product opportunity
Use a normal phone video, computer vision pose estimation, and simple coaching logic to create an affordable AI pitching review system.

## 6. MVP outcome
A parent can upload a short pitching video, receive a mechanics report, watch the video with a pose overlay, and compare today’s results with previous sessions.

## 7. MVP scope

### Must have
- User registration/login
- Athlete profile management
- Upload short pitching video
- Store video privately
- Run server-side pose estimation
- Extract body keypoints per frame
- Detect key pitching phases
- Calculate basic pitching mechanics metrics
- Generate simple feedback notes
- Show analysis dashboard
- Show session history
- Delete uploaded videos and analysis records

### Should have
- Video replay with pose overlay rendered in browser
- Compare two sessions
- Manual coach/parent notes
- Basic export as PDF or printable report

### Could have later
- Batting analysis
- Fielding analysis
- Catching analysis
- Team accounts
- Coach accounts
- AI chat assistant
- Paid subscription
- Mobile app
- Ball tracking
- Pitch speed estimate
- Injury risk flagging after clinical validation

### Out of scope for MVP
- Public athlete profiles
- Social sharing
- Automatic identification of children from a group video
- Medical/injury diagnosis
- Radar-grade velocity measurement
- Live real-time coaching
- NCAA/pro scouting claims
- Fully automated biomechanical expert replacement

## 8. User stories

### Parent stories
1. As a parent, I want to create an account so my child’s videos stay private.
2. As a parent, I want to create my athlete’s profile so the app can track sessions over time.
3. As a parent, I want to upload a pitching video from my phone so I can get analysis.
4. As a parent, I want simple feedback so I know what to help my child practice.
5. As a parent, I want to compare sessions so I can see improvement.
6. As a parent, I want to delete any video permanently.

### Coach stories
1. As a coach, I want to review a pitching session and add notes.
2. As a coach, I want to see mechanics scores over time.
3. As a coach, I want consistent metrics instead of guessing from memory.

## 9. Core workflow

1. User logs in.
2. User creates/selects athlete.
3. User uploads video.
4. Backend stores video and creates an `analysis_job`.
5. CV worker extracts pose keypoints.
6. Phase detector identifies major pitch stages.
7. Metrics engine calculates scores.
8. Feedback engine generates coaching notes.
9. Dashboard displays results.
10. User can replay, compare, annotate, or delete.

## 10. MVP metrics

### Pitching mechanics metrics
- Balance score
- Head stability score
- Stride consistency score
- Arm slot consistency score
- Follow-through direction score
- Overall mechanics score

### Session metrics
- Video duration
- Frames analyzed
- Confidence quality
- Analysis status
- Notes count

### Product metrics
- Upload success rate
- Analysis completion rate
- Average processing time
- Number of sessions per athlete
- Returning users

## 11. Feedback style

Feedback must be simple and parent-friendly.

Good:
- “Head movement increased near release. Try keeping the head still over the stride leg.”
- “Stride length appears more consistent than the last session.”
- “Arm slot changed between pitches. Record from the same angle next time for better comparison.”

Avoid:
- Medical diagnosis
- Injury prediction
- Professional scouting language
- Complex biomechanics jargon without explanation

## 12. MVP acceptance criteria

### Upload
- User can upload MP4/MOV video under configured file size.
- Upload belongs only to the logged-in user.
- System rejects unsupported file types.

### Analysis
- System can process one short pitching video.
- System stores pose keypoints and metrics.
- System marks failed jobs with clear user-facing error.
- User can retry failed analysis.

### Dashboard
- User sees overall score and individual metrics.
- User sees at least three coaching notes.
- User can play the original video.
- User can enable/disable skeleton overlay if keypoints exist.

### Privacy
- User can delete video and analysis.
- Non-owner cannot access athlete, video, or analysis.
- No public sharing exists in MVP.

## 13. Naming options

- BaseballAI Coach
- PitchSmart AI
- YouthPitch AI
- DiamondMotion AI
- SmartPitch Coach

## 14. Initial positioning

“For parents and youth baseball coaches who want simple, private, AI-assisted pitching feedback from phone videos.”
