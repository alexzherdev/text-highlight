import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import rangy from 'rangy';


class Marker extends React.Component {
  render() {
    return (
      <span
        className={`highlight-inner ${this.props.active ? 'active' : 'nonactive'}`}
        onClick={this.props.onClick}
        dangerouslySetInnerHTML={{__html: this.props.children}}>
      </span>
    );
  }
}

let nextId = 1;

class SelectionDetector extends React.Component {
  handleSelectionChange = () => {
    const selection = rangy.getSelection();
    if (selection.rangeCount > 0) {
      const selRange = selection.getRangeAt(0);
      const containerRange = rangy.createRange();
      containerRange.selectNode(this.container);
      if (containerRange.containsRange(selRange)) {
        this.props.onSelectionChange(selection);
      } else {
        console.log('skipped');
      }
    }
  }

  componentDidMount() {
    document.addEventListener('selectionchange', this.handleSelectionChange);
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.handleSelectionChange);
  }

  render() {
    return (
      <div ref={(r) => this.container = r}>
        {this.props.children}
      </div>
    );
  }
}

class HighlightExample extends React.Component {
  state = {
    selected: null,
    html: ''
  }

  componentDidMount() {
    this.setMarkers();
  }

  componentDidUpdate() {
    this.setMarkers();
  }

  handleSelectionChange = (sel) => {
    console.log('selchange', sel)
  }

  handleMarkerClick = (ref) => {
    this.setState({ selected: ref });
  }

  handleHighlight = () => {
    const sel = document.getSelection();
    const r = sel.getRangeAt(0);

    const iterator = document.createNodeIterator(
      r.commonAncestorContainer,
      NodeFilter.SHOW_TEXT
    );

    const id = nextId++;

    let reachedRange = false;
    const ranges = [];
    while (iterator.nextNode()) {
      if (!reachedRange && iterator.referenceNode !== r.startContainer) continue;
      reachedRange = true;
      const node = iterator.referenceNode;
      if (!node.textContent.trim().length) continue;
      const newRange = document.createRange();
      if (node === r.startContainer) {
        newRange.setStart(node, r.startOffset);
      } else {
        newRange.setStartBefore(node);
      }
      if (node === r.endContainer) {
        newRange.setEnd(node, r.endOffset);
      } else {
        newRange.setEndAfter(node);
      }
      ranges.push(newRange);
      if (node === r.endContainer) break;
    }
    ranges.forEach((r, i) => {
      const highlight = document.createElement('span');
      highlight.classList.add('highlight');
      if (i === ranges.length - 1) {
        highlight.classList.add('highlight-icon');
      }
      highlight.dataset.ref = id;
      highlight.appendChild(r.extractContents());
      r.insertNode(highlight);
    });
    document.getSelection().removeAllRanges();
    const newHTML = this.div.innerHTML;
    this.replaceContents(newHTML);
  }

  setMarkers() {
    const els = document.querySelectorAll('.area .highlight');

    els.forEach((el) => {
      $(el).toggleClass('active', el.dataset.ref === this.state.selected);
      $(el).toggleClass('nonactive', el.dataset.ref !== this.state.selected);
      $(el).off('click').on('click', this.handleMarkerClick.bind(this, el.dataset.ref));
    });
  }

  replaceContents(newContents) {
    this.setState({ html: newContents });
  }

  handleClear = () => {
    this.replaceContents('');
  }

  handleCopyFromEditor = () => {
    this.replaceContents(window.CKEDITOR.instances.editor1.getData());
  }

  handleCopyToEditor = () => {
    window.CKEDITOR.instances.editor1.setData(this.state.html);
  }

  render() {
    return (
      <div>
        <SelectionDetector onSelectionChange={this.handleSelectionChange}>
          <div className="area" ref={(el) => this.div = el} dangerouslySetInnerHTML={{__html: this.state.html}}>
          </div>
        </SelectionDetector>
        <button onClick={this.handleClear}>Clear</button>
        <button onClick={this.handleHighlight}>Highlight</button>
        <button onClick={this.handleCopyFromEditor}>Copy from editor</button>
        <button onClick={this.handleCopyToEditor}>Copy to editor</button>
        <div>
          {this.state.selected}
        </div>
      </div>
    );
  }
}

export default HighlightExample;
