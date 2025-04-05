import { Command } from '../classes/command.ts';
import { CommandContext } from '../classes/commandcontext.ts';

export default class PingCommand extends Command {
  override name = 'ping';
  override category = 'util';
  override description = 'Returns latency of the bot';

  override async execute(ctx: CommandContext): Promise<void> {
    const msg = await ctx.channel.send('pinging...');

    msg.edit(`Latency is ${Math.floor(msg.createdTimestamp - ctx.message.createdTimestamp)}ms`);
  }
}