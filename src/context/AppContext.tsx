import { ClientState } from "@dannadori/voice-changer-client-js";
import React, { useContext, useEffect, useRef } from "react";
import { ReactNode } from "react";
import { useVCClient } from "../scripts/useVCClient";
import { useAppRoot } from "./AppRootProvider";

type Props = {
    children: ReactNode;
};

export type AppContextValue = ClientState & {
    audioContext: AudioContext;
    initializedRef: React.MutableRefObject<boolean>;
};

const AppStateContext = React.createContext<AppContextValue | null>(null);
export const useAppState = (): AppContextValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppContextProvider");
    }
    return state;
};

export const AppContextProvider = ({ children }: Props) => {
    const appRoot = useAppRoot();
    const clientState = useVCClient({ audioContext: appRoot.audioContextState.audioContext });
    console.log(clientState);
    const initializedRef = useRef<boolean>(false);
    useEffect(() => {
        if (clientState.clientState.initialized) {
            initializedRef.current = true;
            clientState.clientState.getInfo();
            // clientState.clientState.setVoiceChangerClientSetting({
            //     ...clientState.clientState.setting.voiceChangerClientSetting
            // })
        }
    }, [clientState.clientState.initialized]);
    
    const providerValue: AppContextValue = {
        audioContext: appRoot.audioContextState.audioContext!,
        ...clientState.clientState,
        initializedRef,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
