import { CSS_CLASSES } from "../../styles/constants";
import { useAppState } from "../../context/AppContext";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useUIContext } from "../../context/UIContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

function AudioMode({ audioState, setAudioState }: { audioState: "client" | "server"; setAudioState: Dispatch<SetStateAction<"client" | "server">>; }): JSX.Element {
    const appState = useAppState();
    const uiContext = useUIContext();
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    // Check if there are client audio devices that are not empty
    const isClientAudioAvailable = 
        uiContext?.inputAudioDeviceInfo?.length > 0 &&
        uiContext?.outputAudioDeviceInfo?.length > 0 && 
        uiContext?.inputAudioDeviceInfo[0].deviceId !== "" &&
        uiContext?.outputAudioDeviceInfo[0].deviceId !== "";

    // Check if there are server audio devices
    const serverInputDevices = appState.serverSetting?.serverSetting?.serverAudioInputDevices;
    const serverOutputDevices = appState.serverSetting?.serverSetting?.serverAudioOutputDevices;
    const isServerAudioAvailable = 
        Array.isArray(serverInputDevices) && serverInputDevices.length > 0 &&
        Array.isArray(serverOutputDevices) && serverOutputDevices.length > 0;

    // Set the audio state based on the availability of client and server audio devices
    useEffect(() => {
        let newAudioState: "client" | "server" | null = null;
        if (!isClientAudioAvailable && isServerAudioAvailable) {
            newAudioState = "server";
        } else if (isClientAudioAvailable && !isServerAudioAvailable) {
            newAudioState = "client";
        }

        // Set the server audio state depending on availability
        if (newAudioState && newAudioState !== audioState) {
            setAudioState(newAudioState);
            if (newAudioState === "server") {
                appState.serverSetting.updateServerSettings({
                    ...appState.serverSetting.serverSetting,
                    enableServerAudio: 1
                });
            } else { // client
                appState.serverSetting.updateServerSettings({
                    ...appState.serverSetting.serverSetting,
                    enableServerAudio: 0
                });
            }
        }

        // Update warning message
        const messages = [];
        if (!isClientAudioAvailable) {
            messages.push("Client audio not available");
        }
        if (!isServerAudioAvailable) {
            messages.push("Server audio not available");
        }
        setWarningMessage(messages.length > 0 ? messages.join(" and ") + "." : null);

    }, [isClientAudioAvailable, isServerAudioAvailable, appState.serverSetting, setAudioState, audioState]);


    const handleClientRadioChange = () => {
        if (!isClientAudioAvailable) return;
        appState.serverSetting.updateServerSettings({
            ...appState.serverSetting.serverSetting,
            enableServerAudio: 0
        })
        setAudioState("client")
    }
    
    const handleServerRadioChange = () => {
        if (!isServerAudioAvailable) return;
        appState.serverSetting.updateServerSettings({
            ...appState.serverSetting.serverSetting,
            enableServerAudio: 1
        })
        setAudioState("server")
    }
    
    return (
        <div className="space-y-4">
          <div className="pb-2 border-b border-slate-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Audio Processing</label>
                {warningMessage && (
                    <div className="ml-2 relative group">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                            {warningMessage}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex">
              <label className={`${CSS_CLASSES.radioLabel} ${!isClientAudioAvailable ? "opacity-50 cursor-not-allowed" : ""}`}>
                <input
                  type="radio"
                  className={CSS_CLASSES.radioButton}
                  checked={audioState === "client"}
                  onChange={handleClientRadioChange}
                  disabled={!isClientAudioAvailable || uiContext.isConverting}
                />
                Client
              </label>
              <label className={`${CSS_CLASSES.radioLabel} ${!isServerAudioAvailable ? "opacity-50 cursor-not-allowed" : ""}`}>
                <input
                  type="radio"
                  className={CSS_CLASSES.radioButton }
                  checked={audioState === "server"}
                  onChange={handleServerRadioChange}
                  disabled={!isServerAudioAvailable || uiContext.isConverting}
                />
                Server
              </label>
            </div>
          </div>
        </div>
    )
}

export default AudioMode;