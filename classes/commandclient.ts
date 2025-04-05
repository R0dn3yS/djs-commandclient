import { BitFieldResolvable, Client, ClientOptions, Message, TextChannel } from '../deps.ts';
import { parseCommand } from './command.ts';
import { CommandContext } from './commandcontext.ts';
import { CommandsManager } from './commandsmanager.ts';

export interface CommandClientOptions extends ClientOptions {
  prefix: string;
  owners?: string[];
}

export class CommandClient extends Client {
  prefix: string;
  owners: string[];

  commands: CommandsManager = new CommandsManager(this);

  intents: BitFieldResolvable<'Guilds' | 'GuildMembers' | 'GuildModeration' | 'GuildBans' | 'GuildExpressions' | 'GuildEmojisAndStickers' | 'GuildIntegrations' | 'GuildWebhooks' | 'GuildInvites' | 'GuildVoiceStates' | 'GuildPresences' | 'GuildMessages' | 'GuildMessageReactions' | 'GuildMessageTyping' | 'DirectMessages' | 'DirectMessageReactions' | 'DirectMessageTyping' | 'MessageContent' | 'GuildScheduledEvents' | 'AutoModerationConfiguration' | 'AutoModerationExecution' | 'GuildMessagePolls' | 'DirectMessagePolls', number>;
  
  constructor(options: CommandClientOptions) {
    super(options);

    this.prefix = options.prefix;
    this.owners = options.owners === undefined ? [] : options.owners;
    this.intents = options.intents;

    this.on('messageCreate', async (msg: Message) => await this.processMessage(msg));
  }

  // deno-lint-ignore no-explicit-any
  async processMessage(msg: Message): Promise<any> {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(this.prefix)) return;

    const parsed = parseCommand(msg, this.prefix);
    if (parsed === undefined) return;
    const command = this.commands.fetch(parsed);

    if (command === undefined) return this.emit('commandNotFound', msg, parsed);

    const ctx: CommandContext = {
      client: this,
      name: parsed.name,
      prefix: this.prefix,
      args: parsed.args,
      argString: parsed.argString,
      message: msg,
      author: msg.author,
      member: msg.member ?? undefined,
      command,
      channel: msg.channel as TextChannel,
      guild: msg.guild ?? undefined,
    }

    if (command.ownerOnly) {
      return this.emit('commandOwnerOnly', ctx);
    }

    try {
      this.emit('commandUsed', ctx);
      await command.execute(ctx);
    } catch(e) {
      try {
        await command.onError(ctx, e as Error);
      } catch (e) {
        this.emit('commandError', ctx, e as Error);
      }
      this.emit('commandError', ctx, e as Error);
    }
  }
}