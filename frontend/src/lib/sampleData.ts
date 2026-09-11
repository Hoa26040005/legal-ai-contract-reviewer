import { ContractAnalysisReport, ContractSummaryItem } from '../types/contract';

export const SAMPLE_CONTRACTS_LIST: ContractSummaryItem[] = [
  {
    id: "sample_it_service",
    title: "Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI",
    contract_type: "Hợp đồng Dịch vụ CNTT",
    page_count: 3,
    created_at: "2026-08-25",
    score: 42,
    status: "ready"
  },
  {
    id: "sample_nda",
    title: "Thỏa thuận Bảo mật Thông tin Không Tiết lộ (NDA Song phương)",
    contract_type: "Thỏa thuận Bảo mật",
    page_count: 2,
    created_at: "2026-08-20",
    score: 78,
    status: "ready"
  },
  {
    id: "sample_commercial_sale",
    title: "Hợp đồng Mua bán Thiết bị Phần cứng & Máy chủ Doanh nghiệp",
    contract_type: "Hợp đồng Mua bán Hàng hóa",
    page_count: 4,
    created_at: "2026-08-15",
    score: 58,
    status: "ready"
  }
];

export const SAMPLE_REPORTS: Record<string, ContractAnalysisReport> = {
  sample_it_service: {
    contract_id: "sample_it_service",
    contract_title: "Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI",
    contract_type: "Hợp đồng Dịch vụ CNTT",
    overall_score: 42,
    summary: "Báo cáo rà soát hợp đồng 'Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI' (Tổng số: 6 điều khoản). Điểm an toàn: 42/100. Phát hiện 1 rủi ro nghiêm trọng (Critical), 2 rủi ro cao (High), và 1 điểm cần lưu ý (Medium). CẢNH BÁO: Hợp đồng chứa các điều khoản phạt vi phạm 15% vượt quá mức trần 8% theo Luật Thương mại 2005 và điều khoản bồi thường toàn bộ không có trần trách nhiệm.",
    total_clauses: 6,
    critical_count: 1,
    high_count: 2,
    medium_count: 1,
    low_count: 0,
    clauses: [
      {
        id: "clause_1",
        clause_number: "Điều 1",
        title: "Phạm vi Công việc & Tiến độ Triển khai",
        content: "Bên B (Nhà phát triển) nhận cung cấp dịch vụ xây dựng phần mềm phân tích văn bản AI và tích hợp API cho Bên A (Khách hàng) theo đúng các mốc tiến độ quy định tại Phụ lục A.",
        page_number: 1,
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.34 }]
      },
      {
        id: "clause_2",
        clause_number: "Điều 2",
        title: "Thanh toán & Nghiệm thu",
        content: "Bên A thanh toán cho Bên B thành 3 đợt. Đợt 1: Tạm ứng 30% khi ký hợp đồng. Đợt 2: 40% khi bàn giao phiên bản Beta. Đợt 3: 30% sau khi nghiệm thu chính thức và chạy thử 15 ngày.",
        page_number: 1,
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.38, x1: 0.9, y1: 0.50 }]
      },
      {
        id: "clause_3",
        clause_number: "Điều 3",
        title: "Phạt Vi phạm Hợp đồng",
        content: "Nếu Bên B chậm tiến độ bàn giao quá 7 ngày, Bên B phải chịu mức phạt vi phạm là 15% tổng giá trị hợp đồng đối với mỗi tuần chậm trễ và Bên A có quyền khấu trừ trực tiếp vào đợt thanh toán tiếp theo.",
        page_number: 2,
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.20, x1: 0.9, y1: 0.35 }]
      },
      {
        id: "clause_4",
        clause_number: "Điều 4",
        title: "Đơn phương Chấm dứt & Quyền sở hữu Trí tuệ",
        content: "Bên A có quyền đơn phương chấm dứt hợp đồng ngay lập tức bất kỳ lúc nào mà không cần thông báo trước và không chịu bất kỳ trách nhiệm tài chính nào. Toàn bộ mã nguồn, tài liệu thiết kế và thuật toán AI do Bên B sáng tạo trong thời gian thực hiện đều thuộc quyền sở hữu vô điều kiện của Bên A.",
        page_number: 2,
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.40, x1: 0.9, y1: 0.55 }]
      },
      {
        id: "clause_5",
        clause_number: "Điều 5",
        title: "Trách nhiệm Bồi thường Thiệt hại Toàn bộ",
        content: "Bên B cam kết bồi thường toàn bộ thiệt hại phát sinh bao gồm thiệt hại trực tiếp, thiệt hại gián tiếp và tổn thất doanh thu nếu hệ thống phần mềm gặp sự cố gián đoạn trong thời gian vận hành thử nghiệm.",
        page_number: 3,
        bounding_boxes: [{ page: 3, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.38 }]
      },
      {
        id: "clause_6",
        clause_number: "Điều 6",
        title: "Giải quyết Tranh chấp & Cơ quan Tài phán",
        content: "Mọi tranh chấp phát sinh sẽ được giải quyết duy nhất tại Tòa án nhân dân nơi Bên A đặt trụ sở. Mọi chi phí tố tụng và luật sư do Bên thua kiện gánh chịu toàn bộ.",
        page_number: 3,
        bounding_boxes: [{ page: 3, x0: 0.1, y0: 0.45, x1: 0.9, y1: 0.58 }]
      }
    ],
    risks: [
      {
        id: "risk_clause_3_penalty",
        clause_id: "clause_3",
        clause_number: "Điều 3",
        risk_level: "CRITICAL",
        risk_title: "Phạt vi phạm 15% vượt quá mức trần 8% theo Luật Thương mại 2005",
        risk_category: "Phạt vi phạm",
        description: "Điều khoản quy định mức phạt vi phạm là 15% tổng giá trị hợp đồng cho mỗi tuần chậm trễ, vượt quá mức trần 8% theo quy định bắt buộc tại Điều 301 Luật Thương mại 2005. Điều khoản này có rủi ro cao bị Tòa án/Trọng tài tuyên vô hiệu một phần.",
        legal_basis: "Điều 301, Luật Thương mại 2005",
        original_text: "Nếu Bên B chậm tiến độ bàn giao quá 7 ngày, Bên B phải chịu mức phạt vi phạm là 15% tổng giá trị hợp đồng đối với mỗi tuần chậm trễ và Bên A có quyền khấu trừ trực tiếp vào đợt thanh toán tiếp theo.",
        suggested_text: "Nếu Bên B chậm tiến độ bàn giao quá 7 ngày do lỗi chủ quan của Bên B, Bên B phải chịu mức phạt vi phạm là 0.5% giá trị phần nghĩa vụ bị chậm trễ cho mỗi tuần, nhưng tổng mức phạt không vượt quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm theo quy định của Luật Thương mại 2005.",
        rationale: "Khống chế mức phạt tối đa 8% theo luật định và chỉ tính trên phần nghĩa vụ chậm trễ thay vì toàn bộ tổng giá trị hợp đồng.",
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.20, x1: 0.9, y1: 0.35 }]
      },
      {
        id: "risk_clause_4_termination",
        clause_id: "clause_4",
        clause_number: "Điều 4",
        risk_level: "HIGH",
        risk_title: "Đơn phương chấm dứt hợp đồng ngay lập tức, tước quyền sở hữu trí tuệ",
        risk_category: "Chấm dứt hợp đồng & IP",
        description: "Bên A có quyền đơn phương chấm dứt không cần báo trước và không chịu trách nhiệm tài chính, đồng thời chiếm đoạt toàn bộ quyền SHTT dù chưa thanh toán đầy đủ.",
        legal_basis: "Điều 428, Bộ luật Dân sự 2015 & Luật Sở hữu trí tuệ",
        original_text: "Bên A có quyền đơn phương chấm dứt hợp đồng ngay lập tức bất kỳ lúc nào mà không cần thông báo trước và không chịu bất kỳ trách nhiệm tài chính nào.",
        suggested_text: "Mỗi bên có quyền đơn phương chấm dứt Hợp đồng khi bên kia vi phạm nghiêm trọng nghĩa vụ và không khắc phục trong vòng 30 ngày kể từ khi nhận được thông báo bằng văn bản. Khi chấm dứt, Bên A phải thanh toán toàn bộ chi phí cho khối lượng công việc Bên B đã hoàn thành đạt yêu cầu. Quyền sở hữu trí tuệ chỉ được chuyển giao sau khi Bên A đã hoàn tất 100% nghĩa vụ thanh toán.",
        rationale: "Đảm bảo thời hạn thông báo hợp lý (30 ngày) và bảo vệ quyền sở hữu trí tuệ của nhà phát triển phần mềm cho đến khi nhận đủ thanh toán.",
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.40, x1: 0.9, y1: 0.55 }]
      },
      {
        id: "risk_clause_5_liability",
        clause_id: "clause_5",
        clause_number: "Điều 5",
        risk_level: "HIGH",
        risk_title: "Bồi thường không giới hạn và gánh chịu thiệt hại gián tiếp",
        risk_category: "Bồi thường thiệt hại",
        description: "Bên B phải bồi thường thiệt hại gián tiếp và tổn thất doanh thu mà không có mức trần trách nhiệm, tạo rủi ro phá sản nếu phát sinh sự cố phần mềm.",
        legal_basis: "Điều 360, Bộ luật Dân sự 2015",
        original_text: "Bên B cam kết bồi thường toàn bộ thiệt hại phát sinh bao gồm thiệt hại trực tiếp, thiệt hại gián tiếp và tổn thất doanh thu nếu hệ thống phần mềm gặp sự cố.",
        suggested_text: "Trách nhiệm bồi thường của Bên B chỉ giới hạn trong phạm vi thiệt hại thực tế, trực tiếp phát sinh do lỗi cố ý của Bên B và tổng mức bồi thường trong mọi trường hợp không vượt quá 100% tổng giá trị Hợp đồng thực tế đã nhận thanh toán. Hai bên loại trừ hoàn toàn nghĩa vụ bồi thường cho bất kỳ thiệt hại gián tiếp hoặc mất doanh thu nào.",
        rationale: "Áp dụng giới hạn trần trách nhiệm (Liability Cap) tiêu chuẩn trong ngành phần mềm công nghệ.",
        bounding_boxes: [{ page: 3, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.38 }]
      },
      {
        id: "risk_clause_6_jurisdiction",
        clause_id: "clause_6",
        clause_number: "Điều 6",
        risk_level: "MEDIUM",
        risk_title: "Thẩm quyền Tòa án áp đặt theo trụ sở của Bên A",
        risk_category: "Tranh chấp & Tài phán",
        description: "Quy định giải quyết tranh chấp nghiêng hẳn về địa điểm của Khách hàng, gây khó khăn cho Bên B nếu xảy ra tố tụng.",
        legal_basis: "Điều 39, Bộ luật Tố tụng Dân sự 2015",
        original_text: "Mọi tranh chấp phát sinh sẽ được giải quyết duy nhất tại Tòa án nhân dân nơi Bên A đặt trụ sở.",
        suggested_text: "Mọi tranh chấp phát sinh trước hết sẽ được giải quyết thông qua thương lượng, hòa giải. Trường hợp không đạt được thỏa thuận trong vòng 30 ngày, tranh chấp sẽ được đưa ra giải quyết tại Trung tâm Trọng tài Quốc tế Việt Nam (VIAC) theo Quy tắc tố tụng trọng tài của Trung tâm này.",
        rationale: "Trọng tài thương mại VIAC đảm bảo tính trung lập, bảo mật và phán quyết chung thẩm nhanh chóng.",
        bounding_boxes: [{ page: 3, x0: 0.1, y0: 0.45, x1: 0.9, y1: 0.58 }]
      }
    ],
    graph_data: {
      nodes: [
        { id: "sample_it_service", label: "HĐ Dịch vụ CNTT & AI", type: "Contract" },
        { id: "node_clause_1", label: "Điều 1: Phạm vi", type: "Clause" },
        { id: "node_clause_2", label: "Điều 2: Thanh toán", type: "Clause" },
        { id: "node_clause_3", label: "Điều 3: Phạt vi phạm", type: "Clause" },
        { id: "node_clause_4", label: "Điều 4: Chấm dứt & IP", type: "Clause" },
        { id: "node_clause_5", label: "Điều 5: Bồi thường", type: "Clause" },
        { id: "node_clause_6", label: "Điều 6: Tranh chấp", type: "Clause" },
        { id: "node_risk_penalty", label: "[CRITICAL] Phạt vi phạm 15%", type: "Risk" },
        { id: "node_risk_termination", label: "[HIGH] Đơn phương chấm dứt", type: "Risk" },
        { id: "node_risk_liability", label: "[HIGH] Bồi thường vô hạn", type: "Risk" },
        { id: "node_risk_jurisdiction", label: "[MEDIUM] Thẩm quyền áp đặt", type: "Risk" },
        { id: "law_LTM_301", label: "Điều 301 Luật Thương mại 2005", type: "Law" },
        { id: "law_BLDS_428", label: "Điều 428 Bộ luật Dân sự 2015", type: "Law" },
        { id: "law_BLDS_360", label: "Điều 360 Bộ luật Dân sự 2015", type: "Law" },
        { id: "law_BLTTDS_39", label: "Điều 39 BLTTDS 2015", type: "Law" }
      ],
      edges: [
        { source: "sample_it_service", target: "node_clause_1", relation: "HAS_CLAUSE" },
        { source: "sample_it_service", target: "node_clause_2", relation: "HAS_CLAUSE" },
        { source: "sample_it_service", target: "node_clause_3", relation: "HAS_CLAUSE" },
        { source: "sample_it_service", target: "node_clause_4", relation: "HAS_CLAUSE" },
        { source: "sample_it_service", target: "node_clause_5", relation: "HAS_CLAUSE" },
        { source: "sample_it_service", target: "node_clause_6", relation: "HAS_CLAUSE" },
        { source: "node_clause_3", target: "node_risk_penalty", relation: "EXHIBITS_RISK" },
        { source: "node_clause_4", target: "node_risk_termination", relation: "EXHIBITS_RISK" },
        { source: "node_clause_5", target: "node_risk_liability", relation: "EXHIBITS_RISK" },
        { source: "node_clause_6", target: "node_risk_jurisdiction", relation: "EXHIBITS_RISK" },
        { source: "node_risk_penalty", target: "law_LTM_301", relation: "VIOLATES_LAW" },
        { source: "node_risk_termination", target: "law_BLDS_428", relation: "CONFLICTS_WITH" },
        { source: "node_risk_liability", target: "law_BLDS_360", relation: "EXCEEDS_STATUTE" },
        { source: "node_risk_jurisdiction", target: "law_BLTTDS_39", relation: "REFERENCES" }
      ]
    }
  }
};
