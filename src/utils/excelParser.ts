/**
 * Excel文件解析工具
 */

import * as XLSX from 'xlsx';
import { ExcelData, WorksheetData, CellData, CellStyle } from '../types/excel';

export class ExcelParser {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly SUPPORTED_FORMATS = ['.xlsx', '.xls', '.csv'];

  /**
   * 验证文件格式和大小
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `文件大小超过限制 (${this.MAX_FILE_SIZE / 1024 / 1024}MB)`
      };
    }

    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!this.SUPPORTED_FORMATS.includes(extension)) {
      return {
        valid: false,
        error: `不支持的文件格式。支持的格式: ${this.SUPPORTED_FORMATS.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * 解析Excel文件
   */
  static async parseFile(file: File): Promise<ExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error('文件读取失败：无法获取文件内容');
          }

          // 检查文件内容是否为空
          if (typeof data === 'string' && data.length === 0) {
            throw new Error('文件内容为空');
          }

          const workbook = XLSX.read(data, { 
            type: 'binary',
            cellDates: true,
            cellNF: false,
            cellText: false
          });

          // 检查工作簿是否有效
          if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('文件格式无效：未找到工作表');
          }

          const excelData = this.parseWorkbook(workbook, file);
          resolve(excelData);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          reject(new Error(`文件解析失败：${errorMessage}`));
        }
      };

      reader.onerror = (error) => {
        reject(new Error(`文件读取失败：${error}`));
      };

      reader.onabort = () => {
        reject(new Error('文件读取被中断'));
      };

      try {
        reader.readAsBinaryString(file);
      } catch (error) {
        reject(new Error(`无法读取文件：${error}`));
      }
    });
  }

  /**
   * 解析工作簿
   */
  private static parseWorkbook(workbook: XLSX.WorkBook, file: File): ExcelData {
    const worksheets: WorksheetData[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const worksheetData = this.parseWorksheet(worksheet, sheetName);
      worksheets.push(worksheetData);
    });

    return {
      worksheets,
      activeSheet: 0,
      fileName: file.name,
      fileSize: file.size,
      lastModified: new Date(file.lastModified)
    };
  }

  /**
   * 解析工作表
   */
  private static parseWorksheet(worksheet: XLSX.WorkSheet, sheetName: string): WorksheetData {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    const data: CellData[][] = [];
    
    // 初始化二维数组
    for (let row = range.s.r; row <= range.e.r; row++) {
      data[row] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        data[row][col] = this.createEmptyCell(row, col);
      }
    }

    // 填充实际数据
    Object.keys(worksheet).forEach((cellAddress) => {
      if (cellAddress.startsWith('!')) return;
      
      const cell = worksheet[cellAddress];
      const { r: row, c: col } = XLSX.utils.decode_cell(cellAddress);
      
      if (row >= 0 && col >= 0 && data[row] && data[row][col]) {
        data[row][col] = this.parseCell(cell, row, col);
      }
    });

    // 生成表头
    const headers = this.generateHeaders(range.e.c + 1);

    return {
      name: sheetName,
      data,
      range: worksheet['!ref'] || 'A1:A1',
      rowCount: range.e.r + 1,
      colCount: range.e.c + 1,
      headers
    };
  }

  /**
   * 解析单元格
   */
  private static parseCell(cell: XLSX.CellObject, row: number, col: number): CellData {
    const address = XLSX.utils.encode_cell({ r: row, c: col });
    
    let value = cell.v;
    let type: CellData['type'] = 'empty';
    let formula: string | undefined;
    let format: string | undefined;
    let style: CellStyle | undefined;

    // 处理公式
    if (cell.f) {
      formula = cell.f;
      type = 'formula';
    }

    // 处理格式
    if (cell.z) {
      format = String(cell.z);
    }

    // 处理样式
    if (cell.s) {
      style = this.parseCellStyle(cell.s);
    }

    // 确定数据类型
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (value instanceof Date) {
        type = 'date';
      } else {
        type = 'string';
      }
    } else {
      type = 'empty';
      value = '';
    }

    return {
      value,
      type,
      formula,
      format,
      style,
      row,
      col,
      address
    };
  }

  /**
   * 解析单元格样式
   */
  private static parseCellStyle(style: any): CellStyle {
    const cellStyle: CellStyle = {};

    if (style.font) {
      cellStyle.font = {
        bold: style.font.bold,
        italic: style.font.italic,
        size: style.font.sz,
        color: style.font.color?.rgb
      };
    }

    if (style.fill) {
      cellStyle.fill = {
        color: style.fill.fgColor?.rgb
      };
    }

    if (style.border) {
      cellStyle.border = {
        top: style.border.top?.style,
        bottom: style.border.bottom?.style,
        left: style.border.left?.style,
        right: style.border.right?.style
      };
    }

    if (style.alignment) {
      cellStyle.alignment = {
        horizontal: style.alignment.horizontal,
        vertical: style.alignment.vertical
      };
    }

    return cellStyle;
  }

  /**
   * 创建空单元格
   */
  private static createEmptyCell(row: number, col: number): CellData {
    return {
      value: '',
      type: 'empty',
      row,
      col,
      address: XLSX.utils.encode_cell({ r: row, c: col })
    };
  }

  /**
   * 生成列标题
   */
  private static generateHeaders(colCount: number): string[] {
    const headers: string[] = [];
    for (let i = 0; i < colCount; i++) {
      headers.push(XLSX.utils.encode_col(i));
    }
    return headers;
  }

  /**
   * 获取单元格地址
   */
  static getCellAddress(row: number, col: number): string {
    return XLSX.utils.encode_cell({ r: row, c: col });
  }

  /**
   * 解析单元格地址
   */
  static parseCellAddress(address: string): { row: number; col: number } {
    const decoded = XLSX.utils.decode_cell(address);
    return { row: decoded.r, col: decoded.c };
  }
}
