/**
 * 数据分析组件
 */

import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Spin, Alert } from 'antd';
import { 
  BarChartOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import { DataAnalyzer } from '../../utils/dataAnalyzer';
import { useExcelStore } from '../../stores/excelStore';
import { AnalysisResult, DataQuality, RowAnalysis, ColumnAnalysis } from '../../types/analysis';

interface DataAnalysisProps {
  onAnalyzeComplete?: (result: AnalysisResult) => void;
}

export const DataAnalysis: React.FC<DataAnalysisProps> = ({ onAnalyzeComplete }) => {
  const { currentWorksheet, analysisResult, setAnalysisResult, setLoading } = useExcelStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 执行数据分析
  const handleAnalyze = useCallback(async () => {
    if (!currentWorksheet) return;

    setIsAnalyzing(true);
    setLoading({ isLoading: true, message: '正在分析数据...' });

    try {
      const result = DataAnalyzer.analyzeWorksheet(currentWorksheet);
      setAnalysisResult(result);
      onAnalyzeComplete?.(result);
    } catch (error) {
      console.error('数据分析失败:', error);
    } finally {
      setIsAnalyzing(false);
      setLoading({ isLoading: false });
    }
  }, [currentWorksheet, setAnalysisResult, setLoading, onAnalyzeComplete]);

  // 渲染数据质量概览
  const renderQualityOverview = (quality: DataQuality) => (
    <Card title="数据质量概览" size="small">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="质量分数"
            value={quality.score}
            suffix="/100"
            valueStyle={{ color: quality.score >= 80 ? '#3f8600' : quality.score >= 60 ? '#cf1322' : '#cf1322' }}
          />
          <Progress
            percent={quality.score}
            strokeColor={quality.score >= 80 ? '#52c41a' : quality.score >= 60 ? '#faad14' : '#ff4d4f'}
            size="small"
          />
        </Col>
        <Col span={6}>
          <Statistic title="总行数" value={quality.summary.totalRows} />
        </Col>
        <Col span={6}>
          <Statistic title="总列数" value={quality.summary.totalCols} />
        </Col>
        <Col span={6}>
          <Statistic title="空值数量" value={quality.summary.emptyCells} />
        </Col>
      </Row>
      
      {quality.issues.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>质量问题</h4>
          {quality.issues.slice(0, 5).map((issue, index) => (
            <Alert
              key={index}
              message={issue.message}
              type={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}
              style={{ marginBottom: 8 }}
            />
          ))}
          {quality.issues.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <small>还有 {quality.issues.length - 5} 个问题...</small>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  // 渲染行分析
  const renderRowAnalysis = (rows: RowAnalysis[]) => {
    const columns = [
      {
        title: '行号',
        dataIndex: 'rowIndex',
        key: 'rowIndex',
        render: (index: number) => index + 1,
        width: 80
      },
      {
        title: '数值统计',
        key: 'numericStats',
        render: (record: RowAnalysis) => {
          const { numericSum, numericAvg, numericMin, numericMax } = record.stats;
          if (numericSum === undefined) return <Tag color="default">无数值</Tag>;
          
          return (
            <div>
              <div>总和: {numericSum?.toFixed(2)}</div>
              <div>平均: {numericAvg?.toFixed(2)}</div>
              <div>范围: {numericMin} ~ {numericMax}</div>
            </div>
          );
        }
      },
      {
        title: '数据类型',
        key: 'dataTypes',
        render: (record: RowAnalysis) => (
          <div>
            {Object.entries(record.stats.dataTypes).map(([type, count]) => (
              <Tag key={type} color="blue">{type}: {count}</Tag>
            ))}
          </div>
        )
      },
      {
        title: '趋势',
        key: 'trends',
        render: (record: RowAnalysis) => {
          if (!record.trends) return <Tag color="default">无趋势</Tag>;
          
          const color = record.trends.type === 'increasing' ? 'green' :
                       record.trends.type === 'decreasing' ? 'red' :
                       record.trends.type === 'stable' ? 'blue' : 'orange';
          
          return (
            <Tag color={color}>
              {record.trends.type} ({Math.round(record.trends.confidence * 100)}%)
            </Tag>
          );
        }
      },
      {
        title: '异常值',
        key: 'anomalies',
        render: (record: RowAnalysis) => {
          if (!record.anomalies || record.anomalies.outliers.length === 0) {
            return <Tag color="green">正常</Tag>;
          }
          return <Tag color="red">{record.anomalies.outliers.length} 个异常</Tag>;
        }
      }
    ];

    return (
      <Card title="行数据分析" size="small">
        <Table
          columns={columns}
          dataSource={rows.slice(0, 20)} // 只显示前20行
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 600 }}
        />
        {rows.length > 20 && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <small>显示前20行，共 {rows.length} 行数据</small>
          </div>
        )}
      </Card>
    );
  };

  // 渲染列分析
  const renderColumnAnalysis = (columns: ColumnAnalysis[]) => {
    const columnsConfig = [
      {
        title: '列名',
        dataIndex: 'header',
        key: 'header',
        width: 120
      },
      {
        title: '数据类型',
        dataIndex: 'dataType',
        key: 'dataType',
        render: (type: string) => {
          const color = type === 'numeric' ? 'green' : 
                       type === 'text' ? 'blue' : 
                       type === 'date' ? 'purple' : 
                       type === 'boolean' ? 'orange' : 'red';
          return <Tag color={color}>{type}</Tag>;
        }
      },
      {
        title: '统计信息',
        key: 'stats',
        render: (record: ColumnAnalysis) => {
          const { unique, duplicates, empty, min, max, avg } = record.stats;
          return (
            <div>
              <div>唯一值: {unique}</div>
              <div>重复值: {duplicates}</div>
              <div>空值: {empty}</div>
              {min !== undefined && <div>范围: {min} ~ {max}</div>}
              {avg !== undefined && <div>平均: {avg.toFixed(2)}</div>}
            </div>
          );
        }
      },
      {
        title: '数据质量',
        key: 'quality',
        render: (record: ColumnAnalysis) => (
          <div>
            <div>一致性: {record.quality.consistency}%</div>
            <div>完整性: {record.quality.completeness}%</div>
            <div>有效性: {record.quality.validity}%</div>
          </div>
        )
      }
    ];

    return (
      <Card title="列数据分析" size="small">
        <Table
          columns={columnsConfig}
          dataSource={columns}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 600 }}
        />
      </Card>
    );
  };

  if (!currentWorksheet) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <BarChartOutlined style={{ fontSize: '48px', color: '#ccc' }} />
          <p style={{ marginTop: 16, color: '#999' }}>请先上传Excel文件</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="data-analysis">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<BarChartOutlined />}
          onClick={handleAnalyze}
          loading={isAnalyzing}
        >
          开始分析
        </Button>
        {analysisResult && (
          <Button
            icon={<ReloadOutlined />}
            onClick={handleAnalyze}
            style={{ marginLeft: 8 }}
          >
            重新分析
          </Button>
        )}
      </div>

      {isAnalyzing && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>正在分析数据，请稍候...</p>
          </div>
        </Card>
      )}

      {analysisResult && !isAnalyzing && (
        <div>
          {renderQualityOverview(analysisResult.quality)}
          
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              {renderRowAnalysis(analysisResult.rows)}
            </Col>
            <Col span={12}>
              {renderColumnAnalysis(analysisResult.columns)}
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};
