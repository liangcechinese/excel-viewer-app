/**
 * 视图切换组件
 */

import React from 'react';
import { Radio } from 'antd';
import { TableOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ViewMode } from '../../../types/excel';
import { useExcelStore } from '../../../stores/excelStore';

interface ViewToggleProps {
  disabled?: boolean;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ disabled = false }) => {
  const { viewMode, setViewMode } = useExcelStore();

  const handleViewChange = (mode: ViewMode['type']) => {
    setViewMode({ ...viewMode, type: mode });
  };

  return (
    <div className="view-toggle">
      <Radio.Group
        value={viewMode.type}
        onChange={(e) => handleViewChange(e.target.value)}
        disabled={disabled}
        buttonStyle="solid"
      >
        <Radio.Button value="multiple">
          <TableOutlined />
          多行视图
        </Radio.Button>
        <Radio.Button value="single">
          <UnorderedListOutlined />
          单行视图
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};
