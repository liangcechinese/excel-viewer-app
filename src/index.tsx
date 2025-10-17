import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// 性能监控
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// 发送性能指标到控制台或分析服务
const sendToAnalytics = (metric: any) => {
  // 在开发环境中输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }
  
  // 在生产环境中可以发送到分析服务
  if (process.env.REACT_APP_ENABLE_ANALYTICS === 'true') {
    // 这里可以集成Google Analytics或其他分析服务
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_category: 'Web Vitals',
    //   non_interaction: true,
    // });
  }
};

// 监控关键性能指标
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);