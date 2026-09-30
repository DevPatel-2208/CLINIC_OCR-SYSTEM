from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    tesseract_path: str = ""
    port: int = 8000
    upload_dir: str = "./uploads"
    max_image_size_mb: int = 10
    allowed_origins: str = "http://localhost:5173"
    image_host_override: str = ""

    class Config:
        env_file = ".env"


settings = Settings()


def cors_origins() -> list[str]:
    return [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
