from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "cozyjet",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.skippy_tasks", "app.tasks.publishing_tasks"]
)

celery_app.conf.beat_schedule = {
    "daily-hunt": {
        "task": "app.tasks.skippy_tasks.hunt_all_users",
        "schedule": crontab(hour=7, minute=0)
    },
    "publish-scheduled": {
        "task": "app.tasks.publishing_tasks.publish_due",
        "schedule": 60.0
    }
}

celery_app.conf.timezone = "UTC"
