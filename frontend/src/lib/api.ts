import { ContractAnalysisReport, ContractSummaryItem, KnowledgeGraphData } from '../types/contract';
import { SAMPLE_CONTRACTS_LIST, SAMPLE_REPORTS } from './sampleData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchSampleContracts(): Promise<ContractSummaryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/samples`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa sẵn sàng, sử dụng dữ liệu mẫu offline.', err);
    return SAMPLE_CONTRACTS_LIST;
  }
}

export async function fetchContractReport(contractId: string): Promise<ContractAnalysisReport> {
  try {
    const res = await fetch(`${API_BASE_URL}/contracts/${contractId}/report`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa sẵn sàng, sử dụng dữ liệu báo cáo mẫu offline.', err);
    if (SAMPLE_REPORTS[contractId]) {
      return SAMPLE_REPORTS[contractId];
    }
    return SAMPLE_REPORTS['sample_it_service'];
  }
}

export async function uploadContractPdf(file: File): Promise<ContractAnalysisReport> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/contracts/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lỗi tải lên và phân tích tệp PDF');
  }

  return await res.json();
}
