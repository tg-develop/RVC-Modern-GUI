import { JSX, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { RVCModelSlot } from '@dannadori/voice-changer-client-js';
import { useAppState } from '../../context/AppContext';
import { useUIContext } from '../../context/UIContext';
import ModelList from './ModelList';
import ModelFilter from './ModelFilter';
import UploadModelModal from './Modals/UploadModelModal';

interface LeftSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openModal: (type: string, props?: { modelId?: string; modelName?: string; model?: RVCModelSlot }) => void;
}

function LeftSidebar({
  isSidebarOpen,
  toggleSidebar,
  openModal
}: LeftSidebarProps): JSX.Element | null {
  const appState = useAppState();
  const guiState = useUIContext();

  const [showUpload, setShowUpload] = useState<boolean>(false);  
  const [filteredAndSortedModels, setFilteredAndSortedModels] = useState<RVCModelSlot[]>([]);

  const handleSelectModel = async (slot: RVCModelSlot) => {
    guiState.startLoading(`Swapping to model: ${slot.name}`);
    await appState.serverSetting.updateServerSettings({ ...appState.serverSetting.serverSetting, modelSlotIndex: slot.slotIndex });
    guiState.stopLoading();
  };

  // The actual selected model ID from the global context
  const confirmedSelectedSlotIndex = appState.serverSetting?.serverSetting?.modelSlotIndex ?? null;

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
          <UploadModelModal 
            appState={appState} 
            guiState={guiState} 
            showUpload={showUpload} 
            setShowUpload={setShowUpload} 
          />

          <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium text-slate-600 dark:text-gray-400`}>Available Models ({filteredAndSortedModels.length})</span>
              <button 
                  onClick={() => setShowUpload(true)} 
                  className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" 
                  title="Upload New Model"
              >
              <FontAwesomeIcon icon={faPlus} size="lg" />
              </button>
          </div>

          <ModelFilter 
            appState={appState}
            setFilteredAndSortedModels={setFilteredAndSortedModels}
          />

          <hr className="border-slate-300 dark:border-gray-600 my-2" />

          <ModelList  
            filteredAndSortedModels={filteredAndSortedModels}
            openModal={openModal}
            handleSelectModel={handleSelectModel}
            confirmedSelectedSlotIndex={confirmedSelectedSlotIndex}
            appState={appState}
          />
        </>
      )}
    </div>
  );
}

export default LeftSidebar; 