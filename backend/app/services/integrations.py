import httpx
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..models.user import Integration, IntegrationPlatform
from sqlalchemy.ext.asyncio import AsyncSession
from cryptography.fernet import Fernet
import os

# Encryption setup placeholder
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
fernet = Fernet(ENCRYPTION_KEY.encode())

class IntegrationService:
    @staticmethod
    def encrypt_token(token: str) -> str:
        return fernet.encrypt(token.encode()).decode()

    @staticmethod
    def decrypt_token(encrypted_token: str) -> str:
        return fernet.decrypt(encrypted_token.encode()).decode()

    @async_to_sync # Utility or use async natively
    async def fetch_github_activity(self, integration: Integration) -> List[Dict[str, Any]]:
        token = self.decrypt_token(integration.access_token)
        async with httpx.AsyncClient() as client:
            # Fetch commits from user's repos
            headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
            resp = await client.get("https://api.github.com/user/repos?sort=updated&per_page=5", headers=headers)
            repos = resp.json()
            
            activity = []
            for repo in repos:
                commits_resp = await client.get(f"https://api.github.com/repos/{repo['full_name']}/commits?per_page=3", headers=headers)
                commits = commits_resp.json()
                for commit in commits:
                    activity.append({
                        "platform": "github",
                        "title": f"Commit in {repo['name']}",
                        "description": commit['commit']['message'],
                        "url": commit['html_url'],
                        "metadata": {"repo": repo['full_name'], "sha": commit['sha']}
                    })
            return activity

    async def fetch_notion_activity(self, integration: Integration) -> List[Dict[str, Any]]:
        # Placeholder for Notion API call
        return []

    async def fetch_figma_activity(self, integration: Integration) -> List[Dict[str, Any]]:
        # Placeholder for Figma API call
        return []
