import React, { useEffect, useMemo } from 'react';
import { CSS_CLASSES } from '../../styles/constants';
import { useAppState } from '../../context/AppContext';
import { useState } from 'react';
import { ServerAudioDevice } from '@dannadori/voice-changer-client-js';

function AudioDevicesServer() {
  const appState = useAppState();
  const sampleRates = [16000, 32000, 44100, 48000, 96000, 192000];

  const [availableAudioDrivers, setAvailableAudioDrivers] = useState<string[]>([]);
  const [selectedAudioDriver, setSelectedAudioDriver] = useState<string>('');
 
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('');
  const [selectedMonitorDevice, setSelectedMonitorDevice] = useState<string>('');
  
  const serverInputDevices = useMemo(() => {
    return appState.serverSetting?.serverSetting?.serverAudioInputDevices
          .filter(device => device.hostAPI === selectedAudioDriver);
  }, [appState.serverSetting, selectedAudioDriver]);

  const serverOutputDevices = useMemo(() => {
    return appState.serverSetting?.serverSetting?.serverAudioOutputDevices
          .filter(device => device.hostAPI === selectedAudioDriver);
  }, [appState.serverSetting, selectedAudioDriver]);

  
  const handleSampleRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting.serverSetting,
      serverInputAudioSampleRate: parseInt(event.target.value),
      serverOutputAudioSampleRate: parseInt(event.target.value),
      serverMonitorAudioSampleRate: parseInt(event.target.value)
    });
  };

  const handleAudioDriverChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAudioDriver(event.target.value);
  };

  const handleInputDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

  };

  const handleOutputDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

  };

  const handleMonitorDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

  };

  // Fetch server devices
  const fetchServerDevices = async () => {
    try {
      const serverSettings = appState.serverSetting.serverSetting;
      const inputs: ServerAudioDevice[] = serverSettings.serverAudioInputDevices || [];
      const outputs: ServerAudioDevice[] = serverSettings.serverAudioOutputDevices || [];

      // Extract unique hostAPIs for Audio Driver dropdown
      const hostApis = new Set<string>();
      inputs.forEach(device => device.hostAPI && hostApis.add(device.hostAPI));
      outputs.forEach(device => device.hostAPI && hostApis.add(device.hostAPI));
      const uniqueHostApis = Array.from(hostApis);
      setAvailableAudioDrivers(uniqueHostApis);

      // Set default selections for server devices and audio driver
      if (inputs.length > 0 && (!selectedInputDevice || !selectedInputDevice.startsWith('server-'))) {
        setSelectedInputDevice(`server-${inputs[0].index}`);
      }
      if (outputs.length > 0) {
        if (!selectedOutputDevice || !selectedOutputDevice.startsWith('server-')) {
          setSelectedOutputDevice(`server-${outputs[0].index}`);
        }
        if (!selectedMonitorDevice || !selectedMonitorDevice.startsWith('server-')) {
          setSelectedMonitorDevice(`server-${outputs[0].index}`);
        }
      }
      if (uniqueHostApis.length > 0 && !selectedAudioDriver) {
        setSelectedAudioDriver(uniqueHostApis[0]);
      }

    } catch (err) {
      console.error('Error fetching server devices:', err);
    }
  };

  useEffect(() => {
    fetchServerDevices();
  }, [appState.serverSetting.serverSetting.enableServerAudio]);

  return (
    <>
      <>
      {/* Server-only settings */}
      <div>
        <label htmlFor="sampleRate" className={CSS_CLASSES.label}>Sample Rate</label>
        <select id="sampleRate" className={CSS_CLASSES.select} value={appState.serverSetting?.serverSetting?.inputSampleRate} onChange={handleSampleRateChange}>
          {sampleRates.map(rate => (
            <option key={rate} value={rate}>{rate} Hz</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="audioDriver" className={CSS_CLASSES.label}>Audio Driver</label>
        <select 
          id="audioDriver" 
          className={CSS_CLASSES.select}
          value={selectedAudioDriver}
          onChange={handleAudioDriverChange}
        >
          {availableAudioDrivers.length === 0 ? (
            <option value="">No drivers available</option>
          ) : (
            availableAudioDrivers.map(driver => (
              <option key={driver} value={driver}>{driver}</option>
            ))
          )}
        </select>
      </div>
      </>
            
      {/* Input Device */}
      <div>
        <label htmlFor="inputCh" className={CSS_CLASSES.label}>
          Input Device
        </label>
        <select 
          id="inputCh" 
          className={CSS_CLASSES.select}
          value={selectedInputDevice}
          onChange={handleInputDeviceChange}
        >
          {
            serverInputDevices.length === 0 ? (
              <option value="">No input devices found</option>
            ) : (
              serverInputDevices.map((device) => (
                <option 
                  key={device.index} 
                  value={device.name}
                >
                  {`[${device.hostAPI}] ${device.name}`}
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
          value={selectedOutputDevice}
          onChange={handleOutputDeviceChange}
        >              
          {
            serverOutputDevices.length === 0 ? (
              <option value="">No output devices found</option>
            ) : (
              serverOutputDevices.map((device) => (
                <option 
                  key={device.index} 
                  value={device.name}
                >
                  {`[${device.hostAPI}] ${device.name}`}
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
          value={selectedMonitorDevice}
          onChange={handleMonitorDeviceChange}
        >
          {
            serverInputDevices.length === 0 ? (
              <option value="">No input devices found</option>
            ) : (
              serverOutputDevices.map((device) => (
                <option 
                  key={device.index} 
                  value={device.name}
                >
                  {`[${device.hostAPI}] ${device.name}`}
                </option>
              ))
            )
          }
        </select>
      </div>
    </>
  );
}

export default AudioDevicesServer;