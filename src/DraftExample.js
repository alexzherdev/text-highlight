import React from 'react';
import { CompositeDecorator, ContentState, EditorState, RichUtils, convertFromHTML, convertToRaw,
  convertFromRaw } from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import MultiDecorator from 'draft-js-plugins-editor/lib/Editor/MultiDecorator';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';

import 'draft-js-inline-toolbar-plugin/lib/plugin.css';

class Highlight extends React.Component {
  render() {
    return (
      <span className="highlight">{this.props.children}</span>
    );
  }
}

const decorators = [
  {
    strategy: (contentBlock, callback, contentState) => {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'HIGHLIGHT'
          );
        },
        callback
      );
    },

    component: Highlight
  }
];


class HighlightButton extends React.Component {
  onHighlight = () => {
    const editorState = this.props.getEditorState();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'HIGHLIGHT',
      'MUTABLE',
      {}
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    this.props.setEditorState(
      RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      )
    );
    console.log(this.props.getEditorState())
  }

  onRemoveHighlight = () => {
    const editorState = this.props.getEditorState();
    this.props.setEditorState(
      RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
        null
      )
    );
  }

  render() {
    const editorState = this.props.getEditorState();
    const selection = editorState.getSelection();
    let key;
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = editorState.getSelection().getStartKey();
      const startOffset = editorState.getSelection().getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      key = blockWithLinkAtBeginning.getEntityAt(startOffset);
    }
    return (
      <div onMouseDown={(e) => e.preventDefault()}>
        { !!key
          ? <button onClick={this.onRemoveHighlight}>Remove</button>
          : <button onClick={this.onHighlight}>Highlight</button>
        }
      </div>
    );
  }
}

const inlineToolbarPlugin = createInlineToolbarPlugin({
  structure: [
    HighlightButton
  ]
});
const { InlineToolbar } = inlineToolbarPlugin;
const plugins = [inlineToolbarPlugin];

let clipboard;

export default class DraftExample extends React.Component {
  state = {
    editorState: EditorState.createEmpty()
  }

  onChange = (editorState) => {
    console.log('onchange', editorState.getCurrentContent().toJS());
    this.setState({
      editorState
    });
  }

  focus = () => {
    this.editor.focus();
  }

  exportRaw = () => {
    const content = this.state.editorState.getCurrentContent();
    const raw = convertToRaw(content);
    clipboard = raw;
  }

  importRaw = () => {
    const content = convertFromRaw(clipboard);
    const newState = EditorState.createWithContent(content);
    console.log('content',content.toJS());
    this.setState({
      importedState: newState
    });
  }

  exportHtml = () => {
    const content = this.state.editorState.getCurrentContent();
    clipboard = stateToHTML(content, {
      entityStyleFn: (entity) => {
        const entityType = entity.get('type').toLowerCase();
        if (entityType === 'highlight') {
          return {
            element: 'span',
            attributes: {
              class: 'highlight'
            }
          };
        }
      }
    });
  }

  importHtml = () => {
    // const content = stateFromHTML(clipboard);
    // const newState = EditorState.set(this.state.editorState, { currentContent: content });
    // this.setState({
    //   editorState: newState
    // });
    const blocksFromHTML = convertFromHTML(clipboard);
    const content = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );
    const newState = EditorState.createWithContent(content, new MultiDecorator([new CompositeDecorator(decorators)]));
    console.log('content', content.toJS());
    this.setState({
      importedState: newState
    });
  }

  render() {
    return (
      <div className="container" onClick={this.focus}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={plugins}
          decorators={decorators}
          ref={(element) => { this.editor = element; }}
        />
        <InlineToolbar />
        <button onClick={this.exportRaw}>Export raw</button>
        <button disabled={!clipboard} onClick={this.importRaw}>Import raw</button>
        <br />
        <button onClick={this.exportHtml}>Export HTML</button>
        <button disabled={!clipboard} onClick={this.importHtml}>Import HTML</button>
        <br />
        Imported state:
        { this.state.importedState &&
          <Editor
            editorState={this.state.importedState}
            onChange={(s) => this.setState({ importedState: s })}
            decorators={decorators}
          />
        }
      </div>
    );
  }
}
