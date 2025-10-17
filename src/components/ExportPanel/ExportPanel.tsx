/**
 * 导出面板组件
 */

import React, { useState, useCallback } from 'react';
import { Modal, Form, Select, Radio, Checkbox, Input, Button, message, Divider } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { ExportHelper } from '../../utils/exportHelper';
import { useExcelStore } from '../../stores/excelStore';
import { ExportOptions } from '../../types/excel';

const { Option } = Select;

interface ExportPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ visible, onClose }) => {
  const { excelData, currentWorksheet, selection } = useExcelStore();
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);

  // 处理导出
  const handleExport = useCallback(async () => {
    if (!excelData || !currentWorksheet) return;

    try {
      const values = await form.validateFields();
      const options: ExportOptions = {
        format: values.format,
        range: values.range,
        includeHeaders: values.includeHeaders,
        selectedColumns: values.selectedColumns,
        fileName: values.fileName || ExportHelper.generateFileName(excelData, values)
      };

      const blob = await ExportHelper.exportData(excelData, options, selection || undefined);
      ExportHelper.downloadFile(blob, options.fileName!);
      
      message.success('导出成功！');
      onClose();
    } catch (error) {
      message.error('导出失败：' + (error as Error).message);
    }
  }, [excelData, currentWorksheet, selection, form, onClose]);

  // 处理预览
  const handlePreview = useCallback(async () => {
    if (!excelData || !currentWorksheet) return;

    try {
      const values = await form.validateFields();
      const options: ExportOptions = {
        format: values.format,
        range: values.range,
        includeHeaders: values.includeHeaders,
        selectedColumns: values.selectedColumns
      };

      const blob = await ExportHelper.exportData(excelData, options, selection || undefined);
      const text = await blob.text();
      
      if (values.format === 'json') {
        const jsonData = JSON.parse(text);
        setPreviewData([Object.keys(jsonData[0] || {}), ...jsonData.slice(0, 5)]);
      } else if (values.format === 'csv') {
        const lines = text.split('\n').slice(0, 6);
        setPreviewData(lines.map(line => line.split(',')));
      } else {
        setPreviewData([]);
      }

      const size = ExportHelper.estimateFileSize(currentWorksheet, options, selection || undefined);
      setEstimatedSize(size);
    } catch (error) {
      message.error('预览失败：' + (error as Error).message);
    }
  }, [excelData, currentWorksheet, selection, form]);

  // 处理格式变化
  const handleFormatChange = useCallback((format: string) => {
    form.setFieldsValue({ format });
  }, [form]);

  // 处理范围变化
  const handleRangeChange = useCallback((range: string) => {
    form.setFieldsValue({ range });
  }, [form]);

  if (!excelData || !currentWorksheet) return null;

  return (
    <Modal
      title="导出数据"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="preview" icon={<EyeOutlined />} onClick={handlePreview}>
          预览
        </Button>,
        <Button key="export" type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          导出
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          format: 'xlsx',
          range: 'all',
          includeHeaders: true,
          fileName: ExportHelper.generateFileName(excelData, { format: 'xlsx', range: 'all', includeHeaders: true })
        }}
      >
        <Form.Item label="导出格式" name="format" rules={[{ required: true }]}>
          <Select onChange={handleFormatChange}>
            <Option value="xlsx">Excel (.xlsx)</Option>
            <Option value="csv">CSV (.csv)</Option>
            <Option value="json">JSON (.json)</Option>
          </Select>
        </Form.Item>

        <Form.Item label="导出范围" name="range" rules={[{ required: true }]}>
          <Radio.Group onChange={(e) => handleRangeChange(e.target.value)}>
            <Radio value="all">全部数据</Radio>
            <Radio value="current" disabled={!currentWorksheet}>当前视图</Radio>
            <Radio value="selected" disabled={!selection}>选中区域</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="导出选项">
          <Checkbox.Group>
            <Checkbox name="includeHeaders" value={true}>
              包含表头
            </Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="选择列" name="selectedColumns">
          <Checkbox.Group>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {currentWorksheet.headers?.map((header, index) => (
                <div key={index}>
                  <Checkbox value={index}>{header}</Checkbox>
                </div>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item label="文件名" name="fileName">
          <Input placeholder="请输入文件名" />
        </Form.Item>

        {estimatedSize > 0 && (
          <Form.Item label="预估文件大小">
            <div style={{ color: '#666' }}>
              {estimatedSize < 1024 ? `${estimatedSize} B` :
               estimatedSize < 1024 * 1024 ? `${(estimatedSize / 1024).toFixed(1)} KB` :
               `${(estimatedSize / 1024 / 1024).toFixed(1)} MB`}
            </div>
          </Form.Item>
        )}
      </Form>

      {previewData.length > 0 && (
        <>
          <Divider>预览数据</Divider>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          border: '1px solid #d9d9d9',
                          padding: '4px 8px',
                          fontSize: '12px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxWidth: '200px',
                          verticalAlign: 'top'
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
            <small>显示前5行数据</small>
          </div>
        </>
      )}
    </Modal>
  );
};
