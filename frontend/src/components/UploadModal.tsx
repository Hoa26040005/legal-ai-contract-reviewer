'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, Loader2, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { uploadContractFile } from '../lib/api';
import { ContractAnalysisReport } from '../types/contract';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (report: ContractAnalysisReport) => void;
}

const ACCEPTED_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateFile = (selected: File) => {
    const isSupported = ACCEPTED_TYPES.some((ext) => selected.name.toLowerCase().endsWith(ext));
    if (isSupported) {
      setFile(selected);
      setErrorMessage(null);
    } else {
      setErrorMessage('Hệ thống hỗ trợ tệp PDF hoặc ảnh chụp hợp đồng (.jpg, .jpeg, .png, .webp).');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const report = await uploadContractFile(file);
      setIsUploading(false);
      onUploadSuccess(report);
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Lỗi khi gửi tệp lên máy chủ xử lý AI.');
    }
  };

  const isImageFile = file && !file.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0f1d] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tải Lên Hợp Đồng Cần Rà Soát</h3>
              <p className="text-xs text-slate-400">Hỗ trợ file PDF và Ảnh Chụp Điện Thoại / Bản Scan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              file
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/15 hover:border-cyan-500/60 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
            onClick={() => document.getElementById('contract-file-input')?.click()}
          >
            <input
              id="contract-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {file ? (
              <div className="flex flex-col items-center">
                {isImageFile ? (
                  <ImageIcon className="w-12 h-12 text-cyan-400 mb-2" />
                ) : (
                  <FileText className="w-12 h-12 text-cyan-400 mb-2" />
                )}
                <p className="text-sm font-bold text-white">{file.name}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span className="text-cyan-300 font-semibold font-mono">
                    {isImageFile ? 'OCR Ảnh Chụp (Tự động khử mờ)' : 'Văn Bản PDF'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Kéo thả file PDF hoặc <span className="text-cyan-400 underline">ảnh chụp từ điện thoại</span> vào đây
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  Định dạng hỗ trợ: PDF, JPG, JPEG, PNG, WEBP (Tự động deskew & tăng tương phản)
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleStartAnalysis}
              disabled={!file || isUploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý OCR & Thẩm định Luật...</span>
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
