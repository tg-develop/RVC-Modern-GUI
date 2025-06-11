import { useEffect, useState } from "react"

export type AppGuiSetting = {
    version: string,
    edition: string,
}

export type ServerInfo = {
    version: string,
    edition: string,
}

export type AppGuiSettingState = {
    appGuiSetting: AppGuiSetting
    serverInfo: ServerInfo
}

export const useAppGuiSetting = (): AppGuiSettingState => {
    const [appGuiSetting, setAppGuiSetting] = useState<AppGuiSetting>({ version: "", edition: "" })
    const [serverInfo, setServerInfo] = useState<ServerInfo>({ version: "", edition: "" })
    
    const getAppGuiSetting = async (url: string) => {
        const res = await fetch(`${url}`, {
            method: "GET",
        })
        const appSetting = await res.json() as AppGuiSetting
        
        setAppGuiSetting(appSetting)
        console.log(appGuiSetting)
    }

    useEffect(() => {
        getAppGuiSetting("assets/gui_settings/GUI.json")
    }, [])

    useEffect(() => {
        const getVersionInfo = async () => {
            const res = await fetch('/version')
            const version = await res.text()
            setServerInfo({ ...serverInfo, version: version })
        }
        getVersionInfo()
    }, [])

    useEffect(() => {
        const getVersionInfo = async () => {
            const res = await fetch('/edition')
            const edition = await res.text()
            setServerInfo({ ...serverInfo, edition: edition })
            console.log(serverInfo)
        }
        getVersionInfo()
    }, [])

    return {
        appGuiSetting,
        serverInfo,
    }
}
