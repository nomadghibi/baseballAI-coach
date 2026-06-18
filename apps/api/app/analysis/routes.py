import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.analysis.api_schemas import AnalysisJobResponse, AnalysisResultResponse
from app.analysis.models import AnalysisJob, AnalysisResult, KeypointData
from app.analysis.worker import run_analysis_job_task
from app.auth.models import User
from app.core.deps import get_current_user, get_db
from app.videos.models import Video
from app.videos.service import get_owned as get_owned_video

router = APIRouter(tags=["analysis"])


def _get_job_owned(db: Session, job_id: uuid.UUID, owner_id: uuid.UUID) -> AnalysisJob:
    job = (
        db.query(AnalysisJob)
        .join(Video, Video.id == AnalysisJob.video_id)
        .filter(AnalysisJob.id == job_id, Video.owner_user_id == owner_id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found")
    return job


def _get_result_owned(db: Session, video_id: uuid.UUID, owner_id: uuid.UUID) -> AnalysisResult:
    result = (
        db.query(AnalysisResult)
        .join(Video, Video.id == AnalysisResult.video_id)
        .filter(AnalysisResult.video_id == video_id, Video.owner_user_id == owner_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return result


@router.get("/analysis-jobs/{job_id}", response_model=AnalysisJobResponse)
def get_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_job_owned(db, job_id, current_user.id)


@router.get("/videos/{video_id}/analysis-job", response_model=AnalysisJobResponse)
def get_latest_job_for_video(
    video_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the most recent analysis job for a video."""
    get_owned_video(db, video_id, current_user.id)  # ownership check
    job = (
        db.query(AnalysisJob)
        .filter(AnalysisJob.video_id == video_id)
        .order_by(AnalysisJob.created_at.desc())
        .first()
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No analysis job found")
    return job


@router.post("/videos/{video_id}/analyze", response_model=AnalysisJobResponse, status_code=202)
def trigger_analysis(
    video_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger or retry analysis for an uploaded video."""
    video = get_owned_video(db, video_id, current_user.id)
    if video.status not in ("uploaded", "failed", "analyzed"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot start analysis when video status is '{video.status}'",
        )

    # Reset video status and create new job
    video.status = "uploaded"
    job = AnalysisJob(video_id=video.id, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(run_analysis_job_task, job.id, video.id)
    return job


@router.get("/athletes/{athlete_id}/progress")
def get_athlete_progress(
    athlete_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return per-session score trend and latest-vs-previous summary for an athlete."""
    from app.athletes.models import Athlete
    from app.sessions.models import PitchingSession

    athlete = (
        db.query(Athlete)
        .filter(Athlete.id == athlete_id, Athlete.owner_user_id == current_user.id)
        .first()
    )
    if not athlete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athlete not found")

    rows = (
        db.query(
            AnalysisResult,
            PitchingSession.session_date,
            PitchingSession.title,
        )
        .join(PitchingSession, PitchingSession.id == AnalysisResult.session_id)
        .filter(AnalysisResult.athlete_id == athlete_id)
        .order_by(PitchingSession.session_date.asc(), AnalysisResult.created_at.asc())
        .all()
    )

    trends = [
        {
            "session_id": str(row.AnalysisResult.session_id),
            "session_title": row.title,
            "date": row.session_date.isoformat(),
            "overall_score": float(row.AnalysisResult.overall_score),
            "balance_score": float(row.AnalysisResult.balance_score),
            "head_stability_score": float(row.AnalysisResult.head_stability_score),
            "stride_score": float(row.AnalysisResult.stride_score),
            "arm_slot_score": float(row.AnalysisResult.arm_slot_score),
            "follow_through_score": float(row.AnalysisResult.follow_through_score),
            "video_quality_score": float(row.AnalysisResult.video_quality_score),
        }
        for row in rows
    ]

    latest = trends[-1] if trends else None
    prev = trends[-2] if len(trends) >= 2 else None

    return {
        "athlete_id": str(athlete_id),
        "sessions_count": len(trends),
        "trends": trends,
        "latest_summary": {
            "overall_score": latest["overall_score"],
            "change_from_previous": (
                round(latest["overall_score"] - prev["overall_score"], 1) if prev else None
            ),
        }
        if latest
        else None,
    }


@router.get("/videos/{video_id}/analysis", response_model=AnalysisResultResponse)
def get_analysis(
    video_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = _get_result_owned(db, video_id, current_user.id)
    kd = (
        db.query(KeypointData)
        .filter(KeypointData.analysis_result_id == result.id)
        .first()
    )
    return AnalysisResultResponse(
        video_id=result.video_id,
        session_id=result.session_id,
        athlete_id=result.athlete_id,
        overall_score=float(result.overall_score),
        scores={
            "balance": float(result.balance_score),
            "head_stability": float(result.head_stability_score),
            "stride": float(result.stride_score),
            "arm_slot": float(result.arm_slot_score),
            "follow_through": float(result.follow_through_score),
            "video_quality": float(result.video_quality_score),
        },
        phases=result.phases_json,
        metrics_detail=result.metrics_json,
        feedback=result.feedback_json,
        keypoints=kd.keypoints_json if kd else [],
        created_at=result.created_at.isoformat(),
    )
