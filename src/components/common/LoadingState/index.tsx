/**
 * 增强的加载状态组件
 */

import React from 'react';
import { Spin, Progress, Card, Typography } from 'antd';
import { LoadingOutlined, FileExcelOutlined, BarChartOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingStateProps {
  loading: boolean;
  progress?: number;
  message?: string;
  type?: 'file' | 'analysis' | 'export' | 'general';
  size?: 'small' | 'default' | 'large';
}

const LoadingIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case 'file':
      return <FileExcelOutlined style={{ fontSize: 24 }} spin />;
    case 'analysis':
      return <BarChartOutlined style={{ fontSize: 24 }} spin />;
    default:
      return <LoadingOutlined style={{ fontSize: 24 }} spin />;
  }
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  progress,
  message,
  type = 'general',
  size = 'default'
}) => {
  if (!loading) return null;

  const getDefaultMessage = () => {
    switch (type) {
      case 'file':
        return '正在解析Excel文件...';
      case 'analysis':
        return '正在分析数据...';
      case 'export':
        return '正在导出数据...';
      default:
        return '加载中...';
    }
  };

  const displayMessage = message || getDefaultMessage();

  return (
    <div className="loading-state">
      <Card 
        style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          maxWidth: 400,
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Spin 
            indicator={<LoadingIcon type={type} />} 
            size={size}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            {displayMessage}
          </Text>
        </div>

        {progress !== undefined && (
          <div style={{ marginBottom: 16 }}>
            <Progress
              percent={Math.round(progress)}
              status={progress >= 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {Math.round(progress)}% 完成
            </Text>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            请稍候，正在处理您的请求...
          </Text>
        </div>
      </Card>
    </div>
  );
};

// 全屏加载组件
interface FullScreenLoadingProps {
  loading: boolean;
  message?: string;
  type?: 'file' | 'analysis' | 'export' | 'general';
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  loading,
  message,
  type
}) => {
  if (!loading) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <LoadingState 
        loading={true} 
        message={message} 
        type={type} 
        size="large"
      />
    </div>
  );
};

// 内联加载组件
interface InlineLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  loading,
  children,
  message
}) => {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {loading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Spin size="small" />
            {message && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {message}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

