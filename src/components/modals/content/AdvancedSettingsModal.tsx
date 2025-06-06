import React, { JSX, useState, useEffect } from 'react';
import { useAppState } from '../../../context/AppContext';
import { useUIContext } from '../../../context/UIContext';
import DebouncedSlider from '../../DebouncedSlider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Protocol } from '@dannadori/voice-changer-client-js';

function AdvancedSettingsModal(): JSX.Element {
  const appState = useAppState();
  const uiState = useUIContext();
  
  // Local state for immediate slider feedback
  const [localCrossFadeOverlapSize, setLocalCrossFadeOverlapSize] = useState<number>(
    appState.serverSetting?.serverSetting?.crossFadeOverlapSize ?? 0.02
  );
  const [localProtect, setLocalProtect] = useState<number>(
    appState.serverSetting?.serverSetting?.protect ?? 0
  );

  // Update local state when server settings change
  useEffect(() => {
    const crossFade = appState.serverSetting?.serverSetting?.crossFadeOverlapSize;
    if (crossFade != null) setLocalCrossFadeOverlapSize(crossFade);
    
    const protect = appState.serverSetting?.serverSetting?.protect;
    if (protect != null) setLocalProtect(protect);
  }, [appState.serverSetting?.serverSetting]);

  const commonLabelClass = "block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1";
  const commonSelectClass = "w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm transition-colors duration-150";
  const commonRangeClass = "w-full h-2 bg-slate-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400 transition-colors duration-150";
  const commonCheckboxLabelClass = "inline-flex items-center text-sm text-slate-700 dark:text-gray-300";

  return (
    <div className="space-y-4 py-2">
      {/* UI Language Setting Start */}
      <div>
        <label htmlFor="uiLanguage" className={commonLabelClass}>UI Language</label>
        <select
          id="uiLanguage"
          className={commonSelectClass}
          value={(appState.setting as any)?.uiLanguage || 'en'} // Assuming 'uiLanguage' in appState.setting, cast to any for now
          onChange={(e) => {
            console.log('UI Language selected:', e.target.value);
            // TODO: Implement actual update to appState.setting, e.g.:
            // appState.updateSetting({ ...appState.setting, uiLanguage: e.target.value });
          }}
        >
          <option value="en">🇬🇧 English</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="ja">🇯🇵 日本語</option>
        </select>
      </div>
      {/* UI Language Setting End */}

      <div>
        <label htmlFor="protocol" className={commonLabelClass}>Protocol</label>
        <select id="protocol" className={commonSelectClass}
          value={appState.setting.workletNodeSetting.protocol}
          onChange={e => appState.setWorkletNodeSetting({ ...appState.setting.workletNodeSetting, protocol: e.target.value as Protocol })}
        >
          <option value="sio">sio</option>
          <option value="rest">rest</option>
        </select>
      </div>
      <div>
        <label htmlFor="crossfade" className={commonLabelClass}>Crossfade Overlap</label>
        <DebouncedSlider id="crossfade" name="crossfade"
          min={0.05} max={0.2} step={0.01}
          value={localCrossFadeOverlapSize}
          className={commonRangeClass}
          onImmediateChange={setLocalCrossFadeOverlapSize}
          onChange={async val => {
            await appState.serverSetting.updateServerSettings({ 
              ...appState.serverSetting.serverSetting, 
              crossFadeOverlapSize: val 
            });
          }}
        />
        <p className="text-xs text-slate-600 dark:text-gray-400 text-right">{localCrossFadeOverlapSize.toFixed(2)} s</p>
      </div>
      <div>
        <label className={commonCheckboxLabelClass}>
          <input type="checkbox" className="mr-2 accent-blue-500 dark:accent-blue-400"
            checked={appState.serverSetting.serverSetting.silenceFront === 1}
            onChange={async e => {
              const value = e.target.checked ? 1 : 0;
              uiState.startLoading(`${value === 1 ? "Enabling" : "Disabling"} Silence Front`);
              await appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, silenceFront: value });
              uiState.stopLoading();
            }}
          />
          Silence Front
        </label>
      </div>
      <div>
        <label className={commonCheckboxLabelClass}>
          <input type="checkbox" className="mr-2 accent-blue-500 dark:accent-blue-400"
            checked={appState.serverSetting.serverSetting.forceFp32 === 1}
            onChange={async e => {
              const value = e.target.checked ? 1 : 0;
              uiState.startLoading(`${value === 1 ? "Enabling" : "Disabling"} Force FP32 Mode`);
              await appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, forceFp32: value });
              uiState.stopLoading();
            }}
          />
          Force FP32 Mode
        </label>
      </div>
      <div>
        <label className={commonCheckboxLabelClass}>
          <input type="checkbox" className="mr-2 accent-blue-500 dark:accent-blue-400"
            checked={appState.serverSetting.serverSetting.disableJit === 1}
            onChange={async e => {
              const value = e.target.checked ? 1 : 0;
              uiState.startLoading(`${value === 1 ? "Disabling" : "Enabling"} JIT Compilation`); // Note: Corrected logic for disableJit
              await appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, disableJit: value });
              uiState.stopLoading();
            }}
          />
          Disable JIT Compilation
        </label>
      </div>
      <div>
        <label className={commonCheckboxLabelClass}>
          <input type="checkbox" className="mr-2 accent-blue-500 dark:accent-blue-400"
            checked={appState.serverSetting.serverSetting.useONNX === 1}
            onChange={async e => {
              const value = e.target.checked ? 1 : 0;
              uiState.startLoading(`${value === 1 ? "Enabling" : "Disabling"} Convert to ONNX`);
              await appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, useONNX: value });
              uiState.stopLoading();
            }}
          />
          Convert to ONNX
        </label>
      </div>
      <div>
        <label htmlFor="protect" className={commonLabelClass}>Protect</label>
        <DebouncedSlider id="protect" name="protect"
          min={0} max={0.5} step={0.01}
          value={localProtect}
          className={commonRangeClass}  
          onImmediateChange={setLocalProtect}
          onChange={async val => {
            await appState.serverSetting.updateServerSettings({ 
              ...appState.serverSetting.serverSetting, 
              protect: val 
            });
          }}
        />
        <p className="text-xs text-slate-600 dark:text-gray-400 text-right">{localProtect.toFixed(2)}</p>
      </div>  
      <div className="border border-red-500 p-3 rounded bg-red-50 dark:bg-red-900/20 space-y-2">
        <div className="flex items-center text-red-600 mb-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          <span className="font-semibold">Danger Zone</span>
        </div>
        <label className={commonCheckboxLabelClass}>
          <input type="checkbox" className="mr-2 accent-red-500 dark:accent-red-400"
            checked={appState.setting.voiceChangerClientSetting.passThroughConfirmationSkip}
            onChange={e => appState.setVoiceChangerClientSetting({ ...appState.setting.voiceChangerClientSetting, passThroughConfirmationSkip: e.target.checked })}
          />
          Skip Pass through confirmation
        </label>
      </div>
    </div>
  );
}

export default AdvancedSettingsModal;