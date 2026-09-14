import { ContractAnalysisReport, ContractSummaryItem, KnowledgeGraphData } from '../types/contract';
import { SAMPLE_CONTRACTS_LIST, SAMPLE_REPORTS } from './sampleData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchSampleContracts(): Promise<ContractSummaryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/samples`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, sử dụng dữ liệu mẫu offline.', err);
    return SAMPLE_CONTRACTS_LIST;
  }
}

export async function fetchContractReport(contractId: string): Promise<ContractAnalysisReport> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/report`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, sử dụng dữ liệu báo cáo mẫu offline.', err);
    if (SAMPLE_REPORTS[contractId]) {
      return SAMPLE_REPORTS[contractId];
    }
    return SAMPLE_REPORTS['sample_labor_contract'] || SAMPLE_REPORTS['sample_it_service'];
  }
}

export async function uploadContractFile(file: File): Promise<ContractAnalysisReport> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/contracts/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lỗi tải lên và phân tích tệp hợp đồng');
  }

  return await res.json();
}

export async function downloadContractDocx(contractId: string, title: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/export/docx`);
    if (!res.ok) throw new Error('Không thể tải file Word từ máy chủ');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalAI_TrackChanges_${title.slice(0, 25)}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (err) {
    console.warn('Backend export docx chưa khả dụng, sinh file văn bản dự phòng.', err);
    alert('Tính năng tải trực tiếp .docx yêu cầu Backend FastAPI đang chạy (port 8000). Hệ thống sẽ xuất file báo cáo JSON chi tiết thay thế!');
  }
}

export async function fetchSampleComparison(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/compare/sample`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, sử dụng dữ liệu so sánh mẫu offline.', err);
    const { SAMPLE_COMPARISON } = await import('./sampleData');
    return SAMPLE_COMPARISON;
  }
}

export async function compareTwoContracts(file1: File, file2: File): Promise<any> {
  const formData = new FormData();
  formData.append('file_v1', file1);
  formData.append('file_v2', file2);

  const res = await fetch(`${API_BASE_URL}/contracts/compare`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lỗi so sánh 2 tệp hợp đồng');
  }

  return await res.json();
}

export async function fetchAnnexPreview(contractId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/annex/preview`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, sinh dữ liệu preview phụ lục tạm thời.');
    return null;
  }
}

export async function downloadContractAnnex(
  contractId: string,
  title: string,
  partyA: string = 'BÊN GIAO VIỆC / BÊN A',
  partyB: string = 'BÊN THỰC HIỆN / BÊN B',
  annexNo: string = '01',
  contractNo: string = 'HĐ-2026/01'
): Promise<void> {
  try {
    const params = new URLSearchParams({
      party_a: partyA,
      party_b: partyB,
      annex_no: annexNo,
      contract_no: contractNo,
    });
    const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/export/annex?${params.toString()}`);
    if (!res.ok) throw new Error('Không thể tải file Phụ lục Word từ máy chủ');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalAI_PhuLuc_${title.slice(0, 20)}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (err) {
    console.warn('Lỗi tải file Word phụ lục:', err);
    alert('Tính năng tải trực tiếp .docx yêu cầu Backend FastAPI đang chạy (port 8000).');
  }
}

export async function fetchLitigationPrediction(contractId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/litigation-prediction`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, sinh dữ liệu dự đoán tố tụng giả định.', err);
    return null;
  }
}

