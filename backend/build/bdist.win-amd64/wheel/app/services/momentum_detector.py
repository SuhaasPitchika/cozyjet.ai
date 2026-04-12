"""
Momentum Detector
─────────────────────────────────────────────────────────────────
Runs as a Celery task every 15 minutes.

Checks posts published within the last 90 minutes for momentum signals
by comparing save rate, comment rate, and profile visit conversion
against the user's personal baseline.

A total score above 50 within the first 90 minutes triggers a
WebSocket momentum alert with amplification actions.

Scoring weights (per spec):
  save rate > 2x baseline      → +40 points
  comment rate > 3x baseline   → +35 points
  profile visits > 50 in 60m   → +25 points
"""
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger("cozyjet.momentum")


def compute_momentum_score(current: dict, baseline: dict) -> tuple[int, list[str]]:
    """
    Compare current post metrics against the user's personal baseline.

    Args:
        current: {saves, comments, impressions, profile_visits, minutes_since_publish}
        baseline: {avg_save_rate, avg_comment_rate, avg_profile_visits_60m}

    Returns:
        (score: int, signals: list[str])
    """
    score = 0
    signals = []

    impressions = max(current.get("impressions", 1), 1)
    save_rate = current.get("saves", 0) / impressions
    comment_rate = current.get("comments", 0) / impressions
    profile_visits = current.get("profile_visits", 0)
    minutes = current.get("minutes_since_publish", 90)

    avg_save_rate = baseline.get("avg_save_rate", 0.01)
    avg_comment_rate = baseline.get("avg_comment_rate", 0.005)
    avg_profile_visits_60m = baseline.get("avg_profile_visits_60m", 10)

    if avg_save_rate > 0 and save_rate >= 2 * avg_save_rate:
        score += 40
        multiplier = round(save_rate / avg_save_rate, 1)
        signals.append(
            f"Save rate is {multiplier}x your average — the algorithm is going to push this further"
        )

    if avg_comment_rate > 0 and comment_rate >= 3 * avg_comment_rate:
        score += 35
        multiplier = round(comment_rate / avg_comment_rate, 1)
        signals.append(
            f"Comment rate is {multiplier}x your average — engagement velocity is high"
        )

    if minutes <= 60 and profile_visits >= 50:
        score += 25
        signals.append(
            f"{profile_visits} profile visits in the first hour — people are checking you out"
        )

    return score, signals


async def generate_amplification_actions(
    post_content: str,
    signals: list[str],
    niche: str,
) -> list[str]:
    """
    Use the classifier model to generate 3 specific amplification actions
    tailored to the momentum signals detected.
    """
    from ..services.model_router import call_openrouter

    system = (
        "You generate specific, actionable amplification steps for a social media post "
        "that is showing momentum signals right now. "
        "Each action must be specific and executable in the next 30 minutes. "
        "Return ONLY JSON: {\"actions\": [\"action1\", \"action2\", \"action3\"]}"
    )

    user_message = json.dumps({
        "post_preview": post_content[:300],
        "niche": niche,
        "momentum_signals": signals,
        "window": "The algorithm boost window is open right now",
        "generate": "3 specific amplification actions for the next 30 minutes",
    })

    try:
        raw = await call_openrouter(
            system_prompt=system,
            user_message=user_message,
            model="mistralai/mistral-7b-instruct",
            temperature=0.3,
            max_tokens=200,
            json_mode=True,
        )
        result = json.loads(raw.strip())
        return result.get("actions", [])
    except Exception as e:
        logger.error(f"Amplification action generation failed: {e}")
        return [
            "Reply to every comment in the next 20 minutes to keep engagement velocity high",
            "Share this post to your Stories or cross-post to another platform now",
            "Create a quick follow-up post on this topic while the algorithm is still distributing it",
        ]


def estimate_window_remaining(minutes_since_publish: int) -> int:
    """Estimate minutes remaining in the algorithm boost window."""
    boost_window = 90  # minutes
    return max(0, boost_window - minutes_since_publish)


def build_momentum_alert(
    post_id: str,
    post_preview: str,
    score: int,
    signals: list[str],
    minutes_since_publish: int,
    amplification_actions: list[str],
) -> dict:
    """Build the WebSocket payload for a momentum alert."""
    return {
        "type": "momentum_alert",
        "post_id": post_id,
        "post_preview": post_preview[:100],
        "momentum_score": score,
        "signals": signals,
        "window_remaining_minutes": estimate_window_remaining(minutes_since_publish),
        "amplification_actions": amplification_actions,
        "timestamp": datetime.utcnow().isoformat(),
    }
