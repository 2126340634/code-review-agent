from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from schemas.review import ReviewRequest
from services.review_agent import review_code_stream
from config import settings

router = APIRouter(prefix="/api", tags=["review"])


@router.post("/review")
async def review_code(req: ReviewRequest):
    """审查代码"""
    return StreamingResponse(
        review_code_stream(
            code=req.code,
            dimensions=req.dimensions,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",  # 防止浏览器缓存
            "X-Accel-Buffering": "no",  # 防止nginx sse缓存
            "Access-Control-Allow-Origin": "*",
        },
    )


@router.get("/health")
async def health():
    """获取服务状态"""
    return JSONResponse(
        status_code=200,
        content={"model": settings.MODEL_NAME},
    )
