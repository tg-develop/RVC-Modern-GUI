import { createContext, useContext, ReactNode } from "react";
import { AppGuiSettingState, useAppGuiSetting } from "../scripts/useAppGuiSetting";
import { AudioConfigState, useAudioConfig } from "../scripts/useAudioConfig";

type AppRootProviderProps = {
    children: ReactNode;
};

export type AppRootValue = {
    audioContextState: AudioConfigState;
    appGuiSettingState: AppGuiSettingState;
};

const AppRootContext = createContext<AppRootValue | null>(null);

export const useAppRoot = (): AppRootValue => {
    const context = useContext(AppRootContext);
    if (!context) {
        throw new Error("useAppRoot must be used within an AppRootProvider");
    }
    return context;
};

export const AppRootProvider = ({ children }: AppRootProviderProps) => {
    const audioContextState = useAudioConfig(); 
    const appGuiSettingState = useAppGuiSetting();

    const providerValue: AppRootValue = {
        audioContextState,
        appGuiSettingState,
    };

    return <AppRootContext.Provider value={providerValue}>{children}</AppRootContext.Provider>;
}; 