'use client';

import { use } from 'react';
import { WebSocketProvider } from '../../providers/websocket-provider';
import CoverImage from '../../components/CoverImage';

export default function LeadersSessionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';

  return (
    <WebSocketProvider websocketUrl={websocketUrl} sessionId={sessionId}>
      <CoverImage>{children}</CoverImage>
    </WebSocketProvider>
  );
}
