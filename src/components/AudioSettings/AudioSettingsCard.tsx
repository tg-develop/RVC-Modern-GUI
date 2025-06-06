import React, { JSX, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import DragHandle from '../DragHandle';
import { RVCModelSlot } from '@dannadori/voice-changer-client-js';
import { useAppState } from '../../context/AppContext';
import AudioVolume from './AudioVolume';
import AudioMode from './AudioMode';
import AudioDevicesServer from './AudioDevicesServer';
import AudioDevicesClient from './AudioDevicesClient';

// Props for icons
interface AudioSettingsCardProps {
  dndAttributes?: Record<string, any>;
  dndListeners?: Record<string, any>;
  openModal: (type: string, props?: { modelId?: string; modelName?: string; model?: RVCModelSlot }) => void;
}

// Define types for audio devices
interface ClientAudioDevice {
  deviceId: string;
  kind: string;
  label: string;
  groupId?: string;
}

interface ServerAudioDevice {
  index: number;
  name: string;
  hostAPI: string;
  maxInputChannels?: number;
  maxOutputChannels?: number;
  default_samplerate?: number;
  // Add any other properties from the server device structure
}

// Union type for device lists
type AudioDevice = ClientAudioDevice | ServerAudioDevice;

function AudioSettingsCard({ dndAttributes, dndListeners, openModal }: AudioSettingsCardProps): JSX.Element {
  const appState = useAppState();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for device lists
  const [clientInputDevices, setClientInputDevices] = useState<ClientAudioDevice[]>([]);
  const [clientOutputDevices, setClientOutputDevices] = useState<ClientAudioDevice[]>([]);
  const [serverInputDevices, setServerInputDevices] = useState<ServerAudioDevice[]>([]);
  const [serverOutputDevices, setServerOutputDevices] = useState<ServerAudioDevice[]>([]);
  
  // Selected devices
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('');
  const [selectedMonitorDevice, setSelectedMonitorDevice] = useState<string>('');
  
  // Server settings
  const sampleRates = [16000, 32000, 44100, 48000, 96000, 192000];
  const [availableAudioDrivers, setAvailableAudioDrivers] = useState<string[]>([]);
  const [selectedAudioDriver, setSelectedAudioDriver] = useState<string>('');
  
  // Get the appropriate device lists based on processing mode
  const currentInputDevices: AudioDevice[] = appState.serverSetting.serverSetting.enableServerAudio === 0 ? clientInputDevices : serverInputDevices;
  const currentOutputDevices: AudioDevice[] = appState.serverSetting.serverSetting.enableServerAudio === 0 ? clientOutputDevices : serverOutputDevices;
  
  const getServerInputDeviceList = () => {
    return appState.serverSetting?.serverSetting?.serverAudioInputDevices
          .filter(device => device.hostAPI === selectedAudioDriver);
  };

  const getServerOutputDeviceList = () => {
    return appState.serverSetting?.serverSetting?.serverAudioOutputDevices
          .filter(device => device.hostAPI === selectedAudioDriver);
  };

  // Helper function to get device name
  const getDeviceName = (device: AudioDevice): string => {
    if (!device) return 'Unknown Device';
    if ('label' in device && device.label) return device.label; // ClientAudioDevice
    if ('name' in device && device.name) return `[${device.hostAPI}] ${device.name}`; // ServerAudioDevice
    return `Device ${('deviceId' in device && device.deviceId) || ('index' in device && device.index) || 'Unknown'}`;
  };

  const getDeviceValue = (device: AudioDevice): string => {
    if (!device) return '';
    if ('deviceId' in device) return device.deviceId; // ClientAudioDevice
    if ('index' in device) return `server-${device.index}`; // ServerAudioDevice
    return '';
  };
  
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
      setError('Failed to fetch audio devices. Please check your browser permissions.');
    }
  };
  
  // Fetch server devices
  const fetchServerDevices = async () => {
    try {
      if (!appState.serverSetting?.serverSetting) {
        setError('Server settings not available.');
        setServerInputDevices([]);
        setServerOutputDevices([]);
        setAvailableAudioDrivers([]);
        return;
      }

      const serverSettings = appState.serverSetting.serverSetting;
      const inputs: ServerAudioDevice[] = serverSettings.serverAudioInputDevices || [];
      const outputs: ServerAudioDevice[] = serverSettings.serverAudioOutputDevices || [];

      setServerInputDevices(inputs);
      setServerOutputDevices(outputs);

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
      setError('Failed to process server audio devices. Check console for details.');
      setServerInputDevices([]);
      setServerOutputDevices([]);
      setAvailableAudioDrivers([]);
    }
  };
  
  // Load devices when component mounts and when processing mode changes
  useEffect(() => {
    const loadDevices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (appState.serverSetting.serverSetting.enableServerAudio === 0) {
          await fetchClientDevices();
        } else {
          await fetchServerDevices();
        }
      } catch (err) {
        console.error('Error loading devices:', err);
        setError('Failed to load audio devices. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDevices();
  }, [appState.serverSetting.serverSetting.enableServerAudio]);
  
  // Handle device selection changes
  const handleInputDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInputDevice(e.target.value);
  };
  
  const handleOutputDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutputDevice(e.target.value);
  };
  
  const handleMonitorDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonitorDevice(e.target.value);
  };
  const commonSelectClass = "w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm transition-colors duration-150";
  const commonRangeClass = "w-full h-2 bg-slate-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400 transition-colors duration-150";
  const commonLabelClass = "block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1";
  const commonSliderValueClass = "text-xs text-slate-600 dark:text-gray-400 text-right";
  const checkboxLabelClass = "flex items-center text-sm text-slate-700 dark:text-gray-300";
  const checkboxClass = "mr-2 accent-blue-500 dark:accent-blue-400";
  const headingClass = "text-lg font-semibold text-slate-700 dark:text-gray-200";
  const iconButtonClass = "p-1 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200";
  const radioButtonClass = "mr-2 accent-blue-500 dark:accent-blue-400";
  const radioLabelClass = "inline-flex items-center mr-4 text-sm text-slate-700 dark:text-gray-300";

  return (
    <div className={`p-4 border border-slate-200 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 flex-1 min-h-0 flex flex-col ${isCollapsed ? 'h-auto' : 'overflow-y-auto'}`}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-gray-700">
        <div className="flex items-center">
          <h4 className={headingClass}>Audio Settings</h4>
          {isLoading && (
            <span className="ml-2 text-blue-500">
              <FontAwesomeIcon icon={faSpinner} spin />
            </span>
          )}
        </div>
        <div className="flex space-x-1 items-center">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={iconButtonClass} 
            title={isCollapsed ? "Expand" : "Collapse"}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="h-5 w-5" />
          </button>
          <DragHandle attributes={dndAttributes} listeners={dndListeners} title="Drag" />
        </div>
      </div>
      {!isCollapsed && (
        <>
          <AudioMode />
          <AudioDevicesServer />
          <AudioVolume />
        </>
      )}
    </div>
  );
}

export default AudioSettingsCard; 