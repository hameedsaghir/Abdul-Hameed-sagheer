export enum ProcessingStatus {
  IDLE = 'IDLE',
  READING = 'READING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ProcessedDocument {
  originalText: string;
  modifiedText: string;
  fileName: string;
}

export interface AlertState {
  type: 'success' | 'error' | 'info';
  message: string;
}