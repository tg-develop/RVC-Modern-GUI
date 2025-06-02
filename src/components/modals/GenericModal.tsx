import React, { JSX, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface ModalButton {
  text: string;
  onClick: () => void;
  className?: string; // e.g., 'bg-blue-500 hover:bg-blue-600 text-white'
}

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  primaryButton?: ModalButton;
  secondaryButton?: ModalButton;
}

function GenericModal({
  isOpen,
  onClose,
  title,
  children,
  primaryButton,
  secondaryButton,
}: GenericModalProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  const baseButtonClass = "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-40 p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeInScaleUp" 
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto mb-6 flex-grow">
          {children}
        </div>

        {/* Modal Footer (optional buttons) */}
        {(primaryButton || secondaryButton) && (
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-gray-700">
            {secondaryButton && (
              <button
                onClick={secondaryButton.onClick}
                className={`${baseButtonClass} ${secondaryButton.className || 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 focus:ring-slate-400'}`}
              >
                {secondaryButton.text}
              </button>
            )}
            {primaryButton && (
              <button
                onClick={primaryButton.onClick}
                className={`${baseButtonClass} ${primaryButton.className || 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}`}
              >
                {primaryButton.text}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GenericModal; 