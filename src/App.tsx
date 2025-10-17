/**
 * 主应用组件
 */

import React, { useState, useCallback } from 'react';
import { Layout, Tabs, message } from 'antd';
import { FileUpload } from './components/common/FileUpload';
import { Toolbar } from './components/common/Toolbar';
import { ExcelViewer } from './components/ExcelViewer';
import { CellDetailModal } from './components/CellDetail';
import { DataAnalysis } from './components/DataAnalysis';
import { ExportPanel } from './components/ExportPanel';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { FullScreenLoading } from './components/common/LoadingState';
import { useExcelStore } from './stores/excelStore';
import { CellData } from './types/excel';
import { AnalysisResult } from './types/analysis';

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const App: React.FC = () => {
  const { excelData, loadingState, errorState } = useExcelStore();
  const [activeTab, setActiveTab] = useState('viewer');
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [showCellDetail, setShowCellDetail] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // 错误处理回调
  const handleError = useCallback((error: Error, errorInfo: any) => {
    console.error('Application Error:', error, errorInfo);
    message.error(`应用错误: ${error.message}`);
  }, []);

  // 处理文件上传完成
  const handleFileUploaded = useCallback(() => {
    setActiveTab('viewer');
  }, []);

  // 处理单元格点击
  const handleCellClick = useCallback((cell: CellData) => {
    setSelectedCell(cell);
    setShowCellDetail(true);
  }, []);

  // 处理关闭单元格详情
  const handleCloseCellDetail = useCallback(() => {
    setShowCellDetail(false);
    setSelectedCell(null);
  }, []);

  // 处理导出
  const handleExport = useCallback(() => {
    setShowExportPanel(true);
  }, []);

  // 处理关闭导出面板
  const handleCloseExportPanel = useCallback(() => {
    setShowExportPanel(false);
  }, []);

  // 处理数据分析
  const handleAnalyze = useCallback(() => {
    setActiveTab('analysis');
  }, []);

  // 处理数据分析完成
  const handleAnalyzeComplete = useCallback((result: AnalysisResult) => {
    message.success(`数据分析完成！质量分数: ${result.quality.score}/100`);
  }, []);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    message.info('刷新功能待实现');
  }, []);

  // 处理显示信息
  const handleShowInfo = useCallback(() => {
    if (excelData) {
      message.info(`文件: ${excelData.fileName}, 大小: ${(excelData.fileSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }, [excelData]);

  return (
    <ErrorBoundary onError={handleError}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0, fontSize: '20px', color: '#1890ff' }}>
              Excel查看工具
            </h1>
            {excelData && (
              <Toolbar
                onExport={handleExport}
                onAnalyze={handleAnalyze}
                onRefresh={handleRefresh}
                onShowInfo={handleShowInfo}
              />
            )}
          </div>
        </Header>

        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          {/* 全屏加载状态 */}
          <FullScreenLoading 
            loading={loadingState.isLoading} 
            message={loadingState.message}
            type={loadingState.message?.includes('解析') ? 'file' : 
                  loadingState.message?.includes('分析') ? 'analysis' : 'general'}
          />

          {/* 错误状态显示 */}
          {errorState.hasError && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                padding: '16px', 
                background: '#fff2f0', 
                border: '1px solid #ffccc7', 
                borderRadius: '6px',
                color: '#a8071a'
              }}>
                {errorState.message || '发生错误'}
              </div>
            </div>
          )}

          {!excelData ? (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '24px' }}>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="数据查看" key="viewer">
                  <ExcelViewer onCellClick={handleCellClick} />
                </TabPane>
                <TabPane tab="数据分析" key="analysis">
                  <DataAnalysis onAnalyzeComplete={handleAnalyzeComplete} />
                </TabPane>
              </Tabs>
            </div>
          )}
        </Content>

        {/* 单元格详情弹窗 */}
        <CellDetailModal
          visible={showCellDetail}
          cell={selectedCell}
          onClose={handleCloseCellDetail}
        />

        {/* 导出面板 */}
        <ExportPanel
          visible={showExportPanel}
          onClose={handleCloseExportPanel}
        />
      </Layout>
    </ErrorBoundary>
  );
};

export default App;