import React, { Component } from 'react';
import DraftExample from './DraftExample';
import HighlightExample from './HighlightExample';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <HighlightExample />
        <div>
          other contents not in the highlight example
        </div>
      </div>
    );
  }
}



export default App;
