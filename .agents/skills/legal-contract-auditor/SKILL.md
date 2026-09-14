---
name: legal-contract-auditor
description: >-
  Chuyên gia AI thẩm định pháp lý hợp đồng toàn diện theo pháp luật Việt Nam (Lao động, Thương mại, Dân sự, SHTT, Dữ liệu).
  Kỹ năng bao gồm: Tiền xử lý OCR ảnh chụp điện thoại/scan mờ, Bẻ chunk Điều/Khoản ngữ nghĩa, Đối chiếu 25+ điều luật và Án lệ TANDTC,
  Sinh đồ thị tri thức Neo4j Cypher và Xuất tài liệu Word (.docx) chứa Track Changes Redline chuẩn đàm phán.
---

# KỸ NĂNG: THẨM ĐỊNH PHÁP LÝ HỢP ĐỒNG (LEGAL CONTRACT AUDITOR)

Cẩm nang quy chuẩn toàn diện dành cho Agent khi thực hiện rà soát, thẩm định rủi ro, trích xuất dữ liệu đa phương thức và sinh phương án đàm phán hợp đồng theo quy định của pháp luật nước CHXHCN Việt Nam.

---

## 1. ĐIỀU KIỆN KÍCH HOẠT (TRIGGER CONDITIONS)

Agent tự động kích hoạt kỹ năng này khi:
1. Người dùng tải lên văn bản thỏa thuận, hợp đồng (dạng file `.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`).
2. Nhận diện các yêu cầu: *"rà soát hợp đồng"*, *"kiểm tra rủi ro pháp lý"*, *"đối chiếu luật lao động / thương mại"*, *"xuất file Word track changes"*, *"xử lý ảnh chụp hợp đồng"*.
3. Yêu cầu tư vấn chiến lược đàm phán hoặc hỗ trợ soạn thảo điều khoản sửa đổi (Redline revision).

---

## 2. QUY TRÌNH THỰC THI 6 BƯỚC (6-PHASE EXECUTION PIPELINE)

```
[Phase 1: Ingestion & OCR] ➔ [Phase 2: Semantic Chunking] ➔ [Phase 3: Statutory Audit]
                                                                        │
[Phase 6: Word / Graph Export] ◄─── [Phase 5: Redline Drafting] ◄──────┘
```

### Bước 1: Tiếp nhận tệp & Đánh giá chất lượng OCR (Image Ingestion & Quality Assessment)
- **Tệp kỹ thuật số (Searchable PDF)**: Dùng PyMuPDF trích xuất text khối (`blocks`) kèm tọa độ hộp bao `[x0, y0, x1, y1]`.
- **Tệp ảnh chụp từ điện thoại / Bản scan mờ (.jpg, .png, .webp, Scanned PDF)**:
  - Kiểm tra độ nghiêng (Skew angle): Nếu ảnh bị xoay lệch $> 2^\circ$, áp dụng thuật toán xoay thẳng (Deskew).
  - Khử mờ và bóng lóa: Chuyển sang ảnh Grayscale, nâng độ tương phản (Contrast Enhance 1.8x) và chạy Sharpen Filter.
  - Phân đoạn dòng và chuẩn hóa tọa độ hộp bao theo tỉ lệ thực tế $0.0 \rightarrow 1.0$.

### Bước 2: Bẻ nhỏ ngữ nghĩa phân cấp (Hierarchical Semantic Chunking)
- Tuyệt đối **không** cắt văn bản theo số ký tự cố định (fixed-token chunking).
- Phải tách theo cây phân cấp văn bản pháp lý Việt Nam:
  - `Chương / Mục` $\rightarrow$ `Điều X` $\rightarrow$ `Khoản Y` $\rightarrow$ `Điểm Z`.
  - Giữ nguyên liên kết giữa ID điều khoản và danh sách tọa độ Bounding Box để tô màu chính xác trên giao diện người dùng.

### Bước 3: Thẩm định Pháp lý & Áp dụng Ma trận Rủi ro (Statutory Compliance Matrix)
Đối chiếu nội dung từng điều khoản với Thư viện 25+ Điều luật và Án lệ chính thức:

