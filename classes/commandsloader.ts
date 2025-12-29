import { join } from 'node:path';
import { Command } from './command.ts';
import { CommandClient } from './commandclient.ts';
import { walk } from 'jsr:@std/fs@1.0.21';

export class CommandsLoader {
  client: CommandClient;
  #importSeq: { [name: string]: number } = {};

  constructor(client: CommandClient) {
    this.client = client;
  }

  async load(
    filePath: string,
    exportName: string = 'default',
    onlyRead?: boolean,
  ): Promise<Command> {
    const stat = await Deno.stat(filePath).catch(() => undefined);
    if (stat === undefined || !stat.isFile) throw new Error(`File not found on path ${filePath}`);

    let seq: number | undefined;

    if (this.#importSeq[filePath] !== undefined) seq = this.#importSeq[filePath];
    const mod = await import('file:///' + join(Deno.cwd(), filePath) + (seq === undefined ? '' : `#${seq}`));

    if (this.#importSeq[filePath] === undefined) {
      this.#importSeq[filePath] = 0;
    } else {
      this.#importSeq[filePath]++;
    }

    const Cmd = mod[exportName];
    if (Cmd === undefined) throw new Error(`Command not exported as ${exportName} from ${filePath}`);

    let cmd: Command;
    try {
      if (Cmd instanceof Command) {
        cmd = Cmd;
      } else {
        cmd = new Cmd();
      }

      if (!(cmd instanceof Command)) throw new Error('Failed');
    } catch (_e) {
      throw new Error(`Failed to load Command from ${filePath}`);
    }

    if (!onlyRead) this.client.commands.add(cmd);
    return cmd;
  }

  async loadDirectory(
    path: string,
    options?: {
      exportName?: string,
      maxDepth?: number,
      exts?: string[],
      onlyRead?: boolean
    }
  ): Promise<Command[]> {
    const commands: Command[] = [];

    for await (const entry of walk(path, {
      maxDepth: options?.maxDepth,
      exts: options?.exts,
      includeDirs: false
    })) {
      if (!entry.isFile) continue;
      const cmd = await this.load(
        entry.path,
        options?.exportName,
        options?.onlyRead
      );
      commands.push(cmd);
    }

    return commands;
  }
}