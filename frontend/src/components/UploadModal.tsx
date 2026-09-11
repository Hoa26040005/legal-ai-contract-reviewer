'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { uploadContractPdf } from '../lib/api';
import { ContractAnalysisReport } from '../types/contract';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (report: ContractAnalysisReport) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.name.toLowerCase().endsWith('.pdf')) {
        setFile(selected);
        setErrorMessage(null);
      } else {
        setErrorMessage('Vui lòng chỉ tải lên tệp định dạng .PDF');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.toLowerCase().endsWith('.pdf')) {
        setFile(selected);
        setErrorMessage(null);
      } else {
        setErrorMessage('Vui lòng chỉ tải lên tệp định dạng .PDF');
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const report = await uploadContractPdf(file);
      setIsUploading(false);
      onUploadSuccess(report);
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Lỗi khi gửi tệp lên máy chủ xử lý AI.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-legal-900 border border-legal-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-legal-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tải Lên Hợp Đồng Cần Rà Soát</h3>
              <p className="text-xs text-slate-400">Tự động OCR, Bẻ nhỏ điều khoản & Phân tích rủi ro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-legal-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Drag and drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              file
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-legal-700 hover:border-blue-500/60 bg-legal-950/40 hover:bg-legal-950/80'
            }`}
            onClick={() => document.getElementById('contract-file-input')?.click()}
          >
            <input
              id="contract-file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="w-10 h-10 text-blue-400 mb-2" />
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-200">
                  Kéo thả file PDF hợp đồng vào đây, hoặc <span className="text-blue-400 underline">chọn từ máy tính</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng PDF (Text và Scan OCR)</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-legal-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleStartAnalysis}
              disabled={!file || isUploading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý AI & OCR...</span>
                </>
              ) : (
                <span>Bắt Đầu Rà Soát Rủi Ro</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
