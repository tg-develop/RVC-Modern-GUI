import React from 'react';
import { AppContextProvider } from './context/AppContext';
import App from './App';
import ParticleBackground from './components/Helpers/ParticleBackground';
import GenericModal from './components/modals/GenericModal';
import WelcomeModal from './components/modals/content/WelcomeModal';

export const AppWrapper: React.FC = () => {
  const [showWelcome, setShowWelcome] = React.useState<boolean>(true);

  const handleWelcomeComplete = async () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <>
        <ParticleBackground 
          zIndex={1} 
          particleCount={100} 
          particleColor="rgba(51, 51, 243, 0.7)" 
          backgroundColor="rgb(24, 24, 24)" 
        />
          <GenericModal
            isOpen={true}
            transparent={true}
            onClose={handleWelcomeComplete}
            title="RVC VoiceChanger"
            primaryButton={{
              text: "Continue",
              onClick: handleWelcomeComplete
          }}
        >
          <WelcomeModal onGetStarted={handleWelcomeComplete} />
        </GenericModal>

      </>
    );
  }
  
  return (
    <>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </>
  );
};