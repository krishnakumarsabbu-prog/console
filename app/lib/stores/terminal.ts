import { atom, type WritableAtom } from 'nanostores';
import type { ITerminal } from '~/types/terminal';
import { newBoltShellProcess, newShellProcess } from '~/utils/shell';
import { coloredText } from '~/utils/terminal';

/**
 * TerminalStore manages terminal instances and shell processes.
 *
 * COMMAND EXECUTION FLOW (for terminal reflection):
 * 1. User clicks "Run command" OR assistant triggers command
 * 2. ActionRunner.runAction() -> ActionRunner.#runShellAction()
 * 3. shell.executeCommand(sessionId, command) [from boltTerminal]
 * 4. webcontainer.spawn(cmd, args) executes the command
 * 5. Output is read from spawn().output stream
 * 6. Output is written to terminal via terminal.write(value) [real-time streaming]
 * 7. Command result (exit code + output) returned to chat
 *
 * KEY WIRING:
 * - Terminal UI component -> onTerminalReady -> workbenchStore.attachBoltTerminal
 * - attachBoltTerminal -> BoltShell.init(webcontainer, terminal)
 * - BoltShell stores webcontainer instance for executeCommand
 * - executeCommand calls webcontainer.spawn and streams to terminal.write()
 */
export class TerminalStore {
  #webcontainer: Promise<any>;
  #terminals: Array<{ terminal: ITerminal; process: any }> = [];
  #boltTerminal = newBoltShellProcess();

  showTerminal: WritableAtom<boolean> = import.meta.hot?.data.showTerminal ?? atom(true);

  constructor(webcontainerPromise: Promise<any>) {
    this.#webcontainer = webcontainerPromise;

    if (import.meta.hot) {
      import.meta.hot.data.showTerminal = this.showTerminal;
    }
  }
  get boltTerminal() {
    return this.#boltTerminal;
  }

  toggleTerminal(value?: boolean) {
    this.showTerminal.set(value !== undefined ? value : !this.showTerminal.get());
  }
  async attachBoltTerminal(terminal: ITerminal) {
    try {
      // CRITICAL FIX: Pass actual webcontainer instance to BoltShell
      // This is required for command execution (executeCommand -> webcontainer.spawn)
      const webcontainerInstance = await this.#webcontainer;
      await this.#boltTerminal.init(webcontainerInstance, terminal);
    } catch (error: any) {
      terminal.write(coloredText.red('Failed to spawn bolt shell\n\n') + error.message);
      return;
    }
  }

  async attachTerminal(terminal: ITerminal) {
    try {
      // Pass actual webcontainer instance for regular shell processes
      const webcontainerInstance = await this.#webcontainer;
      const shellProcess = await newShellProcess(webcontainerInstance, terminal);
      this.#terminals.push({ terminal, process: shellProcess });
    } catch (error: any) {
      terminal.write(coloredText.red('Failed to spawn shell\n\n') + error.message);
      return;
    }
  }

  onTerminalResize(cols: number, rows: number) {
    for (const { process } of this.#terminals) {
      process.resize({ cols, rows });
    }
  }
}
