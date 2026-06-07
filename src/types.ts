export interface Identity {
  name: string;
  email: string;
}

export interface Message {
  v: number;
  id: string;
  author: string;
  name: string;
  ts: string;
  body: string;
}

export type SyncState = 'idle' | 'fetching' | 'pushing' | 'error';
