import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import uuid from 'uuid/v1';
import $ from 'jquery';

import Marker from './Marker';


class Container extends Component {
  state = {
    markers: {}
  }

  onDrop(marker, coords) {
    console.log('onDrop', marker, coords);
    const highlight = document.getElementById(`hl-${marker.id}`);

    const parent = highlight.parentNode;
    $(highlight).replaceWith(highlight.innerHTML);
    const newRange = document.createRange();

    const startRange = document.caretRangeFromPoint(coords.x, coords.y);
    newRange.setStart(startRange.startContainer, startRange.startOffset);

    const endRange = document.caretRangeFromPoint(marker.endLeft, marker.endTop);
    newRange.setEnd(endRange.startContainer, endRange.startOffset);
    console.log(newRange);


    // const newSpan = document.createElement('span');
    // newSpan.classList.add('highlight');
    // newSpan.id = `hl-${marker.id}`;


    // newSpan.appendChild(newRange.extractContents());
    // newRange.insertNode(newSpan);


  }

  onCreateHighlight = () => {
    const sel = document.getSelection();
    const r = sel.getRangeAt(0);
    const id = uuid();

    const highlight = document.createElement('span');
    highlight.classList.add('highlight');
    highlight.id = `hl-${id}`;


    highlight.appendChild(r.extractContents());
    r.insertNode(highlight);
    const parent = highlight;
    console.log(r.getClientRects());
    const rects = r.getClientRects();

    document.getSelection().removeAllRanges();

    this.setState({ markers: {
      ...this.state.markers,
      [id]: { id, left: parent.offsetLeft, top: parent.offsetTop, height: highlight.offsetHeight,
        endLeft: rects[0].left, endTop: rects[0].top }
    }});
  }


  render() {
    const { connectDropTarget } = this.props;
    const { markers } = this.state;

    return connectDropTarget(

      <div className="layer">
        {this.props.children}
        <button onClick={this.onCreateHighlight}>Highlight</button>
        {Object.keys(markers).map((id, i) => (
          <Marker
            key={i}
            {...markers[id]}
            onDrop={this.onDrop} />
        ))}

      </div>
    );
  }
}


const spec = {
  drop(props, monitor, component) {
    return monitor.getClientOffset();
  }
}

function collectDrop(connect, monitor) {
  return { connectDropTarget: connect.dropTarget() };
}

export default DropTarget('marker', spec, collectDrop)(Container);
