'use client';

import React, { useState, useMemo } from 'react';
import {
  X, FileSignature, Download, Sparkles, Scale, CheckCircle2,
  Trash2, PlusCircle, RefreshCw, Printer, ShieldAlert, Building2, UserCheck
} from 'lucide-react';
import { ContractAnalysisReport } from '../types/contract';
import { downloadContractAnnex } from '../lib/api';

interface ContractAnnexModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ContractAnalysisReport;
}

export const ContractAnnexModal: React.FC<ContractAnnexModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  // Configurable fields
  const [annexNo, setAnnexNo] = useState<string>('01/2026');
  const [contractNo, setContractNo] = useState<string>('HĐ-2026/08');
  const [partyAName, setPartyAName] = useState<string>('CÔNG TY CỔ PHẦN CÔNG NGHỆ ALPHA');
  const [partyBName, setPartyBName] = useState<string>('BÊN ĐỐI TÁC / NGƯỜI LAO ĐỘNG');
  const [signingDate, setSigningDate] = useState<string>('ngày 14 tháng 09 năm 2026');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Group risks into modified, revoked, and added
  const annexSections = useMemo(() => {
    const modified: any[] = [];
    const revoked: any[] = [];
    const added: any[] = [];

    report.risks.forEach((risk) => {
      const titleLower = risk.risk_title.toLowerCase();
      // Revoked if prohibited clause (diploma, deposit, arbitrary fine)
      if (
        titleLower.includes('giữ văn bằng') ||
        titleLower.includes('giữ bằng') ||
        titleLower.includes('đặt cọc') ||
        titleLower.includes('phạt tiền thay')
      ) {
        revoked.push({
          clauseNumber: risk.clause_number,
          title: risk.risk_title,
          originalText: risk.original_text,
          reason: `Bãi bỏ do vi phạm quy định pháp luật tại ${risk.legal_basis || 'Bộ luật Lao động'}.`,
        });
      } else {
        modified.push({
          clauseNumber: risk.clause_number,
          title: risk.risk_title,
          originalText: risk.original_text,
          suggestedText: risk.suggested_text,
          legalBasis: risk.legal_basis || 'Bộ luật Dân sự 2015',
        });
      }
    });

    // Default added clauses
    if (report.contract_type.toLowerCase().includes('lao động')) {
      added.push({
        title: 'Cam Kết Bảo Vệ Dữ Liệu Cá Nhân Người Lao Động',
        content:
          'Người sử dụng lao động cam kết xử lý và lưu trữ dữ liệu cá nhân của Người lao động tuân thủ nghiêm ngặt quy định tại Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.',
      });
    } else {
      added.push({
        title: 'Giới Hạn Trách Nhiệm Bồi Thường & Trần Phạt Hợp Đồng',
        content:
          'Mức phạt vi phạm hợp đồng tối đa không vượt quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm theo quy định tại Điều 301 Luật Thương mại 2005.',
      });
    }

    return { modified, revoked, added };
  }, [report]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadContractAnnex(
      report.contract_id,
      report.contract_title,
      partyAName,
      partyBName,
      annexNo,
      contractNo
    );
    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
              <FileSignature className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Tạo Phụ Lục Sửa Đổi, Bổ Sung Hợp Đồng (.docx)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">
                  Điều 403 BLDS 2015 & NĐ 30/2020/NĐ-CP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tự động tạo phụ lục pháp lý chuẩn để in ra ký tên đóng dấu ngay mà không cần làm lại hợp đồng gốc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tạo file Word...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải Phụ Lục (.docx)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Sidebar Form + Right Live Paper Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Form Settings Panel */}
          <div className="w-full lg:w-80 border-r border-white/10 p-5 bg-slate-900/40 overflow-y-auto space-y-5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Thông Tin Ký Kết Phụ Lục
              </h3>
              <p className="text-[11px] text-slate-400">
                Tùy chỉnh thông tin để tự động chèn vào văn bản Word
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Số Phụ Lục</label>
                <input
                  type="text"
                  value={annexNo}
                  onChange={(e) => setAnnexNo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Số Hợp Đồng Gốc</label>
                <input
                  type="text"
                  value={contractNo}
                  onChange={(e) => setContractNo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tên Bên A (Giao việc/Bên sử dụng)</label>
                <input
                  type="text"
                  value={partyAName}
                  onChange={(e) => setPartyAName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tên Bên B (Thực hiện/Người lao động)</label>
                <input
                  type="text"
                  value={partyBName}
                  onChange={(e) => setPartyBName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ngày Ký Phụ Lục</label>
                <input
                  type="text"
                  value={signingDate}
                  onChange={(e) => setSigningDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Quick Summary KPI */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs">
              <span className="font-bold text-emerald-300 block">Nội dung sửa đổi tự động:</span>
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span>Sửa đổi điều khoản:</span>
                <span className="font-mono font-bold text-amber-400">{annexSections.modified.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span>Bãi bỏ điều khoản trái luật:</span>
                <span className="font-mono font-bold text-rose-400">{annexSections.revoked.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span>Bổ sung điều khoản bảo vệ:</span>
                <span className="font-mono font-bold text-emerald-400">{annexSections.added.length}</span>
              </div>
            </div>
          </div>

          {/* Right Live A4 Paper Preview */}
          <div className="flex-1 bg-slate-950/60 p-6 overflow-y-auto flex justify-center">
            <div className="w-full max-w-3xl bg-[#0f172a] text-slate-200 border border-white/15 rounded-xl shadow-2xl p-8 sm:p-12 font-serif text-xs leading-relaxed select-text">
              {/* National Emblem Header */}
              <div className="text-center space-y-1 pb-4 border-b border-white/10">
                <p className="font-bold uppercase text-xs tracking-wider text-white">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="font-bold text-xs underline underline-offset-4 text-white">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest pt-1">
                  -----------------o0o-----------------
                </p>
              </div>

              {/* Annex Title */}
              <div className="text-center my-6 space-y-1">
                <h1 className="font-extrabold text-sm uppercase text-cyan-300 tracking-wide font-sans">
                  PHỤ LỤC HỢP ĐỒNG SỐ {annexNo}
                </h1>
                <p className="italic text-slate-300 text-[11px]">
                  (Về việc sửa đổi, bổ sung một số điều khoản của {report.contract_title})
                </p>
                <p className="text-slate-400 text-[11px] font-sans font-medium">
                  Kèm theo Hợp đồng số: <span className="font-mono text-white">{contractNo}</span>
                </p>
              </div>

              {/* Premises */}
              <div className="space-y-1 italic text-slate-400 text-[11px] mb-4">
                <p>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
                <p>- Căn cứ {report.contract_type};</p>
                <p>- Căn cứ Hợp đồng số {contractNo} đã ký kết giữa hai bên;</p>
                <p>- Căn cứ nhu cầu và sự thỏa thuận tự nguyện, thiện chí của hai bên.</p>
                <p className="pt-2 not-italic text-slate-300">
                  Hôm nay, <span className="font-semibold text-white">{signingDate}</span>, hai bên gồm có:
                </p>
              </div>

              {/* Party Information */}
              <div className="space-y-3 mb-6 p-3.5 rounded-lg bg-white/[0.02] border border-white/10 font-sans text-[11px]">
                <div>
                  <p className="font-bold text-white uppercase">BÊN A: {partyAName}</p>
                  <p className="text-slate-400">Địa chỉ: ............................................................................................</p>
                  <p className="text-slate-400">Đại diện: .................................................... Chức vụ: ........................</p>
                </div>
                <div>
                  <p className="font-bold text-white uppercase">BÊN B: {partyBName}</p>
                  <p className="text-slate-400">Địa chỉ: ............................................................................................</p>
                  <p className="text-slate-400">Đại diện: .................................................... Chức vụ: ........................</p>
                </div>
                <p className="italic text-slate-300 pt-1">
                  Hai bên thống nhất ký kết Phụ lục hợp đồng với các nội dung sau:
                </p>
              </div>

              {/* SUBSTANTIVE ARTICLES */}
              <div className="space-y-5">
                {/* Điều 1: Sửa đổi */}
                <div>
                  <h2 className="font-bold text-white uppercase tracking-wide text-xs mb-2 font-sans flex items-center gap-1.5 text-amber-300">
                    <RefreshCw className="w-3.5 h-3.5" />
                    ĐIỀU 1: SỬA ĐỔI, THAY THẾ CÁC ĐIỀU KHOẢN HỢP ĐỒNG
                  </h2>
                  <p className="text-slate-400 mb-2">
                    Hai bên thống nhất sửa đổi, thay thế các điều khoản sau của Hợp đồng gốc:
                  </p>
                  <div className="space-y-3 pl-3 border-l border-amber-500/30">
                    {annexSections.modified.map((m, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-bold text-slate-200">
                          1.{idx + 1}. Sửa đổi {m.clauseNumber} ({m.title}):
                        </p>
                        <p className="text-slate-400 italic line-through text-[11px]">
                          - Nội dung cũ: "{m.originalText}"
                        </p>
                        <p className="text-emerald-300 font-medium">
                          - Nội dung mới sửa đổi: "{m.suggestedText}"
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          (Căn cứ: {m.legalBasis})
                        </p>
                      </div>
                    ))}
                    {annexSections.modified.length === 0 && (
                      <p className="text-slate-500 italic">(Không có điều khoản sửa đổi)</p>
                    )}
                  </div>
                </div>

                {/* Điều 2: Bãi bỏ */}
                <div>
                  <h2 className="font-bold text-white uppercase tracking-wide text-xs mb-2 font-sans flex items-center gap-1.5 text-rose-300">
                    <Trash2 className="w-3.5 h-3.5" />
                    ĐIỀU 2: HỦY BỎ, BÃI BỎ CÁC ĐIỀU KHOẢN TRÁI PHÁP LUẬT
                  </h2>
                  <p className="text-slate-400 mb-2">
                    Hai bên thống nhất bãi bỏ hoàn toàn hiệu lực các điều khoản vi phạm sau:
                  </p>
                  <div className="space-y-3 pl-3 border-l border-rose-500/30">
                    {annexSections.revoked.map((rv, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-bold text-slate-200">
                          2.{idx + 1}. Bãi bỏ {rv.clauseNumber} - {rv.title}:
                        </p>
                        <p className="text-rose-300/80 line-through italic text-[11px]">
                          - Điều khoản bị bãi bỏ: "{rv.originalText}"
                        </p>
                        <p className="text-[11px] text-slate-400">
                          - Lý do: {rv.reason}
                        </p>
                      </div>
                    ))}
                    {annexSections.revoked.length === 0 && (
                      <p className="text-slate-500 italic">(Không có điều khoản bãi bỏ)</p>
                    )}
                  </div>
                </div>

                {/* Điều 3: Bổ sung */}
                <div>
                  <h2 className="font-bold text-white uppercase tracking-wide text-xs mb-2 font-sans flex items-center gap-1.5 text-emerald-300">
                    <PlusCircle className="w-3.5 h-3.5" />
                    ĐIỀU 3: BỔ SUNG CÁC QUY ĐỊNH BẢO VỆ & AN TOÀN PHÁP LÝ
                  </h2>
                  <div className="space-y-3 pl-3 border-l border-emerald-500/30">
                    {annexSections.added.map((ad, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-bold text-slate-200">
                          3.{idx + 1}. {ad.title}:
                        </p>
                        <p className="text-slate-300">"{ad.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Điều 4: Điều khoản thi hành */}
                <div>
                  <h2 className="font-bold text-white uppercase tracking-wide text-xs mb-2 font-sans text-cyan-300">
                    ĐIỀU 4: ĐIỀU KHOẢN THI HÀNH
                  </h2>
                  <div className="space-y-1 text-slate-300 pl-3 border-l border-cyan-500/30 text-[11px]">
                    <p>4.1. Phụ lục này có hiệu lực kể từ ngày ký và là bộ phận không thể tách rời của Hợp đồng số {contractNo}.</p>
                    <p>4.2. Các điều khoản khác của Hợp đồng gốc không bị sửa đổi bởi Phụ lục này vẫn giữ nguyên giá trị thi hành.</p>
                    <p>4.3. Phụ lục được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
                  </div>
                </div>

                {/* Signatures Table */}
                <div className="pt-8 grid grid-cols-2 text-center gap-8 font-sans">
                  <div>
                    <p className="font-bold text-white uppercase text-xs">ĐẠI DIỆN BÊN A</p>
                    <p className="italic text-[10px] text-slate-500 mb-14">(Ký, ghi rõ họ tên và đóng dấu)</p>
                    <p className="font-bold text-white text-xs">{partyAName}</p>
                  </div>
                  <div>
                    <p className="font-bold text-white uppercase text-xs">ĐẠI DIỆN BÊN B</p>
                    <p className="italic text-[10px] text-slate-500 mb-14">(Ký, ghi rõ họ tên và đóng dấu)</p>
                    <p className="font-bold text-white text-xs">{partyBName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
