import { ContractAnalysisReport, ContractSummaryItem } from '../types/contract';

export const SAMPLE_CONTRACTS_LIST: ContractSummaryItem[] = [
  {
    id: "sample_labor_contract",
    title: "Hợp đồng Lao động & Cam kết Làm việc (Vị trí Kỹ sư Phần mềm AI)",
    contract_type: "Hợp đồng Lao động (BLLD 2019)",
    page_count: 3,
    created_at: "2026-08-28",
    score: 22,
    status: "ready"
  },
  {
    id: "sample_it_service",
    title: "Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI",
    contract_type: "Hợp đồng Dịch vụ CNTT",
    page_count: 3,
    created_at: "2026-08-25",
    score: 35,
    status: "ready"
  },
  {
    id: "sample_commercial_sale",
    title: "Hợp đồng Mua bán Thiết bị Phần cứng & Máy chủ Doanh nghiệp",
    contract_type: "Hợp đồng Mua bán Hàng hóa",
    page_count: 4,
    created_at: "2026-08-15",
    score: 52,
    status: "ready"
  },
  {
    id: "sample_nda",
    title: "Thỏa thuận Bảo mật Thông tin Không Tiết lộ (NDA Song phương)",
    contract_type: "Thỏa thuận Bảo mật",
    page_count: 2,
    created_at: "2026-08-20",
    score: 72,
    status: "ready"
  }
];

