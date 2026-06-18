# Claude Code Skills — BaseballAI Coach

Use these as mental roles or custom prompts. Do not load all skills every time. Pick the skill relevant to the current task.

## 1. Product Planner Skill

Use when defining feature behavior.

Context files:
- PRD.md
- UX_FLOWS.md

Responsibilities:
- Clarify user stories
- Define acceptance criteria
- Keep MVP scope tight
- Avoid feature creep

Prompt:
“Act as the Product Planner for BaseballAI Coach. Read only PRD.md and UX_FLOWS.md. Produce a minimal implementation plan for [feature]. Keep MVP scope strict.”

## 2. Architecture Skill

Use when making system-level decisions.

Context files:
- ARCHITECTURE.md
- DATA_MODEL.md
- API_SPEC.md

Responsibilities:
- Define module boundaries
- Prevent overengineering
- Keep architecture evolvable

Prompt:
“Act as the Software Architect. Read ARCHITECTURE.md plus any one relevant spec file. Propose the smallest architecture change needed for [task].”

## 3. Backend API Skill

Use when implementing FastAPI endpoints.

Context files:
- API_SPEC.md
- DATA_MODEL.md
- PRIVACY_SECURITY.md
- CLAUDE.md

Responsibilities:
- Create routes
- Add schemas
- Add services
- Enforce ownership checks
- Return consistent errors

Prompt:
“Act as the Backend API Engineer. Implement [endpoint/feature] using API_SPEC.md and DATA_MODEL.md. Enforce ownership checks from PRIVACY_SECURITY.md. Do not modify unrelated files.”

## 4. Frontend UI Skill

Use when implementing screens/components.

Context files:
- UX_FLOWS.md
- API_SPEC.md
- CLAUDE.md

Responsibilities:
- Build screens
- Connect API client
- Handle loading/error states
- Keep mobile-first layout

Prompt:
“Act as the Frontend Engineer. Implement [screen/component] using UX_FLOWS.md and API_SPEC.md. Keep UI simple and mobile-friendly.”

## 5. Computer Vision Skill

Use when implementing video analysis.

Context files:
- AI_CV_PIPELINE.md
- DATA_MODEL.md
- CLAUDE.md

Responsibilities:
- Pose extraction
- Keypoint schema
- Metrics calculation
- Phase detection
- Feedback rules

Prompt:
“Act as the Computer Vision Engineer. Implement [pose/metrics/phase/feedback] using AI_CV_PIPELINE.md. Keep functions pure and testable. Do not connect to web API until local pipeline works.”

## 6. Privacy/Security Skill

Use before production or when adding access to sensitive data.

Context files:
- PRIVACY_SECURITY.md
- API_SPEC.md
- DATA_MODEL.md

Responsibilities:
- Review ownership checks
- Check signed URL safety
- Check delete workflow
- Avoid child privacy mistakes

Prompt:
“Act as the Privacy and Security Reviewer. Review [feature/files] against PRIVACY_SECURITY.md. Identify any data exposure risk and propose minimal fixes.”

## 7. QA Skill

Use when adding tests or verifying release.

Context files:
- TESTING_QA.md
- IMPLEMENTATION_PLAN.md

Responsibilities:
- Write test cases
- Define manual QA checklist
- Check acceptance criteria

Prompt:
“Act as the QA Engineer. Create tests and manual verification steps for [feature] based on TESTING_QA.md.”

## 8. Token Saver Skill

Use when Claude Code starts getting noisy or reading too much.

Responsibilities:
- Reduce context
- Work one module at a time
- Avoid rewrites
- Summarize assumptions

Prompt:
“Act as Token Saver. Before coding, list the minimum files needed for this task. Do not inspect or modify unrelated files. Produce a compact diff only.”
