import fitz
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import Clause
from app.engine.risk_analyzer import LegalRiskAnalyzer

client = TestClient(app, raise_server_exceptions=False)


def _make_valid_pdf_bytes(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=11)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def _has_risk(text: str, suffix: str, contract_type: str = "Hợp đồng Lao động (BLLD 2019)") -> bool:
    clause = Clause(
        id="c1",
        clause_number="Điều 1",
        title="Điều khoản kiểm thử",
        content=text,
        page_number=1,
        bounding_boxes=[],
    )
    risks = LegalRiskAnalyzer._evaluate_clause(clause, contract_type)
    return any(r.id.endswith(suffix) for r in risks)


def test_cypher_injection_and_write_guard():
    """Chặn tuyệt đối lệnh ghi/xóa/gọi thủ tục hệ thống hoặc truy vấn quá dài trên endpoint Cypher."""
    r_delete = client.post("/api/v1/contracts/graph/query", json={"query": "MATCH (n) DETACH DELETE n"})
    assert r_delete.status_code == 400

    r_call = client.post("/api/v1/contracts/graph/query", json={"query": "CALL dbms.security.listUsers()"})
    assert r_call.status_code == 400

    r_long = client.post("/api/v1/contracts/graph/query", json={"query": "MATCH (n) RETURN n " * 200})
    assert r_long.status_code == 400

    r_valid = client.post(
        "/api/v1/contracts/graph/query",
        json={"query": "MATCH (c:Contract)-[:HAS_CLAUSE]->(cl:Clause) RETURN c, cl LIMIT 5"},
    )
    assert r_valid.status_code == 200


