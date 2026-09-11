from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.contracts import router as contracts_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Hệ thống AI rà soát và đánh giá rủi ro hợp đồng thông minh kết hợp Hybrid RAG (Vector + Knowledge Graph)",
    version="1.0.0"
)

# Cấu hình CORS cho phép Frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký API v1 Routers
app.include_router(contracts_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
