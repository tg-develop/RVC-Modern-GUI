import React, { JSX, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import DragHandle from './DragHandle';
import { RVCModelSlot } from '@dannadori/voice-changer-client-js';

// Props for icons
interface AudioSettingsCardProps {
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
  openModal: (type: string, props?: { modelId?: string; modelName?: string; model?: RVCModelSlot }) => void;
}

function AudioSettingsCard({ dndAttributes, dndListeners, openModal }: AudioSettingsCardProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const inputDevices: string[] = ["Default Input", "Microphone Array"];
  const outputDevices: string[] = ["Default Output", "Speakers"];
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
        <h4 className={headingClass}>Audio Settings</h4>
        <div className="flex space-x-1 items-center">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={iconButtonClass} title={isCollapsed ? "Expand" : "Collapse"}>
            <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="h-5 w-5" />
          </button>
          <DragHandle attributes={dndAttributes} listeners={dndListeners} title="Drag" />
        </div>
      </div>
      {!isCollapsed && (
        <div className="space-y-3">
          <div>
            <label htmlFor="volIn" className={commonLabelClass}>Vol. in:</label>
            <input type="range" id="volIn" name="volIn" min="10" max="250" defaultValue="100" className={commonRangeClass} />
            <p className={commonSliderValueClass}>100%</p>
          </div>
          <div>
            <label htmlFor="volOut" className={commonLabelClass}>Vol. out:</label>
            <input type="range" id="volOut" name="volOut" min="10" max="400" defaultValue="100" className={commonRangeClass} />
            <p className={commonSliderValueClass}>100%</p>
          </div>
          <div>
            <label htmlFor="volMon" className={commonLabelClass}>Vol. mon:</label>
            <input type="range" id="volMon" name="volMon" min="10" max="400" defaultValue="100" className={commonRangeClass} />
            <p className={commonSliderValueClass}>100%</p>
          </div>
          <div>
            <label htmlFor="inputCh" className={commonLabelClass}>Input Ch.:</label>
            <select id="inputCh" name="inputCh" className={commonSelectClass}>
              {inputDevices.map(device => <option key={device} value={device}>{device}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="outputCh" className={commonLabelClass}>Output Ch.:</label>
            <select id="outputCh" name="outputCh" className={commonSelectClass}>
              {outputDevices.map(device => <option key={device} value={device}>{device}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="monCh" className={commonLabelClass}>Mon Ch.:</label>
            <select id="monCh" name="monCh" className={commonSelectClass}>
              {outputDevices.map(device => <option key={device} value={device}>{device}</option>)}
            </select>
          </div>
          <div className="text-right pt-2">
            <label className={checkboxLabelClass + " justify-end"}><input type="checkbox" name="enableMon" className={checkboxClass} /> Enable Mon.</label>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioSettingsCard; 