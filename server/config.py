import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MODEL_API_KEY: str = os.getenv("MODEL_API_KEY")
    MODEL_BASE_URL: str = os.getenv("MODEL_BASE_URL")
    MODEL_NAME: str = os.getenv("MODEL_NAME")
    PORT: int = int(os.getenv("PORT"))

    @property
    def available_dimensions(self) -> list[str]:
        return [
            "security",  # 安全检查
            "performance",  # 性能分析
            "style",  # 代码风格
            "best_practice",  # 最佳实践
        ]


settings = Settings()
