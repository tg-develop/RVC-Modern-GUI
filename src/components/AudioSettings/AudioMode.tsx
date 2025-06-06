import { CSS_CLASSES } from "../../styles/constants";
import { useAppState } from "../../context/AppContext";

function AudioMode(): JSX.Element {
    const appState = useAppState();

    const handleClientRadioChange = () => {
        appState.serverSetting.updateServerSettings({
            ...appState.serverSetting.serverSetting,
            enableServerAudio: 0
        })
    }
    
    const handleServerRadioChange = () => {
        appState.serverSetting.updateServerSettings({
            ...appState.serverSetting.serverSetting,
            enableServerAudio: 1
        })
    }
    
    return (
        <div className="space-y-4">
          <div className="pb-2 border-b border-slate-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Audio Processing</label>
            <div className="flex">
              <label className={CSS_CLASSES.radioLabel}>
                <input
                  type="radio"
                  className={CSS_CLASSES.radioButton}
                  checked={appState.serverSetting.serverSetting.enableServerAudio === 0}
                  onChange={handleClientRadioChange}
                />
                Client
              </label>
              <label className={CSS_CLASSES.radioLabel}>
                <input
                  type="radio"
                  className={CSS_CLASSES.radioButton}
                  checked={appState.serverSetting.serverSetting.enableServerAudio === 1}
                  onChange={handleServerRadioChange}
                />
                Server
              </label>
            </div>
          </div>
        </div>
    )
}

export default AudioMode;