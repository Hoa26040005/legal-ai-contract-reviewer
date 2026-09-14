import io
from typing import Dict, Any, List, Optional
from datetime import datetime
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from app.models.schemas import ContractAnalysisReport, RiskLevel

class ContractAnnexGenerator:
    """
    Module tự động soạn thảo và xuất file Word (.docx)
    "PHỤ LỤC HỢP ĐỒNG SỬA ĐỔI, BỔ SUNG"
    Chuẩn thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP & Điều 403 BLDS 2015).
    """

    @classmethod
    def generate_annex_data(cls, report: ContractAnalysisReport) -> Dict[str, Any]:
        """
        Trích xuất và tổng hợp dữ liệu cấu trúc của Phụ lục sửa đổi hợp đồng
        để phục vụ Live Preview trên Web Frontend.
        """
        # Phân loại rủi ro
        modified_items = []
        revoked_items = []
        added_items = []

        for risk in report.risks:
            # Nếu vi phạm điều cấm nghiêm trọng (giữ bằng, cọc tiền) -> bãi bỏ
            if any(k in risk.risk_title.lower() for k in ["giữ văn bằng", "giữ bằng", "đặt cọc", "phạt tiền thay"]):
                revoked_items.append({
                    "clause_number": risk.clause_number,
                    "title": risk.risk_title,
                    "reason": f"Bãi bỏ do vi phạm điều cấm tại {risk.legal_basis or 'quy định pháp luật'}.",
                    "original_text": risk.original_text
                })
            else:
                # Sửa đổi nội dung
                modified_items.append({
                    "clause_number": risk.clause_number,
                    "title": risk.risk_title,
                    "original_text": risk.original_text,
                    "new_text": risk.suggested_text,
                    "legal_basis": risk.legal_basis or "Bộ luật Dân sự 2015"
                })

        # Điều khoản bổ sung mặc định nếu là hợp đồng dịch vụ / lao động
        if "lao động" in report.contract_type.lower():
            added_items.append({
                "clause_number": "Điều khoản Bổ sung",
                "title": "Bảo vệ Dữ liệu Cá nhân Người Lao Động",
                "content": "Người sử dụng lao động cam kết thu thập, xử lý và lưu trữ dữ liệu cá nhân của Người lao động tuân thủ nghiêm ngặt theo quy định tại Nghị định số 13/2023/NĐ-CP ngày 17/04/2023 của Chính phủ về bảo vệ dữ liệu cá nhân."
            })
        else:
            added_items.append({
                "clause_number": "Điều khoản Bổ sung",
                "title": "Bảo Vệ Dữ Liệu & Giới Hạn Trách Nhiệm Bồi Thường",
                "content": "Các bên cam kết tuân thủ quy định về bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP. Mức phạt vi phạm hợp đồng tối đa không vượt quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm theo Điều 301 Luật Thương mại 2005."
            })

        return {
            "annex_title": f"PHỤ LỤC SỬA ĐỔI, BỔ SUNG HỢP ĐỒNG",
            "contract_title": report.contract_title,
            "contract_type": report.contract_type,
            "modified_items": modified_items,
            "revoked_items": revoked_items,
            "added_items": added_items,
            "total_changes": len(modified_items) + len(revoked_items) + len(added_items)
        }

    @classmethod
    def generate_annex_docx(
        cls,
        report: ContractAnalysisReport,
        party_a_name: str = "BÊN GIAO VIỆC / BÊN A",
        party_b_name: str = "BÊN THỰC HIỆN / BÊN B",
        annex_number: str = "01",
        contract_number: str = "HĐ-2026/01",
        signing_date: Optional[str] = None
    ) -> io.BytesIO:
        """
        Sinh file .docx chuẩn theo quy định văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP).
        """
        doc = Document()
        annex_data = cls.generate_annex_data(report)

        if not signing_date:
            now = datetime.now()
            signing_date = f"ngày {now.day:02d} tháng {now.month:02d} năm {now.year}"

        # Căn lề chuẩn văn bản hành chính (Top 2cm, Bottom 2cm, Left 3cm, Right 1.5cm)
        for section in doc.sections:
            section.top_margin = Inches(0.79)     # ~20mm
            section.bottom_margin = Inches(0.79)  # ~20mm
            section.left_margin = Inches(1.18)    # ~30mm
            section.right_margin = Inches(0.59)   # ~15mm

        # 1. Quốc hiệu & Tiêu ngữ
        p_nat = doc.add_paragraph()
        p_nat.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_nat.paragraph_format.space_after = Pt(2)
        r_nat = p_nat.add_run("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n")
        r_nat.bold = True
        r_nat.font.size = Pt(12)
        r_nat.font.name = "Times New Roman"

        r_mot = p_nat.add_run("Độc lập - Tự do - Hạnh phúc\n")
        r_mot.bold = True
        r_mot.font.size = Pt(13)
        r_mot.underline = True
        r_mot.font.name = "Times New Roman"

        r_star = p_nat.add_run("-----------------o0o-----------------\n")
        r_star.font.size = Pt(10)
        r_star.font.color.rgb = RGBColor(100, 116, 139)

        # 2. Tiêu đề Phụ Lục
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title.paragraph_format.space_before = Pt(8)
        p_title.paragraph_format.space_after = Pt(4)

        r_title = p_title.add_run(f"PHỤ LỤC HỢP ĐỒNG SỐ {annex_number}\n")
        r_title.bold = True
        r_title.font.size = Pt(15)
        r_title.font.name = "Times New Roman"
        r_title.font.color.rgb = RGBColor(15, 23, 42)

        r_sub = p_title.add_run(
            f"(Về việc sửa đổi, bổ sung một số điều khoản của {report.contract_title})\n"
        )
        r_sub.italic = True
        r_sub.font.size = Pt(11)
        r_sub.font.name = "Times New Roman"
        r_sub.font.color.rgb = RGBColor(51, 65, 85)

        r_ref = p_title.add_run(f"Kèm theo Hợp đồng số: {contract_number}\n")
        r_ref.font.size = Pt(11)
        r_ref.font.name = "Times New Roman"

        # 3. Căn cứ pháp lý
        p_premise = doc.add_paragraph()
        p_premise.paragraph_format.space_before = Pt(6)
        p_premise.paragraph_format.space_after = Pt(6)
        p_premise.paragraph_format.line_spacing = 1.15

        premises = [
            "- Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24 tháng 11 năm 2015;",
            "- Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20 tháng 11 năm 2019 (nếu áp dụng);" if "lao động" in report.contract_type.lower() else "- Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14 tháng 06 năm 2005;",
            f"- Căn cứ Hợp đồng số {contract_number} đã ký kết giữa hai bên;",
            "- Căn cứ vào nhu cầu và sự thỏa thuận tự nguyện, thiện chí của các bên."
        ]
        for prem in premises:
            r = p_premise.add_run(prem + "\n")
            r.italic = True
            r.font.size = Pt(11)
            r.font.name = "Times New Roman"

        # Thời gian ký kết
        p_date = doc.add_paragraph()
        p_date.paragraph_format.space_after = Pt(6)
        r_dt = p_date.add_run(f"Hôm nay, {signing_date}, tại trụ sở văn phòng, hai bên gồm có:")
        r_dt.italic = True
        r_dt.font.size = Pt(11)
        r_dt.font.name = "Times New Roman"

        # 4. Thông tin các bên
        p_parties = doc.add_paragraph()
        p_parties.paragraph_format.space_after = Pt(8)
        p_parties.paragraph_format.line_spacing = 1.2

        # Bên A
        r_pa = p_parties.add_run(f"BÊN A: {party_a_name.upper()}\n")
        r_pa.bold = True
        r_pa.font.size = Pt(11)
        r_pa.font.name = "Times New Roman"
        r_pa_dt = p_parties.add_run("Địa chỉ: ........................................................................................................................\nĐại diện: .................................................... Chức vụ: ....................................................\n\n")
        r_pa_dt.font.size = Pt(11)
        r_pa_dt.font.name = "Times New Roman"

        # Bên B
        r_pb = p_parties.add_run(f"BÊN B: {party_b_name.upper()}\n")
        r_pb.bold = True
        r_pb.font.size = Pt(11)
        r_pb.font.name = "Times New Roman"
        r_pb_dt = p_parties.add_run("Địa chỉ: ........................................................................................................................\nĐại diện: .................................................... Chức vụ: ....................................................\n\n")
        r_pb_dt.font.size = Pt(11)
        r_pb_dt.font.name = "Times New Roman"

        p_agree = doc.add_paragraph()
        p_agree.paragraph_format.space_after = Pt(10)
        r_agr = p_agree.add_run("Sau khi bàn bạc và thống nhất trên nguyên tắc bình đẳng, tự nguyện và tuân thủ quy định của pháp luật Việt Nam, hai bên nhất trí ký kết Phụ lục hợp đồng này với các nội dung sau:")
        r_agr.font.size = Pt(11)
        r_agr.font.name = "Times New Roman"

        # 5. NỘI DUNG ĐIỀU KHOẢN SỬA ĐỔI BỔ SUNG

        # ĐIỀU 1: SỬA ĐỔI, THAY THẾ
        p_art1 = doc.add_paragraph()
        p_art1.paragraph_format.space_before = Pt(8)
        p_art1.paragraph_format.space_after = Pt(4)
        r_art1_title = p_art1.add_run("ĐIỀU 1: SỬA ĐỔI, THAY THẾ CÁC ĐIỀU KHOẢN HỢP ĐỒNG\n")
        r_art1_title.bold = True
        r_art1_title.font.size = Pt(12)
        r_art1_title.font.name = "Times New Roman"

        r_art1_sub = p_art1.add_run("Hai bên thống nhất sửa đổi, thay thế các điều khoản sau đây của Hợp đồng gốc:")
        r_art1_sub.font.size = Pt(11)
        r_art1_sub.font.name = "Times New Roman"

        idx = 1
        for m in annex_data["modified_items"]:
            p_m = doc.add_paragraph()
            p_m.paragraph_format.left_indent = Inches(0.2)
            p_m.paragraph_format.space_after = Pt(6)
            p_m.paragraph_format.line_spacing = 1.15

            r_mn = p_m.add_run(f"1.{idx}. Sửa đổi {m['clause_number']} ({m['title']}):\n")
            r_mn.bold = True
            r_mn.font.size = Pt(11)
            r_mn.font.name = "Times New Roman"

            r_old_lbl = p_m.add_run("- Nội dung cũ trước sửa đổi: ")
            r_old_lbl.italic = True
            r_old_lbl.font.size = Pt(10.5)
            r_old_lbl.font.name = "Times New Roman"

            r_old_val = p_m.add_run(f"\"{m['original_text']}\"\n")
            r_old_val.italic = True
            r_old_val.font.size = Pt(10.5)
            r_old_val.font.name = "Times New Roman"
            r_old_val.font.color.rgb = RGBColor(148, 163, 184)

            r_new_lbl = p_m.add_run("- Nội dung mới sau khi sửa đổi, thay thế: ")
            r_new_lbl.bold = True
            r_new_lbl.font.size = Pt(11)
            r_new_lbl.font.name = "Times New Roman"

            r_new_val = p_m.add_run(f"\"{m['new_text']}\"\n")
            r_new_val.bold = True
            r_new_val.font.size = Pt(11)
            r_new_val.font.name = "Times New Roman"
            r_new_val.font.color.rgb = RGBColor(16, 115, 75)

            r_basis = p_m.add_run(f"(Căn cứ pháp lý: {m['legal_basis']})")
            r_basis.font.size = Pt(10)
            r_basis.font.name = "Times New Roman"
            r_basis.font.color.rgb = RGBColor(100, 116, 139)
            idx += 1

        if not annex_data["modified_items"]:
            p_none = doc.add_paragraph()
            p_none.paragraph_format.left_indent = Inches(0.2)
            p_none.add_run("(Không có điều khoản sửa đổi)").font.size = Pt(11)

        # ĐIỀU 2: HỦY BỎ, BÃI BỎ
        p_art2 = doc.add_paragraph()
        p_art2.paragraph_format.space_before = Pt(10)
        p_art2.paragraph_format.space_after = Pt(4)
        r_art2_title = p_art2.add_run("ĐIỀU 2: HỦY BỎ, BÃI BỎ CÁC ĐIỀU KHOẢN TRÁI PHÁP LUẬT HOẶC BẤT HỢP LÝ\n")
        r_art2_title.bold = True
        r_art2_title.font.size = Pt(12)
        r_art2_title.font.name = "Times New Roman"

        r_art2_sub = p_art2.add_run("Hai bên thống nhất bãi bỏ hoàn toàn hiệu lực của các điều khoản sau kể từ ngày ký Phụ lục này:")
        r_art2_sub.font.size = Pt(11)
        r_art2_sub.font.name = "Times New Roman"

        idx_rv = 1
        for rv in annex_data["revoked_items"]:
            p_rv = doc.add_paragraph()
            p_rv.paragraph_format.left_indent = Inches(0.2)
            p_rv.paragraph_format.space_after = Pt(6)
            p_rv.paragraph_format.line_spacing = 1.15

            r_rv_n = p_rv.add_run(f"2.{idx_rv}. Bãi bỏ {rv['clause_number']} - {rv['title']}:\n")
            r_rv_n.bold = True
            r_rv_n.font.size = Pt(11)
            r_rv_n.font.name = "Times New Roman"

            r_rv_old = p_rv.add_run(f"- Điều khoản bị bãi bỏ: \"{rv['original_text']}\"\n")
            r_rv_old.italic = True
            r_rv_old.font.strike = True
            r_rv_old.font.size = Pt(10.5)
            r_rv_old.font.name = "Times New Roman"
            r_rv_old.font.color.rgb = RGBColor(220, 38, 38)

            r_rv_rs = p_rv.add_run(f"- Lý do bãi bỏ: {rv['reason']}")
            r_rv_rs.font.size = Pt(10.5)
            r_rv_rs.font.name = "Times New Roman"
            idx_rv += 1

        if not annex_data["revoked_items"]:
            p_none2 = doc.add_paragraph()
            p_none2.paragraph_format.left_indent = Inches(0.2)
            p_none2.add_run("Hai bên không có điều khoản nào bãi bỏ.").font.size = Pt(11)

        # ĐIỀU 3: BỔ SUNG
        p_art3 = doc.add_paragraph()
        p_art3.paragraph_format.space_before = Pt(10)
        p_art3.paragraph_format.space_after = Pt(4)
        r_art3_title = p_art3.add_run("ĐIỀU 3: BỔ SUNG CÁC QUY ĐỊNH BẢO VỆ & AN TOÀN PHÁP LÝ\n")
        r_art3_title.bold = True
        r_art3_title.font.size = Pt(12)
        r_art3_title.font.name = "Times New Roman"

        idx_ad = 1
        for ad in annex_data["added_items"]:
            p_ad = doc.add_paragraph()
            p_ad.paragraph_format.left_indent = Inches(0.2)
            p_ad.paragraph_format.space_after = Pt(6)
            p_ad.paragraph_format.line_spacing = 1.15

            r_ad_n = p_ad.add_run(f"3.{idx_ad}. {ad['title']}:\n")
            r_ad_n.bold = True
            r_ad_n.font.size = Pt(11)
            r_ad_n.font.name = "Times New Roman"

            r_ad_txt = p_ad.add_run(f"\"{ad['content']}\"")
            r_ad_txt.font.size = Pt(11)
            r_ad_txt.font.name = "Times New Roman"
            idx_ad += 1

        # ĐIỀU 4: HIỆU LỰC THI HÀNH
        p_art4 = doc.add_paragraph()
        p_art4.paragraph_format.space_before = Pt(10)
        p_art4.paragraph_format.space_after = Pt(6)
        r_art4_title = p_art4.add_run("ĐIỀU 4: ĐIỀU KHOẢN THI HÀNH & CAM KẾT CHUNG\n")
        r_art4_title.bold = True
        r_art4_title.font.size = Pt(12)
        r_art4_title.font.name = "Times New Roman"

        terms = [
            f"4.1. Phụ lục này có hiệu lực kể từ ngày ký và là một bộ phận không tách rời của Hợp đồng số {contract_number}.",
            "4.2. Tất cả các điều khoản, điều kiện khác của Hợp đồng gốc không bị sửa đổi, bổ sung bởi Phụ lục này vẫn giữ nguyên hiệu lực thi hành đối với cả hai bên.",
            "4.3. Trong trường hợp có bất kỳ sự mâu thuẫn nào giữa nội dung của Hợp đồng gốc và Phụ lục này, các quy định tại Phụ lục này sẽ được ưu tiên áp dụng.",
            "4.4. Phụ lục này được lập thành 02 (hai) bản gốc bằng tiếng Việt có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản để cùng thực hiện."
        ]
        for t in terms:
            p_t = doc.add_paragraph()
            p_t.paragraph_format.left_indent = Inches(0.2)
            p_t.paragraph_format.space_after = Pt(4)
            p_t.paragraph_format.line_spacing = 1.15
            p_t.add_run(t).font.size = Pt(11)

        # 6. BẢNG CHỮ KÝ HAI BÊN (Căn 2 cột chuẩn mực)
        doc.add_paragraph().paragraph_format.space_after = Pt(14)
        sig_table = doc.add_table(rows=3, cols=2)
        sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER

        # Đặt độ rộng 2 cột
        for row in sig_table.rows:
            row.cells[0].width = Inches(3.2)
            row.cells[1].width = Inches(3.2)

        # Hàng 1: Tiêu đề chức danh
        cell_a_hdr = sig_table.cell(0, 0).paragraphs[0]
        cell_a_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_a_hdr = cell_a_hdr.add_run("ĐẠI DIỆN BÊN A\n")
        r_a_hdr.bold = True
        r_a_hdr.font.size = Pt(11.5)
        r_a_hdr.font.name = "Times New Roman"
        r_a_guide = cell_a_hdr.add_run("(Ký, ghi rõ họ tên và đóng dấu)")
        r_a_guide.italic = True
        r_a_guide.font.size = Pt(10)
        r_a_guide.font.name = "Times New Roman"

        cell_b_hdr = sig_table.cell(0, 1).paragraphs[0]
        cell_b_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_b_hdr = cell_b_hdr.add_run("ĐẠI DIỆN BÊN B\n")
        r_b_hdr.bold = True
        r_b_hdr.font.size = Pt(11.5)
        r_b_hdr.font.name = "Times New Roman"
        r_b_guide = cell_b_hdr.add_run("(Ký, ghi rõ họ tên và đóng dấu)")
        r_b_guide.italic = True
        r_b_guide.font.size = Pt(10)
        r_b_guide.font.name = "Times New Roman"

        # Hàng 2: Khoảng trống để ký (Chiều cao ~ 70pt)
        sig_table.rows[1].height = Pt(65)

        # Hàng 3: Tên đại diện
        cell_a_name = sig_table.cell(2, 0).paragraphs[0]
        cell_a_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_a_nm = cell_a_name.add_run(party_a_name)
        r_a_nm.bold = True
        r_a_nm.font.size = Pt(11)
        r_a_nm.font.name = "Times New Roman"

        cell_b_name = sig_table.cell(2, 1).paragraphs[0]
        cell_b_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_b_nm = cell_b_name.add_run(party_b_name)
        r_b_nm.bold = True
        r_b_nm.font.size = Pt(11)
        r_b_nm.font.name = "Times New Roman"

        # Trả về file BytesIO
        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        return file_stream
