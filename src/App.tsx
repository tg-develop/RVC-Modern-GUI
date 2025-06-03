import './App.css';
import LeftSidebar from './components/LeftSidebar';
import BottomBar from './components/BottomBar';
import React, { useContext, JSX, useState, useEffect, ReactNode } from 'react';
import { ThemeContext } from './context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import GenericModal from './components/modals/GenericModal';
import MergeLabModal from './components/modals/content/MergeLabModal';
import AdvancedSettingsModal from './components/modals/content/AdvancedSettingsModal';
import ServerInfoModal from './components/modals/content/ServerInfoModal';
import ClientInfoModal from './components/modals/content/ClientInfoModal';
import UploadModelModal from './components/modals/content/UploadModelModal';
import EditModelModal from './components/modals/content/EditModelModal';
import DeleteModelModal from './components/modals/content/DeleteModelModal';
import PassthroughConfirmModal, { PassthroughConfirmModalProps } from './components/modals/content/PassthroughConfirmModal';
import { useAppState } from './context/AppContext';
import { RVCModelSlot, ModelSlotUnion } from '@dannadori/voice-changer-client-js';
import MainContent from './components/MainContent';

// Temporary type definition for appState to include necessary properties for linter
// You will need to ensure AppStateValue is properly exported from AppContext and includes these + switchModel
interface AppStateForApptsx {
    serverSetting?: { serverSetting: any }; // Using any for serverSetting object type temporarily
    initialized?: boolean;
    switchModel?: (slotIndex: number) => Promise<void>; 
    // Add other properties of AppStateValue if the linter complains later
}

const MD_BREAKPOINT = 768; // Typical Tailwind md breakpoint

// Define a more flexible type for modalProps passed to openModal
interface ModelRelatedProps {
    modelId?: string; 
    modelName?: string;
    model?: RVCModelSlot; 
}

// Combine with PassthroughConfirmModalProps (excluding closeModal as it's added by App.tsx)
type OpenModalProps = ModelRelatedProps | (Omit<PassthroughConfirmModalProps, 'closeModal'> & { typeSpecificProp?: any });

interface CurrentModalState {
  content: ReactNode | null;
  title: string;
  props?: OpenModalProps; 
  primaryButton?: { text: string; onClick: () => void; className?: string };
  secondaryButton?: { text: string; onClick: () => void; className?: string };
}

