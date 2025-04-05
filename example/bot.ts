import { GatewayIntentBits } from '../deps.ts';
import { CommandClient } from '../index.ts';

const client = new CommandClient({
  prefix: '%',
  owners: [ '325254775828512778' ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`${client.user?.username} is ready on ${client.guilds.cache.size} servers.`);
});

client.commands.loader.load('./example/ping.ts');

client.login(Deno.env.get('DISCORD_TOKEN'));