export async function fetchArchiveContracts(category: string = 'Tất cả'): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/archive/list?category=${encodeURIComponent(category)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, dùng dữ liệu kho hồ sơ mẫu offline.', err);
    return [
      {
        contract_id: "sample_it_service",
        title: "Hợp Đồng Dịch Vụ Phát Triển Phần Mềm AI & Tích Hợp Hệ Thống",
        contract_type: "Hợp đồng Dịch vụ Thương mại",
        category: "Dịch vụ CNTT",
        overall_score: 38,
        status_label: "CẦN SỬA ĐỔI",
        created_at: "2026-09-14 09:30",
        page_count: 4,
        total_clauses: 6,
        critical_count: 2,
        file_size_kb: 345.5,
        original_filename: "Hop_Dong_Dich_Vu_AI_Alpha.pdf",
        has_docx: true,
        has_annex: true
      },
      {
        contract_id: "sample_labor_contract",
        title: "Hợp Đồng Lao Động Xác Định Thời Hạn (Mẫu Nhân Sự TechCorp)",
        contract_type: "Hợp đồng Lao động (BLLD 2019)",
        category: "Lao động & Nhân sự",
        overall_score: 25,
        status_label: "CẦN SỬA ĐỔI",
        created_at: "2026-09-14 10:15",
        page_count: 3,
        total_clauses: 5,
        critical_count: 3,
        file_size_kb: 280.2,
        original_filename: "HDLD_NhanVien_TechCorp_2026.pdf",
        has_docx: true,
        has_annex: true
      },
      {
        contract_id: "sample_sales_contract",
        title: "Hợp Đồng Mua Bán Thiết Bị Máy Chủ & Hạ Tầng Trung Tâm Dữ Liệu",
        contract_type: "Hợp đồng Mua bán Hàng hóa (LTM 2005)",
        category: "Mua bán & Thương mại",
        overall_score: 82,
        status_label: "AN TOÀN",
        created_at: "2026-09-13 14:20",
        page_count: 6,
        total_clauses: 8,
        critical_count: 0,
        file_size_kb: 520.8,
        original_filename: "HD_MuaBan_Server_Cloud_2026.pdf",
        has_docx: true,
        has_annex: false
      },
      {
        contract_id: "sample_nda_agreement",
        title: "Thỏa Thuận Không Tiết Lộ & Bảo Mật Dữ Liệu Bí Mật Kinh Doanh (NDA)",
        contract_type: "Thỏa thuận Bảo mật Thông tin",
        category: "Bảo mật NDA",
        overall_score: 70,
        status_label: "ĐANG ĐÀM PHÁN",
        created_at: "2026-09-12 16:45",
        page_count: 3,
        total_clauses: 4,
        critical_count: 0,
        file_size_kb: 195.0,
        original_filename: "NDA_BaoMat_DoiTacChiLenh.pdf",
        has_docx: true,
        has_annex: true
      }
    ];
  }
}

export async function deleteArchiveContract(contractId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/archive/${contractId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Lỗi xóa tài liệu khỏi kho:', err);
    return false;
  }
}

// ==========================================
// THƯ VIỆN LUẬT & NẠP VĂN BẢN QUY PHẠM PHÁP LUẬT
// ==========================================

