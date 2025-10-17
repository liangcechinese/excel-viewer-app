/**
 * Excel查看器主组件
 */

import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Table, Card, Tabs, Pagination, Empty, Switch, Tooltip, Typography, Spin } from 'antd';
import { CellData } from '../../types/excel';
import { useExcelStore } from '../../stores/excelStore';
import { InlineLoading } from '../common/LoadingState';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// 懒加载虚拟表格组件以减少初始bundle大小
const VirtualTable = lazy(() => import('./VirtualTable'));

const { Text } = Typography;

interface ExcelViewerProps {
  onCellClick?: (cell: CellData) => void;
}

export const ExcelViewer: React.FC<ExcelViewerProps> = ({ onCellClick }) => {
  const { excelData, currentWorksheet, viewMode, setCurrentWorksheet, setViewMode } = useExcelStore();
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 性能监控
  usePerformanceMonitor({
    componentName: 'ExcelViewer',
    enabled: true,
    logToConsole: process.env.NODE_ENV === 'development'
  });

  // 判断是否应该使用虚拟滚动
  const shouldUseVirtualScroll = useMemo(() => {
    return useVirtualScroll && currentWorksheet && currentWorksheet.rowCount > 1000;
  }, [useVirtualScroll, currentWorksheet]);

  // 处理单元格点击
  const handleCellClick = useCallback((cell: CellData) => {
    setSelectedCell(cell);
    onCellClick?.(cell);
  }, [onCellClick]);

  // 处理工作表切换
  const handleSheetChange = useCallback((key: string) => {
    const index = parseInt(key);
    setCurrentWorksheet(index);
  }, [setCurrentWorksheet]);

  // 处理分页变化
  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    // 这里可以实现分页逻辑
    console.log('Page changed:', page, pageSize);
  }, []);

  // 渲染多行视图
  const renderMultipleView = () => {
    if (!currentWorksheet) return <Empty description="暂无数据" />;

    // 如果数据量大且启用虚拟滚动，使用虚拟表格
    if (shouldUseVirtualScroll) {
      return (
        <div className="multiple-view">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>虚拟滚动模式</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ({currentWorksheet.rowCount} 行数据)
              </Text>
            </div>
            <Tooltip title="关闭虚拟滚动">
              <Switch
                checked={useVirtualScroll}
                onChange={setUseVirtualScroll}
                checkedChildren="虚拟"
                unCheckedChildren="普通"
              />
            </Tooltip>
          </div>
          
          <InlineLoading loading={isLoading} message="正在渲染数据...">
            <Suspense fallback={
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>正在加载虚拟表格组件...</div>
              </div>
            }>
              <VirtualTable
                worksheet={currentWorksheet}
                onCellClick={handleCellClick}
                selectedCell={selectedCell}
                height={500}
              />
            </Suspense>
          </InlineLoading>
        </div>
      );
    }

    // 普通表格模式
    const columns = currentWorksheet.headers?.map((header, index) => ({
      title: header,
      dataIndex: index.toString(),
      key: index.toString(),
      width: 120,
      render: (value: any, record: any, rowIndex: number) => {
        const cell = currentWorksheet.data[rowIndex]?.[index];
        if (!cell) return '';
        
        return (
          <div
            className={`cell ${selectedCell?.address === cell.address ? 'selected' : ''}`}
            onClick={() => handleCellClick(cell)}
            style={{
              cursor: 'pointer',
              padding: '4px 8px',
              border: selectedCell?.address === cell.address ? '2px solid #1890ff' : '1px solid transparent',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: '20px'
            }}
          >
            {cell.value}
          </div>
        );
      }
    })) || [];

    const dataSource = currentWorksheet.data.map((row, index) => ({
      key: index,
      ...row.reduce((acc, cell, colIndex) => {
        acc[colIndex.toString()] = cell.value;
        return acc;
      }, {} as any)
    }));

    return (
      <div className="multiple-view">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>普通表格模式</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              ({currentWorksheet.rowCount} 行数据)
            </Text>
          </div>
          {currentWorksheet.rowCount > 1000 && (
            <Tooltip title="启用虚拟滚动以提升性能">
              <Switch
                checked={useVirtualScroll}
                onChange={setUseVirtualScroll}
                checkedChildren="虚拟"
                unCheckedChildren="普通"
              />
            </Tooltip>
          )}
        </div>

        <InlineLoading loading={isLoading} message="正在加载数据...">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              current: viewMode.currentPage || 1,
              pageSize: viewMode.pageSize || 50,
              total: currentWorksheet.rowCount,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: handlePageChange,
              onShowSizeChange: handlePageChange
            }}
            scroll={{ x: 'max-content', y: 400 }}
            size="small"
          />
        </InlineLoading>
      </div>
    );
  };

  // 渲染单行视图
  const renderSingleView = () => {
    if (!currentWorksheet) return <Empty description="暂无数据" />;

    const currentRow = viewMode.currentRow || 0;
    const rowData = currentWorksheet.data[currentRow];
    
    if (!rowData) return <Empty description="行数据不存在" />;

    return (
      <div className="single-view">
        <Card title={`第 ${currentRow + 1} 行数据`} size="small">
          <div className="row-data">
            {rowData.map((cell, index) => (
              <div key={index} className="cell-item">
                <div className="cell-header">
                  <strong>{currentWorksheet.headers?.[index] || `列${index + 1}`}</strong>
                  <span className="cell-type">{cell.type}</span>
                </div>
                <div 
                  className="cell-value"
                  onClick={() => handleCellClick(cell)}
                  style={{ 
                    cursor: 'pointer',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    minHeight: '20px'
                  }}
                >
                  {cell.value || <em>空值</em>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="row-navigation">
            <Pagination
              current={currentRow + 1}
              total={currentWorksheet.rowCount}
              pageSize={1}
              onChange={(page) => {
                setViewMode({ ...viewMode, currentRow: page - 1 });
              }}
              showSizeChanger={false}
              showQuickJumper={true}
            />
          </div>
        </Card>
      </div>
    );
  };

  if (!excelData) {
    return <Empty description="请先上传Excel文件" />;
  }

  return (
    <div className="excel-viewer">
      {/* 工作表标签 */}
      <Tabs
        activeKey={excelData.activeSheet.toString()}
        onChange={handleSheetChange}
        items={excelData.worksheets.map((sheet, index) => ({
          key: index.toString(),
          label: sheet.name,
          children: null
        }))}
      />

      {/* 数据展示区域 */}
      <div className="viewer-content">
        {viewMode.type === 'multiple' ? renderMultipleView() : renderSingleView()}
      </div>
    </div>
  );
};
