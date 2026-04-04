import { Compartment, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Theme } from '~/types/theme.js';
import type { EditorSettings } from './CodeMirrorEditor.js';

export const darkTheme = EditorView.theme({}, { dark: true });
export const themeSelection = new Compartment();

const monokaiHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#f92672' },
  { tag: t.operator, color: '#f92672' },
  { tag: t.special(t.bracket), color: '#f8f8f2' },
  { tag: t.variableName, color: '#66d9ef' },
  { tag: [t.function(t.variableName), t.labelName], color: '#a6e22e' },
  { tag: t.typeName, color: '#a6e22e', fontStyle: 'italic' },
  { tag: t.className, color: '#a6e22e' },
  { tag: t.propertyName, color: '#fd971f' },
  { tag: [t.number, t.bool, t.null], color: '#ae81ff' },
  { tag: [t.string, t.attributeValue], color: '#e6db74' },
  { tag: t.comment, color: '#75715e', fontStyle: 'italic' },
  { tag: t.meta, color: '#75715e' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.link, color: '#66d9ef', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: '#f92672' },
  { tag: t.atom, color: '#ae81ff' },
  { tag: t.attributeName, color: '#a6e22e' },
]);

export const monokaiTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#272822',
      color: '#f8f8f2',
    },
    '.cm-content': {
      caretColor: '#f8f8f2',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#f8f8f2' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: '#49483e !important' },
    '.cm-panels': { backgroundColor: '#272822', color: '#f8f8f2' },
    '.cm-panels.cm-panels-top': { borderBottom: '2px solid #3e3d32' },
    '.cm-panels.cm-panels-bottom': { borderTop: '2px solid #3e3d32' },
    '.cm-searchMatch': {
      backgroundColor: '#725920',
      outline: '1px solid #ffdf5d',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#6199ff2f',
    },
    '.cm-activeLine': { backgroundColor: '#3e3d32' },
    '.cm-selectionMatch': { backgroundColor: '#49483e' },
    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      backgroundColor: '#3e3d32',
      outline: '1px solid #75715e',
    },
    '.cm-gutters': {
      backgroundColor: '#272822',
      color: '#75715e',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#3e3d32',
      color: '#f8f8f2',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ddd',
    },
    '.cm-tooltip': {
      border: '1px solid #3e3d32',
      backgroundColor: '#1f201a',
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: '#3e3d32',
      borderBottomColor: '#3e3d32',
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: '#1f201a',
      borderBottomColor: '#1f201a',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: '#3e3d32',
        color: '#f8f8f2',
      },
    },
  },
  { dark: true },
);

function getActualTheme(theme: Theme) {
  if (theme === 'monokai') {
    return [monokaiTheme, syntaxHighlighting(monokaiHighlightStyle)];
  }

  return theme === 'dark' ? vscodeDark : vscodeLight;
}

export function getTheme(theme: Theme, settings: EditorSettings = {}): Extension {
  return [getEditorTheme(settings), themeSelection.of([getActualTheme(theme)])];
}

export function reconfigureTheme(theme: Theme) {
  return themeSelection.reconfigure(getActualTheme(theme));
}

