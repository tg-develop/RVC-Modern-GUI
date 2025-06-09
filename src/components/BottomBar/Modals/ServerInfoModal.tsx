import { JSX } from 'react';
import { useAppState } from '../../../context/AppContext';
import GenericModal from '../../Modals/GenericModal';
import { CSS_CLASSES } from '../../../styles/constants';

interface ServerInfoModalProps {
    showServerInfo: boolean;
    setShowServerInfo: (showServerInfo: boolean) => void;
}

function ServerInfoModal({ showServerInfo, setShowServerInfo }: ServerInfoModalProps): JSX.Element {
  const appState = useAppState();
  const serverJson = JSON.stringify(appState.serverSetting.serverSetting, null, 2);

  const handleClose = () => {
    setShowServerInfo(false);
  };

  return (
    <GenericModal
      isOpen={showServerInfo}
      onClose={handleClose}
      title="Server Info"
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
          <code>{serverJson}</code>
        </pre>
    </div>
    </GenericModal>
  );
}

export default ServerInfoModal;