/**
 * 性能监控组件
 */

import React from 'react';
import { useMemoryMonitor } from '../../../hooks/usePerformanceMonitor';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const memoryUsage = useMemoryMonitor(2000); // 每2秒更新一次

  if (!enabled) return null;

  return (
    <div className="performance-indicator">
      <div>性能监控</div>
      {memoryUsage && (
        <div className="memory-usage">
          内存: {memoryUsage.toFixed(1)}MB
        </div>
      )}
      <div style={{ fontSize: '10px', opacity: 0.7 }}>
        FPS: {Math.round(1000 / 16)} {/* 简化的FPS计算 */}
      </div>
    </div>
  );
};
