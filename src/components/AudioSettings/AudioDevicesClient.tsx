import React, { JSX, useEffect, useState } from 'react';
import { CSS_CLASSES } from '../../styles/constants';
import { useAppState } from '../../context/AppContext';

interface ClientAudioDevice {
  deviceId: string;
  kind: string;
  label: string;
  groupId?: string;
}

function AudioDevicesClient(): JSX.Element {
  const [clientInputDevices, setClientInputDevices] = useState<ClientAudioDevice[]>([]);
  const [clientOutputDevices, setClientOutputDevices] = useState<ClientAudioDevice[]>([]);
  
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('');
  const [selectedMonitorDevice, setSelectedMonitorDevice] = useState<string>('');

  useEffect(() => {
    const loadDevices = async () => {     
      try {
        fetchClientDevices();
      } catch (err) {
        console.error('Error loading devices:', err);
      }
    };
    
    loadDevices();
  }, []);
  

  // Fetch client devices
  const fetchClientDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('MediaDevices API not supported in this browser');
      }
      
      // Prompt for audio permission to reveal device labels
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn('Unable to access microphone for device labels:', err);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs: ClientAudioDevice[] = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}...`,
          groupId: device.groupId
        }));
        
      const audioOutputs: ClientAudioDevice[] = devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}...`,
          groupId: device.groupId
        }));
      
      setClientInputDevices(audioInputs);
      setClientOutputDevices(audioOutputs);
      
      // Set default selections if not already set
      if (audioInputs.length > 0 && !selectedInputDevice) {
        setSelectedInputDevice(audioInputs[0].deviceId);
      }
      if (audioOutputs.length > 0) {
        if (!selectedOutputDevice) {
          setSelectedOutputDevice(audioOutputs[0].deviceId);
        }
        if (!selectedMonitorDevice) {
          setSelectedMonitorDevice(audioOutputs[0].deviceId);
        }
      }
    } catch (err) {
      console.error('Error fetching client devices:', err);
    }
  };

  const handleInputDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInputDevice(event.target.value);
  };

  const handleOutputDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutputDevice(event.target.value);
  };

  const handleMonitorDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonitorDevice(event.target.value);
  };

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
          value={selectedInputDevice}
          onChange={handleInputDeviceChange}
        >
          {
            clientInputDevices.length === 0 ? (
              <option value="">No input devices found</option>
            ) : (
              clientInputDevices.map((device) => (
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
          value={selectedOutputDevice}
          onChange={handleOutputDeviceChange}
        >              
          {
            clientOutputDevices.length === 0 ? (
              <option value="">No output devices found</option>
            ) : (
              clientOutputDevices.map((device) => (
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
          value={selectedMonitorDevice}
          onChange={handleMonitorDeviceChange}
        >
          {
            clientOutputDevices.length === 0 ? (
              <option value="">No output devices found</option>
            ) : (
              clientOutputDevices.map((device) => (
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
