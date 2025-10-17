/**
 * 性能监控Hook
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
  logToConsole?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions) => {
  const { componentName, enabled = true, logToConsole = false, onMetricsUpdate } = options;
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // 开始渲染计时
  const startRender = useCallback(() => {
    if (enabled) {
      renderStartTime.current = performance.now();
    }
  }, [enabled]);

  // 结束渲染计时
  const endRender = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;

    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    };

    // 获取内存使用情况（如果支持）
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    if (logToConsole) {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        memoryUsage: metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(2)}MB` : 'N/A'
      });
    }

    onMetricsUpdate?.(metrics);
    renderStartTime.current = 0;
  }, [enabled, componentName, logToConsole, onMetricsUpdate]);

  // 监控组件渲染
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return {
    startRender,
    endRender,
    renderCount: renderCount.current
  };
};

// 内存使用监控Hook
export const useMemoryMonitor = (interval: number = 5000) => {
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    if (!('memory' in performance)) {
      return;
    }

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      setMemoryUsage(memory.usedJSHeapSize / 1024 / 1024); // MB
    };

    updateMemoryUsage();
    const intervalId = setInterval(updateMemoryUsage, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryUsage;
};

// 大数据量处理Hook
export const useLargeDataHandler = <T>(
  data: T[],
  chunkSize: number = 1000,
  delay: number = 16
) => {
  const [processedData, setProcessedData] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processData = useCallback(async () => {
    if (data.length <= chunkSize) {
      setProcessedData(data);
      setProgress(100);
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    const result: T[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      result.push(...chunks[i]);
      setProgress(Math.round(((i + 1) / chunks.length) * 100));
      
      // 让出控制权，避免阻塞UI
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setProcessedData(result);
    setIsProcessing(false);
  }, [data, chunkSize, delay]);

  useEffect(() => {
    processData();
  }, [processData]);

  return {
    processedData,
    isProcessing,
    progress,
    reprocess: processData
  };
};
