import { memo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { classNames } from '~/utils/classNames';
import { PanelHeader } from '~/components/ui/PanelHeader';
import { FileTree } from './FileTree';
import { Search } from './Search';
import { LockManager } from './LockManager';
import { WORK_DIR } from '~/utils/constants';
import type { FileMap } from '~/lib/stores/files';
import type { FileHistory } from '~/types/actions';

interface SideBarProps {
    files?: FileMap;
    unsavedFiles?: Set<string>;
    selectedFile?: string | undefined;
    fileHistory?: Record<string, FileHistory>;
    onFileSelect?: (value?: string) => void;
}

export const SideBar = memo(({ files, unsavedFiles, selectedFile, fileHistory, onFileSelect }: SideBarProps) => {
    return (
        <div className="w-full h-full flex flex-col bg-[var(--vscode-sidebar-bg)] border-r border-[var(--vscode-border)] w-64 flex-shrink-0 overflow-hidden">
            <Tabs.Root defaultValue="files" className="flex flex-col h-full">
                <PanelHeader className="w-full text-sm font-medium text-[var(--vscode-text)] px-1 border-b border-[var(--vscode-border)] bg-[var(--vscode-sidebar-bg)]">
                    <div className="h-full flex-shrink-0 flex items-center justify-between w-full">
                        <Tabs.List className="h-full flex-shrink-0 flex items-center gap-1 px-2">
                            <Tabs.Trigger
                                value="files"
                                className={classNames(
                                    'h-full bg-transparent hover:bg-[var(--vscode-hover)] py-1 px-2 rounded-md text-xs font-medium text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)] data-[state=active]:text-[var(--vscode-text)] data-[state=active]:bg-[var(--vscode-selected)] transition-colors',
                                )}
                            >
                                Explorer
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="search"
                                className={classNames(
                                    'h-full bg-transparent hover:bg-[var(--vscode-hover)] py-1 px-2 rounded-md text-xs font-medium text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)] data-[state=active]:text-[var(--vscode-text)] data-[state=active]:bg-[var(--vscode-selected)] transition-colors',
                                )}
                            >
                                Search
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="locks"
                                className={classNames(
                                    'h-full bg-transparent hover:bg-[var(--vscode-hover)] py-1 px-2 rounded-md text-xs font-medium text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text)] data-[state=active]:text-[var(--vscode-text)] data-[state=active]:bg-[var(--vscode-selected)] transition-colors',
                                )}
                            >
                                Locks
                            </Tabs.Trigger>
                        </Tabs.List>
                    </div>
                </PanelHeader>

                <div className="flex-grow overflow-hidden flex flex-col">
                    <Tabs.Content value="files" className="flex-grow overflow-auto focus-visible:outline-none modern-scrollbar">
                        <FileTree
                            className="h-full"
                            files={files}
                            hideRoot
                            unsavedFiles={unsavedFiles}
                            fileHistory={fileHistory}
                            rootFolder={WORK_DIR}
                            selectedFile={selectedFile}
                            onFileSelect={onFileSelect}
                        />
                    </Tabs.Content>

                    <Tabs.Content value="search" className="flex-grow overflow-auto focus-visible:outline-none modern-scrollbar">
                        <Search />
                    </Tabs.Content>

                    <Tabs.Content value="locks" className="flex-grow overflow-auto focus-visible:outline-none modern-scrollbar">
                        <LockManager />
                    </Tabs.Content>
                </div>
            </Tabs.Root>
        </div>
    );
});
