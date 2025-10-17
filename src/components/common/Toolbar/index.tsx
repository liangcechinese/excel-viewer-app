/**
 * 工具栏组件
 */

import React from 'react';
import { Button, Space, Divider, Tooltip } from 'antd';
import { 
  DownloadOutlined, 
  BarChartOutlined, 
  ReloadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { ViewToggle } from '../ViewToggle';
import { useExcelStore } from '../../../stores/excelStore';

interface ToolbarProps {
  onExport?: () => void;
  onAnalyze?: () => void;
  onRefresh?: () => void;
  onShowInfo?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExport,
  onAnalyze,
  onRefresh,
  onShowInfo
}) => {
  const { currentWorksheet, analysisResult } = useExcelStore();
  const hasData = !!currentWorksheet;

  return (
    <div className="toolbar">
      <Space>
        <ViewToggle disabled={!hasData} />
        
        <Divider type="vertical" />
        
        <Tooltip title="数据分析">
          <Button
            icon={<BarChartOutlined />}
            onClick={onAnalyze}
            disabled={!hasData}
            type={analysisResult ? 'primary' : 'default'}
          >
            数据分析
          </Button>
        </Tooltip>
        
        <Tooltip title="导出数据">
          <Button
            icon={<DownloadOutlined />}
            onClick={onExport}
            disabled={!hasData}
          >
            导出
          </Button>
        </Tooltip>
        
        <Tooltip title="刷新数据">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            disabled={!hasData}
          >
            刷新
          </Button>
        </Tooltip>
        
        <Tooltip title="文件信息">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={onShowInfo}
            disabled={!hasData}
          >
            信息
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
};
