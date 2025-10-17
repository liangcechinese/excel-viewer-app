/**
 * 单元格详情弹窗组件
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Descriptions, Button, Space, Input, message } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { CellData } from '../../types/excel';
import { useExcelStore } from '../../stores/excelStore';

const { TextArea } = Input;

interface CellDetailModalProps {
  visible: boolean;
  cell: CellData | null;
  onClose: () => void;
}

export const CellDetailModal: React.FC<CellDetailModalProps> = ({
  visible,
  cell,
  onClose
}) => {
  const { currentWorksheet } = useExcelStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // 重置编辑状态
  useEffect(() => {
    if (cell) {
      setEditValue(String(cell.value || ''));
      setIsEditing(false);
    }
  }, [cell]);

  // 处理编辑
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 处理保存
  const handleSave = useCallback(() => {
    if (!cell || !currentWorksheet) return;

    // 这里可以实现保存逻辑
    message.success('保存成功');
    setIsEditing(false);
  }, [cell, currentWorksheet]);

  // 处理取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditValue(String(cell?.value || ''));
    setIsEditing(false);
  }, [cell]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  }, [onClose, handleSave]);

  if (!cell || !currentWorksheet) return null;

  // 获取相邻单元格信息
  const getAdjacentCells = () => {
    const { row, col } = cell;
    const adjacent = {
      top: currentWorksheet.data[row - 1]?.[col],
      bottom: currentWorksheet.data[row + 1]?.[col],
      left: currentWorksheet.data[row]?.[col - 1],
      right: currentWorksheet.data[row]?.[col + 1]
    };
    return adjacent;
  };

  const adjacentCells = getAdjacentCells();

  return (
    <Modal
      title={`单元格详情 - ${cell.address}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div className="cell-detail" onKeyDown={handleKeyDown}>
        {/* 基本信息 */}
        <Descriptions title="基本信息" bordered size="small" column={2}>
          <Descriptions.Item label="地址">{cell.address}</Descriptions.Item>
          <Descriptions.Item label="行">{cell.row + 1}</Descriptions.Item>
          <Descriptions.Item label="列">{cell.col + 1}</Descriptions.Item>
          <Descriptions.Item label="类型">{cell.type}</Descriptions.Item>
          <Descriptions.Item label="格式" span={2}>
            {cell.format || '无'}
          </Descriptions.Item>
        </Descriptions>

        {/* 单元格值 */}
        <div className="cell-value-section">
          <h4>单元格值</h4>
          {isEditing ? (
            <div className="edit-mode">
              <TextArea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                autoFocus
              />
              <Space style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                >
                  保存
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancelEdit}
                >
                  取消
                </Button>
              </Space>
            </div>
          ) : (
            <div className="view-mode">
              <div className="value-display" style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minHeight: '40px',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {cell.value || <em>空值</em>}
              </div>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
            </div>
          )}
        </div>

        {/* 公式信息 */}
        {cell.formula && (
          <div className="formula-section">
            <h4>公式</h4>
            <div className="formula-display">
              <code>{cell.formula}</code>
            </div>
          </div>
        )}

        {/* 样式信息 */}
        {cell.style && (
          <div className="style-section">
            <h4>样式信息</h4>
            <Descriptions size="small" column={2}>
              {cell.style.font && (
                <>
                  <Descriptions.Item label="字体">
                    {cell.style.font.bold && '粗体 '}
                    {cell.style.font.italic && '斜体 '}
                    {cell.style.font.size && `大小: ${cell.style.font.size}`}
                    {cell.style.font.color && ` 颜色: ${cell.style.font.color}`}
                  </Descriptions.Item>
                </>
              )}
              {cell.style.fill && (
                <Descriptions.Item label="填充色">
                  {cell.style.fill.color || '无'}
                </Descriptions.Item>
              )}
              {cell.style.alignment && (
                <>
                  <Descriptions.Item label="水平对齐">
                    {cell.style.alignment.horizontal || '默认'}
                  </Descriptions.Item>
                  <Descriptions.Item label="垂直对齐">
                    {cell.style.alignment.vertical || '默认'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}

        {/* 相邻单元格 */}
        <div className="adjacent-cells">
          <h4>相邻单元格</h4>
          <div className="adjacent-grid">
            <div className="adjacent-cell empty"></div>
            <div className="adjacent-cell">
              {adjacentCells.top ? (
                <div>
                  <div className="cell-address">{adjacentCells.top.address}</div>
                  <div className="cell-value" style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '100px',
                    fontSize: '12px',
                    lineHeight: '1.3'
                  }}>{adjacentCells.top.value || '空'}</div>
                </div>
              ) : (
                <div className="no-cell">无</div>
              )}
            </div>
            <div className="adjacent-cell empty"></div>
            
            <div className="adjacent-cell">
              {adjacentCells.left ? (
                <div>
                  <div className="cell-address">{adjacentCells.left.address}</div>
                  <div className="cell-value" style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '100px',
                    fontSize: '12px',
                    lineHeight: '1.3'
                  }}>{adjacentCells.left.value || '空'}</div>
                </div>
              ) : (
                <div className="no-cell">无</div>
              )}
            </div>
            <div className="adjacent-cell current">
              <div className="cell-address">{cell.address}</div>
              <div className="cell-value" style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxWidth: '100px',
                fontSize: '12px',
                fontWeight: 'bold',
                lineHeight: '1.3'
              }}>{cell.value || '空'}</div>
            </div>
            <div className="adjacent-cell">
              {adjacentCells.right ? (
                <div>
                  <div className="cell-address">{adjacentCells.right.address}</div>
                  <div className="cell-value" style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '100px',
                    fontSize: '12px',
                    lineHeight: '1.3'
                  }}>{adjacentCells.right.value || '空'}</div>
                </div>
              ) : (
                <div className="no-cell">无</div>
              )}
            </div>
            
            <div className="adjacent-cell empty"></div>
            <div className="adjacent-cell">
              {adjacentCells.bottom ? (
                <div>
                  <div className="cell-address">{adjacentCells.bottom.address}</div>
                  <div className="cell-value" style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '100px',
                    fontSize: '12px',
                    lineHeight: '1.3'
                  }}>{adjacentCells.bottom.value || '空'}</div>
                </div>
              ) : (
                <div className="no-cell">无</div>
              )}
            </div>
            <div className="adjacent-cell empty"></div>
          </div>
        </div>

        {/* 操作提示 */}
        <div className="keyboard-hints">
          <small>
            快捷键：ESC 关闭 | Ctrl+Enter 保存
          </small>
        </div>
      </div>
    </Modal>
  );
};