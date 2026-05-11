import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SupportChatWidget } from '@/components/support/SupportChatWidget';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background glow */}
      <div className="ambient-glow" />
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />
      <SupportChatWidget />
    </div>
  );
}
