const memFiles = new Map<string, Uint8Array>();
const memDirs = new Set<string>();
const listeners = new Map<string, Set<Function>>();
const watchers: Array<{ cb: Function }> = [];

/**
 * IMPORTANT: This workdir must stay in sync with the WORK_DIR used by the
 * browser-side code (`app/utils/constants.ts`) so that:
 *
 * - The FilesStore watcher include pattern (`${WORK_DIR}/**`)
 * - The FileTree root folder (`WORK_DIR`)
 * - And all file paths emitted by this webcontainer stub
 *
 * all share the same absolute prefix. If they differ (e.g. `/workspace`
 * vs `/home/project`), files will be written but never appear in the
 * workbench UI.
 */
const WORKDIR = '/home/project';
memDirs.add(WORKDIR);

function normalize(p: string) {
  return p.replace(/^[.\/]+/g, '').replace(/\\/g, '/');
}

function fullPath(rel: string) {
  const r = normalize(rel);
  return r.startsWith('/') ? r : `${WORKDIR}/${r}`;
}

function emit(event: string, ...args: any[]) {
  const set = listeners.get(event);
  if (!set) return;
  for (const fn of set) {
    try {
      (fn as any)(...args);
    } catch {}
  }
}

function notifyWatchers(events: any[]) {
  for (const w of watchers) {
    try {
      w.cb([events]);
    } catch {}
  }
}

export const webcontainer: any = {
  workdir: WORKDIR,
  fs: {
    async mkdir(dir: string, opts?: { recursive?: boolean }) {
      const rel = normalize(dir);
      const target = fullPath(rel);
      if (opts?.recursive) {
        const segs = target.split('/').filter(Boolean);
        let curr = '';
        for (const s of segs) {
          curr += `/${s}`;
          if (!memDirs.has(curr)) {
            memDirs.add(curr);
          }
        }
      } else {
        memDirs.add(target);
      }
    },
    async writeFile(relPath: string, content: any) {
      const fp = fullPath(relPath);
      const enc = typeof content === 'string' ? new TextEncoder().encode(content) : (content as Uint8Array);
      const existed = memFiles.has(fp);
      memFiles.set(fp, enc);
      const evt = {
        type: existed ? 'change' : 'add_file',
        path: fp,
        buffer: enc,
      };
      notifyWatchers([evt]);
    },
    async readFile(relPath: string, encoding?: string) {
      const fp = fullPath(relPath);
      const data = memFiles.get(fp);
      if (!data) {
        return encoding === 'utf-8' ? '' : new Uint8Array();
      }
      if (encoding === 'utf-8') {
        return new TextDecoder('utf-8').decode(data);
      }
      return data;
    },
    async rm(relPath: string, opts?: { recursive?: boolean }) {
      const fp = fullPath(relPath);
      if (memFiles.has(fp)) {
        memFiles.delete(fp);
        notifyWatchers([{ type: 'remove_file', path: fp }]);
        return;
      }
      if (memDirs.has(fp)) {
        memDirs.delete(fp);
        if (opts?.recursive) {
          for (const key of Array.from(memFiles.keys())) {
            if (key.startsWith(fp + '/')) {
              memFiles.delete(key);
              notifyWatchers([{ type: 'remove_file', path: key }]);
            }
          }
        }
        notifyWatchers([{ type: 'remove_dir', path: fp }]);
      }
    },
  },
  internal: {
    watchPaths(_opts: any, cb: Function) {
      const w = { cb };
      watchers.push(w);
      return {
        close() {
          const idx = watchers.indexOf(w);
          if (idx >= 0) watchers.splice(idx, 1);
        },
      };
    },
  },
  /**
   * Helper for non-production environments (like this stub) to expose a
   * snapshot of all files currently stored in the in-memory filesystem.
   * Real WebContainer instances won't have this, so callers must guard it.
   */
  listFiles() {
    return Array.from(memFiles.entries()).map(([path, buffer]) => ({
      path,
      buffer,
    }));
  },
  on(event: string, cb: (...args: any[]) => void) {
    const set = listeners.get(event) ?? new Set<Function>();
    set.add(cb);
    listeners.set(event, set);
  },
  spawn(cmd: string, args: string[], opts: any) {
    // Simulate shell command execution with proper output streaming
    const fullCmd = [cmd, ...args].join(' ');
    console.log('[WebContainer Shell] Executing:', fullCmd);

    let outputText = '';

    // Handle basic shell commands
    if (cmd === 'pwd' || fullCmd.trim() === 'pwd') {
      outputText = `${WORKDIR}\n`;
    } else if (cmd === 'ls' || fullCmd.startsWith('ls')) {
      const targetDir = args[0] || WORKDIR;
      const dirPath = fullPath(targetDir);
      const items = new Set<string>();

      // List directories
      for (const dir of memDirs) {
        if (dir.startsWith(dirPath + '/')) {
          const rel = dir.slice(dirPath.length + 1);
          const first = rel.split('/')[0];
          if (first) items.add(first + '/');
        }
      }

      // List files
      for (const file of memFiles.keys()) {
        if (file.startsWith(dirPath + '/')) {
          const rel = file.slice(dirPath.length + 1);
          if (!rel.includes('/')) {
            items.add(rel);
          }
        }
      }

      outputText = Array.from(items).sort().join('\n') + '\n';
    } else if (cmd === 'echo') {
      outputText = args.join(' ') + '\n';
    } else if (cmd === 'cat') {
      const filePath = fullPath(args[0] || '');
      const data = memFiles.get(filePath);
      outputText = data ? new TextDecoder('utf-8').decode(data) + '\n' : `cat: ${args[0]}: No such file or directory\n`;
    } else if (cmd === 'node' && args.includes('--version')) {
      outputText = 'v20.0.0\n';
    } else if (cmd === 'npm' && args[0] === '--version') {
      outputText = '10.0.0\n';
    } else if (cmd === 'npm' && args[0] === '-v') {
      outputText = '10.0.0\n';
    } else {
      outputText = `Command '${cmd}' executed (output not available in stub environment)\n`;
    }

    const output = new ReadableStream<string>({
      start(controller) {
        // Write OSC interactive code first
        controller.enqueue('\x1b]654;interactive\x07');
        // Write the command output
        controller.enqueue(outputText);
        // Write OSC exit code
        controller.enqueue('\x1b]654;exit=0:0\x07');
        // Write OSC prompt code
        controller.enqueue('\x1b]654;prompt\x07');
        controller.close();
      },
    });
    const input = new WritableStream<string>();
    return Promise.resolve({ input, output, resize() {} });
  },
  init: async () => {},
  runCommand: async (cmd: string, args?: string[]) => {
    const c = cmd.trim();
    if (c === 'npm' && args?.[0] === 'install') {
      return { status: 'success', message: 'npm install completed successfully', output: 'added 125 packages in 2s' };
    }
    if ((c === 'npm' && args?.[0] === 'run' && args?.[1] === 'dev') || c === 'npm run dev') {
      const port = 5173;
      const url = `http://localhost:${port}/`;
      emit('server-ready', port, url);
      emit('port', port, 'open', url);
      return { status: 'success', message: 'dev server started', output: `Dev server running at ${url}` };
    }
    return { status: 'disabled', message: 'Feature not available in this environment' };
  },
  mountFiles: async () => ({ status: 'disabled', message: 'Feature not available in this environment' }),
};
