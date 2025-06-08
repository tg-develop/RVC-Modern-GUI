import React, { JSX } from 'react';

interface DeleteModelModalProps {
  modelId?: string; // To identify which model to delete
  modelName?: string;
}

function DeleteModelModal({ modelId, modelName }: DeleteModelModalProps): JSX.Element {
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-gray-300">
        Are you sure you want to delete the model "{modelName || 'this model'}" (ID: {modelId || 'N/A'})?
      </p>
      <p className="text-xs text-red-500 dark:text-red-400 mt-2">
        This action cannot be undone.
      </p>
    </div>
  );
}

export default DeleteModelModal; 