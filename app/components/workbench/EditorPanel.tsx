import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { memo, useMemo } from 'react';
import { CodeMirrorEditor, type EditorDocument, type EditorSettings, type OnChangeCallback as OnEditorChange, type OnSaveCallback as OnEditorSave, type OnScrollCallback as OnEditorScroll } from '~/components/editor/codemirror/CodeMirrorEditor';
import { PanelHeader } from '~/components/ui/PanelHeader';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import type { FileMap } from '~/lib/stores/files';
import type { FileHistory } from '~/types/actions';
import { themeStore } from '~/lib/stores/theme';
import { WORK_DIR } from '~/utils/constants';
import { renderLogger } from '~/utils/logger';
import { isMobile } from '~/utils/mobile';
import { FileBreadcrumb } from './FileBreadcrumb';
import { Icon } from '~/components/ui/Icon';
import { classNames } from '~/utils/classNames';

interface EditorPanelProps {
  files?: FileMap;
  unsavedFiles?: Set<string>;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  fileHistory?: Record<string, FileHistory>;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
  onFileSave?: OnEditorSave;
  onFileReset?: () => void;
}

const editorSettings: EditorSettings = { tabSize: 2 };

export const EditorPanel = memo(
  ({
    files,
    unsavedFiles,
    editorDocument,
    selectedFile,
    isStreaming,
    fileHistory,
    onFileSelect,
    onEditorChange,
    onEditorScroll,
    onFileSave,
    onFileReset,
  }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const theme = useNanoStore(themeStore);

    const activeFileSegments = useMemo(() => {
      if (!editorDocument) {
        return undefined;
      }

      return editorDocument.filePath.split('/');
    }, [editorDocument]);

    const activeFileUnsaved = useMemo(() => {
      if (!editorDocument || !unsavedFiles) {
        return false;
      }

      // Make sure unsavedFiles is a Set before calling has()
      return unsavedFiles instanceof Set && unsavedFiles.has(editorDocument.filePath);
    }, [editorDocument, unsavedFiles]);

    return (
      <div className="flex flex-col h-full bg-[var(--vscode-bg)]">
        <div className="flex items-center px-4 py-1.5 border-b border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)] overflow-x-auto no-scrollbar min-h-[36px]">
          {selectedFile ? (
            <FileBreadcrumb pathSegments={activeFileSegments} files={files} onFileSelect={onFileSelect} />
          ) : (
            <div className="flex items-center gap-1.5 text-[var(--vscode-text-muted)]">
              <Icon name="code" size={16} />
              <span className="text-xs">No file selected</span>
            </div>
          )}
          {activeFileUnsaved && (
            <div className="flex gap-1 ml-auto -mr-1.5">
              <PanelHeaderButton onClick={onFileSave}>
                <Icon name="save" />
                Save
              </PanelHeaderButton>
              <PanelHeaderButton onClick={onFileReset}>
                <Icon name="history" />
                Reset
              </PanelHeaderButton>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden relative font-mono text-[14px] leading-relaxed">
          <CodeMirrorEditor
            theme={theme}
            editable={!isStreaming && editorDocument !== undefined}
            settings={editorSettings}
            doc={editorDocument}
            autoFocusOnDocumentChange={!isMobile()}
            onScroll={onEditorScroll}
            onChange={onEditorChange}
            onSave={onFileSave}
          />
        </div>
      </div>
    );
  },
);
