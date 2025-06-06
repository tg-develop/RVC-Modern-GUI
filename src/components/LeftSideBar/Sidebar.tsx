import React, { JSX, useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faPen, faTrash, faTimes, faSort, faFilter } from '@fortawesome/free-solid-svg-icons';
import { RVCModelSlot, VoiceChangerType, ModelSlotUnion } from '@dannadori/voice-changer-client-js';
import { useAppState } from '../../context/AppContext';
import { useUIContext } from '../../context/UIContext';
import ModelSlot from './ModelSlot';

interface LeftSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openModal: (type: string, props?: { modelId?: string; modelName?: string; model?: RVCModelSlot }) => void;
  onSelectModel: (slotIndex: number) => void;
}

// Define Sort and Filter types
type SortOption = 'slot' | 'name';
// Updated Filter Types - will be populated dynamically
type ModelTypeVersionFilter = string; // e.g., "RVC v1", "RVC v2"
type SampleRateFilter = number | 'All'; // Keep number for direct comparison, 'All' for no filter
type EmbedderFilter = string; // e.g., "hubert_base", "spin_base"

const sortOptions: { value: SortOption, label: string }[] = [
    { value: 'slot', label: 'Slot' },
    { value: 'name', label: 'Name' },
];

function LeftSidebar({
  isSidebarOpen,
  toggleSidebar,
  openModal,
  onSelectModel 
}: LeftSidebarProps): JSX.Element | null {
  const appState = useAppState();
  const guiState = useUIContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState<SortOption>('slot');
  const [typeVersionFilter, setTypeVersionFilter] = useState<ModelTypeVersionFilter>('All');
  const [rateFilter, setRateFilter] = useState<SampleRateFilter>('All');
  const [embedderFilter, setEmbedderFilter] = useState<EmbedderFilter>('All');
  const [isSortFilterVisible, setIsSortFilterVisible] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get RVC models from appState and filter them for local display and filtering
  const localModels: RVCModelSlot[] = useMemo(() => {
    if (appState.serverSetting?.serverSetting?.modelSlots) {
      return appState.serverSetting.serverSetting.modelSlots
        .filter((slot: ModelSlotUnion): slot is RVCModelSlot => 
            slot.voiceChangerType === VoiceChangerType.RVC &&
            slot.name !== "" && 
            typeof slot.slotIndex === 'number'
        )
        .map((slot: RVCModelSlot): RVCModelSlot => ({
          ...slot,
          slotIndex: slot.slotIndex as number,
        }));
    }
    return [];
  }, [appState.serverSetting?.serverSetting?.modelSlots]);

  const handleSelectModel = async (slot: RVCModelSlot) => {
    guiState.startLoading(`Swapping to model: ${slot.name}`);
    await appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, modelSlotIndex: slot.slotIndex });
    guiState.stopLoading();
  };

  // The actual selected model ID from the global context
  const confirmedSelectedSlotIndex = appState.serverSetting?.serverSetting?.modelSlotIndex ?? null;

  // Dynamic options for filters (using localModels)
  const modelTypeVersionOptions = useMemo(() => {
    const types = new Set<string>();
    localModels.forEach(model => {
      if (model.voiceChangerType) {
        types.add(`${model.voiceChangerType}`);
      }
    });
    return ['All', ...Array.from(types).sort()];
  }, [localModels]);

  const sampleRateOptions = useMemo(() => {
    const rates = new Set<number>();
    localModels.forEach(model => {
      if (model.samplingRate) {
        rates.add(model.samplingRate);
      }
    });
    return ['All' as SampleRateFilter, ...Array.from(rates).sort((a,b) => a-b)];
  }, [localModels]);

  const embedderOptions = useMemo(() => {
    const embedders = new Set<string>();
    localModels.forEach(model => {
      if (model.embedder) {
        embedders.add(model.embedder);
      }
    });
    return ['All', ...Array.from(embedders).sort()];
  }, [localModels]);

  const filteredAndSortedModels = useMemo(() => {
    let processedModels = [...localModels];

    // Filter by search term
    if (searchTerm) {
      processedModels = processedModels.filter(model => 
        model.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type and version
    if (typeVersionFilter !== 'All') {
      processedModels = processedModels.filter(model => 
        model.voiceChangerType && model.version && `${model.voiceChangerType} ${model.version}` === typeVersionFilter
      );
    }

    // Filter by sample rate
    if (rateFilter !== 'All') {
      processedModels = processedModels.filter(model => model.samplingRate === rateFilter);
    }

    // Filter by embedder
    if (embedderFilter !== 'All') {
      processedModels = processedModels.filter(model => model.embedder === embedderFilter);
    }

    // Sort
    processedModels.sort((a, b) => {
      let comparison = 0;
      if (currentSort === 'slot') {
        comparison = (a.slotIndex as number) - (b.slotIndex as number);
      } else if (currentSort === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return processedModels;
  }, [localModels, searchTerm, currentSort, typeVersionFilter, rateFilter, embedderFilter, sortDirection]);

  // Base classes for the sidebar
  let sidebarClasses = "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-4 space-y-4 transition-all duration-300 ease-in-out flex flex-col";

  // Classes for different states
  if (isSidebarOpen) {
    // Full width on small screens (overlay), fixed width on medium and up
    sidebarClasses += " w-full md:w-72 z-10"; 
  } else {
    sidebarClasses += " w-0 p-0 overflow-hidden"; // Collapsed state
  }
 
  let finalSidebarClasses = `bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border-r border-slate-200 dark:border-gray-700 p-4 space-y-4 transition-all duration-300 ease-in-out flex flex-col z-20 `;

  if (isSidebarOpen) {
    finalSidebarClasses += 'fixed inset-y-0 left-0 w-full transform translate-x-0 md:static md:w-72 md:translate-x-0';
  } else {
    finalSidebarClasses += 'fixed -left-full w-full transform -translate-x-full md:static md:w-0 md:p-0 md:overflow-hidden md:border-r-0'; // Remove border when closed on desktop
  }

  const commonSelectClass = "w-full p-1.5 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-xs placeholder-slate-400 dark:placeholder-gray-500 text-slate-700 dark:text-slate-100";

  return (
    // Use finalSidebarClasses which correctly handles fixed/static and open/closed states
    <div className={finalSidebarClasses}>
      {/* Logo and Close button container */}
      <div className={`flex items-center mb-2 md:mb-0 justify-center relative`}>
        {/* Logo - Conditionally apply mx-auto for centering only when sidebar is open and on small screens (mobile overlay) */}
        {isSidebarOpen && (
          <img 
            src={process.env.PUBLIC_URL + '/logo.png'} 
            alt="Logo" 
            className={`h-10 md:h-12 ${isSidebarOpen ? 'mx-auto md:mx-0' : 'mx-auto'}`} 
          />
        )}
        {/* Close button for mobile overlay - only shown if sidebar is open on mobile */}
        {isSidebarOpen && (
            <button 
              onClick={toggleSidebar} 
              className={`md:hidden p-2 text-slate-600 dark:text-gray-300 self-start absolute top-0 right-0 z-10`} 
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
        )}
      </div>

      {isSidebarOpen && <hr className="hidden md:block border-slate-300 dark:border-gray-600 my-3" />}

      <h3 className={`text-xl font-semibold text-slate-800 dark:text-gray-100 ${isSidebarOpen ? 'mt-2 md:mt-0 text-center md:text-left' : 'mt-0 hidden'}`}>Model Selector</h3>
      
      {/* Render search and list only if sidebar is open to prevent layout shifts/errors when collapsed to w-0 */}
      {isSidebarOpen && (
        <>
          <div className="relative mb-2">
            <input 
              type="search" 
              placeholder="Search Models..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pr-10 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-sm placeholder-slate-400 dark:placeholder-gray-500 text-slate-700 dark:text-slate-100"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500" />
          </div>

          {/* Filter and Sort Toggle Button */}
          <div className="mb-2">
            <button 
              onClick={() => setIsSortFilterVisible(!isSortFilterVisible)}
              className="w-full flex items-center justify-between p-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md border border-slate-300 dark:border-gray-600"
            >
              <span><FontAwesomeIcon icon={faFilter} className="mr-2" /> Filter & Sort</span>
              <FontAwesomeIcon icon={isSortFilterVisible ? faTimes : faSort} />
            </button>
          </div>

          {/* Filter and Sort Controls - Conditional Rendering */}
          {isSortFilterVisible && (
            <div className="space-y-3 mb-3 p-3 border border-slate-200 dark:border-gray-700 rounded-md">
              {/* Sort Controls */}
              <div className="space-y-1 pb-2 border-b border-slate-200 dark:border-gray-700">
                <label htmlFor="sortOption" className="text-xs font-medium text-slate-600 dark:text-gray-300 flex items-center"><FontAwesomeIcon icon={faSort} className="mr-1.5"/>Sort by:</label>
                <div className="flex gap-2 items-center">
                    <select id="sortOption" value={currentSort} onChange={(e) => setCurrentSort(e.target.value as SortOption)} className={`${commonSelectClass} flex-grow`}>
                        {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button 
                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-1.5 border border-slate-300 dark:border-gray-600 rounded-md hover:bg-slate-50 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-300"
                        title={sortDirection === 'asc' ? "Sort Descending" : "Sort Ascending"}
                    >
                        {sortDirection === 'asc' ? <span className="text-xs">ASC</span> : <span className="text-xs">DESC</span>} {/* Placeholder for actual icons if preferred */}
                    </button>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="space-y-1 pt-2">
                <p className="text-xs font-medium text-slate-600 dark:text-gray-300 flex items-center mb-1"><FontAwesomeIcon icon={faFilter} className="mr-1.5"/>Filter by:</p>
                <div className="grid grid-cols-2 gap-2 items-center">
                    <label htmlFor="typeVersionFilter" className="text-xs font-medium text-slate-500 dark:text-gray-400">Type:</label>
                    <select id="typeVersionFilter" value={typeVersionFilter} onChange={(e) => setTypeVersionFilter(e.target.value as ModelTypeVersionFilter)} className={commonSelectClass}>
                        {modelTypeVersionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                    <label htmlFor="rateFilter" className="text-xs font-medium text-slate-500 dark:text-gray-400">Rate:</label>
                    <select id="rateFilter" value={rateFilter === 'All' ? 'All' : rateFilter} onChange={(e) => setRateFilter(e.target.value === 'All' ? 'All' : Number(e.target.value) as SampleRateFilter)} className={commonSelectClass}>
                        {sampleRateOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All' : `${opt/1000}kHz`}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center"> {/* Added Embedder Filter */}
                    <label htmlFor="embedderFilter" className="text-xs font-medium text-slate-500 dark:text-gray-400">Embedder:</label>
                    <select id="embedderFilter" value={embedderFilter} onChange={(e) => setEmbedderFilter(e.target.value as EmbedderFilter)} className={commonSelectClass}>
                        {embedderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
              </div>
            </div>
          )}

          <hr className="border-slate-300 dark:border-gray-600 my-2" />

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
      )}
    </div>
  );
}

export default LeftSidebar; 