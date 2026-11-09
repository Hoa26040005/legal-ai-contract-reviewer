import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LegalAI Auditor | Hệ thống Thẩm định Hợp đồng & Hybrid Graph-RAG Thông minh',
  description:
    'Nền tảng AI chuyên sâu thẩm định rủi ro pháp lý hợp đồng Việt Nam (BLLĐ 2019, LTM 2005, BLDS 2015, SHTT 2022, NĐ 13/2023), kết hợp AST Semantic Chunking, Neo4j Knowledge Graph, Dự báo Tranh tụng Án lệ TANDTC và Xuất Word (.docx) Track Changes Redline.',
  keywords: [
    'LegalTech Vietnam',
    'Contract Review AI',
    'Hybrid Graph-RAG',
    'Neo4j Cypher',
    'Vietnamese Law AI',
    'Track Changes Redline',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-cyan-500/25 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
