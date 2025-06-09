import { JSX } from 'react';
import { useAppState } from '../../../context/AppContext';
import GenericModal from '../../Modals/GenericModal';
import { CSS_CLASSES } from '../../../styles/constants';

interface ClientInfoModalProps {
  showClientInfo: boolean;
  setShowClientInfo: (showClientInfo: boolean) => void;
}

function ClientInfoModal({ showClientInfo, setShowClientInfo }: ClientInfoModalProps): JSX.Element {
  const appState = useAppState();
  const clientJson = JSON.stringify(appState.setting, null, 2);

  const handleClose = () => {
    setShowClientInfo(false);
  };

  return (
    <GenericModal
      isOpen={showClientInfo}
      onClose={handleClose}
      title="Client Info"
      primaryButton={{
        text: 'Close',
        onClick: handleClose,
        className: CSS_CLASSES.modalPrimaryButton,
      }}
      secondaryButton={{
        text: 'Close',
        onClick: handleClose,
        className: CSS_CLASSES.modalSecondaryButton,
      }}
    >
      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg shadow-inner">
        <pre className="text-xs text-slate-700 dark:text-gray-300 overflow-auto max-h-[60vh] custom-scrollbar p-2 rounded-md bg-white dark:bg-slate-900">
          <code>{clientJson}</code>
        </pre>
      </div>
    </GenericModal>
  );
}

export default ClientInfoModal;