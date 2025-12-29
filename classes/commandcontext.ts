import { Guild, GuildMember, Message, TextChannel, User } from '../deps.ts';
import { Command } from './command.ts';
import { CommandClient } from './commandclient.ts';

export interface CommandContext {
  client: CommandClient;
  message: Message;
  author: User;
  member?: GuildMember;
  channel: TextChannel;
  prefix: string;
  command: Command;
  name: string;
  args: string[]
  argString: string;
  guild?: Guild;
}