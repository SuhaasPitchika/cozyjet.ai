import base64
from cryptography.fernet import Fernet
from ..config import settings


def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    # Ensure the key is valid base64-encoded 32 bytes for Fernet
    try:
        raw = base64.urlsafe_b64decode(key.encode())
        if len(raw) != 32:
            raise ValueError("Encryption key must decode to exactly 32 bytes")
        fernet_key = base64.urlsafe_b64encode(raw)
    except Exception:
        # Fallback: derive a 32-byte key from the raw string
        raw_bytes = key.encode()[:32].ljust(32, b"\x00")
        fernet_key = base64.urlsafe_b64encode(raw_bytes)
    return Fernet(fernet_key)


def encrypt_token(raw_token: str) -> str:
    f = _get_fernet()
    return f.encrypt(raw_token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    f = _get_fernet()
    return f.decrypt(encrypted_token.encode()).decode()