#### ⚖ BỘ LUẬT LAO ĐỘNG 2019 (BLLD 2019)
| Điều luật | Hành vi vi phạm | Mức độ rủi ro | Chế tài xử lý |
| :--- | :--- | :---: | :--- |
| **Điều 17.1** | Giữ bản chính văn bằng tốt nghiệp, chứng chỉ, CCCD gốc của người lao động. | **CRITICAL** | Phạt tiền 20 - 25 triệu VNĐ (NĐ 12/2022/NĐ-CP), buộc trả lại bản gốc. |
| **Điều 17.2** | Yêu cầu người lao động đặt cọc tiền, ký quỹ, giữ lại tiền lương để bảo đảm thực hiện hợp đồng. | **CRITICAL** | Phạt tiền 20 - 25 triệu VNĐ, buộc hoàn trả toàn bộ tiền cọc kèm lãi suất. |
| **Điều 25** | Thử việc quá 60 ngày đối với trình độ CĐ, ĐH (ví dụ thử việc 3-4 tháng). | **HIGH** | Phạt tiền 2 - 5 triệu VNĐ, buộc trả 100% lương chính thức cho thời gian quá hạn. |
| **Điều 26** | Trả lương thử việc dưới 85% mức lương chính thức. | **HIGH** | Phạt tiền và truy lĩnh đủ 85% tiền lương. |
| **Điều 127** | Dùng hình thức phạt tiền, cắt lương thay cho việc xử lý kỷ luật lao động khi đi trễ, vi phạm KPI. | **CRITICAL** | Phạt tiền 20 - 40 triệu VNĐ, buộc hoàn trả số tiền đã phạt. |
| **Điều 168** | Thỏa thuận trốn đóng hoặc trả tiền mặt thay thế việc đóng BHXH, BHYT, BHTN bắt buộc. | **CRITICAL** | Truy thu toàn bộ tiền nợ đóng, phạt lãi chậm nộp và phạt hành chính nặng. |
| **Điều 21.2** | Thỏa thuận cấm làm việc cho đối thủ (NCA) quá 24 tháng hoặc không có trợ cấp bù đắp tài chính. | **HIGH** | Có nguy cơ bị Tòa án tuyên vô hiệu do vi phạm quyền tự do việc làm (Điều 35 Hiến pháp). |

#### ⚖ LUẬT THƯƠNG MẠI 2005 (LTM 2005)
| Điều luật | Hành vi vi phạm | Mức độ rủi ro | Chế tài xử lý |
| :--- | :--- | :---: | :--- |
| **Điều 301** | Quy định mức phạt vi phạm vượt quá **8% giá trị phần nghĩa vụ bị vi phạm** (ví dụ phạt 10%, 20%, 50%). | **CRITICAL** | Phần phạt vượt quá 8% bị Tòa án/Trọng tài tuyên vô hiệu, không có giá trị thi hành. |
| **Điều 318** | Quy định thời hạn khiếu nại quá ngắn (như 24h, 48h sau giao hàng) nhằm tước quyền kiểm tra kỹ thuật. | **HIGH** | Luật quy định tối thiểu 03 tháng (chất lượng, số lượng) và 06 tháng (nghĩa vụ khác). |
| **Điều 294, 295** | Điều khoản Bất khả kháng thiếu nghĩa vụ thông báo bằng văn bản hoặc miễn trừ trách nhiệm vô căn cứ. | **MEDIUM** | Buộc phải thông báo kịp thời và áp dụng mọi biện pháp giảm thiểu thiệt hại. |
| **Điều 307** | Áp dụng đồng thời phạt vi phạm khi hợp đồng không hề có điều khoản thỏa thuận phạt. | **HIGH** | Chỉ được yêu cầu bồi thường thiệt hại nếu không có thỏa thuận phạt vi phạm. |

#### ⚖ BỘ LUẬT DÂN SỰ 2015 (BLDS 2015)
| Điều luật | Hành vi vi phạm | Mức độ rủi ro | Chế tài xử lý |
| :--- | :--- | :---: | :--- |
| **Điều 468 & 357** | Lãi suất phạt chậm thanh toán vượt mức trần **20%/năm** (ví dụ tính lãi 0.1% - 0.5%/ngày). | **CRITICAL** | Phần lãi suất vượt quá 20%/năm hoàn toàn vô hiệu. |
| **Điều 360** | Bắt buộc bồi thường toàn bộ thiệt hại gián tiếp, mất cơ hội kinh doanh mà không có mức trần (Liability Cap). | **HIGH** | Rủi ro tài chính vô hạn; luật quy định chỉ bồi thường thiệt hại thực tế, trực tiếp. |
| **Điều 428** | Một bên tự cho mình quyền đơn phương hủy bỏ hợp đồng ngay lập tức mà không cần báo trước. | **HIGH** | Vi phạm nghĩa vụ thông báo; nếu gây thiệt hại đột ngột phải bồi thường. |
| **Điều 405** | Điều khoản bất bình đẳng trong hợp đồng theo mẫu nhằm miễn trừ hoàn toàn trách nhiệm của bên soạn thảo. | **HIGH** | Điều khoản miễn trừ trách nhiệm đơn phương bị tuyên vô hiệu. |