def test_file_upload_security_and_magic_bytes():
    """Kiểm tra chặn tệp thực thi, giả mạo phần mở rộng (Magic Bytes Spoofing), tệp rỗng và chống lộ lỗi nội bộ."""
    # 1. Chặn phần mở rộng nguy hiểm
    r_exe = client.post(
        "/api/v1/contracts/upload",
        files={"file": ("malware.exe", b"MZ\x90\x00", "application/octet-stream")},
    )
    assert r_exe.status_code == 400

    # 2. Chặn giả mạo đuôi .pdf nhưng nội dung là HTML/Script (Magic Bytes Spoofing)
    r_spoof = client.post(
        "/api/v1/contracts/upload",
        files={"file": ("fake.pdf", b"<script>alert(1)</script>", "application/pdf")},
    )
    assert r_spoof.status_code == 400
    assert not any(
        internal in r_spoof.text for internal in ["Traceback", "fitz", "FileDataError", "Failed to open"]
    )

    # 3. Chặn tệp rỗng
    r_empty = client.post(
        "/api/v1/contracts/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert r_empty.status_code == 400

    # 4. Chặn tệp vượt quá 25MB
    oversize_payload = b"%PDF-1.4\n" + (b"0" * (26 * 1024 * 1024))
    r_big = client.post(
        "/api/v1/contracts/upload",
        files={"file": ("oversize.pdf", oversize_payload, "application/pdf")},
    )
    assert r_big.status_code == 413


def test_compare_and_statute_upload_guards():
    """Đảm bảo endpoint /compare và /upload-statute cũng kiểm tra định dạng và giới hạn dung lượng."""
    r_cmp_exe = client.post(
        "/api/v1/contracts/compare",
        files={
            "file_v1": ("a.exe", b"MZ", "application/octet-stream"),
            "file_v2": ("b.exe", b"MZ", "application/octet-stream"),
        },
    )
    assert r_cmp_exe.status_code == 400

    r_statute_exe = client.post(
        "/api/v1/laws/upload-statute",
        files={"file": ("bad.exe", b"MZ", "application/octet-stream")},
        data={"statute_title": "Test", "category": "Dân sự"},
    )
    assert r_statute_exe.status_code == 400


def test_cors_and_archive_404_semantics():
    """Đảm bảo CORS không mở wildcard cho Origin lạ và xóa hồ sơ không tồn tại trả về 404."""
    r_cors = client.options(
        "/api/v1/contracts/samples",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
    )
    assert r_cors.headers.get("access-control-allow-origin") not in ("*", "https://evil.example")

    r_del = client.delete("/api/v1/contracts/archive/non_existent_id_99999")
    assert r_del.status_code == 404


def test_legal_logic_boundary_and_false_positive_immunity():
    """Kiểm thử tính hợp lý pháp lý: biên giá trị (Boundary Values) và khả năng chống báo lỗi giả (False Positives)."""
    commercial_type = "Hợp đồng Dịch vụ Thương mại"

    # 1. Trần thử việc 60 ngày (Điều 25 BLLĐ 2019)
    assert not _has_risk("Thời gian thử việc là 60 ngày.", "_probation_period")
    assert _has_risk("Thời gian thử việc là 61 ngày.", "_probation_period")
    assert not _has_risk("Thời gian thử việc là 2 tháng.", "_probation_period")
    assert _has_risk("Thời gian thử việc là 3 tháng.", "_probation_period")
    assert not _has_risk(
        "Thời gian thử việc là 30 ngày. Hợp đồng chấm dứt khi báo trước 90 ngày.",
        "_probation_period",
    )

    # 2. Giữ văn bằng gốc vs lưu giữ bằng chứng (Điều 17.1 BLLĐ 2019)
    assert _has_risk("Công ty giữ bằng gốc của người lao động.", "_keep_diploma")
    assert not _has_risk("Các bên có trách nhiệm lưu giữ bằng chứng giao dịch.", "_keep_diploma")

    # 3. Trần phạt vi phạm thương mại 8% (Điều 301 LTM 2005)
    assert not _has_risk("Bên vi phạm chịu phạt 8% giá trị phần nghĩa vụ.", "_penalty_cap", commercial_type)
    assert _has_risk("Bên B chịu phạt vi phạm 12% giá trị hợp đồng.", "_penalty_cap", commercial_type)
    assert _has_risk("Bên B chịu phạt 8,5% giá trị hợp đồng.", "_penalty_cap", commercial_type)

    # 4. Phân biệt phạt thương mại và phạt cắt lương kỷ luật lao động (Điều 127 BLLĐ 2019)
    assert not _has_risk("Bên B chịu phạt tiền 5% giá trị đơn hàng giao chậm.", "_salary_penalty", commercial_type)
    assert _has_risk("Người lao động đi muộn bị phạt tiền 500.000 đồng.", "_salary_penalty")

    # 5. Trần lãi suất chậm trả 20%/năm (Điều 468 BLDS 2015)
    assert not _has_risk("Lãi suất chậm trả là 10%/năm.", "_interest_cap", commercial_type)
    assert not _has_risk("Lãi suất chậm trả là 1.5%/tháng.", "_interest_cap", commercial_type)
    assert _has_risk("Lãi suất chậm trả là 0.1%/ngày.", "_interest_cap", commercial_type)

    # 6. Chống báo nhầm đơn phương chấm dứt & chiếm đoạt SHTT khi điều khoản hợp lệ
    assert not _has_risk(
        "Bên A thanh toán ngay lập tức khi nhận hóa đơn hợp lệ.",
        "_unilateral_termination",
        commercial_type,
    )
    assert not _has_risk(
        "Bên B bàn giao mã nguồn sau khi Bên A thanh toán đủ 100% giá trị hợp đồng.",
        "_ip_takeover",
        commercial_type,
    )


def test_real_estate_deposit_and_lease_logic():
    """Kiểm thử toán học định lượng cho Hợp đồng Bất động sản (Luật KDBĐS 2023), Đặt cọc & Thuê mặt bằng (BLDS 2015)."""
    re_type = "Hợp đồng Bất động sản & Nhà ở (Luật KDBĐS 2023 & Đất đai 2024)"
    lease_type = "Hợp đồng Đặt cọc & Thuê mặt bằng (BLDS 2015)"

    # 1. Trần đặt cọc BĐS 5% (Điều 23.5 Luật KDBĐS 2023)
    assert not _has_risk("Bên Mua đặt cọc 5% giá bán căn hộ hình thành trong tương lai.", "_re_deposit_cap", re_type)
    assert _has_risk("Bên Mua đặt cọc 5,5% giá bán căn hộ hình thành trong tương lai.", "_re_deposit_cap", re_type)
    assert _has_risk("Chủ đầu tư thu tiền đặt cọc là 10% giá trị căn hộ dự án.", "_re_deposit_cap", re_type)

    # 2. Hình thức công chứng & pháp lý nhà đất (Luật Đất đai 2024 & Luật Nhà ở 2023)
    assert _has_risk("Hai bên thống nhất mua bán nhà bằng giấy viết tay và lập vi bằng thừa phát lại.", "_re_notarization_and_legal", re_type)
    assert _has_risk("Chuyển nhượng thửa đất khi chưa có sổ đỏ, hai bên miễn công chứng.", "_re_notarization_and_legal", re_type)

    # 3. Hợp đồng Đặt cọc: Bẫy phạt cọc một chiều (Điều 328 BLDS 2015)
    assert _has_risk(
        "Nếu Bên Đặt Cọc đổi ý thì mất cọc; nếu Bên Nhận Cọc đổi ý thì chỉ hoàn trả lại tiền cọc đã nhận mà không chịu phạt cọc.",
        "_one_sided_deposit",
        lease_type,
    )
    assert not _has_risk(
        "Nếu Bên Nhận Đặt Cọc từ chối giao kết thì phải hoàn trả tiền đặt cọc và chịu phạt một khoản tương đương giá trị tiền cọc.",
        "_one_sided_deposit",
        lease_type,
    )

    # 4. Hợp đồng Thuê mặt bằng: Tăng giá thuê > 15% hoặc thu hồi mặt bằng < 30 ngày (Điều 472, 474, 481 BLDS 2015)
    assert _has_risk("Bên cho thuê có quyền điều chỉnh giá thuê tăng 20% mỗi năm.", "_lease_unfair_terms", lease_type)
    assert _has_risk("Bên cho thuê được lấy lại mặt bằng trước hạn khi báo trước 7 ngày.", "_lease_unfair_terms", lease_type)
    assert not _has_risk("Biên độ điều chỉnh giá thuê không quá 8%/năm và phải báo trước 60 ngày.", "_lease_unfair_terms", lease_type)


def test_power_of_attorney_and_signatory_logic():
    """Kiểm thử Giấy Ủy Quyền / Hợp đồng Ủy quyền (Điều 562-569 BLDS 2015) & Thẩm quyền ký kết (Điều 142 BLDS 2015)."""
    poa_type = "Giấy Ủy quyền / Hợp đồng Ủy quyền (BLDS 2015)"

    # 1. Ủy quyền vô thời hạn / không hủy ngang (Điều 563 & 569 BLDS 2015)
    assert _has_risk("Văn bản ủy quyền này là ủy quyền vô thời hạn và không được hủy ngang.", "_poa_unlimited_or_irrevocable", poa_type)
    assert not _has_risk("Thời hạn ủy quyền là 12 tháng kể từ ngày ký văn bản này.", "_poa_unlimited_or_irrevocable", poa_type)

    # 2. Tự ý ủy quyền lại cho bên thứ ba (Điều 564 BLDS 2015)
    assert _has_risk(
        "Bên được ủy quyền có toàn quyền ủy quyền lại cho bên thứ ba mà không cần sự đồng ý của Bên ủy quyền.",
        "_poa_subdelegation",
        poa_type,
    )
    assert not _has_risk(
        "Bên được ủy quyền chỉ được ủy quyền lại khi có sự đồng ý bằng văn bản của Bên ủy quyền.",
        "_poa_subdelegation",
        poa_type,
    )

    # 3. Ký hợp đồng không có giấy ủy quyền hợp lệ (Điều 142 BLDS 2015)
    assert _has_risk(
        "Phó Giám đốc ký thay nhưng không có giấy ủy quyền bằng văn bản của Tổng Giám đốc.",
        "_unauthorized_signatory",
        poa_type,
    )


def test_contract_level_completeness_check():
    """Kiểm thử Bộ kiểm tra Cấu trúc Toàn Hợp đồng (Missing Mandatory Clauses & Signatory Authority)."""
    incomplete_clauses = [
        Clause(id="c1", clause_number="Điều 1", title="Phó Giám đốc đại diện", content="Đại diện Bên A: Ông Nguyễn Văn X - Chức vụ: Phó Giám đốc ký thay.", page_number=1, bounding_boxes=[]),
        Clause(id="c2", clause_number="Điều 2", title="Đối tượng", content="Cung cấp thiết bị máy chủ theo phụ lục.", page_number=1, bounding_boxes=[]),
        Clause(id="c3", clause_number="Điều 3", title="Giá trị", content="Tổng giá trị hợp đồng là 500.000.000 VNĐ.", page_number=1, bounding_boxes=[]),
        Clause(id="c4", clause_number="Điều 4", title="Hiệu lực", content="Hợp đồng có hiệu lực kể từ ngày ký.", page_number=1, bounding_boxes=[]),
    ]
    report = LegalRiskAnalyzer.analyze_contract("contract_incomplete_01", "Hợp đồng thiếu điều khoản", "Hợp đồng Mua bán Hàng hóa", incomplete_clauses)
    risk_ids = [r.id for r in report.risks]
    assert any(rid.endswith("_missing_poa_reference") for rid in risk_ids)
    assert any(rid.endswith("_missing_force_majeure") for rid in risk_ids)
    assert any(rid.endswith("_missing_dispute_resolution") for rid in risk_ids)

    complete_clauses = [
        Clause(id="c1", clause_number="Điều 1", title="Chủ thể", content="Bên A: Công ty TNHH X, Mã số doanh nghiệp: 0101234567, Người đại diện theo pháp luật: Ông A - Giám đốc.", page_number=1, bounding_boxes=[]),
        Clause(id="c2", clause_number="Điều 2", title="Đối tượng & Giá cả", content="Cung cấp dịch vụ phần mềm với giá 200.000.000 VNĐ.", page_number=1, bounding_boxes=[]),
        Clause(id="c3", clause_number="Điều 3", title="Bất khả kháng", content="Các bên được miễn trách nhiệm khi xảy ra sự kiện bất khả kháng như thiên tai, dịch bệnh.", page_number=1, bounding_boxes=[]),
        Clause(id="c4", clause_number="Điều 4", title="Giải quyết tranh chấp", content="Mọi tranh chấp được giải quyết qua thương lượng hoặc tại Trọng tài VIAC.", page_number=1, bounding_boxes=[]),
    ]
    report_ok = LegalRiskAnalyzer.analyze_contract("contract_complete_01", "Hợp đồng đầy đủ", "Hợp đồng Dịch vụ Thương mại", complete_clauses)
    ok_ids = [r.id for r in report_ok.risks]
    assert not any(rid.endswith("_missing_poa_reference") for rid in ok_ids)
    assert not any(rid.endswith("_missing_force_majeure") for rid in ok_ids)
    assert not any(rid.endswith("_missing_dispute_resolution") for rid in ok_ids)

