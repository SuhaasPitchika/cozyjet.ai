from celery import Celery
from celery.schedules import crontab
from ..config import settings

celery_app = Celery(
    "cozyjet",
    broker=settings.CELERY_BROKER_URL or "memory://",
    backend=settings.REDIS_URL or "cache+memory://",
    include=[
        "app.tasks.skippy_tasks",
        "app.tasks.publishing_tasks",
        "app.tasks.analytics_tasks",
        "app.tasks.snooks_tasks",
        "app.tasks.momentum_tasks",
        "app.tasks.relationship_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    # Graceful fallback when Redis is not available
    task_always_eager=not bool(settings.REDIS_URL),
)

celery_app.conf.beat_schedule = {
    # Sync all integrations every 2 hours — Skippy reads fresh work data
    "skippy-sync-all-users": {
        "task": "skippy.sync_all_users",
        "schedule": crontab(minute=0, hour="*/2"),
    },
    # Publish scheduled content every 60 seconds
    "publish-scheduled-content": {
        "task": "publishing.publish_scheduled_content",
        "schedule": 60.0,
    },
    # Refresh post analytics every 4 hours
    "analytics-refresh-all": {
        "task": "analytics.refresh_all",
        "schedule": crontab(minute=30, hour="*/4"),
    },
    # Morning digest: 7AM UTC — Snooks reviews next 7 days and fills calendar gaps
    "morning-digest": {
        "task": "skippy.morning_digest",
        "schedule": crontab(minute=0, hour=7),
    },
    # Weekly growth experiment: every Monday at 8AM UTC
    "weekly-growth-experiment": {
        "task": "snooks.run_growth_experiment",
        "schedule": crontab(minute=0, hour=8, day_of_week=1),
    },
    # Weekly strategy: every Sunday at 8PM UTC
    "weekly-strategy": {
        "task": "snooks.weekly_strategy",
        "schedule": crontab(minute=0, hour=20, day_of_week=0),
    },
    # Momentum check: every 15 minutes
    "momentum-check": {
        "task": "momentum.check_all",
        "schedule": crontab(minute="*/15"),
    },
    # Relationship engine: daily at 9AM UTC
    "relationship-engine": {
        "task": "relationships.run_engine",
        "schedule": crontab(minute=0, hour=9),
    },
    # Conversation hunt: daily at 7AM UTC
    "conversation-hunt": {
        "task": "relationships.hunt_conversations",
        "schedule": crontab(minute=0, hour=7),
    },
}
