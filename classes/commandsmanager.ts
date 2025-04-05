import { Collection } from '../deps.ts';
import { CommandClient } from '../index.ts';
import { Command, ParsedCommand } from './command.ts';
import { CommandsLoader } from './commandsloader.ts';

export class CommandsManager {
  client: CommandClient;
  list: Collection<string, Command> = new Collection();
  loader: CommandsLoader;

  constructor(client: CommandClient) {
    this.client = client;
    this.loader = new CommandsLoader(client);
  }

  get count(): number {
    return this.list.size;
  }

  filter(search: string): Collection<string, Command> {
    return this.list.filter((cmd: Command): boolean => {
      const name = cmd.name;

      if (name === search) {
        return true;
      } else {
        return false;
      }
    });
  }

  find(search: string): Command | undefined {
    const filtered = this.filter(search);
    return filtered.first();
  }

  fetch(parsed: ParsedCommand): Command | undefined {
    const cmd = this.find(parsed.name);

    if (cmd === undefined) return;

    return cmd;
  }

  exists(search: Command | string): boolean {
    let exists = false;

    if (typeof search === 'string') {
      return this.find(search) !== undefined;
    } else {
      exists = this.find(search.name) !== undefined;
    }

    return exists;
  }

  add(cmd: Command | typeof Command): boolean {
    let CmdClass: typeof Command | undefined;

    if (!(cmd instanceof Command)) {
      CmdClass = cmd;
      cmd = new CmdClass();
      Object.assign(cmd, CmdClass.meta ?? {});
    }

    if (this.exists(cmd)) {
      throw new Error(`Failed to add Command '${cmd.toString()}' with name already exists`);
    }

    if (cmd.name === '' && CmdClass !== undefined) {
      let name = CmdClass.name;
      if (name.toLowerCase().endsWith('command') && name.toLowerCase() !== 'command') {
        name = name.substring(0, name.length - 'command'.length).trim();
        cmd.name = name;
      }
    }

    if (cmd.name === '') throw new Error('Command has no name');

    this.list.set(`${cmd.name}-${this.list.filter((e) => e.name === cmd.name).size}`, cmd);
    return true;
  }

  category(category: string): Collection<string, Command> {
    return this.list.filter((cmd) => cmd.category !== undefined && cmd.category === category);
  }
}