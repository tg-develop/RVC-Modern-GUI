import React, { JSX, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faPlayCircle, faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DragHandle from './DragHandle';
import { useThemeContext } from '../context/ThemeContext';

// Define types for the context data
interface PerformanceMetrics {
  vol: number;
  responseTime: number;
  mainprocessTime: number;
}

interface ServerSettings {
  serverReadChunkSize: number;
  crossFadeOverlapSize: number;
}

interface AppPerformanceContextType {
  performance: PerformanceMetrics;
  serverSetting: { serverSetting: ServerSettings };
}

// Mock Context (replace with actual context)
const usePerformanceContext = (): AppPerformanceContextType => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics>({
    vol: 0.5,
    responseTime: 30,
    mainprocessTime: 12,
  });
  const serverSettingData = {
    serverSetting: {
      serverReadChunkSize: 64,
      crossFadeOverlapSize: 0.020,
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData({
        vol: Math.random() * 0.9 + 0.1,
        responseTime: 20 + Math.random() * 30,
        mainprocessTime: 5 + Math.random() * 250,
      });
    }, 200); // User changed interval
    return () => clearInterval(interval);
  }, []);

  return { performance: performanceData, serverSetting: serverSettingData };
};

interface PerformanceStatsCardProps {
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
}

const DEFAULT_MAX_CHART_DATA_POINTS = 50;

interface ChartDataPoint {
  timestamp: number;
  mainprocessTime: number; // Rounded value
  greenTime?: number;
  yellowTime?: number;
  redTime?: number;
}

type PerfStatus = 'good' | 'warning' | 'critical';

interface CalculatedMetricValues {
  volumeDb: number;
  ping: number;
  totalLatencyTime: number;
  perfTime: number;
  chunkTime: number;
  perfStatus: PerfStatus;
}

interface RecordedDataEntry extends CalculatedMetricValues {
  timestamp: number;
  perfValueString: string; // e.g., "15ms of 30ms"
}

const PERF_TEXT_CLASSES: Record<PerfStatus, string> = {
  good: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  critical: 'text-red-600 dark:text-red-400',
};

const PERF_FILL_HEX: Record<PerfStatus, string> = {
  good: '#10B981',     // emerald-500
  warning: '#F59E0B',  // amber-500
  critical: '#EF4444', // red-500
};

const CHART_LINE_COLOR_LIGHT_HEX = '#475569'; // slate-600
const CHART_LINE_COLOR_DARK_HEX = '#cbd5e1'; // slate-300

