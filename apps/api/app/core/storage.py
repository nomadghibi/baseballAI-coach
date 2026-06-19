import re
import tempfile
from pathlib import Path
from typing import IO

from app.core.config import settings


def _safe_filename(filename: str) -> str:
    stem = re.sub(r"[^a-z0-9_-]", "_", Path(filename).stem.lower())[:50]
    suffix = Path(filename).suffix.lower()
    return f"{stem}{suffix}"


def build_storage_key(user_id: str, video_id: str, filename: str) -> str:
    return f"{user_id}/{video_id}/{_safe_filename(filename)}"


# ── R2 / S3 client ───────────────────────────────────────────────────────────

def _s3_client():
    import boto3
    return boto3.client(
        "s3",
        endpoint_url=settings.storage_endpoint,
        aws_access_key_id=settings.storage_access_key,
        aws_secret_access_key=settings.storage_secret_key,
        region_name="auto",
    )


# ── Public API ────────────────────────────────────────────────────────────────

def get_upload_url(video_id: str, *, storage_key: str, content_type: str) -> str:
    """Return a URL the client should PUT the video to."""
    if settings.storage_provider == "local":
        return f"{settings.storage_base_url}/api/v1/videos/{video_id}/upload"
    if settings.storage_provider == "r2":
        return _s3_client().generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.storage_bucket,
                "Key": storage_key,
                "ContentType": content_type,
            },
            ExpiresIn=3600,
        )
    raise NotImplementedError(f"Storage provider '{settings.storage_provider}' not supported")


def get_playback_url(storage_key: str) -> str:
    if settings.storage_provider == "local":
        return f"{settings.storage_base_url}/storage/{storage_key}"
    if settings.storage_provider == "r2":
        return _s3_client().generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.storage_bucket, "Key": storage_key},
            ExpiresIn=3600,
        )
    raise NotImplementedError(f"Storage provider '{settings.storage_provider}' not supported")


def save_file(storage_key: str, data: bytes) -> None:
    """Local-only: write bytes to disk."""
    path = Path(settings.storage_local_dir) / storage_key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def download_to_temp(storage_key: str) -> IO[bytes]:
    """
    Return an open NamedTemporaryFile with the video contents.
    Caller must close/delete it when done.
    Local: reads from disk into temp.
    R2: streams from R2 into temp.
    """
    tmp = tempfile.NamedTemporaryFile(suffix=Path(storage_key).suffix, delete=False)
    if settings.storage_provider == "local":
        path = Path(settings.storage_local_dir) / storage_key
        tmp.write(path.read_bytes())
    elif settings.storage_provider == "r2":
        obj = _s3_client().get_object(Bucket=settings.storage_bucket, Key=storage_key)
        for chunk in obj["Body"].iter_chunks(chunk_size=8 * 1024 * 1024):
            tmp.write(chunk)
    else:
        tmp.close()
        raise NotImplementedError(f"Storage provider '{settings.storage_provider}' not supported")
    tmp.flush()
    return tmp


def delete_file(storage_key: str) -> None:
    if settings.storage_provider == "local":
        path = Path(settings.storage_local_dir) / storage_key
        path.unlink(missing_ok=True)
    elif settings.storage_provider == "r2":
        _s3_client().delete_object(Bucket=settings.storage_bucket, Key=storage_key)
    # unknown providers: silent no-op (don't crash on delete)
