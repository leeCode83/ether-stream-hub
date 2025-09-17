// TypeScript interfaces for the video platform

export interface Video {
  id: string;
  contractAddress: string;
  creator: string;
  title: string;
  videoURI: string;
  viewingFee: bigint;
  thumbnail?: string;
  description?: string;
  createdAt?: Date;
}

export interface VideoMetadata {
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  category?: string;
}

export interface UserBalance {
  wusdt: bigint;
  deposits: bigint;
}

export interface TransactionStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  hash?: string;
}