# ⚖️ LegalAI Contract Reviewer (Hệ thống Rà soát Hợp đồng & Graph-RAG Thông minh)

Hệ thống AI chuyên sâu rà soát và đánh giá rủi ro pháp lý hợp đồng thương mại/dịch vụ tại Việt Nam, kết hợp công nghệ **Hybrid RAG (Vector Search + Neo4j Knowledge Graph)**, bẻ nhỏ điều khoản theo ngữ nghĩa pháp luật (**Semantic Clause Chunking**) và giao diện tương tác trực quan (**PDF Risk Highlighting & Redline Suggestions**).

---

## 🚀 Kiến trúc Hệ thống

1. **Frontend**: Next.js 14, TailwindCSS, Lucide Icons, Split-Screen PDF & Risk Viewer với cơ chế đồng bộ cuộn 2 chiều.
2. **Backend API**: FastAPI, PyMuPDF (fitz), Vietnamese Legal Regex Chunker, Legal Risk Evaluator.
3. **AI & RAG Engine**:
   - **Semantic Chunking**: Tự động nhận diện cấu trúc phân cấp Điều / Khoản / Điểm trong văn bản pháp luật Việt Nam và lưu tọa độ Bounding Box.
   - **Legal Knowledge Base**: Đối chiếu trực tiếp Bộ luật Dân sự 2015, Luật Thương mại 2005 (trần phạt 8%), Luật Sở hữu trí tuệ, Nghị định 13/2023/NĐ-CP.
   - **Knowledge Graph**: Xây dựng đồ thị quan hệ Hợp đồng ➔ Điều khoản ➔ Rủi ro ➔ Căn cứ Luật (Neo4j Cypher Schema).
4. **Hạ tầng Docker**: PostgreSQL, Redis, Neo4j, Qdrant Vector DB, MinIO.

---

## 🛠️ Hướng Dẫn Chạy Nhanh (Quick Start)

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

## 🎯 Các Tính Năng Nổi Bật

- **Interactive PDF Risk Highlighting**: Hiển thị hợp đồng với các lớp màu theo 4 mức độ rủi ro:
  - 🔴 **CRITICAL**: Vi phạm quy định bắt buộc (Ví dụ phạt vi phạm vượt trần 8% theo Điều 301 LTM 2005).
  - 🟠 **HIGH**: Điều khoản bất đối xứng nghiêm trọng, bồi thường vô hạn, đơn phương chấm dứt không báo trước.
  - 🟡 **MEDIUM**: Thẩm quyền tòa án bất lợi hoặc câu chữ mơ hồ cần làm rõ.
  - 🔵 **LOW**: Nghĩa vụ bảo mật thời hạn quá dài hoặc điều khoản thông lệ.
- **Redline Before/After Suggestions**: Tự động sinh điều khoản đề xuất sửa đổi và nút 1-click Sao chép / Áp dụng.
- **Knowledge Graph Visualizer**: Khám phá trực quan mạng lưới liên kết giữa các điều khoản và căn cứ luật định.
- **Hợp đồng mẫu tiếng Việt tích hợp sẵn**: Hợp đồng Dịch vụ CNTT & AI, Thỏa thuận Bảo mật (NDA), Hợp đồng Mua bán Thiết bị Máy chủ.
