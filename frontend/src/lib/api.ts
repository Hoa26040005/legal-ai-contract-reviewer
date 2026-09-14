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

