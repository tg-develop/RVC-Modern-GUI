import React, { JSX, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import DragHandle from './DragHandle';

// Props for icons
interface AiSettingsCardProps {
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
}

function AiSettingsCard({ dndAttributes, dndListeners }: AiSettingsCardProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const gpuOptions: string[] = ["GPU 1", "GPU 2", "Not Set"];
  const commonSelectClass = "w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm transition-colors duration-150";
  const commonRangeClass = "w-full h-2 bg-slate-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400 transition-colors duration-150";
  const commonLabelClass = "block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1";
  const commonSliderValueClass = "text-xs text-slate-600 dark:text-gray-400 text-right";
  const checkboxLabelClass = "flex items-center text-sm text-slate-700 dark:text-gray-300";
  const checkboxClass = "mr-2 accent-blue-500 dark:accent-blue-400";
  const headingClass = "text-lg font-semibold text-slate-700 dark:text-gray-200";
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";

  return (
    <div className={`p-4 border border-slate-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 flex-1 min-h-0 flex flex-col ${isCollapsed ? 'h-auto' : 'overflow-y-auto'}`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-gray-700">
        <h4 className={headingClass}>AI Settings</h4>
        <div className="flex space-x-1 items-center">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={iconButtonClass} title={isCollapsed ? "Expand" : "Collapse"}>
            <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="h-5 w-5" />
          </button>
          <DragHandle attributes={dndAttributes} listeners={dndListeners} title="Drag" />
        </div>
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-3">
            <div>
              <label className={commonLabelClass}>Noise:</label>
              <div className="space-y-1">
                <label className={checkboxLabelClass}><input type="checkbox" name="noise" value="echo" className={checkboxClass} /> Echo</label>
                <label className={checkboxLabelClass}><input type="checkbox" name="noise" value="sup1" className={checkboxClass} /> Sup1</label>
                <label className={checkboxLabelClass}><input type="checkbox" name="noise" value="sup2" className={checkboxClass} /> Sup2</label>
              </div>
            </div>
            <div>
              <label htmlFor="fo" className={commonLabelClass}>FO:</label>
              <select id="fo" name="fo" className={commonSelectClass}>
                <option value="option1">Option 1</option>
              </select>
            </div>
            <div>
              <label htmlFor="inSens" className={commonLabelClass}>In. Sens:</label>
              <input type="range" id="inSens" name="inSens" min="-90" max="-60" defaultValue="-75" className={commonRangeClass} />
              <p className={commonSliderValueClass}>-75 DB</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="chunk" className={commonLabelClass}>Chunk:</label>
              <input type="range" id="chunk" name="chunk" min="2.7" max="2730.7" step="0.1" defaultValue="100" className={commonRangeClass} />
              <p className={commonSliderValueClass}>100 ms</p>
            </div>
            <div>
              <label htmlFor="extra" className={commonLabelClass}>Extra:</label>
              <input type="range" id="extra" name="extra" min="0" max="5" step="0.1" defaultValue="1" className={commonRangeClass} />
              <p className={commonSliderValueClass}>1.0 s</p>
            </div>
            <div>
              <label htmlFor="gpu" className={commonLabelClass}>GPU:</label>
              <select id="gpu" name="gpu" className={commonSelectClass}>
                {gpuOptions.map(gpu => <option key={gpu} value={gpu}>{gpu}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiSettingsCard; 