"""
Email notifications via Resend API.
Fails silently if RESEND_API_KEY is not configured.
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_RESEND_URL = "https://api.resend.com/emails"


def send_analysis_complete_email(
    *,
    to_email: str,
    athlete_name: str,
    session_title: str,
    session_id: str,
    overall_score: float,
    top_feedback: list[dict],
) -> None:
    """Send analysis-complete notification. No-op if RESEND_API_KEY unset."""
    if not settings.resend_api_key:
        return

    app_url = settings.app_base_url.rstrip("/")
    session_url = f"{app_url}/sessions/{session_id}"
    score_color = "#16a34a" if overall_score >= 80 else "#ca8a04" if overall_score >= 60 else "#dc2626"

    positives = [f for f in top_feedback if f.get("severity") == "positive"][:2]
    focus_items = [f for f in top_feedback if f.get("severity") in ("focus", "caution")][:2]

    feedback_html = ""
    for item in positives + focus_items:
        icon = "✓" if item.get("severity") == "positive" else "→" if item.get("severity") == "focus" else "!"
        bg = "#f0fdf4" if item.get("severity") == "positive" else "#eff6ff" if item.get("severity") == "focus" else "#fefce8"
        feedback_html += f"""
        <div style="background:{bg};border-radius:8px;padding:12px 14px;margin-bottom:8px;">
          <p style="margin:0;font-size:14px;color:#1f2937;font-weight:600;">
            {icon} {item.get('message', '')}
          </p>
          <p style="margin:6px 0 0 20px;font-size:13px;color:#6b7280;">
            {item.get('suggestion', '')}
          </p>
        </div>"""

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

    <div style="background:#1e3a5f;padding:24px 28px;">
      <p style="margin:0;color:#93c5fd;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;">BaseballAI Coach</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700;">Analysis complete</h1>
    </div>

    <div style="padding:28px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">
        {athlete_name}'s session <strong>{session_title}</strong> has been analyzed.
      </p>

      <div style="text-align:center;padding:24px 0;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;margin-bottom:20px;">
        <p style="margin:0;font-size:12px;color:#9ca3af;font-weight:600;letter-spacing:.06em;text-transform:uppercase;">Overall mechanics score</p>
        <p style="margin:8px 0 0;font-size:64px;font-weight:800;color:{score_color};line-height:1;">{round(overall_score)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">out of 100</p>
      </div>

      {f'<div style="margin-bottom:20px;">{feedback_html}</div>' if feedback_html else ''}

      <a href="{session_url}"
         style="display:block;text-align:center;background:#2563eb;color:#fff;text-decoration:none;
                font-weight:600;font-size:15px;padding:14px 24px;border-radius:8px;">
        View full report →
      </a>
    </div>

    <div style="padding:16px 28px;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        BaseballAI Coach provides general mechanics feedback for training purposes only —
        not medical advice or professional coaching certification.
      </p>
    </div>
  </div>
</body>
</html>"""

    try:
        resp = httpx.post(
            _RESEND_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}", "Content-Type": "application/json"},
            json={
                "from": settings.resend_from_email,
                "to": [to_email],
                "subject": f"Analysis ready: {athlete_name} — {session_title}",
                "html": html,
            },
            timeout=10,
        )
        resp.raise_for_status()
    except Exception as exc:
        logger.warning("Email send failed (non-fatal): %s", exc)
