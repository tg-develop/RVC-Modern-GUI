import React, { JSX } from 'react';
import GenericModal from '../../Modals/GenericModal';
import { CSS_CLASSES } from '../../../styles/constants';
import { RVCModelSlot } from '@dannadori/voice-changer-client-js';

interface DeleteModelModalProps {
  model: RVCModelSlot;
  showModal: boolean;
  setShowDelete: (show: boolean) => void;
}

function DeleteModelModal({ model, showModal, setShowDelete }: DeleteModelModalProps): JSX.Element {
  const handleConfirm = () => {
    setShowDelete(false);
  };

  const handleCancel = () => {
    setShowDelete(false);
  };

  return (
    <GenericModal
      isOpen={showModal}
      onClose={handleCancel}
      title="Delete Model"
      size="small"
      primaryButton={{
        text: "Yes, Delete Model",
        onClick: handleConfirm,
        className: CSS_CLASSES.modalPrimaryButton + " !bg-red-600 hover:!bg-red-700 focus:!ring-red-500"
      }}
      secondaryButton={{
        text: "Cancel",
        onClick: handleCancel,
        className: CSS_CLASSES.modalSecondaryButton
      }}
    >
      <div>
        <p className="text-sm text-slate-600 dark:text-gray-300">
          Are you sure you want to delete the model "{model.name || 'this model'}" (ID: {model.slotIndex})?
        </p>
        <p className="text-xs text-red-500 dark:text-red-400 mt-2">
          This action cannot be undone.
        </p>
      </div>
    </GenericModal>
  );
}

export default DeleteModelModal; 