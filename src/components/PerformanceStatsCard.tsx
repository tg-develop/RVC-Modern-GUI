import React, { JSX, useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faPlayCircle, faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DragHandle from './Helpers/DragHandle';
import { useThemeContext } from '../context/ThemeContext';
import { useAppState } from '../context/AppContext';
import CustomTooltip from './Helpers/Tooltip';

// Define types for the performance data
interface PerformanceMetrics {
  vol: number;
  responseTime: number;
  mainprocessTime: number;
}

interface ServerSettings {
  serverReadChunkSize: number;
  crossFadeOverlapSize: number;
}

interface PerformanceStatsCardProps {
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
}

const DEFAULT_MAX_CHART_DATA_POINTS = 50;

interface ChartDataPoint {
  timestamp: number;
  perfTimeValue: number; // Stores mainprocessTime (perfTime) for the chart's Y-axis
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

const LATENCY_STATUS_FILL_HEX: Record<PerfStatus, string> = {
  good: '#10B981',     // emerald-500
  warning: '#F59E0B',  // amber-500
  critical: '#EF4444', // red-500
};

const CHART_LINE_COLOR_LIGHT_HEX = '#475569'; // slate-600
const CHART_LINE_COLOR_DARK_HEX = '#cbd5e1'; // slate-300

const DEFAULT_PERFORMANCE_METRICS: PerformanceMetrics = {
  vol: 0.01, // Default to very low volume to avoid log(0)
  responseTime: 0,
  mainprocessTime: 0
};

function PerformanceStatsCard({ dndAttributes, dndListeners }: PerformanceStatsCardProps): JSX.Element {
  const theme = useThemeContext();
  const appState = useAppState();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const performanceMetricKeys: string[] = ["Vol", "Ping", "Total", "Perf"];
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";

  // Memoize performance data from appState, providing defaults
  const currentPerformance = useMemo((): PerformanceMetrics => {
    // Assuming these are direct properties on appState based on previous hook's access patterns
    // and user's mention of appState.performance (which might mean stats *within* appState)
    return {
      vol: (appState as any).inputVolume ?? DEFAULT_PERFORMANCE_METRICS.vol,
      responseTime: (appState as any).responseTime ?? DEFAULT_PERFORMANCE_METRICS.responseTime,
      mainprocessTime: (appState as any).mainprocessTime ?? DEFAULT_PERFORMANCE_METRICS.mainprocessTime,
    };
  }, [appState]);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [maxDataPoints, setMaxDataPoints] = useState(DEFAULT_MAX_CHART_DATA_POINTS);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<RecordedDataEntry[]>([]);

  //Calculate the next DataPoint
  const calculatedMetrics = useMemo((): CalculatedMetricValues => {
    const volumeDb = Math.max(Math.round(20 * Math.log10(appState.performance.vol || 0.00001)), -90);
    const chunkTime = ((appState.serverSetting.serverSetting.serverReadChunkSize * 128 * 1000) / 48000); // Assuming 48kHz sample rate, 128 samples per frame for chunk size unit
    const totalLatencyTime = Math.ceil(chunkTime + appState.performance.responseTime + appState.serverSetting.serverSetting.crossFadeOverlapSize * 1000);

    let perfStatus: PerfStatus = 'good';
    const eightyPercentChunkTime = 0.8 * chunkTime;
    if (appState.performance.mainprocessTime > chunkTime) {
        perfStatus = 'critical';
    } else if (appState.performance.mainprocessTime > eightyPercentChunkTime) { // totalLatencyTime <= chunkTime is implicit
        perfStatus = 'warning';
    }

    return {
      volumeDb,
      ping: appState.performance.responseTime,
      totalLatencyTime,
      perfTime: appState.performance.mainprocessTime, // This is the original mainprocessTime
      chunkTime,
      perfStatus,
    };
  }, [currentPerformance, appState.serverSetting.serverSetting]);

  //Format DataPoint into ChartDataPoint
  useEffect(() => {
    const { perfStatus, perfTime } = calculatedMetrics;

    const roundedPerfTime = Math.round(perfTime);
    let gt = 0, yt = 0, rt = 0;

    if (perfStatus === 'good') gt = roundedPerfTime;
    else if (perfStatus === 'warning') yt = roundedPerfTime;
    else if (perfStatus === 'critical') rt = roundedPerfTime;

    const newDataPoint: ChartDataPoint = {
      timestamp: Date.now(),
      perfTimeValue: roundedPerfTime, // Use the rounded perfTime for the chart line
      greenTime: gt, yellowTime: yt, redTime: rt,
    };

    //Add DataPoint to ChartData
    setChartData(prevData => {
      const newChartData = [...prevData, newDataPoint];
      return newChartData.length > maxDataPoints ? newChartData.slice(newChartData.length - maxDataPoints) : newChartData;
    });

    //Add DataPoint to RecordedData
    if (isRecording) {
      setRecordedData(prev => [...prev, {
        timestamp: newDataPoint.timestamp,
        ...calculatedMetrics,
        perfValueString: `${Math.round(calculatedMetrics.totalLatencyTime)}ms of ${Math.round(calculatedMetrics.chunkTime)}ms`
      }]);
    }
  }, [calculatedMetrics, maxDataPoints, isRecording]);

  const displayValues: Record<string, { value: string | number; unit?: string; className?: string }> = {
    Vol: { value: calculatedMetrics.volumeDb, unit: 'dB' },
    Ping: { value: Math.round(calculatedMetrics.ping), unit: 'ms' },
    Total: { value: Math.round(calculatedMetrics.totalLatencyTime), unit: 'ms' },
    Perf: { // Display mainprocessTime (perfTime) vs chunkTime, colored by perfStatus
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
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
                
                {/* Area Charts für Hintergrund-Farbcodierung (ohne Tooltip-Anzeige) */}
                <Area 
                  type="monotone" 
                  dataKey="greenTime" 
                  stroke="none" 
                  fill={LATENCY_STATUS_FILL_HEX.good} 
                  stackId="perfArea" 
                  fillOpacity={0.4} 
                  name="" 
                  legendType="none" 
                />
                <Area 
                  type="monotone" 
                  dataKey="yellowTime" 
                  stroke="none" 
                  fill={LATENCY_STATUS_FILL_HEX.warning} 
                  stackId="perfArea" 
                  fillOpacity={0.4} 
                  name="" 
                  legendType="none" 
                />
                <Area 
                  type="monotone" 
                  dataKey="redTime" 
                  stroke="none" 
                  fill={LATENCY_STATUS_FILL_HEX.critical} 
                  stackId="perfArea" 
                  fillOpacity={0.4} 
                  name="" 
                  legendType="none" 
                />
                
                {/* Hauptlinie für MainProcessTime */}
                <Line 
                  type="monotone" 
                  dataKey="perfTimeValue" 
                  stroke={theme.theme === 'dark' ? CHART_LINE_COLOR_DARK_HEX : CHART_LINE_COLOR_LIGHT_HEX} 
                  strokeWidth={2} 
                  dot={false} 
                  name="Main Process Time" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceStatsCard;