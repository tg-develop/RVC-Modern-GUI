import { ClientState } from "@dannadori/voice-changer-client-js";
import { CSS_CLASSES } from "../../styles/constants";
import { useEffect } from "react";
import { INDEXEDDB_KEYS } from "../../styles/constants";

interface NoiseReductionProps {
    appState: ClientState;
    getItem: (key: string) => Promise<any>;
    setItem: (key: string, value: any) => Promise<void>;
}

function NoiseReduction({ appState, getItem, setItem }: NoiseReductionProps) {
  // Load Output and Monitor from Cache
  useEffect(() => {
    const loadCache = async () => {
        const echo = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_ECHO);
        if (echo) {
          appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            echoCancel: echo as boolean
          });
        }
        const noise1 = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE1);
        if (noise1) {
          appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            noiseSuppression: noise1 as boolean
          });
        }
        const noise2 = await getItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE2);
        if (noise2) {
          appState.setVoiceChangerClientSetting({
            ...appState.setting.voiceChangerClientSetting,
            noiseSuppression2: noise2 as boolean
          });
        }
    };
    loadCache();
  }, []);


    const handleChangeNoiseSuppression = (value: boolean) => {
        appState.setVoiceChangerClientSetting({
          ...appState.setting.voiceChangerClientSetting,
          noiseSuppression: value
        });
        setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE1, value);
      };
    
      const handleChangeNoiseSuppression2 = (value: boolean) => {
        appState.setVoiceChangerClientSetting({
          ...appState.setting.voiceChangerClientSetting,
          noiseSuppression2: value
        });
        setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_NOISE2, value);
      };
    
      const handleChangeEchoCancel = (value: boolean) => {
        appState.setVoiceChangerClientSetting({
          ...appState.setting.voiceChangerClientSetting,
          echoCancel: value
        });
        setItem(INDEXEDDB_KEYS.INDEXEDDB_KEY_ECHO, value);
      };

    return (
        <div>
        <label className={CSS_CLASSES.label}>Noise Reduction:</label>
        <div className="space-y-1">
          <label className={CSS_CLASSES.checkboxLabel}>
            <input 
              type="checkbox" 
              name="echoCancel" 
              className={CSS_CLASSES.checkbox} 
              checked={appState.setting.voiceChangerClientSetting.echoCancel ?? false}
              onChange={(e) => handleChangeEchoCancel(e.target.checked)}
              disabled={appState.serverSetting.serverSetting.enableServerAudio === 1}
            /> Echo Cancellation
          </label>
          <label className={CSS_CLASSES.checkboxLabel}>
            <input 
              type="checkbox" 
              name="noiseSuppression" 
              className={CSS_CLASSES.checkbox} 
              checked={appState.setting.voiceChangerClientSetting.noiseSuppression ?? false}
              onChange={(e) => handleChangeNoiseSuppression(e.target.checked)}
              disabled={appState.serverSetting.serverSetting.enableServerAudio === 1}
            /> Noise Suppression
          </label>
          <label className={CSS_CLASSES.checkboxLabel}>
            <input 
              type="checkbox" 
              name="noiseSuppression2" 
              className={CSS_CLASSES.checkbox} 
              checked={appState.setting.voiceChangerClientSetting.noiseSuppression2 ?? false}
              onChange={(e) => handleChangeNoiseSuppression2(e.target.checked)}
              disabled={appState.serverSetting.serverSetting.enableServerAudio === 1}
            /> Noise Suppression 2
          </label>
        </div>
      </div>
    );
}

export default NoiseReduction;