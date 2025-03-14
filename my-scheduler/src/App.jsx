import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const hours = Array.from({ length: 21 }, (_, i) => 8 + i * 0.5);
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const blocks = [
  { id: 1, label: "3 hours", duration: 3 },
  { id: 2, label: "3 hours", duration: 3 },
  { id: 3, label: "3 hours", duration: 3 },
  { id: 4, label: "3 hours", duration: 3 },
  { id: 5, label: "8 hours", duration: 8 },
  { id: 6, label: "8 hours", duration: 8 },
];

const ItemType = "BLOCK";

const DraggableBlock = ({ block }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: block,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="draggable-block"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {block.label}
    </div>
  );
};

const DroppableSlot = ({ day, hour, onDrop, placedBlocks }) => {
  const isSlotOccupied = placedBlocks.some(
    (b) =>
      b.day === day &&
      hour >= b.startHour &&
      hour < b.startHour + b.duration
  );

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item) => {
      if (!isSlotOccupied) onDrop(item, day, hour);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const blockInSlot = placedBlocks.find(
    (b) =>
      b.day === day &&
      hour >= b.startHour &&
      hour < b.startHour + b.duration
  );

  return (
    <div
      ref={drop}
      className={`droppable-slot ${isOver ? "hovered" : ""} ${
        blockInSlot ? "occupied" : ""
      }`}
    >
      {blockInSlot && hour === blockInSlot.startHour && (
        <div
          className="block-item"
          style={{
            height: `${blockInSlot.duration * 2.2}rem`,
            borderBottom: "none",
          }}
        >
          {blockInSlot.label}
        </div>
      )}
    </div>
  );
};

export default function Scheduler() {
  const [placedBlocks, setPlacedBlocks] = useState([]);

  const formatTime = (hour) => {
    const h = Math.floor(hour);
    const m = hour % 1 === 0 ? "00" : "30";
    return `${h}:${m}`;
  };

  const handleDrop = (block, day, startHour) => {
    const slotsNeeded = block.duration * 2 + (block.duration === 8 ? 1 : 0);
    const hourIndex = hours.indexOf(startHour);
    const endIndex = hourIndex + slotsNeeded;

    if (endIndex > hours.length) {
      console.log("Block does not fit at this time.");
      return;
    }

    const overlapping = placedBlocks.some(
      (b) =>
        b.day === day &&
        ((b.startHour >= startHour && b.startHour < startHour + block.duration) ||
         (startHour >= b.startHour && startHour < b.startHour + b.duration))
    );

    if (overlapping) {
      console.log("Block overlaps with another block.");
      return;
    }

    setPlacedBlocks((prev) => [
      ...prev.filter((b) => b.id !== block.id),
      { ...block, day, startHour },
    ]);
  };

  const resetSchedule = () => {
    setPlacedBlocks([]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <div className="sticky-controls">
          <button onClick={resetSchedule} className="reset-button">
            Reset Schedule
          </button>
          <div className="block-container">
            {blocks
              .filter((block) => !placedBlocks.some((pb) => pb.id === block.id))
              .map((block) => (
                <DraggableBlock key={block.id} block={block} />
              ))}
          </div>
        </div>
        <div className="grid-container">
          <div></div>
          {days.map((day) => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
          {hours.map((hour) => (
            <>
              <div className="time-column">
                {formatTime(hour)}
              </div>
              {days.map((day) => (
                <DroppableSlot
                  key={`${day}-${hour}`}
                  day={day}
                  hour={hour}
                  onDrop={handleDrop}
                  placedBlocks={placedBlocks}
                />
              ))}
            </>
          ))}
        </div>
        {placedBlocks.length > 0 && (
          <div className="meeting-message">
            {placedBlocks.map((block, index) => (
              <p key={index}>
                Adam has a meeting on {block.day} from {formatTime(block.startHour)} till {formatTime(block.startHour + block.duration)}
              </p>
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
}
