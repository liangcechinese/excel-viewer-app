/**
 * Excel相关类型定义
 */

export interface CellStyle {
  font?: {
    bold?: boolean;
    italic?: boolean;
    size?: number;
    color?: string;
  };
  fill?: {
    color?: string;
  };
  border?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'middle' | 'bottom';
  };
}

export interface CellData {
  value: any;
  type: 'string' | 'number' | 'date' | 'boolean' | 'formula' | 'empty';
  formula?: string;
  format?: string;
  style?: CellStyle;
  comment?: string;
  row: number;
  col: number;
  address: string;
}

export interface WorksheetData {
  name: string;
  data: CellData[][];
  range: string;
  rowCount: number;
  colCount: number;
  headers?: string[];
}

export interface ExcelData {
  worksheets: WorksheetData[];
  activeSheet: number;
  fileName: string;
  fileSize: number;
  lastModified: Date;
}

export interface ViewMode {
  type: 'single' | 'multiple';
  currentRow?: number;
  pageSize?: number;
  currentPage?: number;
}

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  cells: CellData[];
}

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'json';
  range: 'all' | 'current' | 'selected';
  includeHeaders: boolean;
  selectedColumns?: number[];
  fileName?: string;
}