export const SAMPLE_REPORTS: Record<string, ContractAnalysisReport> = {
  sample_labor_contract: {
    contract_id: "sample_labor_contract",
    contract_title: "Hợp đồng Lao động & Cam kết Làm việc (Vị trí Kỹ sư Phần mềm AI)",
    contract_type: "Hợp đồng Lao động (BLLD 2019)",
    overall_score: 22,
    summary: "CẢNH BÁO PHÁP LÝ ĐẶC BIỆT NGHIÊM TRỌNG: Hợp đồng Lao động này chứa 4 điều khoản vi phạm trực tiếp các điều cấm của Bộ luật Lao động 2019, bao gồm: Yêu cầu giữ bản gốc bằng tốt nghiệp đại học (Điều 17.1), Bắt người lao động đóng tiền cọc ký quỹ 20.000.000 VNĐ (Điều 17.2), Thử việc 04 tháng vượt mức trần 60 ngày (Điều 25), Phạt tiền 500.000 VNĐ trừ vào lương (Điều 127), và Thỏa thuận trốn đóng BHXH (Điều 168). Các điều khoản này hoàn toàn vô hiệu và doanh nghiệp đối mặt nguy cơ bị Thanh tra Lao động xử phạt nặng.",
    total_clauses: 6,
    critical_count: 4,
    high_count: 2,
    medium_count: 0,
    low_count: 0,
    clauses: [
      {
        id: "clause_1",
        clause_number: "Điều 1",
        title: "Vị trí Công việc & Hồ sơ Tiếp nhận",
        content: "Người sử dụng lao động tuyển dụng Người lao động làm việc tại vị trí Kỹ sư Phần mềm AI. Khi ký hợp đồng, Người lao động phải nộp bản gốc bằng tốt nghiệp đại học và giấy tờ tùy thân gốc để Công ty lưu giữ trong suốt thời hạn hợp đồng.",
        page_number: 1,
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.35 }]
      },
      {
        id: "clause_2",
        clause_number: "Điều 2",
        title: "Thời gian Thử việc & Tiền ký quỹ Bảo đảm",
        content: "Thời gian thử việc là 04 tháng (120 ngày). Để bảo đảm việc thực hiện hợp đồng và không tự ý bỏ việc, Người lao động phải nộp tiền đặt cọc ký quỹ là 20.000.000 VNĐ vào tài khoản Công ty ngay trong ngày đầu nhận việc.",
        page_number: 1,
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.38, x1: 0.9, y1: 0.52 }]
      },
      {
        id: "clause_3",
        clause_number: "Điều 3",
        title: "Tiền lương & Chế độ Bảo hiểm Xã hội",
        content: "Mức lương chính thức là 30.000.000 VNĐ/tháng. Hai bên thỏa thuận Công ty không tham gia BHXH, BHYT, BHTN bắt buộc cho Người lao động mà sẽ cộng thêm 500.000 VNĐ/tháng vào lương để Người lao động tự lo các loại bảo hiểm.",
        page_number: 2,
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.20, x1: 0.9, y1: 0.36 }]
      },
      {
        id: "clause_4",
        clause_number: "Điều 4",
        title: "Kỷ luật Lao động & Chế tài Phạt tiền",
        content: "Nếu Người lao động đi làm trễ quá 15 phút hoặc không hoàn thành KPI tuần, Công ty sẽ áp dụng chế tài phạt tiền 500.000 VNĐ cho mỗi lần vi phạm và trừ trực tiếp vào tiền lương của tháng đó.",
        page_number: 2,
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.40, x1: 0.9, y1: 0.54 }]
      },
      {
        id: "clause_5",
        clause_number: "Điều 5",
        title: "Thỏa thuận Không Cạnh tranh (Non-Compete)",
        content: "Sau khi chấm dứt hợp đồng lao động vì bất kỳ lý do gì, Người lao động cam kết cấm làm việc cho bất kỳ công ty nào trong ngành công nghệ thông tin hoặc đối thủ cạnh tranh trong thời hạn 03 năm kể từ ngày nghỉ việc.",
        page_number: 3,
        bounding_boxes: [{ page: 3, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.38 }]
      },
      {
        id: "clause_6",
        clause_number: "Điều 6",
        title: "Cam kết Thời hạn Làm việc & Thẩm quyền Tòa án",
        content: "Người lao động cam kết làm việc tối thiểu 03 năm và không được đơn phương nghỉ việc. Nếu nghỉ việc trước hạn phải bồi thường 06 tháng tiền lương. Mọi tranh chấp phát sinh sẽ được giải quyết duy nhất tại Tòa án nơi Công ty đặt trụ sở.",
        page_number: 3,
        bounding_boxes: [{ page: 3, x0: 0.1, y0: 0.42, x1: 0.9, y1: 0.56 }]
      }
    ],
    risks: [
      {
        id: "risk_clause_1_diploma",
        clause_id: "clause_1",
        clause_number: "Điều 1",
        risk_level: "CRITICAL",
        risk_title: "Hành vi giữ bản chính bằng đại học gốc bị nghiêm cấm theo Điều 17.1 BLLD 2019",
        risk_category="Điều cấm của Luật Lao động",
        description="Điều 17.1 Bộ luật Lao động 2019 nghiêm cấm NSDLĐ giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ của người lao động. Hành vi này có thể bị phạt tiền từ 20.000.000 đến 25.000.000 đồng theo Nghị định 12/2022/NĐ-CP.",
        legal_basis: "Điều 17.1, Bộ luật Lao động 2019",
        original_text: "Người lao động phải nộp bản gốc bằng tốt nghiệp đại học và giấy tờ tùy thân gốc để Công ty lưu giữ trong suốt thời hạn hợp đồng.",
        suggested_text: "Người lao động chỉ có nghĩa vụ xuất trình bản chính văn bằng, chứng chỉ và giấy tờ tùy thân để Người sử dụng lao động đối chiếu, kiểm tra tính xác thực và nộp 01 bản sao có chứng thực để lưu hồ sơ nhân sự. Công ty không giữ bất kỳ bản chính giấy tờ tùy thân nào của Người lao động.",
        rationale="Loại bỏ việc giữ bằng gốc trái luật, chuyển sang đối chiếu và lưu bản sao có chứng thực theo đúng quy định.",
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.35 }]
      },
      {
        id: "risk_clause_2_deposit",
        clause_id: "clause_2",
        clause_number: "Điều 2",
        risk_level: "CRITICAL",
        risk_title: "Yêu cầu đặt cọc ký quỹ 20.000.000 VNĐ là hành vi vi phạm điều cấm (Điều 17.2 BLLD 2019)",
        risk_category="Điều cấm của Luật Lao động",
        description="Bắt người lao động đặt cọc tiền hoặc giữ lương làm tin vi phạm nghiêm trọng Điều 17.2 BLLD 2019. Thỏa thuận này bị vô hiệu toàn phần và doanh nghiệp bị xử phạt hành chính từ 20.000.000 đến 25.000.000 đồng, đồng thời bị buộc hoàn trả toàn bộ số tiền cọc kèm lãi suất.",
        legal_basis: "Điều 17.2, Bộ luật Lao động 2019",
        original_text: "Để bảo đảm việc thực hiện hợp đồng và không tự ý bỏ việc, Người lao động phải nộp tiền đặt cọc ký quỹ là 20.000.000 VNĐ vào tài khoản Công ty ngay trong ngày đầu nhận việc.",
        suggested_text: "Xóa bỏ hoàn toàn điều khoản yêu cầu ký quỹ/đặt cọc tiền. Thay bằng: 'Người lao động cam kết thực hiện đúng trách nhiệm chuyên môn và tuân thủ Nội quy lao động của Công ty trong suốt quá trình làm việc.'",
        rationale="Hủy bỏ yêu cầu đặt cọc tiền trái luật để tránh rủi ro thanh tra lao động và bảo vệ người lao động.",
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.38, x1: 0.9, y1: 0.52 }]
      },
      {
        id: "risk_clause_2_probation",
        clause_id: "clause_2",
        clause_number: "Điều 2",
        risk_level: "HIGH",
        risk_title: "Thời gian thử việc 04 tháng vượt mức trần tối đa 60 ngày (Điều 25 BLLD 2019)",
        risk_category="Thử việc & Tiền lương",
        description="Theo Điều 25 BLLD 2019, thời gian thử việc tối đa cho vị trí kỹ sư/chuyên môn kỹ thuật có trình độ đại học chỉ là 60 ngày (chỉ có người quản lý doanh nghiệp mới được thử việc đến 180 ngày). Thử việc 04 tháng (120 ngày) là vi phạm luật.",
        legal_basis: "Điều 25, Bộ luật Lao động 2019",
        original_text: "Thời gian thử việc là 04 tháng (120 ngày).",
        suggested_text: "Thời gian thử việc của Người lao động là 60 (sáu mươi) ngày kể từ ngày bắt đầu nhận việc. Trong thời gian thử việc, tiền lương thử việc bằng 85% mức lương chính thức theo đúng quy định tại Điều 26 Bộ luật Lao động 2019.",
        rationale="Rút ngắn thời gian thử việc về đúng mức trần 60 ngày và ghi rõ mức lương thử việc tối thiểu 85%.",
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.38, x1: 0.9, y1: 0.52 }]
      },
      {
        id: "risk_clause_3_insurance",
        clause_id: "clause_3",
        clause_number: "Điều 3",
        risk_level: "CRITICAL",
        risk_title="Thỏa thuận không tham gia BHXH bắt buộc là vô hiệu (Điều 168 BLLD 2019 & Luật BHXH)",
        risk_category="Bảo hiểm Xã hội bắt buộc",
        description="Tham gia BHXH, BHYT, BHTN là nghĩa vụ luật định bắt buộc đối với hợp đồng lao động từ đủ 01 tháng trở lên. Việc thỏa thuận 'tự đóng' hoặc 'chi trả tiền mặt' để trốn đóng BHXH là vô hiệu, doanh nghiệp sẽ bị truy thu, tính lãi chậm đóng và phạt hành chính nặng.",
        legal_basis: "Điều 168, Bộ luật Lao động 2019 & Điều 2, 17 Luật BHXH 2014",
        original_text: "Hai bên thỏa thuận Công ty không tham gia BHXH, BHYT, BHTN bắt buộc cho Người lao động mà sẽ cộng thêm 500.000 VNĐ/tháng vào lương để Người lao động tự lo.",
        suggested_text: "Người sử dụng lao động và Người lao động có nghĩa vụ cùng tham gia đóng đầy đủ Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp bắt buộc theo đúng tỷ lệ trích nộp và mức lương căn cứ đóng do pháp luật bảo hiểm xã hội quy định.",
        rationale="Tuân thủ bắt buộc chế độ bảo hiểm xã hội để bảo đảm đầy đủ chế độ ốm đau, thai sản, tai nạn lao động và hưu trí.",
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.20, x1: 0.9, y1: 0.36 }]
      },
      {
        id: "risk_clause_4_punishment",
        clause_id: "clause_4",
        clause_number: "Điều 4",
        risk_level: "CRITICAL",
        risk_title="Phạt tiền 500.000 VNĐ và trừ tiền lương vi phạm nghiêm trọng Điều 127 BLLD 2019",
        risk_category="Kỷ luật Lao động",
        description="Điều 127 BLLD 2019 nghiêm cấm tuyệt đối hành vi phạt tiền, cắt lương thay cho việc xử lý kỷ luật lao động. Doanh nghiệp phạt tiền người lao động sẽ bị xử phạt từ 20.000.000 đến 40.000.000 đồng theo Nghị định 12/2022/NĐ-CP.",
        legal_basis: "Điều 127, Bộ luật Lao động 2019",
        original_text: "Nếu Người lao động đi làm trễ quá 15 phút hoặc không hoàn thành KPI tuần, Công ty sẽ áp dụng chế tài phạt tiền 500.000 VNĐ cho mỗi lần vi phạm và trừ trực tiếp vào tiền lương.",
        suggested_text: "Trường hợp Người lao động vi phạm thời giờ làm việc hoặc nội quy, Người sử dụng lao động sẽ nhắc nhở và xem xét xử lý kỷ luật theo đúng trình tự luật định (Khiển trách, Kéo dài thời hạn nâng lương, Cách chức hoặc Sa thải theo Điều 124 BLLD 2019). Không áp dụng bất kỳ hình thức phạt tiền hay khấu trừ lương nào.",
        rationale="Xóa bỏ chế tài phạt tiền trái luật, chuyển sang áp dụng đúng các hình thức kỷ luật lao động hợp pháp.",
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.40, x1: 0.9, y1: 0.54 }]
      },
      {
        id: "risk_clause_5_nca",
        clause_id: "clause_5",
        clause_number: "Điều 5",
        risk_level: "HIGH",
        risk_title="Thỏa thuận Không Cạnh tranh (NCA) 03 năm không đền bù, vi phạm quyền tự do việc làm",
        risk_category="Thỏa thuận Không Cạnh Tranh & NDA",
        description="Cấm người lao động làm việc trong toàn bộ ngành CNTT trong 03 năm mà không có khoản trợ cấp tài chính bù đắp vi phạm quyền tự do làm việc của công dân theo Hiến pháp 2013 và Điều 5 BLLD 2019.",
        legal_basis: "Điều 21.2 Bộ luật Lao động 2019 & Điều 35 Hiến pháp 2013",
        original_text: "Sau khi chấm dứt hợp đồng lao động vì bất kỳ lý do gì, Người lao động cam kết cấm làm việc cho bất kỳ công ty nào trong ngành công nghệ thông tin hoặc đối thủ cạnh tranh trong thời hạn 03 năm kể từ ngày nghỉ việc.",
        suggested_text: "Người lao động cam kết trong vòng 12 (mười hai) tháng kể từ ngày chấm dứt HĐLĐ không làm việc cho các đối thủ cạnh tranh trực tiếp có cùng dải sản phẩm AI với Công ty. Trong thời gian 12 tháng này, Công ty có trách nhiệm chi trả cho Người lao động khoản trợ cấp không cạnh tranh hàng tháng bằng 50% mức lương bình quân 06 tháng gần nhất.",
        rationale="Giới hạn thời gian cấm cạnh tranh xuống 12 tháng và bổ sung khoản bù đắp tài chính hợp lệ cho người lao động.",
        bounding_boxes: [{ page: 3, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.38 }]
      }
    ],
    graph_data: {
      nodes: [
        { id: "sample_labor_contract", label: "HĐ Lao Động & Làm Việc", type: "Contract" },
        { id: "node_clause_1", label: "Điều 1: Giữ bằng đại học gốc", type: "Clause" },
        { id: "node_clause_2", label: "Điều 2: Đặt cọc 20 triệu & Thử việc 4 tháng", type: "Clause" },
        { id: "node_clause_3", label: "Điều 3: Miễn đóng BHXH", type: "Clause" },
        { id: "node_clause_4", label: "Điều 4: Phạt tiền 500k trừ lương", type: "Clause" },
        { id: "node_clause_5", label: "Điều 5: Cấm cạnh tranh 3 năm", type: "Clause" },
        { id: "node_clause_6", label: "Điều 6: Cấm nghỉ việc", type: "Clause" },
        { id: "node_risk_diploma", label: "[CRITICAL] Giữ bằng gốc Điều 17.1", type: "Risk" },
        { id: "node_risk_deposit", label: "[CRITICAL] Ký quỹ 20tr Điều 17.2", type: "Risk" },
        { id: "node_risk_insurance", label: "[CRITICAL] Trốn BHXH Điều 168", type: "Risk" },
        { id: "node_risk_salary_cut", label: "[CRITICAL] Phạt tiền cắt lương Điều 127", type: "Risk" },
        { id: "node_risk_probation", label: "[HIGH] Thử việc 4 tháng Điều 25", type: "Risk" },
        { id: "node_risk_nca", label: "[HIGH] NCA 3 năm không đền bù", type: "Risk" },
        { id: "law_BLLD_17_1", label: "Điều 17.1 BLLD 2019 (Cấm giữ giấy tờ gốc)", type: "Law" },
        { id: "law_BLLD_17_2", label: "Điều 17.2 BLLD 2019 (Cấm bắt đặt cọc)", type: "Law" },
        { id: "law_BLLD_25", label: "Điều 25 BLLD 2019 (Trần thử việc 60 ngày)", type: "Law" },
        { id: "law_BLLD_127", label: "Điều 127 BLLD 2019 (Cấm phạt tiền, trừ lương)", type: "Law" },
        { id: "law_BLLD_168", label: "Điều 168 BLLD 2019 & Luật BHXH 2014 (Bắt buộc đóng BHXH)", type: "Law" },
        { id: "law_BLLD_21", label: "Điều 21.2 BLLD 2019 & Hiến pháp 2013 (Quyền tự do việc làm)", type: "Law" }
      ],
      edges: [
        { source: "sample_labor_contract", target: "node_clause_1", relation: "HAS_CLAUSE" },
        { source: "sample_labor_contract", target: "node_clause_2", relation: "HAS_CLAUSE" },
        { source: "sample_labor_contract", target: "node_clause_3", relation: "HAS_CLAUSE" },
        { source: "sample_labor_contract", target: "node_clause_4", relation: "HAS_CLAUSE" },
        { source: "sample_labor_contract", target: "node_clause_5", relation: "HAS_CLAUSE" },
        { source: "sample_labor_contract", target: "node_clause_6", relation: "HAS_CLAUSE" },
        { source: "node_clause_1", target: "node_risk_diploma", relation: "EXHIBITS_RISK" },
        { source: "node_clause_2", target: "node_risk_deposit", relation: "EXHIBITS_RISK" },
        { source: "node_clause_2", target: "node_risk_probation", relation: "EXHIBITS_RISK" },
        { source: "node_clause_3", target: "node_risk_insurance", relation: "EXHIBITS_RISK" },
        { source: "node_clause_4", target: "node_risk_salary_cut", relation: "EXHIBITS_RISK" },
        { source: "node_clause_5", target: "node_risk_nca", relation: "EXHIBITS_RISK" },
        { source: "node_risk_diploma", target: "law_BLLD_17_1", relation: "VIOLATES_PROHIBITION" },
        { source: "node_risk_deposit", target: "law_BLLD_17_2", relation: "VIOLATES_PROHIBITION" },
        { source: "node_risk_probation", target: "law_BLLD_25", relation: "EXCEEDS_STATUTE" },
        { source: "node_risk_salary_cut", target: "law_BLLD_127", relation: "VIOLATES_PROHIBITION" },
        { source: "node_risk_insurance", target: "law_BLLD_168", relation: "VIOLATES_MANDATORY_DUTY" },
        { source: "node_risk_nca", target: "law_BLLD_21", relation: "CONFLICTS_WITH" }
      ]
    }
  },
  sample_it_service: {
    contract_id: "sample_it_service",
    contract_title: "Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI",
    contract_type: "Hợp đồng Dịch vụ CNTT",
    overall_score: 35,
    summary: "Báo cáo rà soát hợp đồng 'Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI' (Tổng số: 6 điều khoản). Điểm an toàn: 35/100. Phát hiện 2 rủi ro nghiêm trọng (Critical), 3 rủi ro cao (High), và 1 điểm cần lưu ý (Medium). CẢNH BÁO: Hợp đồng chứa các điều khoản phạt vi phạm 15% vượt quá mức trần 8% theo Luật Thương mại 2005, lãi suất chậm trả 0.1%/ngày vượt trần 20%/năm theo Điều 468 BLDS 2015, chiếm đoạt quyền sở hữu trí tuệ trước khi thanh toán và thiếu cam kết bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.",
    total_clauses: 6,
    critical_count: 2,
    high_count: 3,
    medium_count: 1,
    low_count: 0,
    clauses: [
      {
        id: "clause_1",
        clause_number: "Điều 1",
        title: "Phạm vi Công việc & Tiến độ Triển khai",
        content: "Bên B (Nhà phát triển) nhận cung cấp dịch vụ xây dựng phần mềm phân tích văn bản AI và tích hợp API cho Bên A (Khách hàng) theo đúng các mốc tiến độ quy định tại Phụ lục A. Hai bên có xử lý dữ liệu khách hàng và cơ sở dữ liệu người dùng.",
        page_number: 1,
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.22, x1: 0.9, y1: 0.34 }]
      },
      {
        id: "clause_2",
        clause_number: "Điều 2",
        title: "Thanh toán & Lãi phạt Chậm trả",
        content: "Bên A thanh toán cho Bên B thành 3 đợt. Nếu Bên A hoặc Bên B chậm thanh toán bất kỳ đợt nào, bên vi phạm phải chịu lãi suất phạt chậm trả cố định là 0.1% mỗi ngày (tương đương 36.5%/năm) trên số tiền chậm thanh toán.",
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
        title: "Thời hạn Khiếu nại & Giải quyết Tranh chấp",
        content: "Bên A có quyền khiếu nại trong vòng 48 giờ sau khi nghiệm thu, quá thời hạn trên Bên B không còn quyền phản hồi. Mọi tranh chấp phát sinh sẽ được giải quyết duy nhất tại Tòa án nhân dân nơi Bên A đặt trụ sở.",
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
        risk_title: "Phạt vi phạm 15% vượt quá mức trần 8% theo Điều 301 Luật Thương mại 2005",
        risk_category: "Phạt vi phạm",
        description: "Điều khoản quy định mức phạt vi phạm là 15% tổng giá trị hợp đồng cho mỗi tuần chậm trễ, vượt quá mức trần 8% theo quy định bắt buộc tại Điều 301 Luật Thương mại 2005.",
        legal_basis: "Điều 301, Luật Thương mại 2005",
        original_text: "Nếu Bên B chậm tiến độ bàn giao quá 7 ngày, Bên B phải chịu mức phạt vi phạm là 15% tổng giá trị hợp đồng.",
        suggested_text: "Nếu Bên B chậm tiến độ bàn giao quá 7 ngày, Bên B phải chịu phạt 0.5% giá trị phần nghĩa vụ chậm trễ cho mỗi tuần, nhưng tổng mức phạt không vượt quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm theo Điều 301 Luật Thương mại 2005.",
        rationale: "Khống chế trần phạt 8% theo luật định.",
        bounding_boxes: [{ page: 2, x0: 0.1, y0: 0.20, x1: 0.9, y1: 0.35 }]
      },
      {
        id: "risk_clause_2_interest",
        clause_id: "clause_2",
        clause_number: "Điều 2",
        risk_level: "CRITICAL",
        risk_title: "Lãi phạt chậm trả 0.1%/ngày (36.5%/năm) vượt trần 20%/năm theo Điều 468 BLDS 2015",
        risk_category: "Lãi suất & Chậm thanh toán",
        description: "Lãi phạt chậm trả 0.1%/ngày tương đương 36.5%/năm vượt quá trần lãi suất 20%/năm quy định tại Điều 468 Bộ luật Dân sự 2015.",
        legal_basis: "Điều 468, Bộ luật Dân sự 2015",
        original_text: "chịu lãi suất phạt chậm trả cố định là 0.1% mỗi ngày (tương đương 36.5%/năm).",
        suggested_text: "Lãi suất chậm thanh toán được tính theo lãi suất nợ quá hạn bình quân nhưng trong mọi trường hợp không vượt quá mức trần 20%/năm theo Điều 468 Bộ luật Dân sự 2015.",
        rationale: "Tuân thủ trần lãi suất 20%/năm.",
        bounding_boxes: [{ page: 1, x0: 0.1, y0: 0.38, x1: 0.9, y1: 0.50 }]
      }
    ]
  }
};

