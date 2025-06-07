import React, { JSX, useEffect, useState } from 'react';
import { CSS_CLASSES, INDEXEDDB_KEYS } from '../../styles/constants';
import { useAppState } from '../../context/AppContext';
import { useIndexedDB } from '@dannadori/voice-changer-client-js';
import { useUIContext } from '../../context/UIContext';

interface ClientAudioDevice {
  deviceId: string;
  kind: string;
  label: string;
  groupId?: string;
}

function AudioDevicesClient(): JSX.Element {
  const appState = useAppState();
  const uiState = useUIContext();
  const { getItem, setItem } = useIndexedDB({ clientType: null });

  const handleInputDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    appState.setting.voiceChangerClientSetting.audioInput = event.target.value;
    setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_AUDIO_INPUT, event.target.value);
    uiState.setAudioInputForGUI(event.target.value);
  };

  const handleOutputDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_AUDIO_OUTPUT, event.target.value);
    uiState.setAudioOutputForGUI(event.target.value);
  };

  const handleMonitorDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_AUDIO_MONITOR, event.target.value);
    uiState.setAudioMonitorForGUI(event.target.value);
  };

  // Load Output and Monitor from Cache
  useEffect(() => {
    const loadCache = async () => {
        const output = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_AUDIO_OUTPUT);
        if (output) {
            uiState.setAudioOutputForGUI(output as string);
        }
        const monitor = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_AUDIO_MONITOR);
        if (monitor) {
            uiState.setAudioMonitorForGUI(monitor as string);
        }
        const input = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_AUDIO_INPUT);
        if (input) {
          appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            audioInput: input as string
          });
          uiState.setAudioInputForGUI(input as string);
        }
    };
    loadCache();
  }, []);

  return (
    <>
      {/* Input Device */}
      <div>
        <label htmlFor="inputCh" className={CSS_CLASSES.label}>
          Input Device
        </label>
        <select 
          id="inputCh" 
          className={CSS_CLASSES.select}
          value={uiState.audioInputForGUI}
          onChange={handleInputDeviceChange}
        >
          {
            uiState.inputAudioDeviceInfo.length === 0 ? (
              <option value="">No input devices found</option>
            ) : (
              uiState.inputAudioDeviceInfo.map((device) => (
                <option 
                  key={device.deviceId} 
                  value={device.deviceId}
                >
                  {device.label}
                </option>
              ))
            )
          }
        </select>
      </div>
      
      {/* Output Device */}
      <div>
        <label htmlFor="outputCh" className={CSS_CLASSES.label}>
          Output Device
        </label>
        <select 
          id="outputCh" 
          className={CSS_CLASSES.select}
          value={uiState.audioOutputForGUI}
          onChange={handleOutputDeviceChange}
        >              
          {
            uiState.outputAudioDeviceInfo.length === 0 ? (
              <option value="">No output devices found</option>
            ) : (
              uiState.outputAudioDeviceInfo.map((device) => (
                <option 
                  key={device.deviceId} 
                  value={device.deviceId}
                >
                  {device.label}
                </option>
              ))
            )
          }
        </select>
      </div>
      
      {/* Monitor Device */}
      <div>
        <label htmlFor="monCh" className={CSS_CLASSES.label}>
          Monitor Device
        </label>
        <select 
          id="monCh" 
          className={CSS_CLASSES.select}
          value={uiState.audioMonitorForGUI}
          onChange={handleMonitorDeviceChange}
        >
          {
            uiState.outputAudioDeviceInfo.length === 0 ? (
              <option value="">No output devices found</option>
            ) : (
              uiState.outputAudioDeviceInfo.map((device) => (
                <option 
                  key={device.deviceId} 
                  value={device.deviceId}
                >
                  {device.label}
                </option>
              ))
            )
          }
        </select>
      </div>
    </>
  );
}

export default AudioDevicesClient;
