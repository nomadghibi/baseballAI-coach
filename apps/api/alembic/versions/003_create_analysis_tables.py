"""create analysis_jobs, analysis_results, keypoint_data tables

Revision ID: 003
Revises: 002
Create Date: 2026-06-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analysis_jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "video_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("videos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", sa.Text(), nullable=False, server_default="queued"),
        sa.Column("error_code", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_analysis_jobs_video_id", "analysis_jobs", ["video_id"])

    op.create_table(
        "analysis_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "video_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("videos.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("pitching_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "athlete_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("athletes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("overall_score", sa.Numeric(), nullable=False, server_default="0"),
        sa.Column("balance_score", sa.Numeric(), nullable=False, server_default="0"),
        sa.Column("head_stability_score", sa.Numeric(), nullable=False, server_default="0"),
        sa.Column("stride_score", sa.Numeric(), nullable=False, server_default="0"),
        sa.Column("arm_slot_score", sa.Numeric(), nullable=False, server_default="0"),
        sa.Column("follow_through_score", sa.Numeric(), nullable=False, server_default="0"),
        sa.Column("video_quality_score", sa.Numeric(), nullable=False, server_default="0"),
        sa.Column("metrics_json", postgresql.JSONB(), nullable=False, server_default="'{}'"),
        sa.Column("phases_json", postgresql.JSONB(), nullable=False, server_default="'[]'"),
        sa.Column("feedback_json", postgresql.JSONB(), nullable=False, server_default="'[]'"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_analysis_results_video_id", "analysis_results", ["video_id"])

    op.create_table(
        "keypoint_data",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "analysis_result_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("analysis_results.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("storage_key", sa.Text(), nullable=True),
        sa.Column("keypoints_json", postgresql.JSONB(), nullable=True),
        sa.Column("frame_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sample_rate_fps", sa.Numeric(), nullable=False, server_default="15"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_keypoint_data_result_id", "keypoint_data", ["analysis_result_id"])


def downgrade() -> None:
    op.drop_table("keypoint_data")
    op.drop_table("analysis_results")
    op.drop_table("analysis_jobs")
