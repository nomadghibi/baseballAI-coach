"""
Background analysis worker.

Runs synchronously in a threadpool via FastAPI BackgroundTasks.
Creates its own DB session — cannot use request-scoped sessions.
"""

import uuid
from datetime import datetime, timezone

from app.core.database import SessionLocal


def run_analysis_job_task(job_id: uuid.UUID, video_id: uuid.UUID) -> None:
    """Entry point called by FastAPI BackgroundTasks."""
    db = SessionLocal()
    job = None
    video = None
    try:
        from app.analysis.models import AnalysisJob, AnalysisResult, KeypointData
        from app.athletes.models import Athlete
        from app.sessions.models import PitchingSession
        from app.videos.models import Video

        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        video = db.query(Video).filter(Video.id == video_id).first()

        if not job or not video:
            return

        job.status = "processing"
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        # Get throwing hand from athlete profile
        session_row = db.query(PitchingSession).filter(PitchingSession.id == video.session_id).first()
        athlete = db.query(Athlete).filter(Athlete.id == session_row.athlete_id).first()
        throwing_hand = (athlete.throwing_hand or "right").lower()

        # Download video to temp file (works for local and r2)
        from app.core import storage as store
        tmp = store.download_to_temp(video.storage_key)
        video_path = tmp.name
        tmp.close()

        # Run CV pipeline
        try:
            from app.analysis.pipeline import analyze_video
            result_dict = analyze_video(video_path, throwing_hand=throwing_hand)
        finally:
            import os
            try:
                os.unlink(video_path)
            except OSError:
                pass

        if result_dict.get("status") == "failed":
            raise RuntimeError(result_dict.get("reason", "CV pipeline returned failed status"))

        # Persist results
        scores = result_dict.get("scores", {})
        ar = AnalysisResult(
            video_id=video.id,
            session_id=video.session_id,
            athlete_id=session_row.athlete_id,
            overall_score=result_dict.get("overall_score", 0),
            balance_score=scores.get("balance", 0),
            head_stability_score=scores.get("head_stability", 0),
            stride_score=scores.get("stride", 0),
            arm_slot_score=scores.get("arm_slot", 0),
            follow_through_score=scores.get("follow_through", 0),
            video_quality_score=scores.get("video_quality", 0),
            metrics_json=result_dict.get("metrics_detail", {}),
            phases_json=result_dict.get("phases", []),
            feedback_json=result_dict.get("feedback", []),
        )
        db.add(ar)
        db.flush()

        kd = KeypointData(
            analysis_result_id=ar.id,
            keypoints_json=result_dict.get("keypoints_sample", []),
            frame_count=result_dict.get("metadata", {}).get("frames_analyzed", 0),
            sample_rate_fps=15,
        )
        db.add(kd)

        video.status = "analyzed"
        job.status = "completed"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

        # Email notification — fetch user email after commit so all data is final
        try:
            from app.auth.models import User
            from app.core.email import send_analysis_complete_email

            user = db.query(User).filter(User.id == athlete.owner_user_id).first()
            if user:
                send_analysis_complete_email(
                    to_email=user.email,
                    athlete_name=athlete.first_name,
                    session_title=session_row.title,
                    session_id=str(video.session_id),
                    overall_score=result_dict.get("overall_score", 0),
                    top_feedback=result_dict.get("feedback", []),
                )
        except Exception as email_exc:
            import logging
            logging.getLogger(__name__).warning("Email notification failed: %s", email_exc)

    except Exception as exc:
        try:
            if job:
                job.status = "failed"
                job.error_message = str(exc)[:500]
            if video:
                video.status = "failed"
            db.commit()
        except Exception:
            pass
    finally:
        db.close()
