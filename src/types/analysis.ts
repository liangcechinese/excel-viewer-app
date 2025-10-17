/**
 * 数据分析相关类型定义
 */

export interface DataQuality {
  score: number; // 0-100
  issues: QualityIssue[];
  summary: {
    totalRows: number;
    totalCols: number;
    emptyCells: number;
    duplicateRows: number;
    inconsistentTypes: number;
  };
}

export interface QualityIssue {
  type: 'empty' | 'duplicate' | 'inconsistent' | 'outlier' | 'format';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location: {
    row?: number;
    col?: number;
    range?: string;
  };
  suggestion?: string;
}

export interface RowAnalysis {
  rowIndex: number;
  stats: {
    numericSum?: number;
    numericAvg?: number;
    numericMin?: number;
    numericMax?: number;
    textCount: number;
    emptyCount: number;
    dataTypes: Record<string, number>;
  };
  trends?: {
    type: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    confidence: number;
  };
  anomalies?: {
    outliers: number[];
    missing: number[];
  };
}

export interface ColumnAnalysis {
  colIndex: number;
  header: string;
  dataType: 'numeric' | 'text' | 'date' | 'boolean' | 'mixed';
  stats: {
    unique: number;
    duplicates: number;
    empty: number;
    null: number;
    min?: number;
    max?: number;
    avg?: number;
    median?: number;
    std?: number;
  };
  distribution?: {
    values: Record<string, number>;
    histogram?: number[];
  };
  quality: {
    consistency: number; // 0-100
    completeness: number; // 0-100
    validity: number; // 0-100
  };
}

export interface AnalysisResult {
  quality: DataQuality;
  rows: RowAnalysis[];
  columns: ColumnAnalysis[];
  correlations?: Record<string, Record<string, number>>;
  generatedAt: Date;
  processingTime: number;
}
