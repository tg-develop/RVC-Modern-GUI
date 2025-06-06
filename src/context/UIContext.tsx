import React, { createContext, ReactNode, useContext, useState, useRef, useCallback } from 'react';
import LoadingScreen from '../components/modals/LoadingScreen';
import ErrorNotifications from '../components/modals/ErrorNotifications';

type ErrorType = 'Error' | 'Warning' | 'Confirm';

interface UIError {
  id: number;
  message: string;
  type: ErrorType;
}

interface UIContextType {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  showError: (message: string, type?: ErrorType) => void;
  setIsConverting: (isConverting: boolean) => void;
  isConverting: boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [errors, setErrors] = useState<UIError[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const idRef = useRef(0);

  const startLoading = useCallback((message?: string) => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  }, []);

  const showError = useCallback((message: string, type: ErrorType = 'Error') => {
    idRef.current += 1;
    const id = idRef.current;
    setErrors(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setErrors(prev => prev.filter(err => err.id !== id));
    }, 5000);
  }, []);

  const removeError = useCallback((id: number) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  }, []);

  return (
    <UIContext.Provider value={{ startLoading, stopLoading, showError, isConverting, setIsConverting }}>
      {children}
      {isLoading && <LoadingScreen message={loadingMessage} />}
      <ErrorNotifications errors={errors} removeError={removeError} />
    </UIContext.Provider>
  );
};

export const useUIContext = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIContextProvider');
  }
  return context;
};
