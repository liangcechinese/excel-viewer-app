/**
 * Excel数据状态管理
 */

import { create } from 'zustand';
import { ExcelData, WorksheetData, CellData, ViewMode, Selection } from '../types/excel';
import { AnalysisResult } from '../types/analysis';
import { LoadingState, ErrorState } from '../types/common';

interface ExcelStore {
  // 数据状态
  excelData: ExcelData | null;
  currentWorksheet: WorksheetData | null;
  analysisResult: AnalysisResult | null;
  
  // UI状态
  viewMode: ViewMode;
  selection: Selection | null;
  loadingState: LoadingState;
  errorState: ErrorState;
  
  // 操作
  setExcelData: (data: ExcelData) => void;
  setCurrentWorksheet: (index: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelection: (selection: Selection | null) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: ErrorState) => void;
  clearData: () => void;
}

export const useExcelStore = create<ExcelStore>((set, get) => ({
  // 初始状态
  excelData: null,
  currentWorksheet: null,
  analysisResult: null,
  viewMode: { type: 'multiple', pageSize: 50, currentPage: 1 },
  selection: null,
  loadingState: { isLoading: false },
  errorState: { hasError: false },

  // 操作方法
  setExcelData: (data) => {
    set({
      excelData: data,
      currentWorksheet: data.worksheets[data.activeSheet],
      errorState: { hasError: false }
    });
  },

  setCurrentWorksheet: (index) => {
    const { excelData } = get();
    if (excelData && excelData.worksheets[index]) {
      set({
        currentWorksheet: excelData.worksheets[index],
        excelData: { ...excelData, activeSheet: index }
      });
    }
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setSelection: (selection) => {
    set({ selection });
  },

  setAnalysisResult: (result) => {
    set({ analysisResult: result });
  },

  setLoading: (loading) => {
    set({ loadingState: loading });
  },

  setError: (error) => {
    set({ errorState: error });
  },

  clearData: () => {
    set({
      excelData: null,
      currentWorksheet: null,
      analysisResult: null,
      selection: null,
      loadingState: { isLoading: false },
      errorState: { hasError: false }
    });
  }
}));
