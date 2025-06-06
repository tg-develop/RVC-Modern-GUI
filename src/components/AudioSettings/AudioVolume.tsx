import React, { JSX } from 'react';
import { useAppState } from '../../context/AppContext';
import { CSS_CLASSES } from '../../styles/constants';

// CSS Class Constants (can be moved to a shared file or passed as props if preferred)

function AudioVolume(): JSX.Element {
  const appState = useAppState(); // To access serverSetting for max volume

  return (
    <>
      <div>
        <label htmlFor="inputGain" className={CSS_CLASSES.label}>Input Volume</label>
        <input
          type="range"
          id="inputGain"
          min="10"
          max="250"
          step="1"
          value={Math.round((appState.setting.voiceChangerClientSetting.inputGain ?? 1) * 100)}
          className={CSS_CLASSES.range}
          onChange={(e) => appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            inputGain: parseInt(e.target.value) / 100
          })}
        />
        <p className={CSS_CLASSES.sliderValue}>{Math.round((appState.setting.voiceChangerClientSetting.inputGain ?? 1) * 100)}%</p>
      </div>
      <div>
        <label htmlFor="outputGain" className={CSS_CLASSES.label}>Output Volume</label>
        <input
          type="range"
          id="outputGain"
          min="10"
          max="400"
          step="1"
          value={Math.round((appState.setting.voiceChangerClientSetting.outputGain ?? 1) * 100)}
          className={CSS_CLASSES.range}
          onChange={(e) => appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            outputGain: parseInt(e.target.value) / 100
          })}
        />
        <p className={CSS_CLASSES.sliderValue}>{Math.round((appState.setting.voiceChangerClientSetting.outputGain ?? 1) * 100)}%</p>
      </div>
      <div>
        <label htmlFor="monitorGain" className={CSS_CLASSES.label}>Monitor Volume</label>
        <input
          type="range"
          id="monitorGain"
          min="10"
          max="400"
          step="1"
          value={Math.round((appState.setting.voiceChangerClientSetting.monitorGain ?? 1) * 100)}
          className={CSS_CLASSES.range}
          onChange={(e) => appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            monitorGain: parseInt(e.target.value) / 100
          })}
        />
        <p className={CSS_CLASSES.sliderValue}>{Math.round((appState.setting.voiceChangerClientSetting.monitorGain ?? 1) * 100)}%</p>
      </div>

      {/* Monitoring toggle */}
      <div className="pt-2">
        <label className={CSS_CLASSES.checkboxLabel}>
          <input type="checkbox" className={CSS_CLASSES.checkbox} defaultChecked />
          Enable Monitoring
        </label>
      </div>
    </>
  );
}

export default AudioVolume;
