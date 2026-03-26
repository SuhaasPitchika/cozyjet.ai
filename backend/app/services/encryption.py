from cryptography.fernet import Fernet
from ..config import settings

class TokenEncryptionService:
    def __init__(self):
        # Initialized with TOKEN_ENCRYPTION_KEY from settings
        try:
            self.fernet = Fernet(settings.TOKEN_ENCRYPTION_KEY.encode())
        except Exception as e:
            # For development, generate a dummy key if not set, 
            # but raise for production safety
            if settings.ENVIRONMENT == "production":
                raise e
            self.fernet = Fernet(Fernet.generate_key())

    def encrypt(self, token: str) -> str:
        """
        Encodes the token to bytes and returns a Fernet-encrypted string 
        safe for database storage.
        """
        if not token:
            return None
        return self.fernet.encrypt(token.encode()).decode()

    def decrypt(self, encrypted_token: str) -> str:
        """
        Reverses the process and returns the raw token.
        """
        if not encrypted_token:
            return None
        return self.fernet.decrypt(encrypted_token.encode()).decode()

# Global Instance
token_encryption_service = TokenEncryptionService()
