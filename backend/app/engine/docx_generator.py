import io
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from app.models.schemas import ContractAnalysisReport

class ContractDocxGenerator:
    """
    Module sinh tài liệu Word (.docx) chứa Track Changes / Redline chuyên nghiệp.
    - Đánh dấu gạch đỏ (strikethrough) đối với điều khoản rủi ro gốc.
    - Đánh dấu chữ xanh lá cây (underline/bold) đối với điều khoản đề xuất sửa đổi của AI.
    - Hộp chú thích căn cứ pháp luật Việt Nam (Bộ luật Lao động 2019, Luật Thương mại 2005, BLDS 2015).
    """

    @classmethod
    def generate_redline_docx(cls, report: ContractAnalysisReport) -> io.BytesIO:
        doc = Document()

        # Set page margins
        for section in doc.sections:
            section.top_margin = Inches(0.8)
            section.bottom_margin = Inches(0.8)
            section.left_margin = Inches(1.0)
            section.right_margin = Inches(1.0)

        # 1. National Emblem & Header
        p_header = doc.add_paragraph()
        p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_nation = p_header.add_run("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n")
        run_nation.bold = True
        run_nation.font.size = Pt(11)
        run_nation.font.name = "Times New Roman"

        run_motto = p_header.add_run("Độc lập - Tự do - Hạnh phúc\n")
        run_motto.bold = True
        run_motto.underline = True
        run_motto.font.size = Pt(11)
        run_motto.font.name = "Times New Roman"

        p_header.add_run("------------------o0o------------------\n\n")

        # 2. Document Title
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_title = p_title.add_run(f"BẢN SỬA ĐỔI ĐIỀU KHOẢN HỢP ĐỒNG (TRACK CHANGES REDLINE)\n")
        run_title.bold = True
        run_title.font.size = Pt(14)
        run_title.font.color.rgb = RGBColor(15, 23, 42)

        run_subtitle = p_title.add_run(f"Tài liệu gốc: {report.contract_title}\n")
        run_subtitle.italic = True
        run_subtitle.font.size = Pt(11)
        run_subtitle.font.color.rgb = RGBColor(71, 85, 105)

        # 3. Audit Summary Table
        summary_table = doc.add_table(rows=2, cols=4)
        summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        summary_table.autofit = False

        headers = ["Điểm An Toàn", "Vi Phạm Điều Cấm", "Bất Lợi Lớn", "Tổng Điều Khoản"]
        values = [
            f"{report.overall_score}/100",
            f"{report.critical_count} mục",
            f"{report.high_count} mục",
            f"{report.total_clauses} điều",
        ]

        hdr_cells = summary_table.rows[0].cells
        for idx, text in enumerate(headers):
            hdr_cells[idx].text = text
            hdr_cells[idx].paragraphs[0].runs[0].font.bold = True
            hdr_cells[idx].paragraphs[0].runs[0].font.size = Pt(9.5)
            # Background light gray
            shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F1F5F9"/>')
            hdr_cells[idx]._tc.get_or_add_tcPr().append(shading)

        val_cells = summary_table.rows[1].cells
        for idx, text in enumerate(values):
            val_cells[idx].text = text
            run = val_cells[idx].paragraphs[0].runs[0]
            run.font.bold = True
            run.font.size = Pt(11)
            if idx == 0:
                run.font.color.rgb = RGBColor(220, 38, 38) if report.overall_score < 50 else RGBColor(16, 185, 129)
            elif idx == 1:
                run.font.color.rgb = RGBColor(220, 38, 38)
            elif idx == 2:
                run.font.color.rgb = RGBColor(245, 158, 11)

        doc.add_paragraph() # Spacer

        # 4. Executive Summary Note
        p_exec = doc.add_paragraph()
        run_exec_title = p_exec.add_run("ĐÁNH GIÁ TỔNG QUAN CỦA HỆ THỐNG AI:\n")
        run_exec_title.bold = True
        run_exec_title.font.size = Pt(10.5)
        run_exec_title.font.color.rgb = RGBColor(30, 41, 59)

        run_exec_body = p_exec.add_run(report.summary)
        run_exec_body.italic = True
        run_exec_body.font.size = Pt(10)
        run_exec_body.font.color.rgb = RGBColor(71, 85, 105)

        p_divider = doc.add_paragraph()
        p_divider.add_run("=" * 65).font.color.rgb = RGBColor(203, 213, 225)

        # 5. Clauses & Track Changes Revisions
        risk_map = {r.clause_id: r for r in report.risks}

        for clause in report.clauses:
            risk = risk_map.get(clause.id)

            p_clause_num = doc.add_paragraph()
            p_clause_num.paragraph_format.space_before = Pt(12)
            p_clause_num.paragraph_format.space_after = Pt(4)

            run_cnum = p_clause_num.add_run(f"{clause.clause_number}: {clause.title} ")
            run_cnum.bold = True
            run_cnum.font.size = Pt(11)

            if risk:
                # Add severity tag
                run_tag = p_clause_num.add_run(f" [{risk.risk_level.value} - {risk.risk_category}]")
                run_tag.bold = True
                run_tag.font.size = Pt(9.5)
                if risk.risk_level.value == "CRITICAL":
                    run_tag.font.color.rgb = RGBColor(220, 38, 38)
                else:
                    run_tag.font.color.rgb = RGBColor(245, 158, 11)

                # Paragraph with Strikethrough Old Text
                p_old = doc.add_paragraph()
                p_old.paragraph_format.left_indent = Inches(0.2)
                p_old.paragraph_format.space_after = Pt(3)
                run_old_label = p_old.add_run("[-] Văn bản gốc (Vi phạm / Bất lợi): ")
                run_old_label.bold = True
                run_old_label.font.size = Pt(9.5)
                run_old_label.font.color.rgb = RGBColor(220, 38, 38)

                run_old_content = p_old.add_run(clause.content)
                run_old_content.font.strike = True
                run_old_content.font.size = Pt(10)
                run_old_content.font.color.rgb = RGBColor(220, 38, 38)

                # Paragraph with Green Underline Suggested Text
                p_new = doc.add_paragraph()
                p_new.paragraph_format.left_indent = Inches(0.2)
                p_new.paragraph_format.space_after = Pt(5)
                run_new_label = p_new.add_run("[+] Đề xuất AI sửa đổi (Hợp pháp): ")
                run_new_label.bold = True
                run_new_label.font.size = Pt(9.5)
                run_new_label.font.color.rgb = RGBColor(16, 185, 129)

                run_new_content = p_new.add_run(risk.suggested_text)
                run_new_content.font.underline = True
                run_new_content.font.bold = True
                run_new_content.font.size = Pt(10)
                run_new_content.font.color.rgb = RGBColor(5, 150, 105)

                # Legal Basis Box (Table with purple border)
                legal_table = doc.add_table(rows=1, cols=1)
                legal_table.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = legal_table.rows[0].cells[0]
                
                shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F5F3FF"/>')
                cell._tc.get_or_add_tcPr().append(shading)

                p_box = cell.paragraphs[0]
                p_box.paragraph_format.space_before = Pt(3)
                p_box.paragraph_format.space_after = Pt(3)
                
                run_box_lbl = p_box.add_run("⚖ CĂN CỨ PHÁP LUẬT VIỆT NAM: ")
                run_box_lbl.bold = True
                run_box_lbl.font.size = Pt(9.5)
                run_box_lbl.font.color.rgb = RGBColor(109, 40, 217)

                run_box_text = p_box.add_run(f"{risk.legal_basis}\n")
                run_box_text.bold = True
                run_box_text.font.size = Pt(9.5)
                run_box_text.font.color.rgb = RGBColor(79, 70, 229)

                run_reason_lbl = p_box.add_run("💡 Chiến lược đàm phán: ")
                run_reason_lbl.bold = True
                run_reason_lbl.font.size = Pt(9)
                run_reason_lbl.font.color.rgb = RGBColor(71, 85, 105)

                run_reason_text = p_box.add_run(risk.rationale)
                run_reason_text.font.size = Pt(9)
                run_reason_text.font.color.rgb = RGBColor(51, 65, 85)

            else:
                # Safe clause
                p_safe = doc.add_paragraph()
                p_safe.paragraph_format.left_indent = Inches(0.2)
                run_safe = p_safe.add_run(clause.content)
                run_safe.font.size = Pt(10)
                run_safe.font.color.rgb = RGBColor(51, 65, 85)

        # Output to buffer
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer
