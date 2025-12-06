export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  DATA_GRID = 'DATA_GRID',
  PROCESS = 'PROCESS',
  CONTROLS = 'CONTROLS',
  SETTINGS = 'SETTINGS',
  DOCS = 'DOCS'
}

export interface NavNode {
  id: ViewState;
  label: string;
  icon: any; // Lucide icon component
  shortCode: string;
  status: 'active' | 'pending' | 'locked' | 'complete';
}

export interface Metric {
  label: string;
  value: string | number;
  trend?: number;
  status: 'neutral' | 'good' | 'warning' | 'danger';
}

export interface TableRow {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  status: string;
}
