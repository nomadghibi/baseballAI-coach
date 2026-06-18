# AI / Computer Vision Pipeline — BaseballAI Coach MVP

## 1. MVP CV goal
Analyze one youth pitching video and return useful, understandable feedback.

The first version does not need perfect biomechanics. It needs:
- Reliable pose extraction when the video is recorded correctly.
- Basic phase detection.
- Simple mechanics metrics.
- Clear quality warnings when video is poor.

## 2. Input requirements

Recommended recording:
- Landscape orientation
- 1080p if possible
- 60 FPS preferred, 30 FPS acceptable
- Full body visible from head to feet
- Camera on tripod or stable surface
- Side view first
- Bright lighting
- One pitcher only
- Clip length: 3–10 seconds
- One pitch per clip for MVP

## 3. Processing stages

```txt
1. Validate video
2. Extract metadata
3. Sample frames
4. Run pose estimation
5. Smooth keypoints
6. Estimate video quality
7. Detect pitching phases
8. Calculate metrics
9. Score mechanics
10. Generate feedback
11. Save results
```

## 4. Stage details

### 4.1 Validate video
Check:
- File type: mp4, mov
- File size under configured max
- Duration under configured max
- Resolution readable
- Video has frames

Reject or fail gracefully if invalid.

### 4.2 Extract metadata
Use OpenCV or ffprobe:
- duration_seconds
- fps
- frame_count
- width
- height

### 4.3 Sample frames
For MVP:
- Process 15 FPS or every Nth frame to reduce compute.
- Keep timestamps aligned to original video.

### 4.4 Pose estimation
Use MediaPipe Pose.

Important landmarks:
- nose
- left/right shoulder
- left/right elbow
- left/right wrist
- left/right hip
- left/right knee
- left/right ankle
- left/right heel/foot index if available

Store:
- x normalized coordinate
- y normalized coordinate
- visibility/confidence
- timestamp_sec

### 4.5 Smooth keypoints
Pose data may jitter. Use simple smoothing:
- Moving average over 3–5 frames
- Ignore landmarks below confidence threshold
- Interpolate short missing segments only if safe

### 4.6 Video quality score
Quality score should detect whether analysis is trustworthy.

Factors:
- Full body visible
- Keypoint confidence average
- Number of frames with reliable shoulders/hips/ankles/wrists
- Camera stability approximation
- Athlete not too small in frame
- One visible primary person

Quality labels:
- Good: 80–100
- Usable: 60–79
- Weak: 40–59
- Not analyzable: below 40

If weak, show:
“Analysis confidence is low. Record from a stable side angle with the full body visible.”

## 5. Pitching phase detection

MVP phase detection is heuristic-based.

### Phases
1. Set position
2. Leg lift
3. Stride
4. Release approximation
5. Follow-through

### Heuristic signals

#### Leg lift
Detect when lead knee rises relative to hip.

#### Stride
Detect when lead foot moves forward/down from peak knee lift.

#### Release approximation
Without ball tracking, approximate release near:
- maximum forward wrist speed
- wrist crossing near/above shoulder line
- after stride foot plant

#### Follow-through
Frames after release where torso and throwing arm move forward/down.

## 6. Metrics

### 6.1 Balance score
Approximate with:
- head/nose horizontal movement during leg lift
- centerline deviation between head and hips
- torso tilt stability

Output:
- score 0–100
- confidence
- explanation

### 6.2 Head stability score
Approximate with:
- nose displacement from set position to release
- nose movement during stride/release window

### 6.3 Stride score
Approximate with:
- lead ankle displacement from set position to foot plant
- consistency if multiple pitches later

MVP limitation:
Without real-world calibration, stride length is relative, not inches.

### 6.4 Arm slot score
Approximate with:
- angle between shoulder-elbow-wrist at release window
- throwing arm side inferred from athlete profile

### 6.5 Follow-through score
Approximate with:
- throwing wrist continues forward/down after release
- torso follows toward target
- back leg movement indicates completion

### 6.6 Overall score
Weighted score:

```txt
overall =
  balance_score * 0.20 +
  head_stability_score * 0.20 +
  stride_score * 0.20 +
  arm_slot_score * 0.20 +
  follow_through_score * 0.15 +
  video_quality_score * 0.05
```

## 7. Feedback generation rules

Start deterministic. Do not use LLM until metrics are stable.

Example rules:

```txt
IF video_quality_score < 60:
  show recording improvement note first

IF head_stability_score < 70:
  add head stability focus note

IF balance_score > 85:
  add positive balance note

IF arm_slot_score confidence < 0.60:
  avoid strong arm-slot claims
```

## 8. Feedback severity levels

- positive
- focus
- caution
- recording_quality

## 9. Example output

```json
{
  "overall_score": 82,
  "scores": {
    "balance": 90,
    "head_stability": 74,
    "stride": 80,
    "arm_slot": 78,
    "follow_through": 86,
    "video_quality": 88
  },
  "feedback": [
    {
      "category": "balance",
      "severity": "positive",
      "message": "Balance looked stable during leg lift.",
      "suggestion": "Keep the same tempo and record from this angle again next time."
    },
    {
      "category": "head_stability",
      "severity": "focus",
      "message": "Head movement increased near release.",
      "suggestion": "Work on keeping the head centered through stride and release."
    }
  ]
}
```

## 10. Later upgrades

### Batting analysis
- stance
- load
- stride
- hip rotation
- contact approximation
- follow-through

### Ball tracking
- YOLO or custom detection
- harder because ball is small and fast
- requires high FPS and good angle

### Multiple pitches per clip
- segment each pitch automatically
- compare consistency pitch-to-pitch

### Real-time feedback
- requires mobile/edge optimization
- not MVP

## 11. Important safety limitation

This system should not claim to diagnose injury risk. It can say:
“Movement pattern changed from prior sessions.”

It should not say:
“Your child is at risk of elbow injury.”

## 12. Development strategy for Claude Code

Build CV pipeline separately from web app first:

1. Create `/apps/api/app/analysis/pose.py`
2. Write function: `extract_pose_keypoints(video_path) -> PoseResult`
3. Write tests with sample dummy/small video
4. Write `metrics.py` using saved keypoints
5. Only after local CLI works, connect to API job

This saves tokens and reduces debugging complexity.
