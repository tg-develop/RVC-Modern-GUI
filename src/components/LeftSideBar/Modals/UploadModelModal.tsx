import { useState, ChangeEvent, useEffect } from 'react';
import { ClientState, ModelFileKind, ModelSlot, ModelUploadSetting } from '@dannadori/voice-changer-client-js';
import { CSS_CLASSES } from '../../../styles/constants';
import GenericModal from '../../Modals/GenericModal';
import { UIContextType } from '../../../context/UIContext';

export interface UploadFinalForm extends ModelUploadSetting {
  modelName: string
  thumbnailFile: File | null
  embedder: string
}

interface UploadModelModalProps {
  appState: ClientState
  guiState: UIContextType
  showUpload: boolean
  setShowUpload: (showUpload: boolean) => void
}

function UploadModelModal({ appState, guiState, showUpload, setShowUpload }: UploadModelModalProps) {
  const [uploadSettings, setUploadSettings] = useState<UploadFinalForm>({ modelName: '', thumbnailFile: null, voiceChangerType: 'RVC', slot: 0, isSampleMode: false, sampleId: null, files: [], params: {}, embedder: 'hubert_base' });
  const [autoSelectModel, setAutoSelectModel] = useState<boolean>(false);

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isThumbnailExpanded, setIsThumbnailExpanded] = useState(false);
  const [previewMode, setPreviewMode] = useState<'settings' | 'list'>('settings');

  useEffect(() => {
    // Automatically set model name from file name if modelName is empty and modelFile is selected
    const model = uploadSettings.files.find(x => x.kind === "rvcModel")
    if (model) {
      const baseName = model.file.name.substring(0, model.file.name.lastIndexOf('.'));
      setUploadSettings({ ...uploadSettings, modelName: baseName });
    }
    // Auto-expand thumbnail preview when a new thumbnail is selected and preview is available
    if (thumbnailPreview) {
      setIsThumbnailExpanded(true);
    }

  }, [uploadSettings.files]); // Dependencies for this effect

  const handleModelFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const newFile = { kind: "rvcModel" as ModelFileKind, file: file, dir: "" };

      const updatedFiles = uploadSettings.files.filter(f => f.kind !== "rvcModel");
      updatedFiles.push(newFile);

      setUploadSettings({
        ...uploadSettings,
        files: updatedFiles,
        modelName: file.name.replace(/\.[^/.]+$/, '')
      });
    } else {
      const updatedFiles = uploadSettings.files.filter(f => f.kind !== "rvcModel");

      setUploadSettings({
        ...uploadSettings,
        files: updatedFiles,
        modelName: ''
      });
    }
  };

  const handleIndexFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newFile = { kind: "rvcIndex" as ModelFileKind, file: event.target.files[0], dir: "" };

      const updatedFiles = uploadSettings.files.filter(f => f.kind !== "rvcIndex");
      updatedFiles.push(newFile);

      setUploadSettings({
        ...uploadSettings,
        files: updatedFiles
      });
    } else {
      const updatedFiles = uploadSettings.files.filter(f => f.kind !== "rvcIndex");

      setUploadSettings({
        ...uploadSettings,
        files: updatedFiles
      });
    }
  };

  const handleThumbnailFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadSettings({ ...uploadSettings, thumbnailFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadSettings({ ...uploadSettings, thumbnailFile: null });
      setThumbnailPreview(null);
    }
  };

  const handleUploadCloseModal = () => {
    if (!appState.serverSetting.isUploading) {
      setShowUpload(false);
      setUploadSettings({ modelName: '', thumbnailFile: null, voiceChangerType: 'RVC', slot: 0, isSampleMode: false, sampleId: null, files: [], params: {}, embedder: 'hubert_base' });
    }
  };

  const handleUploadModal = async () => {
    console.log(uploadSettings);
    if (!uploadSettings.files) {
      guiState.showError('Please select a model file.', "Error");
      return;
    }
    const trimmedModelName = uploadSettings.modelName.trim();
    if (!trimmedModelName) {
      guiState.showError('Please enter a model name.', "Error");
      return;
    }

    try {
      let emptySlotIndex = -1;
      const currentModelSlots = appState.serverSetting.serverSetting.modelSlots;

      if (currentModelSlots && currentModelSlots.length > 0) {
        emptySlotIndex = currentModelSlots.findIndex((slot: ModelSlot) => !slot.name || slot.name.length === 0);
        if (emptySlotIndex === -1) {
          console.warn("No slot with an empty name found. Prioritizing slots with no name.");
        }
      }
      if (emptySlotIndex === -1) {
        guiState.showError('No empty model slot available. Please clear a slot or manage existing ones.', "Error");
        return;
      }

      const filesForUpload: { kind: ModelFileKind; file: File; dir: string }[] = [
        { kind: "rvcModel" as ModelFileKind, file: uploadSettings.files[0].file, dir: "" },
      ];

      if (uploadSettings.files[1]) {
        filesForUpload.push({ kind: "rvcIndex" as ModelFileKind, file: uploadSettings.files[1].file, dir: "" });
      }

      const uploadSettingsData: ModelUploadSetting & { embedder: string } = {
        voiceChangerType: "RVC",
        slot: emptySlotIndex,
        files: filesForUpload,
        isSampleMode: false,
        sampleId: null,
        params: {},
        embedder: uploadSettings.embedder
      };

      console.log('Uploading model with settings:', uploadSettingsData);
      await appState.serverSetting.uploadModel(uploadSettingsData);
      console.log('Model uploaded successfully.');

      if (uploadSettings.thumbnailFile) {
        console.log(`Uploading icon to slot ${emptySlotIndex}...`);
        await appState.serverSetting.uploadAssets(emptySlotIndex, "iconFile", uploadSettings.thumbnailFile);
        console.log('Icon uploaded.');
      }

      guiState.showError("Model uploaded successfully!", "Confirm");
      await appState.serverSetting.reloadServerInfo();

      if (autoSelectModel) {
        guiState.startLoading("Swapping to model: " + uploadSettings.modelName);
        await appState.serverSetting.updateServerSettings({
          ...appState.serverSetting.serverSetting,
          modelSlotIndex: emptySlotIndex
        });
        guiState.stopLoading();
      }

      handleUploadCloseModal();
    } catch (error) {
      console.error('Error uploading model:', error);
      guiState.showError(`Error uploading model: ${error instanceof Error ? error.message : String(error)}`, "Error");
    }
  };

  const commonLabelClass = "block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1";
  const commonSelectClass = "w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm transition-colors duration-150";
  const commonInputClass = "w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-sm transition-colors duration-150";
  const commonFileInputClass = `${commonInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-gray-600 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-gray-500`;

  return (
    <GenericModal
      isOpen={showUpload}
      onClose={handleUploadCloseModal}
      title="Upload Model"
      closeOnOutsideClick={false}
      primaryButton={{
        text: `${appState.serverSetting.isUploading ? `Uploading... (${appState.serverSetting.uploadProgress.toFixed(1)}%)` : 'Upload'}`,
        onClick: handleUploadModal,
        className: CSS_CLASSES.modalPrimaryButton,
        disabled: appState.serverSetting.isUploading
      }}
      secondaryButton={
        {
          text: "Cancel",
          onClick: handleUploadCloseModal,
          className: CSS_CLASSES.modalSecondaryButton,
          disabled: appState.serverSetting.isUploading
        }
      }
    >
      <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label htmlFor="modelFile" className={commonLabelClass}>Model File (.pth, .safetensors, .onnx):</label>
          <input
            type="file"
            id="modelFile"
            accept=".pth,.safetensors,.onnx"
            onChange={handleModelFileChange}
            className={commonFileInputClass}
            disabled={appState.serverSetting.isUploading}
          />
        </div>

        {uploadSettings.files.find(x => x.kind === "rvcModel") && (
          <div className="space-y-4 ml-2 pl-3 border-l-2 border-slate-200 dark:border-gray-700">
            <div className="space-y-2">
              <label htmlFor="modelName" className={commonLabelClass}>Model Name:</label>
              <div className="relative">
                <input
                  type="text"
                  id="modelName"
                  value={uploadSettings.modelName}
                  onChange={(e) => setUploadSettings({ ...uploadSettings, modelName: e.target.value })}
                  className={`${commonInputClass} pl-3 pr-10 py-2 bg-white/50 dark:bg-gray-700/50 border-slate-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm`}
                  placeholder="Enter a descriptive name for your model"
                  disabled={appState.serverSetting.isUploading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="embedderType" className={commonLabelClass}>Embedder Type:</label>
              <select
                id="embedderType"
                value={uploadSettings.embedder}
                onChange={(e) => setUploadSettings({ ...uploadSettings, embedder: e.target.value as 'hubert_base' | 'spin_base' })}
                className={commonSelectClass}
                disabled={appState.serverSetting.isUploading}
              >
                <option value="hubert_base">Hubert_Base / Contentvec (Default)</option>
                <option value="spin_base">SPIN</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="indexFile" className={commonLabelClass}>Index File (.index) (Optional):</label>
          <input
            type="file"
            id="indexFile"
            accept=".index"
            onChange={handleIndexFileChange}
            className={commonFileInputClass}
            disabled={appState.serverSetting.isUploading}
          />
        </div>

        <div>
          <label htmlFor="thumbnailFile" className={commonLabelClass}>Thumbnail Image (Optional):</label>
          <input
            type="file"
            id="thumbnailFile"
            accept="image/*"
            onChange={handleThumbnailFileChange}
            className={commonFileInputClass}
            disabled={appState.serverSetting.isUploading}
          />
        </div>

        {thumbnailPreview && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsThumbnailExpanded(!isThumbnailExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              disabled={appState.serverSetting.isUploading}
            >
              <span>Preview Thumbnail</span>
              <svg
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${isThumbnailExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isThumbnailExpanded && (
              <div className="space-y-4 p-3 bg-slate-50 dark:bg-gray-800/30 rounded-lg border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-gray-300">Preview Mode:</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreviewMode('settings'); }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${previewMode === 'settings' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-700'} disabled:opacity-50`}
                      disabled={appState.serverSetting.isUploading}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreviewMode('list'); }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${previewMode === 'list' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-700'} disabled:opacity-50`}
                      disabled={appState.serverSetting.isUploading}
                    >
                      List
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center p-4">
                  <div className={`transition-all duration-200 ${previewMode === 'settings'
                      ? 'w-32 h-32 rounded-full p-1.5 border-2 border-slate-300 dark:border-gray-500'
                      : 'w-36 h-36 rounded-xl p-1.5 border border-slate-300 dark:border-gray-500'
                    } bg-white dark:bg-gray-800 shadow-md overflow-hidden`}>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className={`w-full h-full object-cover ${previewMode === 'settings' ? 'rounded-full' : 'rounded-lg'
                        }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSelectModel"
              checked={autoSelectModel}
              onChange={(e) => setAutoSelectModel(e.target.checked)}
              className={CSS_CLASSES.checkbox}
              disabled={appState.serverSetting.isUploading}
            />
            <label htmlFor="autoSelectModel" className={CSS_CLASSES.checkboxLabel}>
              Automatisch nach Upload auswählen
            </label>
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export default UploadModelModal;