function App(): JSX.Element {
  const themeContext = useContext(ThemeContext);
  const appState = useAppState() as AppStateForApptsx; // Cast to the temporary interface
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= MD_BREAKPOINT);
  const [currentModal, setCurrentModal] = useState<CurrentModalState | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);

  const serverModelSlotIndexFromContext = appState.serverSetting?.serverSetting?.modelSlotIndex;
  const [activelySwitchingToSlot, setActivelySwitchingToSlot] = useState<number | null>(null);

  useEffect(() => {
    // This effect now primarily manages stopping the loading indicator
    if (isLoadingModel && typeof serverModelSlotIndexFromContext === 'number' && serverModelSlotIndexFromContext === activelySwitchingToSlot) {
        setIsLoadingModel(false);
        setActivelySwitchingToSlot(null);
        console.log(`App: Model switch to slot ${serverModelSlotIndexFromContext} confirmed by context.`);
    } else if (isLoadingModel && activelySwitchingToSlot !== null && serverModelSlotIndexFromContext !== activelySwitchingToSlot) {
        // This case might happen if the switch attempt failed and server reverted or selected something else,
        // or if the initial state of serverModelSlotIndexFromContext was already the target but we forced loading.
        // Consider if an explicit failure signal from switchModel is needed.
        // For now, if the actively switching slot is no longer the context's slot, stop loading.
        if(appState.serverSetting?.serverSetting?.modelSlots?.some((s: ModelSlotUnion) => s.slotIndex === activelySwitchingToSlot)){
            // Only stop loading if the context has changed to something *else*
            // and not just that the context hasn't updated *yet*.
        } else {
             // If the model we were switching to is no longer valid or context changed to something else unexpectedly
            // setIsLoadingModel(false); 
            // setActivelySwitchingToSlot(null);
            // console.warn(`App: Loading stopped. Context slot (${serverModelSlotIndexFromContext}) does not match target (${activelySwitchingToSlot}).`);
            // Decided to keep loading until context confirms the activelySwitchingToSlot, or switchModel fails.
        }
    }
  }, [serverModelSlotIndexFromContext, isLoadingModel, activelySwitchingToSlot, appState.serverSetting?.serverSetting?.modelSlots]);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= MD_BREAKPOINT;
      if (isDesktop && !isSidebarOpen && window.innerWidth >= MD_BREAKPOINT) {
         setIsSidebarOpen(true);
      } else if (!isDesktop && isSidebarOpen && window.innerWidth < MD_BREAKPOINT) {
        setIsSidebarOpen(false);
      }
    };

    const simplifiedHandleResize = () => {
        setIsSidebarOpen(window.innerWidth >= MD_BREAKPOINT);
    };

    const breakpointHandleResize = () => {
      const currentIsDesktop = window.innerWidth >= MD_BREAKPOINT;
      setIsSidebarOpen(currentIsDesktop);
    };

    window.addEventListener('resize', breakpointHandleResize);
    breakpointHandleResize(); 

    return () => window.removeEventListener('resize', breakpointHandleResize);
  }, []);

  const handleSelectModel = async (slotIndexToLoad: number) => {
    const currentServerSlot = appState.serverSetting?.serverSetting?.modelSlotIndex;

    if (slotIndexToLoad === currentServerSlot && !isLoadingModel) {
        console.log(`App: Slot ${slotIndexToLoad} is already selected and not loading. No action.`);
        return; 
    }
    if (isLoadingModel && slotIndexToLoad === activelySwitchingToSlot) {
        console.log(`App: Already attempting to load slot ${slotIndexToLoad}. No action.`);
        return; 
    }

    if (!appState.switchModel) {
        console.error("App: switchModel function is not available on appState. Cannot switch model.");
        return;
    }

    console.log(`App: Initiating model switch to slot ${slotIndexToLoad}. Current context slot: ${currentServerSlot}`);
    setIsLoadingModel(true);
    setActivelySwitchingToSlot(slotIndexToLoad);

    try {
        await appState.switchModel(slotIndexToLoad);
        // Successfully initiated switch. The useEffect watching serverModelSlotIndexFromContext
        // will handle setting isLoadingModel to false when context updates.
        console.log(`App: switchModel(${slotIndexToLoad}) call completed.`);
    } catch (error) {
        console.error(`App: Failed to switch model to slot ${slotIndexToLoad}:`, error);
        setIsLoadingModel(false); 
        setActivelySwitchingToSlot(null); 
    }

    // Close sidebar on mobile after selection attempt
    if (window.innerWidth < MD_BREAKPOINT && isSidebarOpen) {
        setIsSidebarOpen(false);
    }
  };

  if (!themeContext || !appState.initialized) {
    return <div>Loading...</div>;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeModal = () => {
    if (isLoadingModel) return; // Prevent closing modal if a model is loading, or adjust as needed
    setCurrentModal(null);
  };

  const openModal = (type: string, modalProps?: OpenModalProps) => {
    let modalDetails: Partial<CurrentModalState> = { content: null, title: '' };
    let finalPropsForContent: any = modalProps || {}; // Pass all modalProps to content by default

    switch (type) {
      case 'mergeLab':
        modalDetails = { title: 'Merge Lab', content: <MergeLabModal />,
          primaryButton: { text: 'Start Merge', onClick: () => { alert('Merging...'); closeModal(); } } };
        break;
      case 'advancedSettings':
        modalDetails = { title: 'Advanced Settings', content: <AdvancedSettingsModal />,
          primaryButton: { text: 'Save Changes', onClick: () => { alert('Saving...'); closeModal(); } } };
        break;
      case 'serverInfo':
        modalDetails = { title: 'Server Info', content: <ServerInfoModal /> };
        break;
      case 'clientInfo':
        modalDetails = { title: 'Client Info', content: <ClientInfoModal /> };
        break;
      case 'uploadModel':
        modalDetails = { title: 'Upload New Model', content: <UploadModelModal />,
          primaryButton: { text: 'Upload', onClick: () => { alert('Uploading...'); closeModal(); } } };
        break;
      case 'editModel':
        const editProps = modalProps as ModelRelatedProps;
        if (editProps?.model) {
          modalDetails = { title: `Edit Model: ${editProps.model.name}`, content: <EditModelModal modelId={editProps.model.slotIndex.toString()} modelName={editProps.model.name} />,
            primaryButton: { text: 'Save Changes', onClick: () => { alert(`Saving ${editProps.model?.name}...`); closeModal(); } } };
        } else if (editProps?.modelId && editProps?.modelName) {
            modalDetails = { title: `Edit Model: ${editProps.modelName}`, content: <EditModelModal modelId={editProps.modelId} modelName={editProps.modelName} />,
            primaryButton: { text: 'Save Changes', onClick: () => { alert(`Saving ${editProps.modelName}...`); closeModal(); } } };
        }
        finalPropsForContent = editProps; // Ensure modelId, modelName are passed to CurrentModalState.props
        break;
      case 'deleteModel':
        const deleteProps = modalProps as ModelRelatedProps;
        if (deleteProps?.model) {
            modalDetails = { title: `Delete Model: ${deleteProps.model.name}`, content: <DeleteModelModal modelId={deleteProps.model.slotIndex.toString()} modelName={deleteProps.model.name} />,
            primaryButton: { text: 'Delete', onClick: () => { alert(`Deleting ${deleteProps.model?.name}...`); closeModal(); }, className: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white' },
            secondaryButton: { text: 'Cancel', onClick: closeModal }};
        } else if (deleteProps?.modelId && deleteProps?.modelName) {
            modalDetails = { title: `Delete Model: ${deleteProps.modelName}`, content: <DeleteModelModal modelId={deleteProps.modelId} modelName={deleteProps.modelName} />,
            primaryButton: { text: 'Delete', onClick: () => { alert(`Deleting ${deleteProps.modelName}...`); closeModal(); }, className: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white' },
            secondaryButton: { text: 'Cancel', onClick: closeModal }};
        }
        finalPropsForContent = deleteProps;
        break;
      case 'passThrough':
        const passThroughProps = modalProps as Omit<PassthroughConfirmModalProps, 'closeModal'>;
        modalDetails = {
          title: passThroughProps.title || 'Confirm',
          content: <PassthroughConfirmModal {...passThroughProps} closeModal={closeModal} />
        };
        finalPropsForContent = passThroughProps;
        break;
      default:
        console.warn('Unknown modal type:', type);
        return;
    }
    
    setCurrentModal({ 
      title: modalDetails.title || 'Modal',
      content: modalDetails.content,
      props: finalPropsForContent,
      primaryButton: modalDetails.primaryButton,
      secondaryButton: modalDetails.secondaryButton
    });
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 text-gray-600 dark:text-gray-300 fixed top-3 left-3 z-30 bg-gray-200 dark:bg-gray-700 rounded-md shadow"
        aria-label="Toggle sidebar"
      >
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
      </button>

      <div className={`flex flex-grow overflow-hidden ${!isSidebarOpen && window.innerWidth < MD_BREAKPOINT ? 'pt-0' : 'pt-12'} md:pt-0`}> 
        <LeftSidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          openModal={openModal} 
          onSelectModel={handleSelectModel}
        />
        
        <main className="flex-grow p-4 overflow-y-auto">
          <MainContent openModal={openModal} />
        </main>
      </div>
      <BottomBar openModal={openModal} />

      {currentModal && currentModal.content && !isLoadingModel && (
        <GenericModal
          isOpen={!!currentModal}
          onClose={closeModal}
          title={currentModal.title}
          primaryButton={currentModal.primaryButton}
          secondaryButton={currentModal.secondaryButton}
        >
          {currentModal.content}
        </GenericModal>
      )}

      {isLoadingModel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-md flex flex-col justify-center items-center z-50 p-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading Model...</p>
          <p className="text-slate-300 text-sm">Please wait while the selected model is being prepared.</p>
        </div>
      )}
    </div>
  );
}

export default App; 