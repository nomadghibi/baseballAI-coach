import re
from pathlib import Path

from app.core.config import settings


def _safe_filename(filename: str) -> str:
    stem = re.sub(r"[^a-z0-9_-]", "_", Path(filename).stem.lower())[:50]
    suffix = Path(filename).suffix.lower()
    return f"{stem}{suffix}"


def build_storage_key(user_id: str, video_id: str, filename: str) -> str:
    return f"{user_id}/{video_id}/{_safe_filename(filename)}"


def get_upload_url(video_id: str) -> str:
    if settings.storage_provider == "local":
        return f"{settings.storage_base_url}/api/v1/videos/{video_id}/upload"
    raise NotImplementedError(f"Storage provider '{settings.storage_provider}' not yet implemented")


def save_file(storage_key: str, data: bytes) -> None:
    path = Path(settings.storage_local_dir) / storage_key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def get_playback_url(storage_key: str) -> str:
    if settings.storage_provider == "local":
        return f"{settings.storage_base_url}/storage/{storage_key}"
    raise NotImplementedError(f"Storage provider '{settings.storage_provider}' not yet implemented")


def delete_file(storage_key: str) -> None:
    if settings.storage_provider == "local":
        path = Path(settings.storage_local_dir) / storage_key
        path.unlink(missing_ok=True)
