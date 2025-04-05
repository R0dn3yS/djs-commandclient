import { Message } from '../deps.ts';
import { CommandContext } from './commandcontext.ts';

export interface CommandOptions {
  name?: string;
  description?: string;
  category?: string;
  args?: string[];
  ownerOnly?: boolean;
}

export class Command implements CommandOptions {
  static meta?: CommandOptions;

  name: string = '';
  description?: string;
  category?: string;
  args?: string[];
  ownerOnly?: boolean = false;

  onError(_ctx: CommandContext, _error: Error): unknown | Promise<unknown> {
    return;
  }

  execute(_ctx: CommandContext): unknown | Promise<unknown> {
    return;
  }

  toString(): string {
    return `Command: ${this.name}${
        this.category !== undefined
        ? ` [${this.category}]`
        : ''
    }`
  }
}

export interface ParsedCommand {
  name: string;
  args: string[];
  argString: string;
}

export const parseCommand = (
  msg: Message,
  prefix: string,
): ParsedCommand | undefined => {
  const content = msg.content.slice(prefix.length);
  const args = content.split(/\s/);

  const name = args.shift();
  if (name === undefined) return;
  const argString = content.slice(name.length).trim();

  return { name, args, argString };
}