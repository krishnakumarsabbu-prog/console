import type { Message } from 'ai';
import { generateId } from './fileUtils';
import { detectProjectCommands, createCommandsMessage, escapeCortexTags } from './projectCommands';
import { webcontainer } from '~/lib/webcontainer';
import { workbenchStore } from '~/lib/stores/workbench';
import { path } from '~/utils/path';

export const createChatFromFolder = async (
  files: File[],
  binaryFiles: string[],
  folderName: string,
): Promise<Message[]> => {
  const fileArtifacts = await Promise.all(
    files.map(async (file) => {
      return new Promise<{ content: string; path: string }>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const content = reader.result as string;
          const relativePath = file.webkitRelativePath.split('/').slice(1).join('/');
          resolve({
            content,
            path: relativePath,
          });
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }),
  );

  const commands = await detectProjectCommands(fileArtifacts);
  const commandsMessage = createCommandsMessage(commands);

  const binaryFilesMessage =
    binaryFiles.length > 0
      ? `\n\nSkipped ${binaryFiles.length} binary files:\n${binaryFiles.map((f) => `- ${f}`).join('\n')}`
      : '';

  const filesMessage: Message = {
    role: 'assistant',
    content: `I've imported the contents of the "${folderName}" folder.${binaryFilesMessage}

<cortexArtifact id="imported-files" title="Imported Files" type="bundled" >
${fileArtifacts
        .map(
          (file) => `<cortexAction type="file" filePath="${file.path}">
${escapeCortexTags(file.content)}
</cortexAction>`,
        )
        .join('\n\n')}
</cortexArtifact>`,
    id: generateId(),
    createdAt: new Date(),
  };

  const userMessage: Message = {
    role: 'user',
    id: generateId(),
    content: `Import the "${folderName}" folder`,
    createdAt: new Date(),
  };

  const messages = [userMessage, filesMessage];

  if (commandsMessage) {
    messages.push({
      role: 'user',
      id: generateId(),
      content: 'Setup the codebase and Start the application',
    });
    messages.push(commandsMessage);
  }

  return messages;
};

/**
 * Materialize an imported folder directly into the workbench/files store so
 * that files are immediately available after import, without waiting on
 * message parsing or additional model actions.
 */
export const materializeFolderInWorkbench = async (files: File[], folderName: string) => {
  try {
    const wc = await webcontainer;

    for (const file of files) {
      // Strip the top-level folder name so we only keep the project-internal path
      const relativePath = file.webkitRelativePath.split('/').slice(1).join('/');

      if (!relativePath) {
        continue;
      }

      const fullPath = path.join(wc.workdir, relativePath);
      const content = await file.text();

      // Use the existing workbench store API so FilesStore and editor state
      // stay consistent.
      await workbenchStore.createFile(fullPath, content);
    }
  } catch (error) {
    console.error('Failed to materialize folder in workbench:', folderName, error);
    // Best-effort: don't surface this as a hard failure for the user.
  }
};
