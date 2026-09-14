---
name: legal-contract-auditor
description: >-
  Chuyên gia AI rà soát, thẩm định rủi ro pháp lý hợp đồng Việt Nam (Lao động, Thương mại, Dân sự, CNTT, NDA).
  Hỗ trợ tiền xử lý OCR ảnh chụp từ điện thoại, đối chiếu 20+ quy tắc điều luật và sinh tài liệu Word Track Changes.
---

# Kỹ Năng: Rà Soát & Thẩm Định Hợp Đồng Pháp Lý (Legal Contract Auditor)

Skill này cung cấp quy trình và tiêu chuẩn cho Agent khi thực hiện rà soát hợp đồng, trích xuất OCR và sinh tài liệu đàm phán pháp lý tại Việt Nam.

## 1. Nguyên Tắc Thẩm Định Pháp Lý Việt Nam

Khi rà soát hợp đồng, Agent phải tuân thủ nghiêm ngặt các mốc luật định sau:

### A. Hợp Đồng Lao Động (Bộ luật Lao động 2019)
1. **Điều 17.1**: Tuyệt đối KHÔNG ĐƯỢC giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ của người lao động.
2. **Điều 17.2**: Tuyệt đối KHÔNG ĐƯỢC yêu cầu người lao động đặt cọc tiền, thế chấp tài sản, ký quỹ.
3. **Điều 25**: Thời gian thử việc tối đa:
   - Tối đa 60 ngày đối với trình độ cao đẳng, đại học (kỹ sư, cử nhân).
   - Tối đa 180 ngày chỉ dành riêng cho người quản lý doanh nghiệp.
4. **Điều 127**: Tuyệt đối KHÔNG ĐƯỢC phạt tiền, cắt lương thay cho việc xử lý kỷ luật lao động.
5. **Điều 168**: Nghĩa vụ tham gia BHXH, BHYT, BHTN là bắt buộc, không được thỏa thuận tự đóng bằng tiền mặt.

### B. Hợp Đồng Thương Mại (Luật Thương mại 2005)
1. **Điều 301**: Trần phạt vi phạm tối đa là **8% giá trị phần nghĩa vụ bị vi phạm**. Mọi thỏa thuận phạt 10%, 15%, 20% đều vô hiệu đối với phần vượt mức.
2. **Điều 318**: Thời hạn khiếu nại tối thiểu: 03 tháng (số lượng, phẩm chất) và 06 tháng (nghĩa vụ khác). Quy định khiếu nại 24h - 48h là bất hợp pháp.
3. **Điều 294 & 295**: Sự kiện bất khả kháng bắt buộc phải kèm nghĩa vụ thông báo bằng văn bản và hạn chế tổn thất.

### C. Hợp Đồng Dân Sự & Trách Nhiệm Bồi Thường (Bộ luật Dân sự 2015)
1. **Điều 468**: Trần lãi phạt chậm trả tối đa là **20%/năm**. Thỏa thuận lãi 0.1% - 0.5%/ngày (tương đương 36.5% - 182.5%/năm) là vi phạm trần lãi suất.
2. **Điều 360**: Chỉ bồi thường thiệt hại thực tế, trực tiếp; loại trừ thiệt hại gián tiếp và bắt buộc phải có trần trách nhiệm (Liability Cap).
3. **Điều 428**: Đơn phương chấm dứt hợp đồng bắt buộc phải có thời hạn thông báo trước hợp lý (tối thiểu 30 ngày).

---

## 2. Quy Trình Xử Lý OCR Ảnh Chụp Điện Thoại / Bản Scan

1. **Kiểm tra định dạng**: Tiếp nhận file `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`.
2. **Tiền xử lý ảnh (Image Preprocessing)**:
   - Chuyển ảnh xám (Grayscale).
   - Tăng độ tương phản (Adaptive Thresholding) để làm rõ chữ chụp mờ.
   - Khử góc nghiêng (Deskew) nếu người dùng chụp ảnh bị xéo góc.
3. **Trích xuất Text & Bounding Box**:
   - Sử dụng PaddleOCR tiếng Việt hoặc PyMuPDF.
   - Nhóm các dòng văn bản theo cấu trúc: `Điều X` $\rightarrow$ `Khoản Y` $\rightarrow$ `Nội dung`.

---

## 3. Quy Chuẩn Sinh File Word (.docx) Track Changes

Khi sinh tài liệu Word phục vụ đàm phán hợp đồng cho người dùng:
1. **Văn bản gốc vi phạm**: Định dạng chữ đỏ, có vạch gạch ngang (`strikethrough`).
2. **Nội dung AI đề xuất sửa đổi**: Định dạng chữ xanh lá cây đậm, gạch chân (`underline`).
3. **Hộp chú thích căn cứ pháp luật**: Đặt trong khung viền (Callout box) ghi rõ số Điều, tên Luật và mức phạt hành chính liên quan.
