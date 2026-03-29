from celery import Celery
from celery.schedules import crontab
from ..config import settings

celery_app = Celery(
    "cozyjet",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.skippy_tasks",
        "app.tasks.publishing_tasks",
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
)

celery_app.conf.beat_schedule = {
    # Sync all users every 2 hours
    "skippy-sync-all-users": {
        "task": "skippy.sync_all_users",
        "schedule": crontab(minute=0, hour="*/2"),
    },
    # Publish scheduled content every 60 seconds
    "publish-scheduled-content": {
        "task": "publishing.publish_scheduled_content",
        "schedule": 60.0,
    },
}