#### ⚖ DỮ LIỆU CÁ NHÂN & SỞ HỮU TRÍ TUỆ
- **Nghị định 13/2023/NĐ-CP (Điều 9, 11, 17)**: Hợp đồng có xử lý dữ liệu khách hàng/nhân sự bắt buộc phải có điều khoản cam kết bảo vệ dữ liệu và sự chấp thuận minh thị của chủ thể dữ liệu.
- **Luật Sở hữu trí tuệ 2022 (Điều 20, 45)**: Quyền tác giả đối với mã nguồn phần mềm, sáng chế chỉ chuyển giao khi khách hàng đã thanh toán đủ 100% chi phí.

---

## 3. THUẬT TOÁN TÍNH ĐIỂM AN TOÀN HỢP ĐỒNG (RISK SCORING ALGORITHM)

Điểm an toàn ban đầu: $Score_{base} = 100$.  
Điểm trừ lũy kế theo cấp độ rủi ro:
$$Penalty = (N_{critical} \times 25) + (N_{high} \times 14) + (N_{medium} \times 6) + (N_{low} \times 2)$$
$$Score_{final} = \max(5, Score_{base} - Penalty)$$

- **$Score \ge 80$**: Hợp đồng An toàn (Safe / Compliant).
- **$50 \le Score < 80$**: Cảnh báo rủi ro (Warning / Moderate Risk) – Cần đàm phán sửa đổi.
- **$Score < 50$**: Rất nguy hiểm (High Danger / Critical Violation) – Chứa điều khoản vi phạm điều cấm của luật.

---

## 4. QUY CHUẨN BIÊN SOẠN SỬA ĐỔI REDLINE (REDLINE DRAFTING STANDARDS)

Khi sinh điều khoản đề xuất sửa đổi (Redline Proposal), Agent phải tuân thủ nguyên tắc:
1. **Bảo tồn mục đích kinh doanh**: Không xóa bỏ hoàn toàn quyền lợi chính đáng của đối tác, mà chuyển hóa về khuôn khổ hợp pháp (Ví dụ: Giữ nguyên chế tài phạt chậm tiến độ nhưng hạ mức phạt từ 15% về đúng mức trần 8% theo Điều 301 LTM 2005).
2. **Kỹ thuật Before & After song song**:
   - `[-] Nội dung gốc vi phạm`: Giữ nguyên nguyên văn, gạch ngang màu đỏ.
   - `[+] Nội dung AI đề xuất`: Bổ sung điều kiện loại trừ, mức trần và thời hạn hợp lý.
3. **Cung cấp Chiến lược Đàm phán (Negotiation Tactics)**: Chỉ rõ cho người dùng cách thức giải thích với đối tác (ví dụ: *"Dẫn chiếu trực tiếp Điều 17.1 BLLD 2019 để từ chối nộp bằng tốt nghiệp gốc"*).

---

## 5. MÔ HÌNH HÓA ĐỒ THỊ TRI THỨC (NEO4J GRAPH-RAG CYPHER SCHEMA)

Agent xuất dữ liệu đồ thị tri thức theo mô hình 4 lớp thực thể:
```
(:Contract {id, title, score})
    ├──[:HAS_CLAUSE]──> (:Clause {id, number, title, page})
    │                       ├──[:EXHIBITS_RISK]──> (:Risk {id, level, category})
    │                       │                         ├──[:VIOLATES_LAW]──> (:Law {code, name})
```

---

## 6. QUY CHUẨN XUẤT TÀI LIỆU WORD (.DOCX) TRACK CHANGES

Tệp Word xuất ra phục vụ đàm phán hợp đồng bắt buộc phải có:
1. **Tiêu ngữ Quốc gia**: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc.
2. **Bảng KPI Thẩm Định**: Điểm an toàn, tổng số điều vi phạm cấm, tổng số điều khoản.
3. **Định dạng trực quan**:
   - Chữ đỏ có vạch gạch ngang (`strikethrough`) đối với phần điều khoản vi phạm.
   - Chữ xanh lá cây in đậm, có gạch chân (`underline`) đối với phần điều khoản AI sửa đổi.
   - Khung màu tím nhạt dẫn chiếu căn cứ điều luật Việt Nam và chiến lược đàm phán tương ứng.

---

## 7. XỬ LÝ CÁC TRƯỜNG HỢP NGOẠI LỆ (EDGE CASES)

- **Ảnh chụp bị lóa sáng / Mất góc**: Cảnh báo người dùng về phần văn bản bị che khuất và kích hoạt bộ lọc bù nét tương phản.
- **Hợp đồng không đánh số Điều**: Tự động đánh số theo phân đoạn logic (`Phần 1`, `Phần 2`,...) dựa trên ngắt trang.
- **Hợp đồng Song ngữ (Anh - Việt)**: Ưu tiên rà soát trên văn bản tiếng Việt; trường hợp có mâu thuẫn giữa 2 ngôn ngữ, cảnh báo nguy cơ theo quy định giải thích hợp đồng tại Điều 404 BLDS 2015.
