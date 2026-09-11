import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LegalAI - Hệ thống Rà soát Hợp đồng & Graph-RAG Thông minh',
  description: 'Nền tảng phân tích rủi ro hợp đồng pháp lý, đối chiếu quy định pháp luật Việt Nam và đề xuất sửa đổi điều khoản tự động bằng AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
