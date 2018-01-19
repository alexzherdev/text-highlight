import React from 'react';
import { DragLayer } from 'react-dnd';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

// DragLayer(monitor => ({
//   item: monitor.getItem(),
//   itemType: monitor.getItemType(),
//   initialOffset: monitor.getInitialSourceClientOffset(),
//   currentOffset: monitor.getSourceClientOffset(),
//   isDragging: monitor.isDragging(),
// }))
