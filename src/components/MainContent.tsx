import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    // rectSwappingStrategy, // Consider if needed for 2x2 grid strategy
    // sortableKeyboardCoordinates, // Re-add if KeyboardSensor is used
} from '@dnd-kit/sortable';

import SortableCardItem from './Helpers/SortableCardItem';
import ModelSettingsCard from './ModelSettings/ModelSettingsCard';
import PerformanceStatsCard from './PerformanceStats/PerformanceStatsCard';
import AiSettingsCard from './AiSettings/AiSettingsCard';
import AudioSettingsCard from './AudioSettings/AudioSettingsCard';
import { RVCModelSlot } from '@dannadori/voice-changer-client-js'; // For openModal prop

// Define Card IDs
const CARD_IDS = {
    MODEL_SETTINGS: 'modelSettings',
    PERFORMANCE: 'performance',
    AI_SETTINGS: 'aiSettings',
    AUDIO_SETTINGS: 'audioSettings',
};

interface MainContentProps {
  openModal: (type: string, props?: { modelId?: string; modelName?: string; model?: RVCModelSlot }) => void;
}

function MainContent({ openModal }: MainContentProps) {
  const [cardOrder, setCardOrder] = useState<string[]>([
    CARD_IDS.MODEL_SETTINGS,
    CARD_IDS.PERFORMANCE,
    CARD_IDS.AI_SETTINGS,
    CARD_IDS.AUDIO_SETTINGS,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cardOrder}
        // strategy={rectSwappingStrategy} // Default strategy works well with grid
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cardOrder.map((cardId) => {
            let cardComponent;
            switch (cardId) {
              case 'modelSettings':
                cardComponent = (
                  <SortableCardItem key={cardId} id={cardId}>
                    {(attributes, listeners) => (
                      <ModelSettingsCard openModal={openModal} dndAttributes={attributes} dndListeners={listeners} />
                    )}
                  </SortableCardItem>
                );
                break;
              case 'performance':
                cardComponent = (
                  <SortableCardItem key={cardId} id={cardId}>
                    {(attributes, listeners) => (
                      <PerformanceStatsCard dndAttributes={attributes} dndListeners={listeners} />
                    )}
                  </SortableCardItem>
                );
                break;
              case 'aiSettings':
                cardComponent = (
                  <SortableCardItem key={cardId} id={cardId}>
                    {(attributes, listeners) => (
                      <AiSettingsCard dndAttributes={attributes} dndListeners={listeners} />
                    )}
                  </SortableCardItem>
                );
                break;
              case 'audioSettings':
                cardComponent = (
                  <SortableCardItem key={cardId} id={cardId}>
                    {(attributes, listeners) => (
                      <AudioSettingsCard dndAttributes={attributes} dndListeners={listeners} />
                    )}
                  </SortableCardItem>
                );
                break;
              default:
                cardComponent = null;
            }
            return cardComponent;
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default MainContent; 