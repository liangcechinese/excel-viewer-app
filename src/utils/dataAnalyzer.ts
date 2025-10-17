/**
 * 数据分析工具
 */

import { CellData, WorksheetData } from '../types/excel';
import { AnalysisResult, DataQuality, QualityIssue, RowAnalysis, ColumnAnalysis } from '../types/analysis';

export class DataAnalyzer {
  /**
   * 分析整个工作表
   */
  static analyzeWorksheet(worksheet: WorksheetData): AnalysisResult {
    const startTime = Date.now();
    
    try {
      // 验证输入数据
      if (!worksheet || !worksheet.data) {
        throw new Error('工作表数据无效');
      }

      if (worksheet.rowCount === 0 || worksheet.colCount === 0) {
        throw new Error('工作表为空');
      }

      // 检查数据大小限制
      const totalCells = worksheet.rowCount * worksheet.colCount;
      if (totalCells > 1000000) { // 100万单元格限制
        throw new Error('数据量过大，超过100万单元格限制');
      }

      const quality = this.analyzeDataQuality(worksheet);
      const rows = this.analyzeRows(worksheet);
      const columns = this.analyzeColumns(worksheet);
      const correlations = this.calculateCorrelations(worksheet);

      return {
        quality,
        rows,
        columns,
        correlations,
        generatedAt: new Date(),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      // 返回错误结果而不是抛出异常
      const errorMessage = error instanceof Error ? error.message : '分析过程中发生未知错误';
      
      return {
        quality: {
          score: 0,
          issues: [{
            type: 'inconsistent',
            severity: 'high',
            message: `分析失败: ${errorMessage}`,
            location: {}
          }],
          summary: {
            totalRows: worksheet.rowCount,
            totalCols: worksheet.colCount,
            emptyCells: 0,
            duplicateRows: 0,
            inconsistentTypes: 0
          }
        },
        rows: [],
        columns: [],
        generatedAt: new Date(),
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * 分析数据质量
   */
  private static analyzeDataQuality(worksheet: WorksheetData): DataQuality {
    const issues: QualityIssue[] = [];
    let emptyCells = 0;
    let duplicateRows = 0;
    let inconsistentTypes = 0;

    // 检查空值
    for (let row = 0; row < worksheet.data.length; row++) {
      for (let col = 0; col < worksheet.data[row].length; col++) {
        const cell = worksheet.data[row][col];
        if (cell.type === 'empty' || cell.value === '') {
          emptyCells++;
          if (emptyCells <= 10) { // 只报告前10个空值
            issues.push({
              type: 'empty',
              severity: 'medium',
              message: `空值位于 ${cell.address}`,
              location: { row: cell.row, col: cell.col }
            });
          }
        }
      }
    }

    // 检查重复行
    const rowHashes = new Map<string, number[]>();
    for (let row = 0; row < worksheet.data.length; row++) {
      const rowData = worksheet.data[row];
      const hash = this.hashRow(rowData);
      if (rowHashes.has(hash)) {
        rowHashes.get(hash)!.push(row);
        duplicateRows++;
      } else {
        rowHashes.set(hash, [row]);
      }
    }

    // 检查数据类型一致性
    for (let col = 0; col < worksheet.colCount; col++) {
      const types = new Set<string>();
      for (let row = 0; row < worksheet.data.length; row++) {
        const cell = worksheet.data[row][col];
        if (cell.type !== 'empty') {
          types.add(cell.type);
        }
      }
      if (types.size > 1) {
        inconsistentTypes++;
        issues.push({
          type: 'inconsistent',
          severity: 'high',
          message: `列 ${worksheet.headers?.[col]} 包含多种数据类型`,
          location: { col },
          suggestion: '建议统一数据类型'
        });
      }
    }

    // 计算质量分数
    const totalCells = worksheet.rowCount * worksheet.colCount;
    const emptyRate = emptyCells / totalCells;
    const duplicateRate = duplicateRows / worksheet.rowCount;
    const inconsistencyRate = inconsistentTypes / worksheet.colCount;
    
    const score = Math.max(0, 100 - (emptyRate * 30 + duplicateRate * 40 + inconsistencyRate * 30));

    return {
      score: Math.round(score),
      issues,
      summary: {
        totalRows: worksheet.rowCount,
        totalCols: worksheet.colCount,
        emptyCells,
        duplicateRows,
        inconsistentTypes
      }
    };
  }

  /**
   * 分析行数据
   */
  private static analyzeRows(worksheet: WorksheetData): RowAnalysis[] {
    const analyses: RowAnalysis[] = [];

    for (let row = 0; row < worksheet.data.length; row++) {
      const rowData = worksheet.data[row];
      const analysis = this.analyzeRow(rowData, row);
      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * 分析单行数据
   */
  private static analyzeRow(rowData: CellData[], rowIndex: number): RowAnalysis {
    const numericValues: number[] = [];
    let textCount = 0;
    let emptyCount = 0;
    const dataTypes: Record<string, number> = {};

    rowData.forEach(cell => {
      if (cell.type === 'empty') {
        emptyCount++;
      } else {
        dataTypes[cell.type] = (dataTypes[cell.type] || 0) + 1;
        
        if (cell.type === 'number') {
          numericValues.push(Number(cell.value));
        } else if (cell.type === 'string') {
          textCount++;
        }
      }
    });

    const stats = {
      textCount,
      emptyCount,
      dataTypes
    };

    // 数值统计
    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      Object.assign(stats, {
        numericSum: numericValues.reduce((sum, val) => sum + val, 0),
        numericAvg: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
        numericMin: sorted[0],
        numericMax: sorted[sorted.length - 1]
      });
    }

    return {
      rowIndex,
      stats,
      trends: this.detectTrends(numericValues),
      anomalies: this.detectAnomalies(numericValues)
    };
  }

  /**
   * 分析列数据
   */
  private static analyzeColumns(worksheet: WorksheetData): ColumnAnalysis[] {
    const analyses: ColumnAnalysis[] = [];

    for (let col = 0; col < worksheet.colCount; col++) {
      const columnData: CellData[] = [];
      for (let row = 0; row < worksheet.data.length; row++) {
        columnData.push(worksheet.data[row][col]);
      }
      
      const analysis = this.analyzeColumn(columnData, col, worksheet.headers?.[col] || `列${col + 1}`);
      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * 分析单列数据
   */
  private static analyzeColumn(columnData: CellData[], colIndex: number, header: string): ColumnAnalysis {
    const values: any[] = [];
    const uniqueValues = new Set<string>();
    let emptyCount = 0;
    let nullCount = 0;
    const dataTypes = new Set<string>();

    columnData.forEach(cell => {
      if (cell.type === 'empty' || cell.value === '') {
        emptyCount++;
      } else if (cell.value === null) {
        nullCount++;
      } else {
        values.push(cell.value);
        uniqueValues.add(String(cell.value));
        dataTypes.add(cell.type);
      }
    });

    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v)) as number[];
    
    const stats = {
      unique: uniqueValues.size,
      duplicates: values.length - uniqueValues.size,
      empty: emptyCount,
      null: nullCount
    };

    // 数值统计
    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((s, v) => s + v, 0);
      const avg = sum / numericValues.length;
      const variance = numericValues.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / numericValues.length;
      
      Object.assign(stats, {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: avg,
        median: sorted[Math.floor(sorted.length / 2)],
        std: Math.sqrt(variance)
      });
    }

    return {
      colIndex,
      header,
      dataType: this.determineColumnType(dataTypes),
      stats,
      distribution: this.calculateDistribution(values),
      quality: {
        consistency: this.calculateConsistency(dataTypes),
        completeness: Math.round(((values.length) / columnData.length) * 100),
        validity: this.calculateValidity(values, dataTypes)
      }
    };
  }

  /**
   * 计算列间相关性
   */
  private static calculateCorrelations(worksheet: WorksheetData): Record<string, Record<string, number>> {
    const correlations: Record<string, Record<string, number>> = {};
    
    // 只计算数值列之间的相关性
    const numericColumns: number[] = [];
    for (let col = 0; col < worksheet.colCount; col++) {
      const columnData: CellData[] = [];
      for (let row = 0; row < worksheet.data.length; row++) {
        columnData.push(worksheet.data[row][col]);
      }
      
      const hasNumericData = columnData.some(cell => cell.type === 'number');
      if (hasNumericData) {
        numericColumns.push(col);
      }
    }

    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        const values1: number[] = [];
        const values2: number[] = [];
        
        for (let row = 0; row < worksheet.data.length; row++) {
          const cell1 = worksheet.data[row][col1];
          const cell2 = worksheet.data[row][col2];
          
          if (cell1.type === 'number' && cell2.type === 'number') {
            values1.push(Number(cell1.value));
            values2.push(Number(cell2.value));
          }
        }
        
        if (values1.length > 1) {
          const correlation = this.calculatePearsonCorrelation(values1, values2);
          const header1 = worksheet.headers?.[col1] || `列${col1 + 1}`;
          const header2 = worksheet.headers?.[col2] || `列${col2 + 1}`;
          
          if (!correlations[header1]) {
            correlations[header1] = {};
          }
          correlations[header1][header2] = correlation;
        }
      }
    }

    return correlations;
  }

  /**
   * 计算皮尔逊相关系数
   */
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * 检测趋势
   */
  private static detectTrends(values: number[]): RowAnalysis['trends'] {
    if (values.length < 3) return undefined;
    
    let increasing = 0;
    let decreasing = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increasing++;
      else if (values[i] < values[i - 1]) decreasing++;
    }
    
    const total = values.length - 1;
    const increasingRatio = increasing / total;
    const decreasingRatio = decreasing / total;
    
    let type: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    if (increasingRatio > 0.7) type = 'increasing';
    else if (decreasingRatio > 0.7) type = 'decreasing';
    else if (Math.abs(increasingRatio - decreasingRatio) < 0.2) type = 'stable';
    else type = 'volatile';
    
    return {
      type,
      confidence: Math.max(increasingRatio, decreasingRatio)
    };
  }

  /**
   * 检测异常值
   */
  private static detectAnomalies(values: number[]): RowAnalysis['anomalies'] {
    if (values.length < 3) return undefined;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outliers: number[] = [];
    values.forEach((value, index) => {
      if (value < lowerBound || value > upperBound) {
        outliers.push(index);
      }
    });
    
    return {
      outliers,
      missing: []
    };
  }

  /**
   * 计算分布
   */
  private static calculateDistribution(values: any[]): ColumnAnalysis['distribution'] {
    const valueCounts: Record<string, number> = {};
    values.forEach(value => {
      const key = String(value);
      valueCounts[key] = (valueCounts[key] || 0) + 1;
    });
    
    return {
      values: valueCounts
    };
  }

  /**
   * 确定列类型
   */
  private static determineColumnType(dataTypes: Set<string>): ColumnAnalysis['dataType'] {
    if (dataTypes.size === 0) return 'text';
    if (dataTypes.size === 1) {
      const type = Array.from(dataTypes)[0];
      return type === 'number' ? 'numeric' : 
             type === 'date' ? 'date' : 
             type === 'boolean' ? 'boolean' : 'text';
    }
    return 'mixed';
  }

  /**
   * 计算一致性
   */
  private static calculateConsistency(dataTypes: Set<string>): number {
    if (dataTypes.size <= 1) return 100;
    return Math.max(0, 100 - (dataTypes.size - 1) * 20);
  }

  /**
   * 计算有效性
   */
  private static calculateValidity(values: any[], dataTypes: Set<string>): number {
    if (values.length === 0) return 0;
    
    let validCount = 0;
    values.forEach(value => {
      if (value !== null && value !== undefined && value !== '') {
        validCount++;
      }
    });
    
    return Math.round((validCount / values.length) * 100);
  }

  /**
   * 生成行哈希
   */
  private static hashRow(rowData: CellData[]): string {
    return rowData.map(cell => `${cell.address}:${cell.value}:${cell.type}`).join('|');
  }
}