function PerformanceStatsCard({ dndAttributes, dndListeners }: PerformanceStatsCardProps): JSX.Element {
  const theme = useThemeContext();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const performanceMetricKeys: string[] = ["Vol", "Ping", "Total", "Perf"];
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";

  const { performance, serverSetting } = usePerformanceContext();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [maxDataPoints, setMaxDataPoints] = useState(DEFAULT_MAX_CHART_DATA_POINTS);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<RecordedDataEntry[]>([]);

  const calculatedMetrics = useMemo((): CalculatedMetricValues => {
    if (!performance || !serverSetting?.serverSetting) {
      return {
        volumeDb: -90, ping: 0, totalLatencyTime: 0, perfTime: 0, chunkTime: 0, perfStatus: 'good',
      };
    }

    const volumeDb = Math.max(Math.round(20 * Math.log10(performance.vol || 0.00001)), -90);
    const chunkTime = ((serverSetting.serverSetting.serverReadChunkSize * 128 * 1000) / 48000);
    const totalLatencyTime = Math.ceil(chunkTime + performance.responseTime + serverSetting.serverSetting.crossFadeOverlapSize * 1000);
    
    let perfStatus: PerfStatus = 'good';
    if (performance.mainprocessTime > chunkTime) {
        perfStatus = 'critical';
    } else if (performance.mainprocessTime * 1.2 > chunkTime) {
        perfStatus = 'warning';
    }

    return {
      volumeDb,
      ping: performance.responseTime,
      totalLatencyTime,
      perfTime: performance.mainprocessTime,
      chunkTime,
      perfStatus,
    };
  }, [performance, serverSetting]);

  useEffect(() => {
    if (!performance || !serverSetting?.serverSetting) return;

    const { perfStatus, perfTime, chunkTime } = calculatedMetrics;
    const roundedMainProcessTime = Math.round(perfTime);
    let gt = 0, yt = 0, rt = 0;

    if (perfStatus === 'good') gt = roundedMainProcessTime;
    else if (perfStatus === 'warning') yt = roundedMainProcessTime;
    else if (perfStatus === 'critical') rt = roundedMainProcessTime;

    const newDataPoint: ChartDataPoint = {
      timestamp: Date.now(),
      mainprocessTime: roundedMainProcessTime,
      greenTime: gt, yellowTime: yt, redTime: rt,
    };

    setChartData(prevData => {
      const newChartData = [...prevData, newDataPoint];
      return newChartData.length > maxDataPoints ? newChartData.slice(newChartData.length - maxDataPoints) : newChartData;
    });

    if (isRecording) {
      setRecordedData(prev => [...prev, {
        timestamp: newDataPoint.timestamp,
        ...calculatedMetrics,
        perfValueString: `${Math.round(perfTime)}ms of ${Math.round(chunkTime)}ms`
      }]);
    }
  }, [performance, serverSetting, calculatedMetrics, maxDataPoints, isRecording]);

  const displayValues: Record<string, { value: string | number; unit?: string; className?: string }> = {
    Vol: { value: calculatedMetrics.volumeDb, unit: 'dB' },
    Ping: { value: Math.round(calculatedMetrics.ping), unit: 'ms' },
    Total: { value: Math.round(calculatedMetrics.totalLatencyTime), unit: 'ms' },
    Perf: { 
      value: `${Math.round(calculatedMetrics.perfTime)}ms of ${Math.round(calculatedMetrics.chunkTime)}ms`, 
      className: PERF_TEXT_CLASSES[calculatedMetrics.perfStatus]
    },
  };

  const downloadLogFile = useCallback(() => {
    if (recordedData.length === 0) return;
    const header = "Timestamp,DateTime,Volume_dB,Ping_ms,TotalLatency_ms,PerfValue_ms,PerfChunk_ms,PerfStatus\n";
    const logContent = recordedData.map(entry => 
      `${entry.timestamp},${new Date(entry.timestamp).toISOString()},${entry.volumeDb},${Math.round(entry.ping)},${Math.round(entry.totalLatencyTime)},${Math.round(entry.perfTime)},${Math.round(entry.chunkTime)},${entry.perfStatus}`
    ).join("\n");
    
    const blob = new Blob([header + logContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `performance_log_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setRecordedData([]); // Clear data after download
  }, [recordedData]);

  const handleRecordToggle = () => {
    if (isRecording) {
      downloadLogFile();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className={`p-4 border border-slate-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 flex-1 min-h-0 flex flex-col ${isCollapsed ? 'h-auto' : ''}`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-gray-700">
        <h5 className="text-lg font-semibold text-slate-700 dark:text-gray-200">Performance Stats</h5>
        <div className="flex space-x-1 items-center">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={iconButtonClass} title={isCollapsed ? "Expand" : "Collapse"}>
            <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="h-5 w-5" />
          </button>
          <DragHandle attributes={dndAttributes} listeners={dndListeners} title="Drag" />
        </div>
      </div>
      {!isCollapsed && (
        <div className="flex-grow flex flex-col items-center">
          <div className="flex justify-around w-full mb-3">
            {performanceMetricKeys.map(metricKey => {
              const metricInfo = displayValues[metricKey];
              return (
                <span key={metricKey} className="text-xs font-medium text-slate-600 dark:text-gray-400">
                  {metricKey}:{' '}
                  <span className={`text-slate-800 dark:text-gray-200 ${metricInfo.className || ''}`}>
                    {metricInfo.value}
                    {metricInfo.unit || ''}
                  </span>
                </span>
              );
            })}
          </div>

          <div className="flex justify-between items-center mb-2 w-full px-1">
            <button
                onClick={handleRecordToggle}
                className={`px-2 py-1 text-xs rounded flex items-center space-x-1.5 transition-colors duration-150 ${
                    isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
                }`}
                title={isRecording ? "Stop Recording & Download CSV" : "Start Recording Performance Log"}
            >
                <FontAwesomeIcon icon={isRecording ? faStopCircle : faPlayCircle} className="h-3 w-3" />
                <span>{isRecording ? 'Stop' : 'Record'}</span>
            </button>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 dark:text-gray-400 self-center">History:</span>
                {[20, 50, 100].map(num => (
                    <button
                        key={num}
                        onClick={() => setMaxDataPoints(num)}
                        className={`px-2 py-0.5 text-xs rounded ${maxDataPoints === num ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 text-slate-700 dark:text-gray-200'}`}
                    >
                        {num}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="w-full h-48 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-500 rounded-md flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(unixTime: number) => new Date(unixTime).toLocaleTimeString()} 
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} 
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: number) => String(Math.round(value))}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#475569', borderRadius: '0.375rem' }}
                  labelStyle={{ color: '#e2e8f0', marginBottom: '4px' }}
                  itemStyle={{ color: '#cbd5e1', paddingTop: '2px', paddingBottom: '2px' }}
                  formatter={(value: number | string, name: string) => {
                    if (name === 'Main Process Time' && typeof value === 'number') {
                        return [Math.round(value) + ' ms', name];
                    }
                    if (name.startsWith('Perf (')) return null; 
                    return [value, name];
                  }}
                  labelFormatter={(label: number) => `Time: ${new Date(label).toLocaleTimeString()}`}
                />
                <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
                
                <Area type="monotone" dataKey="greenTime" stroke="none" fill={PERF_FILL_HEX.good} stackId="perfArea" fillOpacity={0.4} name="Perf (Good)" legendType="none" />
                <Area type="monotone" dataKey="yellowTime" stroke="none" fill={PERF_FILL_HEX.warning} stackId="perfArea" fillOpacity={0.4} name="Perf (Warning)" legendType="none" />
                <Area type="monotone" dataKey="redTime" stroke="none" fill={PERF_FILL_HEX.critical} stackId="perfArea" fillOpacity={0.4} name="Perf (Critical)" legendType="none" />
                
                <Line type="monotone" dataKey="mainprocessTime" stroke={theme.theme === 'dark' ? CHART_LINE_COLOR_DARK_HEX : CHART_LINE_COLOR_LIGHT_HEX} strokeWidth={1} dot={false} name="Main Process Time" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceStatsCard; 