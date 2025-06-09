import { createContext, useContext, ReactNode } from "react";
import { AppGuiSettingStateAndMethod, useAppGuiSetting } from "../scripts/useAppGuiSetting";
import { AudioConfigState, useAudioConfig } from "../scripts/useAudioConfig";

type AppRootProviderProps = {
    children: ReactNode;
};

export type AppRootValue = {
    audioContextState: AudioConfigState;
    appGuiSettingState: AppGuiSettingStateAndMethod;
    getGUISetting: () => Promise<void>;
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

    const getGUISetting = async () => {
        await appGuiSettingState.getAppGuiSetting(`/assets/gui_settings/GUI.json`);
    };

    const providerValue: AppRootValue = {
        audioContextState,
        appGuiSettingState,
        getGUISetting,
    };

    return <AppRootContext.Provider value={providerValue}>{children}</AppRootContext.Provider>;
}; 