function getEditorTheme(settings: EditorSettings) {
  return EditorView.theme({
    '&': {
      fontSize: settings.fontSize ?? '12px',
    },
    '&.cm-editor': {
      height: '100%',
      background: 'var(--cm-backgroundColor)',
      color: 'var(--cm-textColor)',
    },
    '.cm-cursor': {
      borderLeft: 'var(--cm-cursor-width) solid var(--cm-cursor-backgroundColor)',
    },
    '.cm-scroller': {
      lineHeight: '1.5',
      '&:focus-visible': {
        outline: 'none',
      },
    },
    '.cm-line': {
      padding: '0 0 0 4px',
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
      backgroundColor: 'var(--cm-selection-backgroundColorFocused) !important',
      opacity: 'var(--cm-selection-backgroundOpacityFocused, 0.3)',
    },
    '&:not(.cm-focused) > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
      backgroundColor: 'var(--cm-selection-backgroundColorBlured)',
      opacity: 'var(--cm-selection-backgroundOpacityBlured, 0.3)',
    },
    '&.cm-focused > .cm-scroller .cm-matchingBracket': {
      backgroundColor: 'var(--cm-matching-bracket)',
    },
    '.cm-activeLine': {
      background: 'var(--cm-activeLineBackgroundColor)',
    },
    '.cm-gutters': {
      background: 'var(--cm-gutter-backgroundColor)',
      borderRight: 0,
      color: 'var(--cm-gutter-textColor)',
    },
    '.cm-gutter': {
      '&.cm-lineNumbers': {
        fontFamily: 'var(--font-mono)',
        fontSize: settings.gutterFontSize ?? settings.fontSize ?? '12px',
        minWidth: '40px',
      },
      '& .cm-activeLineGutter': {
        background: 'transparent',
        color: 'var(--cm-gutter-activeLineTextColor)',
      },
      '&.cm-foldGutter .cm-gutterElement > .fold-icon': {
        cursor: 'pointer',
        color: 'var(--cm-foldGutter-textColor)',
        transform: 'translateY(2px)',
        '&:hover': {
          color: 'var(--cm-foldGutter-textColorHover)',
        },
      },
    },
    '.cm-foldGutter .cm-gutterElement': {
      padding: '0 4px',
    },
    '.cm-tooltip-autocomplete > ul > li': {
      minHeight: '18px',
    },
    '.cm-panel.cm-search label': {
      marginLeft: '2px',
      fontSize: '12px',
    },
    '.cm-panel.cm-search .cm-button': {
      fontSize: '12px',
    },
    '.cm-panel.cm-search .cm-textfield': {
      fontSize: '12px',
    },
    '.cm-panel.cm-search input[type=checkbox]': {
      position: 'relative',
      transform: 'translateY(2px)',
      marginRight: '4px',
    },
    '.cm-panels': {
      borderColor: 'var(--cm-panels-borderColor)',
    },
    '.cm-panels-bottom': {
      borderTop: '1px solid var(--cm-panels-borderColor)',
      backgroundColor: 'transparent',
    },
    '.cm-panel.cm-search': {
      background: 'var(--cm-search-backgroundColor)',
      color: 'var(--cm-search-textColor)',
      padding: '8px',
    },
    '.cm-search .cm-button': {
      background: 'var(--cm-search-button-backgroundColor)',
      borderColor: 'var(--cm-search-button-borderColor)',
      color: 'var(--cm-search-button-textColor)',
      borderRadius: '4px',
      '&:hover': {
        color: 'var(--cm-search-button-textColorHover)',
      },
      '&:focus-visible': {
        outline: 'none',
        borderColor: 'var(--cm-search-button-borderColorFocused)',
      },
      '&:hover:not(:focus-visible)': {
        background: 'var(--cm-search-button-backgroundColorHover)',
        borderColor: 'var(--cm-search-button-borderColorHover)',
      },
      '&:hover:focus-visible': {
        background: 'var(--cm-search-button-backgroundColorHover)',
        borderColor: 'var(--cm-search-button-borderColorFocused)',
      },
    },
    '.cm-panel.cm-search [name=close]': {
      top: '6px',
      right: '6px',
      padding: '0 6px',
      fontSize: '1rem',
      backgroundColor: 'var(--cm-search-closeButton-backgroundColor)',
      color: 'var(--cm-search-closeButton-textColor)',
      '&:hover': {
        'border-radius': '6px',
        color: 'var(--cm-search-closeButton-textColorHover)',
        backgroundColor: 'var(--cm-search-closeButton-backgroundColorHover)',
      },
    },
    '.cm-search input': {
      background: 'var(--cm-search-input-backgroundColor)',
      borderColor: 'var(--cm-search-input-borderColor)',
      color: 'var(--cm-search-input-textColor)',
      outline: 'none',
      borderRadius: '4px',
      '&:focus-visible': {
        borderColor: 'var(--cm-search-input-borderColorFocused)',
      },
    },
    '.cm-tooltip': {
      background: 'var(--cm-tooltip-backgroundColor)',
      border: '1px solid transparent',
      borderColor: 'var(--cm-tooltip-borderColor)',
      color: 'var(--cm-tooltip-textColor)',
    },
    '.cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]': {
      background: 'var(--cm-tooltip-backgroundColorSelected)',
      color: 'var(--cm-tooltip-textColorSelected)',
    },
    '.cm-searchMatch': {
      backgroundColor: 'var(--cm-searchMatch-backgroundColor)',
    },
    '.cm-tooltip.cm-readonly-tooltip': {
      padding: '4px',
      whiteSpace: 'nowrap',
      backgroundColor: 'var(--bolt-elements-bg-depth-2)',
      borderColor: 'var(--bolt-elements-borderColorActive)',
      '& .cm-tooltip-arrow:before': {
        borderTopColor: 'var(--bolt-elements-borderColorActive)',
      },
      '& .cm-tooltip-arrow:after': {
        borderTopColor: 'transparent',
      },
    },
  });
}

function getLightTheme() {
  return vscodeLight;
}

function getDarkTheme() {
  return vscodeDark;
}
