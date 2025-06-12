import DebouncedSlider from "../Helpers/DebouncedSlider";
import { ClientState } from "@dannadori/voice-changer-client-js";
import { CSS_CLASSES } from "../../styles/constants";
import { useEffect, useState } from "react";
import { UIContextType } from "../../context/UIContext";

interface SilenceThresholdProps {
    appState: ClientState;
    uiState: UIContextType;
}

function SilentThreshold({ appState, uiState }: SilenceThresholdProps) {
  // Local state for immediate slider labels
  const [localSilentThreshold, setLocalSilentThreshold] = useState<number>(
    appState.serverSetting?.serverSetting?.silentThreshold ?? -75
  );

  useEffect(() => {
    const st = appState.serverSetting?.serverSetting?.silentThreshold;
    setLocalSilentThreshold(st);
  }, [appState.serverSetting?.serverSetting?.silentThreshold]);

  const handleChangeSilentThreshold = (value: number) => {
    setLocalSilentThreshold(value);
    appState.serverSetting.updateServerSettings({
      ...appState.serverSetting?.serverSetting,
      silentThreshold: value
    });
  };

  return (
    <div>
      <label htmlFor="inSens" className={CSS_CLASSES.label}>Input Sensitivity (In. Sens):</label>
      <DebouncedSlider
        id="inSens"
        name="inSens"
        min={-90}
        max={-60}
        step={1}
        value={localSilentThreshold}
        className={CSS_CLASSES.range}
        onImmediateChange={setLocalSilentThreshold}
        onChange={handleChangeSilentThreshold}
      />
      <p className={CSS_CLASSES.sliderValue}>{localSilentThreshold} dB</p>
    </div>
  );
}

export default SilentThreshold;