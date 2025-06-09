import { RVCModelSlot } from "@dannadori/voice-changer-client-js";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useInitialPlaceholder } from "../../scripts/usePlaceholder";
import { useState } from "react";
import DeleteModelModal from "./Modals/DeleteModelModal";
import EditModelModal from "./Modals/EditModelModal";

interface ModelSlotProps {
    selected: boolean;
    model: RVCModelSlot;
    modelDir: string;
    handleSelectModel: (model: RVCModelSlot) => void;
}

function ModelSlot(props: ModelSlotProps) {
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [showDelete, setShowDelete] = useState<boolean>(false);


    const icon = props.model.iconFile.length > 0 ? "http://127.0.0.1:18888/" + props.modelDir + "/" + props.model.slotIndex + "/" + props.model.iconFile.split(/[\/\\]/).pop() : "";
    const placeholder = useInitialPlaceholder(props.model.name);

    return (
      <>
      <EditModelModal 
        model={props.model}
        showModal={showEdit}
        setShowEdit={setShowEdit}
      />
      <DeleteModelModal 
        model={props.model}
        showModal={showDelete}
        setShowDelete={setShowDelete}
      />
      <li 
        className={`p-2.5 text-sm rounded-md cursor-pointer flex items-center group text-slate-700 dark:text-slate-300 
              ${ props.selected
                  ? 'bg-sky-100 dark:bg-blue-700/30 border border-blue-500' 
                  : 'hover:bg-slate-100 dark:hover:bg-gray-700'}`}
        onClick={() => {
            props.handleSelectModel(props.model);
        }}
      >
        <img 
          src={icon.length > 0 ? icon : placeholder} 
          alt={props.model.name} 
          className="w-8 h-8 md:w-10 md:h-10 rounded-md mr-3 object-cover flex-shrink-0"
        />
        <span className="truncate mr-2 flex-grow">{props.model.name}</span> 
        <div className="flex space-x-2 md:space-x-1 items-center md:opacity-0 group-hover:md:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 md:p-0" 
            title="Edit Model"
          >
            <FontAwesomeIcon icon={faPen} className="h-4 w-4 md:h-3 md:w-3" /> 
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 md:p-0" 
            title="Delete Model"
          >
            <FontAwesomeIcon icon={faTrash} className="h-4 w-4 md:h-3 md:w-3"/> 
          </button>
        </div>
      </li>
      </>
    )
}

export default ModelSlot