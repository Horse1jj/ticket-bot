const Command = require('../../structures/Command');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'help',
      aliases: ['help', 'menu'],
      description: `Displays ${config.bot_name || 'Bot'}'s Help Menu.`,
      category: 'Information',
      cooldown: 3,
    });
  }

  async run(message, args) {
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`${config.bot_name || 'Bot'}'s Command List`)
        .setDescription('**Please make sure to follow the rules**');

      const categories = message.client.utils.removeDuplicates(
        message.client.commands
          .filter((cmd) => cmd.category !== 'Owner')
          .map((cmd) => cmd.category)
      );

      for (const category of categories) {
        embed.addFields({
          name: `**${category}**`,
          value: message.client.commands
            .filter((cmd) => cmd.category === category)
            .map(
              (cmd) =>
                `\`${cmd.name}${' '.repeat(
                  12 - Number(cmd.name.length)
                )}:\` - ${cmd.description}`
            )
            .join('\n'),
        });
      }

      message.channel.send({ embeds: [embed] });
    } else {
      const cmd =
        this.client.commands.get(args[0]) ||
        this.client.commands.get(this.client.aliases.get(args[0]));
      if (!cmd) return message.channel.send(`Could not find the following command.`);

      const embed = new EmbedBuilder()
        .setTitle(`Command: ${cmd.name}`)
        .setDescription(cmd.description)
        .setFooter({
          text: cmd.disabled
            ? 'This command is currently disabled.'
            : message.member.displayName,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      embed.addFields(
        { name: 'Usage', value: `\`${cmd.usage || 'No usage specified'}\``, inline: true },
        { name: 'Category', value: `\`${capitalize(cmd.category)}\``, inline: true }
      );

      if (cmd.aliases && cmd.aliases.length) {
        embed.addFields({
          name: 'Aliases',
          value: cmd.aliases.map((alias) => `\`${alias}\``).join(', '),
          inline: true,
        });
      }

      if (cmd.cooldown && cmd.cooldown > 1) {
        embed.addFields({
          name: 'Cooldown',
          value: `\`${cmd.cooldown}s\``,
          inline: true,
        });
      }

      if (cmd.examples && cmd.examples.length) {
        embed.addFields({
          name: '__**Examples**__',
          value: cmd.examples.map((example) => `- \`${example}\``).join('\n'),
        });
      }

      message.channel.send({ embeds: [embed] });
    }
  }
};
