import { JSX } from 'react';
import { useAppState } from '../../../context/AppContext';

function ClientInfoModal(): JSX.Element {
  const appState = useAppState();
  const clientJson = JSON.stringify(appState.setting, null, 2);
  return (
      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg shadow-inner">
        <pre className="text-xs text-slate-700 dark:text-gray-300 overflow-auto max-h-[60vh] custom-scrollbar p-2 rounded-md bg-white dark:bg-slate-900">
          <code>{clientJson}</code>
        </pre>
    </div>
  );
}

export default ClientInfoModal;