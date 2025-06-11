import React, { JSX, useEffect } from 'react';
import { AUDIO_KEYS, CSS_CLASSES, INDEXEDDB_KEYS } from '../../styles/constants';
import { useAppState } from '../../context/AppContext';
import { useIndexedDB } from '@dannadori/voice-changer-client-js';
import { useUIContext } from '../../context/UIContext';

function AudioDevicesClient(): JSX.Element {
  const appState = useAppState();
  const uiState = useUIContext();
  const { getItem, setItem } = useIndexedDB({ clientType: null });

  useEffect(() => {
    const setAudioOutput = async () => {
        const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();

        [AUDIO_KEYS.AUDIO_ELEMENT_FOR_PLAY_RESULT, AUDIO_KEYS.AUDIO_ELEMENT_FOR_TEST_CONVERTED_ECHOBACK].forEach((x) => {
            const audio = document.getElementById(x) as HTMLAudioElement;
            if (audio) {
                if (appState.serverSetting.serverSetting.enableServerAudio == 1) {
                    audio.volume = 0;
                } else if (uiState.audioOutputForGUI == "none") {
                    try {
                        audio.setSinkId("");
                        audio.volume = 0;
                    } catch (e) {
                        console.error("catch:" + e);
                    }
                } else {
                    const audioOutputs = mediaDeviceInfos.filter((x) => {
                        return x.kind == "audiooutput";
                    });
                    const found = audioOutputs.some((x) => {
                        return x.deviceId == uiState.audioOutputForGUI;
                    });
                    if (found) {
                        try {
                            audio.setSinkId(uiState.audioOutputForGUI);
                            audio.volume = 1;
                          } catch (e) {
                            console.error("catch:" + e);
                        }
                    } else {
                        console.warn("No audio output device. use default");
                    }
                }
            }
        });
    };
    setAudioOutput();
  }, [uiState.audioOutputForGUI, appState.serverSetting.serverSetting.enableServerAudio]);

  useEffect(() => {
    const setAudioMonitor = async () => {
        const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();

        [AUDIO_KEYS.AUDIO_ELEMENT_FOR_PLAY_MONITOR].forEach((x) => {
            const audio = document.getElementById(x) as HTMLAudioElement;
            if (audio) {
                if (appState.serverSetting.serverSetting.enableServerAudio == 1) {
                    audio.volume = 0;
                } else if (uiState.audioMonitorForGUI == "none") {
                    try {
                        audio.setSinkId("");
                        audio.volume = 0;
                    } catch (e) {
                        console.error("catch:" + e);
                    }
                } else {
                    const audioOutputs = mediaDeviceInfos.filter((x) => {
                        return x.kind == "audiooutput";
                    });
                    const found = audioOutputs.some((x) => {
                        return x.deviceId == uiState.audioMonitorForGUI;
                    });
                    if (found) {
                        try {
                            audio.setSinkId(uiState.audioMonitorForGUI);
                            audio.volume = 1;
                        } catch (e) {
                            console.error("catch:" + e);
                        }
                    } else {
                        console.warn("No audio output device. use default");
                    }
                }
            }
        });
    };
    setAudioMonitor();
  }, [uiState.audioMonitorForGUI, appState.serverSetting.serverSetting.enableServerAudio]);

  useEffect(() => {
    console.log("initializedRef.current", appState.initializedRef.current);
    appState.setAudioOutputElementId(AUDIO_KEYS.AUDIO_ELEMENT_FOR_PLAY_RESULT);
  }, [appState.initializedRef.current]);

  useEffect(() => {
    console.log("initializedRef.current", appState.initializedRef.current);
    appState.setAudioMonitorElementId(AUDIO_KEYS.AUDIO_ELEMENT_FOR_PLAY_MONITOR);
  }, [appState.initializedRef.current]);

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
              <>
                <option value="none">No device selected</option>
                {
                  uiState.outputAudioDeviceInfo.map((device) => (
                    <option 
                      key={device.deviceId} 
                      value={device.deviceId}
                    >
                      {device.label}
                    </option>
                  ))
                }
              </>
            )
          }
        </select>
      </div>
    </>
  );
}

export default AudioDevicesClient;
