import { useEffect, useState } from "react"

export type AppGuiSetting = {
    type: "demo",
    front: {
        "modelSlotControl": GuiComponentSetting[],
    }
}

export type GuiComponentSetting = {
    "name": string,
    "options": any
}

const InitialAppGuiDemoSetting: AppGuiSetting = {
    type: "demo",
    front: {
        "modelSlotControl": []
    }
}

export type AppGuiSettingState = {
    appGuiSetting: AppGuiSetting
    guiSettingLoaded: boolean
    version: string
    edition: string
}

export type AppGuiSettingStateAndMethod = AppGuiSettingState & {
    getAppGuiSetting: (url: string) => Promise<void>
    clearAppGuiSetting: () => void
}

export const useAppGuiSetting = (): AppGuiSettingStateAndMethod => {
    const [guiSettingLoaded, setGuiSettingLoaded] = useState<boolean>(false)
    const [appGuiSetting, setAppGuiSetting] = useState<AppGuiSetting>(InitialAppGuiDemoSetting)
    const [version, setVersion] = useState<string>("")
    const [edition, setEdition] = useState<string>("")
    const getAppGuiSetting = async (url: string) => {
        const res = await fetch(`${url}`, {
            method: "GET",
        })
        const appSetting = await res.json() as AppGuiSetting
        setAppGuiSetting(appSetting)
        setGuiSettingLoaded(true)
    }
    const clearAppGuiSetting = () => {
        setAppGuiSetting(InitialAppGuiDemoSetting)
        setGuiSettingLoaded(false)
    }

    useEffect(() => {
        const getVersionInfo = async () => {
            const res = await fetch('http://127.0.0.1:18888/version')
            const version = await res.text()
            setVersion(version)
        }
        getVersionInfo()
    }, [])

    useEffect(() => {
        const getVersionInfo = async () => {
            const res = await fetch('http://127.0.0.1:18888/edition')
            const edition = await res.text()
            setEdition(edition)
        }
        getVersionInfo()
    }, [])

    return {
        appGuiSetting,
        guiSettingLoaded,
        version,
        edition,
        getAppGuiSetting,
        clearAppGuiSetting,
    }
}
