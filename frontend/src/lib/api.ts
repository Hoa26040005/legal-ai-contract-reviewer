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




