import { UIContextType } from "../../context/UIContext";
import { AppGuiSettingState } from "../../scripts/useAppGuiSetting";
import { CSS_CLASSES } from "../../styles/constants";
import { ClientState } from "@dannadori/voice-changer-client-js";
import { F0Detector } from "@dannadori/voice-changer-client-js";

interface F0ExtractionProps {
    appState: ClientState;
    uiState: UIContextType;
    appGuiSettingState: AppGuiSettingState;
}

const f0Detectors = [
  'crepe_full_onnx', 'crepe_tiny_onnx', 'crepe_full', 'crepe_tiny',
  'rmvpe', 'rmvpe_onnx', 'fcpe', 'fcpe_onnx'
]

function F0Extraction({ appState, uiState, appGuiSettingState }: F0ExtractionProps) {
    const generateF0DetOptions = () => {
        // DirectML can only use ONNX models
        if (appGuiSettingState.serverInfo.edition.indexOf("DirectML") >= 0) {
            const recommended = f0Detectors.filter(extractor => extractor.includes('_onnx'));
            return Object.values(appState.serverSetting.serverSetting.voiceChangerParams).map((x) => {
                if (recommended.includes(x)) {
                    return (
                        <option key={x} value={x}>
                            {x}
                        </option>
                    );
                } else {
                    return (
                        <option key={x} value={x} disabled>
                            {x}(N/A)
                        </option>
                    );
                }
            });
        } else {
            return Object.values(f0Detectors).map((x) => {
                return (
                    <option key={x} value={x}>
                        {x}
                    </option>
                );
            });
        }
      };

    return (
        <div>
            <label htmlFor="f0Detector" className={CSS_CLASSES.label}>Pitch Extraction Algorithm</label>
            <select
                id="f0Detector"
                className={CSS_CLASSES.select}
                value={appState.serverSetting?.serverSetting?.f0Detector ?? ''}
                disabled={uiState.isConverting}
                onChange={async (e) => {
                  uiState.startLoading(`Changing F0 Detector to ${e.target.value}`);
                  await appState.serverSetting.updateServerSettings({
                    ...appState.serverSetting?.serverSetting,
                    f0Detector: e.target.value as F0Detector
                  });
                  uiState.stopLoading();
                }}
              >
                {generateF0DetOptions()}
              </select>
        </div>
    );
}

export default F0Extraction;