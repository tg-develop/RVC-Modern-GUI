import ModelSlot from "./ModelSlot";
import { ClientState, RVCModelSlot } from "@dannadori/voice-changer-client-js";

interface ModelListProps {
    filteredAndSortedModels: RVCModelSlot[];
    handleSelectModel: (slot: RVCModelSlot) => Promise<void>;
    confirmedSelectedSlotIndex: number | null;
    appState: ClientState;
}

function ModelList({ filteredAndSortedModels, handleSelectModel, confirmedSelectedSlotIndex, appState }: ModelListProps) {  
    return (
        <>
        <ul className="space-y-2 flex-grow overflow-y-auto min-h-[100px]">
            {filteredAndSortedModels.length > 0 ? (
                filteredAndSortedModels.map(model => (
                  <ModelSlot 
                    key={model.slotIndex} 
                    model={model} 
                    handleSelectModel={handleSelectModel} 
                    modelDir={appState.serverSetting.serverSetting.voiceChangerParams.model_dir}
                    selected={model.slotIndex === confirmedSelectedSlotIndex} />
                ))
            ) : (
                <p className="text-center text-sm text-slate-500 dark:text-gray-400 py-4">No models match your criteria.</p>
            )}
        </ul>
        </>
    )
}

export default ModelList;