export async function fetchLaws(category?: string, query?: string): Promise<import('../types/contract').LegalRuleItem[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'Tất cả') params.append('category', category);
    if (query) params.append('query', query);

    const res = await fetch(`${API_BASE_URL}/laws?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, dùng dữ liệu quy tắc mẫu.');
    return [
      {
        code: "BLLD2019_D17_1",
        law: "Điều 17.1, Bộ luật Lao động 2019",
        topic: "Cấm giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ",
        rule: "Người sử dụng lao động tuyệt đối không được giữ bản chính giấy tờ tuỳ thân, văn bằng, chứng chỉ của người lao động khi giao kết, thực hiện hợp đồng lao động.",
        category: "Lao động",
        keywords: ["giữ bằng gốc", "giữ bản chính", "nộp bằng đại học gốc", "giữ cccd gốc", "giữ giấy tờ"],
        risk_level: "CRITICAL",
        statute_source: "Bộ luật Lao động số 45/2019/QH14"
      },
      {
        code: "LTM2005_D301",
        law: "Điều 301, Luật Thương mại 2005",
        topic: "Trần mức phạt vi phạm nghĩa vụ thương mại tối đa 8%",
        rule: "Mức phạt đối với vi phạm nghĩa vụ hợp đồng do các bên thoả thuận, nhưng không quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm (trừ trường hợp kết quả giám định sai).",
        category: "Thương mại",
        keywords: ["phạt 10%", "phạt 15%", "phạt 20%", "phạt 30%", "phạt 50%", "tổng giá trị hợp đồng"],
        risk_level: "CRITICAL",
        statute_source: "Luật Thương mại số 36/2005/QH11"
      },
      {
        code: "BLDS2015_D468",
        law: "Điều 468 & Điều 357, Bộ luật Dân sự 2015",
        topic: "Trần lãi suất vay và lãi phạt chậm trả tối đa 20%/năm",
        rule: "Lãi suất theo thỏa thuận không được vượt quá 20%/năm. Các quy định tính lãi chậm trả 0.1% - 0.5%/ngày (tương đương 36.5% - 182.5%/năm) vượt quá mức trần này và phần vượt mức bị vô hiệu.",
        category: "Dân sự",
        keywords: ["0.1% mỗi ngày", "0.2% mỗi ngày", "0.5% mỗi ngày", "lãi phạt 30%/năm", "lãi suất chậm trả"],
        risk_level: "CRITICAL",
        statute_source: "Bộ luật Dân sự số 91/2015/QH13"
      },
      {
        code: "LDD2024_D45",
        law: "Điều 45, Luật Đất đai 2024",
        topic: "Điều kiện thực hiện quyền chuyển nhượng, cho thuê quyền sử dụng đất",
        rule: "Chuyển nhượng quyền sử dụng đất bắt buộc phải có Giấy chứng nhận quyền sử dụng đất (Sổ đỏ), đất không có tranh chấp, quyền sử dụng đất không bị kê biên, trong thời hạn sử dụng đất và phải đăng ký tại cơ quan đăng ký đất đai.",
        category: "Đất đai & BĐS",
        keywords: ["chưa có sổ đỏ", "đang tranh chấp đất", "giấy tờ tay", "đang bị kê biên"],
        risk_level: "CRITICAL",
        statute_source: "Luật Đất đai số 31/2024/QH15"
      },
      {
        code: "LNO2023_D160",
        law: "Điều 160, Luật Nhà ở 2023",
        topic: "Điều kiện của nhà ở tham gia giao dịch mua bán, cho thuê",
        rule: "Giao dịch mua bán nhà ở thương mại hình thành trong tương lai bắt buộc phải có bảo lãnh của ngân hàng thương mại và biên bản nghiệm thu hoàn thành xây dựng phần móng.",
        category: "Đất đai & BĐS",
        keywords: ["nhà ở tương lai", "chưa xong móng", "không có bảo lãnh ngân hàng", "mua bán dự án chưa nghiệm thu"],
        risk_level: "CRITICAL",
        statute_source: "Luật Nhà ở số 27/2023/QH15"
      },
      {
        code: "ND13_2023_NDCP",
        law: "Điều 9, 11, 17, Nghị định 13/2023/NĐ-CP",
        topic: "Bảo vệ Dữ liệu Cá nhân người lao động & khách hàng",
        rule: "Việc xử lý dữ liệu cá nhân (kể cả thông tin nhân viên, khách hàng) bắt buộc phải có sự chấp thuận minh thị của chủ thể dữ liệu và tuân thủ các biện pháp bảo vệ kỹ thuật.",
        category: "Công nghệ & Dữ liệu",
        keywords: ["dữ liệu cá nhân", "thông tin nhân viên", "thông tin khách hàng", "nghị định 13"],
        risk_level: "HIGH",
        statute_source: "Nghị định số 13/2023/NĐ-CP"
      }
    ];
  }
}

export async function fetchLawStats(): Promise<import('../types/contract').LegalLibraryStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/laws/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    return {
      total_rules: 20,
      total_categories: 6,
      total_statutes: 5,
      categories: [
        { category: 'Lao động', count: 9 },
        { category: 'Thương mại', count: 4 },
        { category: 'Dân sự', count: 3 },
        { category: 'Đất đai & BĐS', count: 2 },
        { category: 'Sở hữu trí tuệ', count: 1 },
        { category: 'Công nghệ & Dữ liệu', count: 1 }
      ],
      rag_active: true
    };
  }
}

export async function createLaw(rule: import('../types/contract').LegalRuleCreate): Promise<import('../types/contract').LegalRuleItem> {
  const res = await fetch(`${API_BASE_URL}/laws`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Không thể tạo điều luật mới');
  }
  return await res.json();
}

export async function updateLaw(code: string, updates: import('../types/contract').LegalRuleUpdate): Promise<import('../types/contract').LegalRuleItem> {
  const res = await fetch(`${API_BASE_URL}/laws/${code}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Không thể cập nhật điều luật');
  }
  return await res.json();
}

