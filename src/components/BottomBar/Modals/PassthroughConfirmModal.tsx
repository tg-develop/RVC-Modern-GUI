import { JSX } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface PassthroughConfirmModalProps {
  title?: string;
  message?: string;
  icon?: IconDefinition;
  iconClassName?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  closeModal: () => void; // Standard prop to close the modal
}

const PassthroughConfirmModal: React.FC<PassthroughConfirmModalProps> = ({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  icon,
  iconClassName = "text-yellow-500 w-12 h-12 mx-auto mb-4",
  confirmText = "Confirm",
  onConfirm,
  onCancel,
  closeModal,
}): JSX.Element => {

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeModal();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto">
      {icon && (
        <div className="flex justify-center mb-4">
          <FontAwesomeIcon icon={icon} className={`${iconClassName} text-4xl`} />
        </div>
      )}
      <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
        {message}
      </p>
      <div className="flex justify-center space-x-3">
        <button
          onClick={handleConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 transition-colors duration-150"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default PassthroughConfirmModal; 