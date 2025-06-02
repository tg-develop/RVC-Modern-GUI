import React, { JSX } from 'react';

function ServerInfoModal(): JSX.Element {
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-gray-300">
        Server information content goes here. Display details about the connected server, version, status, resource usage, etc.
      </p>
      {/* Display server statistics, logs, etc. */}
    </div>
  );
}

export default ServerInfoModal; 