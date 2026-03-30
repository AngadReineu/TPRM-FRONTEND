from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://tprm_user:tprm_pass@localhost:5432/tprm_db"
    secret_key: str = "dev-secret-key-change-in-production-min-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    upload_dir: str = "app/uploads"
    upload_dir_controls: str = "uploads/controls"
    max_upload_size_mb: int = 25
    agent_script_path: str = r"C:\Users\Angad\OneDrive\Desktop\Agent\GmailAgent\ConsultingAgent.py"
    mistral_url: str = "http://localhost:11434/api/chat"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
