/**
 * 文件上传组件
 */

import React, { useCallback } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined, FileExcelOutlined } from '@ant-design/icons';
import { ExcelParser } from '../../../utils/excelParser';
import { useExcelStore } from '../../../stores/excelStore';

const { Dragger } = Upload;

interface FileUploadProps {
  onFileUploaded?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const { setExcelData, setLoading, setError } = useExcelStore();

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // 验证文件
      const validation = ExcelParser.validateFile(file);
      if (!validation.valid) {
        message.error(validation.error);
        return false;
      }

      setLoading({ isLoading: true, message: '正在解析文件...' });

      // 解析文件
      const excelData = await ExcelParser.parseFile(file);
      setExcelData(excelData);
      
      message.success(`文件 "${file.name}" 解析成功！`);
      onFileUploaded?.();
      
      return false; // 阻止默认上传行为
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '文件解析失败';
      setError({ hasError: true, message: errorMessage });
      message.error(errorMessage);
      return false;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [setExcelData, setLoading, setError, onFileUploaded]);

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: handleFileUpload,
    showUploadList: false,
    accept: '.xlsx,.xls,.csv',
  };

  return (
    <div className="file-upload-container">
      <Dragger {...uploadProps} className="file-upload-dragger">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持 Excel (.xlsx, .xls) 和 CSV 格式文件
        </p>
        <div className="upload-example">
          <FileExcelOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        </div>
      </Dragger>
      
      <div className="upload-tips">
        <h4>使用说明：</h4>
        <ul>
          <li>支持 .xlsx、.xls、.csv 格式文件</li>
          <li>文件大小限制：50MB</li>
          <li>支持多工作表Excel文件</li>
          <li>自动识别数据类型和格式</li>
        </ul>
      </div>
    </div>
  );
};
