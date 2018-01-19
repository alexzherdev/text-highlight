import React, { Component } from 'react';
import { DragSource } from 'react-dnd'


class Marker extends Component {
  render() {
    const { connectDragSource, left, top, height } = this.props;
    return connectDragSource(
      <span className="marker" style={{ left, top, height }}></span>
    );
  }
}

const markerSource = {
  beginDrag(props) {
    console.log('beginDrag', props);
    return props;
  },

  endDrag(props, monitor, component) {
    const { onDrop } = props;
    onDrop(props, monitor.getDropResult());
  }
}

function collectDrag(connect, monitor) {
  return {
    connectDragSource: connect.dragSource()
  }
}

export default DragSource('marker', markerSource, collectDrag)(Marker);
