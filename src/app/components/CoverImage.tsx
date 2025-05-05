'use client';
import Image from 'next/image';
import { useWebSocket } from '../providers/websocket-provider';

const DEFUALT_IMAGE =
  'https://images.unsplash.com/photo-1533167649158-6d508895b680?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export default function CoverImage({ children }: { children: React.ReactNode }) {
  const { images } = useWebSocket();
  const image = images.length > 0 ? images[0].blob : DEFUALT_IMAGE;

  return (
    <div className="relative w-full h-screen">
      <Image src={image} alt="Background" fill className="object-contain" priority />
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
