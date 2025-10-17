/**
 * 导出功能工具
 */

import * as XLSX from 'xlsx';
import { ExcelData, WorksheetData, CellData, ExportOptions } from '../types/excel';

export class ExportHelper {
  /**
   * 导出数据
   */
  static async exportData(
    excelData: ExcelData, 
    options: ExportOptions,
    selectedRange?: { startRow: number; startCol: number; endRow: number; endCol: number }
  ): Promise<Blob> {
    const worksheet = excelData.worksheets[excelData.activeSheet];
    
    switch (options.format) {
      case 'xlsx':
        return this.exportToExcel(worksheet, options, selectedRange);
      case 'csv':
        return this.exportToCSV(worksheet, options, selectedRange);
      case 'json':
        return this.exportToJSON(worksheet, options, selectedRange);
      default:
        throw new Error(`不支持的导出格式: ${options.format}`);
    }
  }

  /**
   * 导出为Excel格式
   */
  private static async exportToExcel(
    worksheet: WorksheetData,
    options: ExportOptions,
    selectedRange?: { startRow: number; startCol: number; endRow: number; endCol: number }
  ): Promise<Blob> {
    const data = this.getExportData(worksheet, options, selectedRange);
    const workbook = XLSX.utils.book_new();
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // 设置列宽
    const colWidths = this.calculateColumnWidths(data);
    ws['!cols'] = colWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, ws, worksheet.name);
    
    // 生成文件
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * 导出为CSV格式
   */
  private static async exportToCSV(
    worksheet: WorksheetData,
    options: ExportOptions,
    selectedRange?: { startRow: number; startCol: number; endRow: number; endCol: number }
  ): Promise<Blob> {
    const data = this.getExportData(worksheet, options, selectedRange);
    const csvContent = this.arrayToCSV(data);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  }

  /**
   * 导出为JSON格式
   */
  private static async exportToJSON(
    worksheet: WorksheetData,
    options: ExportOptions,
    selectedRange?: { startRow: number; startCol: number; endRow: number; endCol: number }
  ): Promise<Blob> {
    const data = this.getExportData(worksheet, options, selectedRange);
    const jsonData = this.arrayToJSON(data, worksheet.headers);
    return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  }

  /**
   * 获取导出数据
   */
  private static getExportData(
    worksheet: WorksheetData,
    options: ExportOptions,
    selectedRange?: { startRow: number; startCol: number; endRow: number; endCol: number }
  ): any[][] {
    let startRow = 0;
    let startCol = 0;
    let endRow = worksheet.rowCount - 1;
    let endCol = worksheet.colCount - 1;

    // 根据导出范围确定数据范围
    switch (options.range) {
      case 'selected':
        if (selectedRange) {
          startRow = selectedRange.startRow;
          startCol = selectedRange.startCol;
          endRow = selectedRange.endRow;
          endCol = selectedRange.endCol;
        }
        break;
      case 'current':
        // 当前视图范围（这里简化为全部）
        break;
      case 'all':
      default:
        break;
    }

    const data: any[][] = [];

    // 添加表头
    if (options.includeHeaders && worksheet.headers) {
      const headers = options.selectedColumns 
        ? options.selectedColumns.map(col => worksheet.headers![col])
        : worksheet.headers.slice(startCol, endCol + 1);
      data.push(headers);
    }

    // 添加数据行
    for (let row = startRow; row <= endRow; row++) {
      const rowData: any[] = [];
      
      for (let col = startCol; col <= endCol; col++) {
        // 如果指定了列选择，只导出选中的列
        if (options.selectedColumns && !options.selectedColumns.includes(col)) {
          continue;
        }
        
        const cell = worksheet.data[row]?.[col];
        if (cell) {
          rowData.push(this.formatCellValue(cell));
        } else {
          rowData.push('');
        }
      }
      
      data.push(rowData);
    }

    return data;
  }

  /**
   * 格式化单元格值
   */
  private static formatCellValue(cell: CellData): any {
    if (cell.type === 'empty') {
      return '';
    }
    
    if (cell.type === 'date' && cell.value instanceof Date) {
      return cell.value.toISOString();
    }
    
    if (cell.type === 'formula' && cell.formula) {
      return cell.formula;
    }
    
    return cell.value;
  }

  /**
   * 计算列宽
   */
  private static calculateColumnWidths(data: any[][]): Array<{ wch: number }> {
    if (data.length === 0) return [];
    
    const colCount = data[0].length;
    const widths: Array<{ wch: number }> = [];
    
    for (let col = 0; col < colCount; col++) {
      let maxWidth = 10; // 最小宽度
      
      for (let row = 0; row < data.length; row++) {
        const cellValue = String(data[row][col] || '');
        maxWidth = Math.max(maxWidth, cellValue.length);
      }
      
      widths.push({ wch: Math.min(maxWidth, 50) }); // 最大宽度限制
    }
    
    return widths;
  }

  /**
   * 数组转CSV
   */
  private static arrayToCSV(data: any[][]): string {
    return data.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // 如果包含逗号、引号或换行符，需要用引号包围并转义
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  }

  /**
   * 数组转JSON
   */
  private static arrayToJSON(data: any[][], headers?: string[]): any[] {
    if (data.length === 0) return [];
    
    const result: any[] = [];
    const startRow = headers ? 1 : 0; // 如果有表头，从第二行开始
    
    for (let row = startRow; row < data.length; row++) {
      const rowData: any = {};
      
      for (let col = 0; col < data[row].length; col++) {
        const key = headers?.[col] || `column_${col}`;
        rowData[key] = data[row][col];
      }
      
      result.push(rowData);
    }
    
    return result;
  }

  /**
   * 下载文件
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 估算文件大小
   */
  static estimateFileSize(
    worksheet: WorksheetData,
    options: ExportOptions,
    selectedRange?: { startRow: number; startCol: number; endRow: number; endCol: number }
  ): number {
    const data = this.getExportData(worksheet, options, selectedRange);
    const content = JSON.stringify(data);
    
    // 根据格式估算大小
    switch (options.format) {
      case 'xlsx':
        return Math.round(content.length * 1.5); // Excel格式通常更大
      case 'csv':
        return Math.round(content.length * 0.8); // CSV格式通常更小
      case 'json':
        return content.length;
      default:
        return content.length;
    }
  }

  /**
   * 生成默认文件名
   */
  static generateFileName(excelData: ExcelData, options: ExportOptions): string {
    const baseName = excelData.fileName.replace(/\.[^/.]+$/, '');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    switch (options.format) {
      case 'xlsx':
        return `${baseName}_export_${timestamp}.xlsx`;
      case 'csv':
        return `${baseName}_export_${timestamp}.csv`;
      case 'json':
        return `${baseName}_export_${timestamp}.json`;
      default:
        return `${baseName}_export_${timestamp}.txt`;
    }
  }
}
