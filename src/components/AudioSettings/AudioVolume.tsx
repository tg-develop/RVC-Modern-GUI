import React, { JSX, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { CSS_CLASSES } from '../../styles/constants';
import DebouncedSlider from '../Helpers/DebouncedSlider';

// CSS Class Constants (can be moved to a shared file or passed as props if preferred)

interface AudioVolumeProps {
  audioState: "client" | "server";
} 

function AudioVolume({ audioState }: AudioVolumeProps): JSX.Element {
  const appState = useAppState();

  const [inputGain, setInputGain] = useState(1);
  const [outputGain, setOutputGain] = useState(1);
  const [monitorGain, setMonitorGain] = useState(1); 

  const handleInputGainChange = (value: number) => {
    const gain = value / 100
    if(audioState == "server"){
      appState.serverSetting.updateServerSettings({
        ...appState.serverSetting.serverSetting,
        serverInputAudioGain: gain
      })
    }else{
      appState.setVoiceChangerClientSetting({
        ...appState.setting.voiceChangerClientSetting,
        inputGain: gain
      })
    }
  }

  const handleOutputGainChange = (value: number) => {
    const gain = value / 100
    if(audioState == "server"){
      appState.serverSetting.updateServerSettings({
        ...appState.serverSetting.serverSetting,
        serverOutputAudioGain: gain
      })
    }else{
      appState.setVoiceChangerClientSetting({
        ...appState.setting.voiceChangerClientSetting,
        outputGain: gain
      })
    }
  }

  const handleMonitorGainChange = (value: number) => {
    const gain = value / 100
    if(audioState == "server"){
      appState.serverSetting.updateServerSettings({
        ...appState.serverSetting.serverSetting,
        serverMonitorAudioGain: gain
      })
    }else{
      appState.setVoiceChangerClientSetting({
        ...appState.setting.voiceChangerClientSetting,
        monitorGain: gain
      })
    }
  }

  return (
    <>
      <div>
        <label htmlFor="inputGain" className={CSS_CLASSES.label}>Input Volume</label>
        <DebouncedSlider
          id="inputGain"
          min={10}
          max={250}
          step={1}
          value={Math.round(inputGain * 100)}
          className={CSS_CLASSES.range}
          onChange={handleInputGainChange}
          onImmediateChange={(value) => setInputGain(value / 100)}
        />
        <p className={CSS_CLASSES.sliderValue}>{Math.round(inputGain * 100)}%</p>
      </div>
      <div>
        <label htmlFor="outputGain" className={CSS_CLASSES.label}>Output Volume</label>
        <DebouncedSlider
          id="outputGain"
          min={10}
          max={400}
          step={1}
          value={Math.round(outputGain * 100)}
          className={CSS_CLASSES.range}
          onChange={handleOutputGainChange}
          onImmediateChange={(value) => setOutputGain(value / 100)}
        />
        <p className={CSS_CLASSES.sliderValue}>{Math.round(outputGain * 100)}%</p>
      </div>
      <div>
        <label htmlFor="monitorGain" className={CSS_CLASSES.label}>Monitor Volume</label>
        <DebouncedSlider
          id="monitorGain"
          min={10}
          max={400}
          step={1}
          value={Math.round(monitorGain * 100)}
          className={CSS_CLASSES.range}
          onChange={handleMonitorGainChange}
          onImmediateChange={(value) => setMonitorGain(value / 100)}
        />
        <p className={CSS_CLASSES.sliderValue}>{Math.round(monitorGain * 100)}%</p>
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