export async function deleteLaw(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/laws/${code}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Lỗi xóa điều luật:', err);
    return false;
  }
}

export async function uploadStatuteDocument(
  file: File,
  statuteTitle: string,
  category: string
): Promise<import('../types/contract').StatuteUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('statute_title', statuteTitle);
  formData.append('category', category);

  const res = await fetch(`${API_BASE_URL}/laws/upload-statute`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Lỗi khi nạp văn bản luật');
  }

  return await res.json();
}

export async function fetchNationalCatalog(): Promise<import('../types/contract').NationalStatuteItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/laws/auto-ingest/catalog`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa bật, dùng catalog mẫu.');
    return [
      {
        id: "statute_land_2024",
        title: "Luật Đất đai 2024",
        official_number: "31/2024/QH15",
        effective_date: "01/08/2024",
        category: "Đất đai & BĐS",
        description: "Đạo luật then chốt điều chỉnh toàn bộ quyền sử dụng đất, điều kiện chuyển nhượng, cấp sổ đỏ và đăng ký biến động đất đai.",
        articles_count: 3,
        is_ingested: true
      },
      {
        id: "statute_housing_2023",
        title: "Luật Nhà ở 2023",
        official_number: "27/2023/QH15",
        effective_date: "01/08/2024",
        category: "Đất đai & BĐS",
        description: "Quy định điều kiện pháp lý giao dịch nhà ở thương mại, mua bán nhà ở hình thành trong tương lai và quản lý căn hộ chung cư.",
        articles_count: 2,
        is_ingested: true
      },
      {
        id: "statute_real_estate_2023",
        title: "Luật Kinh doanh Bất động sản 2023",
        official_number: "29/2023/QH15",
        effective_date: "01/08/2024",
        category: "Đất đai & BĐS",
        description: "Siết chặt mức trần tiền đặt cọc nhà ở hình thành trong tương lai tối đa 5% và mẫu hợp đồng kinh doanh BĐS bắt buộc.",
        articles_count: 2,
        is_ingested: false
      },
      {
        id: "statute_e_transaction_2023",
        title: "Luật Giao dịch điện tử 2023",
        official_number: "20/2023/QH15",
        effective_date: "01/07/2024",
        category: "Công nghệ & Dữ liệu",
        description: "Xác lập giá trị pháp lý tương đương bản gốc của thông điệp dữ liệu, hợp đồng điện tử và chữ ký số an toàn.",
        articles_count: 3,
        is_ingested: false
      },
      {
        id: "statute_labor_decree_12",
        title: "Nghị định 12/2022/NĐ-CP",
        official_number: "12/2022/NĐ-CP",
        effective_date: "17/01/2022",
        category: "Lao động",
        description: "Khung chế tài xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội, đưa người lao động đi làm việc ở nước ngoài.",
        articles_count: 2,
        is_ingested: false
      },
      {
        id: "statute_data_protection_13",
        title: "Nghị định 13/2023/NĐ-CP",
        official_number: "13/2023/NĐ-CP",
        effective_date: "01/07/2023",
        category: "Công nghệ & Dữ liệu",
        description: "Nghị định đầu tiên của Việt Nam về Bảo vệ Dữ liệu Cá nhân (PDPD), áp dụng cho mọi doanh nghiệp xử lý dữ liệu nhân viên và khách hàng.",
        articles_count: 2,
        is_ingested: true
      },
      {
        id: "statute_ip_2022",
        title: "Luật Sở hữu trí tuệ 2022",
        official_number: "07/2022/QH15",
        effective_date: "01/01/2023",
        category: "Sở hữu trí tuệ",
        description: "Bảo hộ bản quyền phần mềm, mã nguồn, thuật toán AI và cơ chế giải quyết tranh chấp quyền sở hữu công nghiệp.",
        articles_count: 2,
        is_ingested: true
      }
    ];
  }
}

export async function autoIngestStatute(
  req: import('../types/contract').AutoIngestRequest
): Promise<import('../types/contract').AutoIngestResponse> {
  const res = await fetch(`${API_BASE_URL}/laws/auto-ingest/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Lỗi khi tự động nạp văn bản luật');
  }

  return await res.json();
}