export const SAMPLE_COMPARISON = {
  title_v1: "HĐ Lao Động V1 (Dự thảo đối tác gửi - Chứa nhiều bẫy)",
  title_v2: "HĐ Lao Động V2 (Bản sau khi đàm phán pháp lý thành công)",
  score_v1: 22,
  score_v2: 88,
  score_delta: 66,
  summary: "KẾT QUẢ ĐÀM PHÁN XUẤT SẮC: Bản V2 an toàn hơn vượt bậc (+66 điểm). Điểm an toàn tăng từ 22/100 lên 88/100. Đã loại bỏ thành công 4 hành vi vi phạm điều cấm của Bộ luật Lao động 2019 (Giữ bằng gốc, Đặt cọc tiền, Phạt tiền cắt lương, Trốn đóng BHXH).",
  resolved_risks_count: 5,
  diff_items: [
    {
      clause_number: "Điều 1",
      title: "Hồ sơ nhân sự & Bằng cấp",
      status: "MODIFIED" as const,
      text_v1: "Người lao động phải nộp bản gốc bằng tốt nghiệp đại học và giấy tờ tùy thân gốc để Công ty lưu giữ trong suốt thời hạn hợp đồng.",
      text_v2: "Người lao động xuất trình bản chính văn bằng để Công ty đối chiếu và nộp 01 bản sao có chứng thực. Công ty không lưu giữ bất kỳ bản chính giấy tờ tùy thân nào của Người lao động theo Điều 17.1 BLLD 2019.",
      resolved_risk: "Đàm phán thành công: Loại bỏ hành vi giữ bằng đại học gốc trái luật (Điều 17.1 BLLD 2019)",
      legal_impact: "Bảo vệ tài sản và quyền nhân thân của người lao động; tránh cho doanh nghiệp bị phạt 20 - 25 triệu VNĐ."
    },
    {
      clause_number: "Điều 2",
      title: "Thời gian Thử việc & Tiền Ký quỹ",
      status: "MODIFIED" as const,
      text_v1: "Thời gian thử việc là 04 tháng (120 ngày). Người lao động phải nộp tiền đặt cọc ký quỹ là 20.000.000 VNĐ vào ngày đầu nhận việc.",
      text_v2: "Thời gian thử việc là 60 (sáu mươi) ngày theo đúng Điều 25 BLLD 2019. Lương thử việc bằng 85% mức lương chính thức. Hủy bỏ hoàn toàn yêu cầu đặt cọc tiền ký quỹ.",
      resolved_risk: "Đàm phán thành công: Xóa bỏ yêu cầu nộp cọc 20 triệu (Điều 17.2) và hạ thời gian thử việc về đúng mức trần 60 ngày (Điều 25)",
      legal_impact: "Xóa bỏ rủi ro bị xử phạt vi phạm hành chính và đòi lại 20 triệu tiền ký quỹ."
    },
    {
      clause_number: "Điều 3",
      title: "Chế độ Bảo hiểm Xã hội",
      status: "MODIFIED" as const,
      text_v1: "Công ty không tham gia BHXH bắt buộc cho Người lao động mà cộng thêm 500.000 VNĐ/tháng để Người lao động tự lo.",
      text_v2: "Công ty và Người lao động cùng đóng đầy đủ Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp bắt buộc theo đúng tỷ lệ trích nộp do Luật BHXH quy định.",
      resolved_risk: "Đàm phán thành công: Bắt buộc tham gia BHXH theo Điều 168 BLLD 2019",
      legal_impact: "Bảo đảm đầy đủ quyền lợi thai sản, ốm đau, tai nạn lao động và lương hưu cho người lao động."
    },
    {
      clause_number: "Điều 4",
      title: "Kỷ luật Lao động & Chế tài Phạt tiền",
      status: "MODIFIED" as const,
      text_v1: "Nếu đi làm trễ quá 15 phút hoặc không đạt KPI tuần, Công ty sẽ phạt tiền 500.000 VNĐ trừ trực tiếp vào lương.",
      text_v2: "Mọi hành vi vi phạm kỷ luật được xử lý theo đúng 4 hình thức luật định (Khiển trách, Kéo dài nâng lương, Cách chức, Sa thải theo Điều 124 BLLD 2019). Không áp dụng chế tài phạt tiền hoặc cắt lương.",
      resolved_risk: "Đàm phán thành công: Xóa bỏ chế tài phạt tiền và trừ lương (Điều 127 BLLD 2019)",
      legal_impact: "Bảo toàn thu nhập chính đáng của người lao động, loại bỏ hành vi bị pháp luật nghiêm cấm."
    },
    {
      clause_number: "Điều 5",
      title: "Cam kết Không Cạnh tranh (NCA)",
      status: "MODIFIED" as const,
      text_v1: "Sau khi nghỉ việc, Người lao động cấm làm việc cho bất kỳ công ty nào trong ngành CNTT trong thời hạn 03 năm kể từ ngày nghỉ việc.",
      text_v2: "Người lao động cam kết trong vòng 12 tháng không làm việc cho các đối thủ cạnh tranh trực tiếp. Công ty chi trả khoản trợ cấp không cạnh tranh hàng tháng tương đương 50% mức lương bình quân theo quy định.",
      resolved_risk: "Đàm phán thành công: Giảm thời hạn cấm cạnh tranh xuống 12 tháng và bổ sung khoản bù đắp tài chính 50% lương",
      legal_impact: "Hài hòa lợi ích: Bảo vệ bí mật công nghệ cho công ty và đảm bảo sinh kế cho người lao động."
    }
  ]
};

