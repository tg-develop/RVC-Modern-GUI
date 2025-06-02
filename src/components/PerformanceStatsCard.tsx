import React, { JSX, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import DragHandle from './DragHandle';

// Props for icons
interface PerformanceStatsCardProps {
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
}

function PerformanceStatsCard({ dndAttributes, dndListeners }: PerformanceStatsCardProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const performanceData: string[] = ["Vol", "Ping", "Total", "Perf", "MS"];
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";

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
            {performanceData.map(metric => 
                <span key={metric} className="text-xs font-medium text-slate-600 dark:text-gray-400">{metric}: <span className="text-slate-800 dark:text-gray-200">Value</span></span>
            )}
          </div>
          <div className="w-full h-48 bg-slate-200 dark:bg-gray-600 border border-slate-300 dark:border-gray-500 rounded-md flex justify-center items-center flex-grow">
              <span className="text-slate-500 dark:text-gray-400 italic">Line Diagram Placeholder</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceStatsCard; 