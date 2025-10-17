/**
 * 通用类型定义
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  code?: string;
}

export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  filterable?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean';
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'histogram';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  options?: any;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  url?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  defaultView: 'single' | 'multiple';
  pageSize: number;
  autoSave: boolean;
}
