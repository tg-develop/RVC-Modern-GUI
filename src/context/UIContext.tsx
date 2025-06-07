import React, { createContext, ReactNode, useContext, useState, useRef, useCallback, useEffect } from 'react';
import LoadingScreen from '../components/modals/LoadingScreen';
import ErrorNotifications from '../components/modals/ErrorNotifications';

type ErrorType = 'Error' | 'Warning' | 'Confirm';

interface UIError {
  id: number;
  message: string;
  type: ErrorType;
}

interface UIContextType {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  showError: (message: string, type?: ErrorType) => void;
  setIsConverting: (isConverting: boolean) => void;
  isConverting: boolean;

  reloadDeviceInfo: () => Promise<void>;
  inputAudioDeviceInfo: MediaDeviceInfo[];
  outputAudioDeviceInfo: MediaDeviceInfo[];
  audioInputForGUI: string;
  audioOutputForGUI: string;
  audioMonitorForGUI: string;
  setAudioInputForGUI: (audioInputForGUI: string) => void;
  setAudioOutputForGUI: (audioOutputForGUI: string) => void;
  setAudioMonitorForGUI: (audioMonitorForGUI: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [inputAudioDeviceInfo, setInputAudioDeviceInfo] = useState<MediaDeviceInfo[]>([]);
  const [outputAudioDeviceInfo, setOutputAudioDeviceInfo] = useState<MediaDeviceInfo[]>([]);
  const [audioInputForGUI, setAudioInputForGUI] = useState<string>("none");
  const [audioOutputForGUI, setAudioOutputForGUI] = useState<string>("none");
  const [audioMonitorForGUI, setAudioMonitorForGUI] = useState<string>("none");

  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [errors, setErrors] = useState<UIError[]>([]);
  const idRef = useRef(0);

  const startLoading = useCallback((message?: string) => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  }, []);

  const showError = useCallback((message: string, type: ErrorType = 'Error') => {
    idRef.current += 1;
    const id = idRef.current;
    setErrors(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setErrors(prev => prev.filter(err => err.id !== id));
    }, 5000);
  }, []);

  const removeError = useCallback((id: number) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  }, []);

  const checkDeviceAvailable = useRef<boolean>(false);

  const _reloadDeviceInfo = async () => {
    // デバイスチェックの空振り
    if (checkDeviceAvailable.current == false) {
        try {
            const ms = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            ms.getTracks().forEach((x) => {
                x.stop();
            });
            checkDeviceAvailable.current = true;
        } catch (e) {
            console.warn("Enumerate device error:", e);
        }
    }
    const mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();

    const audioInputs = mediaDeviceInfos.filter((x) => {
        return x.kind == "audioinput";
    });

    const audioOutputs = mediaDeviceInfos.filter((x) => {
      return x.kind == "audiooutput";
    });
    
    return [audioInputs, audioOutputs];
  };

  const reloadDeviceInfo = async () => {
    const audioInfo = await _reloadDeviceInfo();
    setInputAudioDeviceInfo(audioInfo[0]);
    setOutputAudioDeviceInfo(audioInfo[1]);
  };

  useEffect(() => {
    let isMounted = true;

    const pollDevices = async () => {
        const checkDeviceDiff = (knownDeviceIds: Set<string>, newDeviceIds: Set<string>) => {
            const deleted = new Set([...knownDeviceIds].filter((x) => !newDeviceIds.has(x)));
            const added = new Set([...newDeviceIds].filter((x) => !knownDeviceIds.has(x)));
            return { deleted, added };
        };
        try {
            const audioInfo = await _reloadDeviceInfo();

            const knownAudioinputIds = new Set(inputAudioDeviceInfo.map((x) => x.deviceId));
            const newAudioinputIds = new Set(audioInfo[0].map((x) => x.deviceId));

            const knownAudiooutputIds = new Set(outputAudioDeviceInfo.map((x) => x.deviceId));
            const newAudiooutputIds = new Set(audioInfo[1].map((x) => x.deviceId));

            const audioInputDiff = checkDeviceDiff(knownAudioinputIds, newAudioinputIds);
            const audioOutputDiff = checkDeviceDiff(knownAudiooutputIds, newAudiooutputIds);

            if (audioInputDiff.deleted.size > 0 || audioInputDiff.added.size > 0) {
                console.log(`deleted input device:`, [...audioInputDiff.deleted]);
                console.log(`added input device:`, [...audioInputDiff.added]);
                setInputAudioDeviceInfo(audioInfo[0]);
            }
            if (audioOutputDiff.deleted.size > 0 || audioOutputDiff.added.size > 0) {
                console.log(`deleted output device:`, [...audioOutputDiff.deleted]);
                console.log(`added output device:`, [...audioOutputDiff.added]);
                setOutputAudioDeviceInfo(audioInfo[1]);
            }

            if (isMounted) {
                setTimeout(pollDevices, 1000 * 3);
            }
        } catch (err) {
            console.error("An error occurred during enumeration of devices:", err);
        }
    };

    pollDevices();
    return () => {
        isMounted = false;
    };
}, [inputAudioDeviceInfo, outputAudioDeviceInfo]);


  return (
    <UIContext.Provider value={{ 
      startLoading, stopLoading, showError, setIsConverting, reloadDeviceInfo, 
      isConverting, setAudioInputForGUI, setAudioOutputForGUI, setAudioMonitorForGUI,
      inputAudioDeviceInfo, outputAudioDeviceInfo, audioInputForGUI, audioOutputForGUI, audioMonitorForGUI  }}>
      {children}
      {isLoading && <LoadingScreen message={loadingMessage} />}
      <ErrorNotifications errors={errors} removeError={removeError} />
    </UIContext.Provider>
  );
};

export const useUIContext = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIContextProvider');
  }
  return context;
};
