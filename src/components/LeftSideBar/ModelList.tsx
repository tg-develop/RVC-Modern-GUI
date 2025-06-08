import ModelSlot from "./ModelSlot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ClientState, RVCModelSlot } from "@dannadori/voice-changer-client-js";

interface ModelListProps {
    filteredAndSortedModels: RVCModelSlot[];
    openModal: (type: string, props?: { modelId?: string; modelName?: string; model?: RVCModelSlot }) => void;
    handleSelectModel: (slot: RVCModelSlot) => Promise<void>;
    confirmedSelectedSlotIndex: number | null;
    appState: ClientState;
}

function ModelList({ filteredAndSortedModels, openModal, handleSelectModel, confirmedSelectedSlotIndex, appState }: ModelListProps) {  
    return (
        <>
        <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium text-slate-600 dark:text-gray-400`}>Available Models ({filteredAndSortedModels.length})</span>
            <button 
                onClick={() => openModal('uploadModel')} 
                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" 
                title="Upload New Model"
            >
            <FontAwesomeIcon icon={faPlus} size="lg" />
            </button>
        </div>

        <ul className="space-y-2 flex-grow overflow-y-auto min-h-[100px]">
            {filteredAndSortedModels.length > 0 ? (
                filteredAndSortedModels.map(model => (
                  <ModelSlot 
                    key={model.slotIndex} 
                    model={model} 
                    openModal={openModal} 
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
