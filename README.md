# ⚖️ LegalAI Contract Reviewer (Hệ thống Rà soát Hợp đồng & Graph-RAG Thông minh)

[![LegalAI CI/CD](https://github.com/Hoa26040005/legal-ai-contract-reviewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Hoa26040005/legal-ai-contract-reviewer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.11](https://img.shields.io/badge/Python-3.11-brightgreen.svg)](https://www.python.org/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

Hệ thống AI chuyên sâu rà soát, phát hiện bẫy và đánh giá rủi ro pháp lý hợp đồng tại Việt Nam (Lao động, Thương mại, Dân sự, Sở hữu trí tuệ, Nghị định 13/2023). Kết hợp công nghệ **Hybrid RAG (Vector Search + Neo4j Knowledge Graph)**, bộ xử lý **OCR Ảnh chụp điện thoại/Scan mờ**, và trình **Xuất File Word (.docx) chứa Track Changes Redline** chuẩn đàm phán ký kết.

---

## 🚀 Điểm Sáng Kiến Trúc & Tính Năng Nổi Bật

1. **Thẩm Định Đa Tầng 25+ Điều Luật & Án Lệ Việt Nam**:
   - **Bộ luật Lao động 2019**: Chống bẫy giữ bằng đại học gốc (Điều 17.1), cấm bắt cọc tiền ký quỹ (Điều 17.2), trần thử việc 60 ngày (Điều 25), cấm phạt tiền cắt lương (Điều 127), bắt buộc đóng BHXH (Điều 168), cam kết không cạnh tranh NCA (Điều 21.2).
   - **Luật Thương mại 2005**: Khống chế trần phạt vi phạm tối đa 8% (Điều 301), thời hạn khiếu nại tối thiểu (Điều 318), miễn trách nhiệm Bất khả kháng (Điều 294-295).
   - **Bộ luật Dân sự 2015**: Khống chế trần lãi chậm trả tối đa 20%/năm (Điều 468), giới hạn bồi thường thiệt hại trực tiếp và trần trách nhiệm Liability Cap (Điều 360), đơn phương chấm dứt hợp đồng (Điều 428).
   - **Bảo vệ Dữ liệu & SHTT**: Nghị định 13/2023/NĐ-CP và Luật Sở hữu trí tuệ 2022 (bảo vệ quyền tác giả mã nguồn phần mềm).

2. **Xử Lý Đa Phương Thức (Multimodal Image OCR Pipeline)**:
   - Tiếp nhận cả văn bản **PDF số** và **Ảnh chụp từ điện thoại / Bản scan nghiêng mờ** (`.jpg, .jpeg, .png, .webp`).
   - Tự động tiền xử lý: Chuyển xám, nâng tương phản 1.8x, lọc nét ký tự và khử góc nghiêng (Deskew).

3. **Xuất File Word (.docx) Chứa Track Changes Redline 1-Click**:
   - Tự động sinh file Word có tiêu ngữ Quốc gia.
   - Các điều khoản vi phạm được đánh dấu **chữ đỏ có vạch gạch ngang `[-]`** *(Strikethrough)*.
   - Nội dung AI đề xuất sửa đổi hiển thị **chữ xanh lá cây in đậm và gạch chân `[+]`** *(Underline)*.
   - Hộp tím dẫn chiếu căn cứ pháp lý và mẹo đàm phán hợp đồng để gửi ngay cho đối tác ký kết.

4. **Giao Diện Split-Screen Luxury LegalTech**:
   - Mộc đỏ pháp lý watermark: **`AI AUDITED - LEGAL STANDARD`**.
   - Chế độ **Tiêu Điểm (Spotlight Focus Mode)** làm nổi bật điều khoản đang chọn.
   - Bản đồ phổ màu phân bổ rủi ro (Risk Distribution Spectrum).
   - **AI Copilot Chat** hỗ trợ các câu hỏi gợi ý nhanh 1-click.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Nhanh

### 1. Khởi động các dịch vụ Hạ tầng (Docker)
```bash
cd docker
docker compose up -d
```

### 2. Khởi động Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`

### 3. Khởi động Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Giao diện Web: `http://localhost:3000`

---

## 🧪 Kiểm Thử Tự Động (Automated Testing)

Chạy bộ kiểm thử tự động toàn diện cho Legal Engine:
```bash
cd backend
pytest tests -v
```

---

## 🤖 Antigravity Agent Skill
Kỹ năng chuyên gia của hệ thống được lưu tại:
- `.agents/skills/legal-contract-auditor/SKILL.md`
- `skills/legal-contract-auditor/SKILL.md`
