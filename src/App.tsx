import './App.css';
import LeftSidebar from './components/LeftSideBar/Sidebar';
import BottomBar from './components/BottomBar/BottomBar';
import React, { useContext, JSX, useState, useEffect, ReactNode } from 'react';
import { ThemeContext } from './context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import GenericModal from './components/Modals/GenericModal';
import MergeLabModal from './components/BottomBar/Modals/MergeLabModal';
import AdvancedSettingsModal from './components/BottomBar/Modals/AdvancedSettingsModal';
import ServerInfoModal from './components/BottomBar/Modals/ServerInfoModal';
import ClientInfoModal from './components/BottomBar/Modals/ClientInfoModal';
import UploadModelModal from './components/LeftSideBar/Modals/UploadModelModal';
import EditModelModal from './components/LeftSideBar/Modals/EditModelModal';
import DeleteModelModal from './components/LeftSideBar/Modals/DeleteModelModal';
import PassthroughConfirmModal, { PassthroughConfirmModalProps } from './components/BottomBar/Modals/PassthroughConfirmModal';
import { RVCModelSlot } from '@dannadori/voice-changer-client-js';
import MainContent from './components/MainContent';

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
  transparent?: boolean;
}

function App(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= MD_BREAKPOINT);
  const [currentModal, setCurrentModal] = useState<CurrentModalState | null>(null);

  useEffect(() => {
    const breakpointHandleResize = () => {
      const currentIsDesktop = window.innerWidth >= MD_BREAKPOINT;
      setIsSidebarOpen(currentIsDesktop);
    };

    window.addEventListener('resize', breakpointHandleResize);
    breakpointHandleResize(); 

    return () => window.removeEventListener('resize', breakpointHandleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeModal = () => {
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
          primaryButton: { text: 'Save', onClick: () => { alert('Saving...'); closeModal(); } },
          secondaryButton: { text: 'Close', onClick: () => { closeModal(); } } };
        break;
      case 'serverInfo':
        modalDetails = { title: 'Server Info', content: <ServerInfoModal />,
          secondaryButton: { text: 'Close', onClick: () => { closeModal(); } } };
        break;
      case 'clientInfo':
        modalDetails = { title: 'Client Info', content: <ClientInfoModal />,
          secondaryButton: { text: 'Close', onClick: () => { closeModal(); } } };
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
      secondaryButton: modalDetails.secondaryButton,
      transparent: false
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
        />
        
        <main className="flex-grow p-4 overflow-y-auto">
          <MainContent openModal={openModal} />
        </main>
      </div>
      <BottomBar openModal={openModal} />

      { currentModal && currentModal.content &&
        <GenericModal
          isOpen={!!currentModal}
          onClose={closeModal}
          title={currentModal.title}
          primaryButton={currentModal.primaryButton}
          secondaryButton={currentModal.secondaryButton}
        >
          {currentModal.content}
        </GenericModal>
      }
    </div>
  );
}

export default App; 