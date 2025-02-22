const Command = require('../../structures/Command');
const config = require('../../config.json');

module.exports = class PingCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: 'ping',
      aliases: ['latency'],
      description: `Displays ${config.bot_name || 'Bot'}'s Ping Latency.`,
      category: 'Information',
      cooldown: 3,
    });
  }

  async run(message) {
    const startTime = Date.now();
    const msg = await message.channel.send('🏓 Pinging...');

    const latency = Date.now() - startTime;
    const apiLatency = Math.round(this.client.ws.ping);

    msg.edit(`\`\`\`js
Time taken: ${latency}ms
Discord API: ${apiLatency}ms
\`\`\``);
  }
};
