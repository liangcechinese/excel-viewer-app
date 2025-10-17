/**
 * 简化的虚拟滚动表格组件
 */

import React from 'react';
import { CellData, WorksheetData } from '../../types/excel';

interface VirtualTableProps {
  worksheet: WorksheetData;
  onCellClick?: (cell: CellData) => void;
  selectedCell?: CellData | null;
  height?: number;
  itemHeight?: number;
}

export const VirtualTable: React.FC<VirtualTableProps> = ({
  worksheet,
  onCellClick,
  selectedCell,
  height = 400
}) => {
  return (
    <div className="virtual-table-container" style={{ height, width: '100%' }}>
      {/* 表头 */}
      <div className="virtual-header" style={{ 
        display: 'flex', 
        borderBottom: '2px solid #1890ff',
        backgroundColor: '#fafafa',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div className="header-cell" style={{ 
          width: 50, 
          padding: '8px 4px', 
          borderRight: '1px solid #d9d9d9',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          #
        </div>
        {worksheet.headers?.map((header, index) => (
          <div
            key={index}
            className="header-cell"
            style={{
              width: 120,
              minWidth: 120,
              padding: '8px 4px',
              borderRight: '1px solid #d9d9d9',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {header}
          </div>
        ))}
      </div>

      {/* 简化的数据展示 */}
      <div style={{ height: height - 40, overflow: 'auto' }}>
        {worksheet.data.slice(0, 1000).map((rowData, rowIndex) => (
          <div key={rowIndex} className="virtual-row" style={{ display: 'flex' }}>
            <div className="row-number">{rowIndex + 1}</div>
            {rowData.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`virtual-cell ${selectedCell?.address === cell.address ? 'selected' : ''}`}
                onClick={() => onCellClick?.(cell)}
                style={{
                  width: 120,
                  minWidth: 120,
                  padding: '4px 8px',
                  border: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  backgroundColor: selectedCell?.address === cell.address ? '#e6f7ff' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div 
                  className="cell-content" 
                  title={String(cell.value || '')}
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    minHeight: '20px'
                  }}
                >
                  {cell.value || ''}
                </div>
              </div>
            ))}
          </div>
        ))}
        {worksheet.rowCount > 1000 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            显示前1000行数据，共 {worksheet.rowCount} 行
          </div>
        )}
      </div>
    </div>
  );
};
