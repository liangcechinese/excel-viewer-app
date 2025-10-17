/**
 * 增强的错误边界组件
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Card, Collapse, Typography } from 'antd';
import { ReloadOutlined, BugOutlined, CloseOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // 调用外部错误处理函数
    this.props.onError?.(error, errorInfo);

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 可以在这里添加错误上报逻辑
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 模拟错误上报
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.retryCount
    };

    console.log('Error Report:', errorReport);
    
    // 这里可以发送到错误监控服务
    // sendErrorToService(errorReport);
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    }
  };

  private handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="error-boundary">
          <Result
            status="error"
            title="应用出现错误"
            subTitle="抱歉，应用遇到了一个错误。我们已经记录了这个问题。"
            extra={[
              canRetry && (
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={this.handleRetry}
                  key="retry"
                >
                  重试 ({this.maxRetries - this.retryCount} 次机会)
                </Button>
              ),
              <Button 
                icon={<CloseOutlined />} 
                onClick={this.handleReset}
                key="reset"
              >
                重置
              </Button>,
              <Button 
                icon={<ReloadOutlined />} 
                onClick={this.handleReload}
                key="reload"
              >
                刷新页面
              </Button>
            ].filter(Boolean)}
          />

          <Card 
            title={
              <span>
                <BugOutlined /> 错误详情
              </span>
            }
            size="small"
            style={{ marginTop: 16, maxWidth: 800, margin: '16px auto' }}
          >
            <Collapse defaultActiveKey={['basic']}>
              <Panel header="基本信息" key="basic">
                <div style={{ marginBottom: 8 }}>
                  <Text strong>错误ID:</Text> <Text code>{errorId}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>错误信息:</Text> <Text>{error?.message}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>发生时间:</Text> <Text>{new Date().toLocaleString()}</Text>
                </div>
                <div>
                  <Text strong>重试次数:</Text> <Text>{this.retryCount}/{this.maxRetries}</Text>
                </div>
              </Panel>

              <Panel header="错误堆栈" key="stack">
                <Paragraph>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4,
                    fontSize: 12,
                    overflow: 'auto',
                    maxHeight: 200
                  }}>
                    {error?.stack}
                  </pre>
                </Paragraph>
              </Panel>

              <Panel header="组件堆栈" key="component">
                <Paragraph>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4,
                    fontSize: 12,
                    overflow: 'auto',
                    maxHeight: 200
                  }}>
                    {errorInfo?.componentStack}
                  </pre>
                </Paragraph>
              </Panel>
            </Collapse>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

