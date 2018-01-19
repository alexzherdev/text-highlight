import React, { Component } from 'react';
import { DragSource, DropTarget, DragDropContext, DragLayer } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Container from './Container';
import select from './select';
import './App.css';

class App extends Component {
  state = {
    html: '\
        <p>Some text in paragraph</p>\
        <p>Second <strong>paragraph</strong> with more <em>italic</em> text</p>\
      '
  }

  render() {
    return (
      <div className="App">
        <div className="layer-container">
          <Container>
            <div dangerouslySetInnerHTML={{__html: this.state.html}} />
          </Container>
        </div>
      </div>
    );
  }
}



export default DragDropContext(HTML5Backend)(App);
