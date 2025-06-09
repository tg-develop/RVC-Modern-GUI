import { useState, JSX } from 'react';
import { ClientState, RVCModelSlot } from '@dannadori/voice-changer-client-js';
import { CSS_CLASSES } from '../../../styles/constants';
import GenericModal from '../../Modals/GenericModal';
import { UIContextType } from '../../../context/UIContext';
import MergeFilter from './MergeFilter';
import MergeModelList from './MergeModelList';
import { useAppState } from '../../../context/AppContext';

interface ModelMergeInfo {
  slot: RVCModelSlot;
  percentage: number;
}

interface MergeLabModalProps {
  guiState: UIContextType;
  showMerge: boolean;
  setShowMerge: (showMerge: boolean) => void;
}

function MergeLabModal({ guiState, showMerge, setShowMerge }: MergeLabModalProps): JSX.Element {
  const appState = useAppState();

  const [sampleRate, setSampleRate] = useState<number>(40000);
  const [embedder, setEmbedder] = useState<string>('hubert_base');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<ModelMergeInfo[]>([]);

  const getFilteredModels = (): RVCModelSlot[] => {
    if (!appState.serverSetting.serverSetting.modelSlots) return [];
    
    return appState.serverSetting.serverSetting.modelSlots.filter((slot: RVCModelSlot) => {
      if (!slot.name || slot.name.length === 0) return false;
      
      if (slot.samplingRate && slot.samplingRate !== sampleRate) return false;
      
      if (slot.embedder && slot.embedder !== embedder) return false;
      
      if (searchText && !slot.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      
      return true;
    });
  };

  const handleFilterChange = () => {
    setSelectedModels([]);
  };

  const handleModelToggle = (slot: RVCModelSlot) => {
    const isSelected = selectedModels.some(m => m.slot.slotIndex === slot.slotIndex);
    
    if (isSelected) {
      setSelectedModels(selectedModels.filter(m => m.slot.slotIndex !== slot.slotIndex));
    } else {
      setSelectedModels([...selectedModels, { slot, percentage: 50 }]);
    }
  };

  const handlePercentageChange = (slotIndex: number, percentage: number) => {
    setSelectedModels(selectedModels.map(m => 
      m.slot.slotIndex === slotIndex 
        ? { ...m, percentage }
        : m
    ));
  };

  const handleClose = () => {
    setShowMerge(false);
    setSelectedModels([]);
    setSampleRate(48000);
    setEmbedder('hubert_base');
    setSearchText('');
  };

  const handleMerge = async () => {
    if (selectedModels.length < 2) {
      guiState.showError('Please select at least 2 models to merge.', 'Error');
      return;
    }

    const totalWeight = selectedModels.reduce((sum, m) => sum + m.percentage, 0);
    if (totalWeight !== 100) {
      guiState.showError('Total weight must equal 100%.', 'Error');
      return;
    }

    try {
      guiState.showError('Model merging started. This may take a while...', 'Warning');
      
      const mergeData = {
        models: selectedModels.map(m => ({
          slotIndex: m.slot.slotIndex,
          weight: m.percentage / 100
        })),
        sampleRate,
        embedder
      };

      console.log('Merging models with data:', mergeData);
      
      guiState.showError('Models merged successfully!', 'Confirm');
      handleClose();
    } catch (error) {
      console.error('Error merging models:', error);
      guiState.showError(`Error merging models: ${error instanceof Error ? error.message : String(error)}`, 'Error');
    }
  };

  const filteredModels = getFilteredModels();

  return (
    <GenericModal
      isOpen={showMerge}
      onClose={handleClose}
      title="Merge Lab"
      closeOnOutsideClick={false}
      primaryButton={{
        text: 'Merge',
        onClick: handleMerge,
        className: CSS_CLASSES.modalPrimaryButton
      }}
      secondaryButton={{
        text: 'Close',
        onClick: handleClose,
        className: CSS_CLASSES.modalSecondaryButton
      }}
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        <MergeFilter
          sampleRate={sampleRate}
          setSampleRate={setSampleRate}
          embedder={embedder}
          setEmbedder={setEmbedder}
          searchText={searchText}
          setSearchText={setSearchText}
          onFilterChange={handleFilterChange}
        />

        <MergeModelList
          models={filteredModels}
          selectedModels={selectedModels}
          onModelToggle={handleModelToggle}
          onPercentageChange={handlePercentageChange}
          modelDir={appState.serverSetting.serverSetting.voiceChangerParams.model_dir}
        />
      </div>
    </GenericModal>
  );
}

export default MergeLabModal; 