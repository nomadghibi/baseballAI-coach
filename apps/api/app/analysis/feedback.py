"""
Deterministic feedback rule engine.
Rules applied in priority order; at most one item per category.
Never make medical or injury claims.
"""

from app.analysis.schemas import FeedbackItem, MetricResult


def generate_feedback(
    scores: dict[str, float],
    metric_results: dict[str, MetricResult],
    video_quality_score: float,
) -> list[FeedbackItem]:
    items: list[FeedbackItem] = []

    # ── Recording quality first ───────────────────────────────────────────────
    if video_quality_score < 40:
        items.append(FeedbackItem(
            category="recording_quality",
            severity="caution",
            message="Video quality is too low for reliable analysis.",
            suggestion=(
                "Record from a stable side angle with the full body visible from head to feet. "
                "Use good lighting and keep the camera steady."
            ),
        ))
        # Return early — scores are not trustworthy
        return items

    if video_quality_score < 60:
        items.append(FeedbackItem(
            category="recording_quality",
            severity="focus",
            message="Analysis confidence is reduced due to video quality.",
            suggestion=(
                "For best results, record from a stable tripod at a 90° side angle, "
                "with the full body visible and bright lighting."
            ),
        ))

    # ── Balance ───────────────────────────────────────────────────────────────
    b = scores.get("balance", 50)
    b_conf = metric_results["balance"].confidence if "balance" in metric_results else 0.3
    if b_conf >= 0.5:
        if b >= 85:
            items.append(FeedbackItem(
                category="balance",
                severity="positive",
                message="Balance looked stable during leg lift.",
                suggestion="Keep the same tempo — consistent balance is a great foundation.",
            ))
        elif b < 65:
            items.append(FeedbackItem(
                category="balance",
                severity="focus",
                message="Lateral movement was noticeable during leg lift.",
                suggestion=(
                    "Try keeping the head directly over the stance leg during the lift. "
                    "Slow the leg lift down and focus on staying centered."
                ),
            ))

    # ── Head stability ────────────────────────────────────────────────────────
    hs = scores.get("head_stability", 50)
    hs_conf = metric_results["head_stability"].confidence if "head_stability" in metric_results else 0.3
    if hs_conf >= 0.5:
        if hs >= 80:
            items.append(FeedbackItem(
                category="head_stability",
                severity="positive",
                message="Head position stayed consistent from windup through release.",
                suggestion="Stable head movement helps with control — keep it up.",
            ))
        elif hs < 65:
            items.append(FeedbackItem(
                category="head_stability",
                severity="focus",
                message="Head movement increased near release.",
                suggestion=(
                    "Try to keep the eyes and head level through the stride and release. "
                    "Focus on a fixed target point and track it through the delivery."
                ),
            ))

    # ── Stride ────────────────────────────────────────────────────────────────
    st = scores.get("stride", 50)
    st_conf = metric_results["stride"].confidence if "stride" in metric_results else 0.3
    if st_conf >= 0.4:
        if st >= 80:
            items.append(FeedbackItem(
                category="stride",
                severity="positive",
                message="Stride length looks good for generating momentum.",
                suggestion="Record from the same angle next session to track consistency.",
            ))
        elif st < 50:
            items.append(FeedbackItem(
                category="stride",
                severity="focus",
                message="Stride length appeared shorter than expected.",
                suggestion=(
                    "A longer stride toward the target helps transfer energy from the lower body. "
                    "Practice striding toward a specific target spot on the mound."
                ),
            ))

    # ── Arm slot ──────────────────────────────────────────────────────────────
    arms = scores.get("arm_slot", 50)
    arms_conf = metric_results["arm_slot"].confidence if "arm_slot" in metric_results else 0.3
    if arms_conf < 0.4:
        items.append(FeedbackItem(
            category="arm_slot",
            severity="caution",
            message="Arm angle at release was difficult to measure from this angle.",
            suggestion=(
                "For better arm slot feedback, record from directly to the side "
                "with the full arm clearly visible."
            ),
        ))
    elif arms >= 80:
        items.append(FeedbackItem(
            category="arm_slot",
            severity="positive",
            message="Arm path through release looked consistent.",
            suggestion="Consistent arm slot is key to repeatable mechanics.",
        ))
    elif arms < 55:
        items.append(FeedbackItem(
            category="arm_slot",
            severity="focus",
            message="Arm angle at release varied or was outside a typical range.",
            suggestion=(
                "Work on a consistent arm path from glove-side to release. "
                "Record from the same side view angle to compare sessions."
            ),
        ))

    # ── Follow-through ────────────────────────────────────────────────────────
    ft = scores.get("follow_through", 50)
    ft_conf = metric_results["follow_through"].confidence if "follow_through" in metric_results else 0.3
    if ft_conf >= 0.4:
        if ft >= 80:
            items.append(FeedbackItem(
                category="follow_through",
                severity="positive",
                message="Follow-through was complete and extended.",
                suggestion="Good deceleration pattern — keep working on finishing strong.",
            ))
        elif ft < 55:
            items.append(FeedbackItem(
                category="follow_through",
                severity="focus",
                message="Follow-through appeared cut short after release.",
                suggestion=(
                    "Let the throwing arm finish all the way across and down after release. "
                    "A full follow-through protects the arm and improves velocity."
                ),
            ))

    # Ensure at least one item if no quality issue
    if not items and video_quality_score >= 60:
        items.append(FeedbackItem(
            category="general",
            severity="positive",
            message="Mechanics analysis complete. Keep recording sessions to track progress.",
            suggestion="Compare scores across sessions to see improvement over time.",
        ))

    return items
