const Command = require('../../structures/Command');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = class HelpCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: 'help',
      aliases: ['menu'],
      description: `Displays ${config.bot_name || 'Bot'}'s Help Menu.`,
      category: 'Information',
      cooldown: 3,
    });
  }

  async run(message, args) {
    const { client } = this;

    // If no command argument is provided, show the general help menu
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`${config.bot_name || 'Bot'}'s Command List`)
        .setDescription('**Please make sure to follow the rules**');

      const categories = [...new Set(client.commands
        .filter(cmd => cmd.category && cmd.category !== 'Owner')
        .map(cmd => cmd.category))];

      for (const category of categories) {
        embed.addFields({
          name: `**${capitalize(category)}**`,
          value: client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `\`${cmd.name.padEnd(12)}:\` - ${cmd.description}`)
            .join('\n'),
        });
      }

      return message.channel.send({ embeds: [embed] });
    }

    // If a command name is provided, show detailed help for that command
    const cmd = client.commands.get(args[0].toLowerCase()) || 
                client.commands.get(client.aliases.get(args[0].toLowerCase()));

    if (!cmd) {
      return message.channel.send(`❌ Could not find the command: \`${args[0]}\``);
    }

    const embed = new EmbedBuilder()
      .setColor('Blue')
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

    if (cmd.aliases?.length) {
      embed.addFields({ name: 'Aliases', value: cmd.aliases.map(alias => `\`${alias}\``).join(', '), inline: true });
    }

    if (cmd.cooldown && cmd.cooldown > 1) {
      embed.addFields({ name: 'Cooldown', value: `\`${cmd.cooldown}s\``, inline: true });
    }

    if (cmd.examples?.length) {
      embed.addFields({
        name: '__**Examples**__',
        value: cmd.examples.map(example => `- \`${example}\``).join('\n'),
      });
    }

    return message.channel.send({ embeds: [embed] });
  }
};

// Utility function for capitalizing first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
