import { JSX } from 'react';
import GenericModal from '../../Modals/GenericModal';
import { CSS_CLASSES } from '../../../styles/constants';
import { RVCModelSlot } from '@dannadori/voice-changer-client-js';

interface EditModelModalProps {
  model: RVCModelSlot;
  showModal: boolean;
  setShowEdit: (show: boolean) => void;
}

function EditModelModal({ model, showModal, setShowEdit }: EditModelModalProps): JSX.Element {
  const handleCancel = () => {
    setShowEdit(false);
  };

  return (
    <GenericModal 
      isOpen={showModal}
      onClose={handleCancel}
      title="Edit Model"
      size="small"
      primaryButton={{
        text: "Save",
        onClick: handleCancel,
        className: CSS_CLASSES.modalPrimaryButton,
      }}
      secondaryButton={{
        text: "Cancel",
        onClick: handleCancel,
        className: CSS_CLASSES.modalSecondaryButton,
      }}
    >
      <div>
        <p className="text-sm text-slate-600 dark:text-gray-300">
          Edit model content for {model.name || 'model'} (ID: {model.slotIndex}) goes here. Allow modification of model name, parameters, etc.
        </p>
      </div>
    </GenericModal>
  );
}

export default EditModelModal; 