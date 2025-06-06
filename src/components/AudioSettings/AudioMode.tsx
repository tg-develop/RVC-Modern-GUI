import { CSS_CLASSES } from "../../styles/constants";
import { useAppState } from "../../context/AppContext";
import { Dispatch, SetStateAction } from "react";

function AudioMode({ audioState, setAudioState }: { audioState: "client" | "server"; setAudioState: Dispatch<SetStateAction<"client" | "server">>; }): JSX.Element {
    const appState = useAppState();

    const handleClientRadioChange = () => {
        appState.serverSetting.updateServerSettings({
            ...appState.serverSetting.serverSetting,
            enableServerAudio: 0
        })
        setAudioState("client")
    }
    
    const handleServerRadioChange = () => {
        appState.serverSetting.updateServerSettings({
            ...appState.serverSetting.serverSetting,
            enableServerAudio: 1
        })
        setAudioState("server")
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
                  checked={audioState === "client"}
                  onChange={handleClientRadioChange}
                />
                Client
              </label>
              <label className={CSS_CLASSES.radioLabel}>
                <input
                  type="radio"
                  className={CSS_CLASSES.radioButton}
                  checked={audioState === "server"}
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