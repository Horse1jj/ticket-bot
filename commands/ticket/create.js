const Command = require('../../structures/Command');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'ticket',
      aliases: ['create', 'setup'],
      description: `Creates a ticket message in a specified channel.`,
      category: 'Ticket',
      cooldown: 3,
      userPermission: ['ManageGuild'], // Updated to match Discord.js v14
    });
  }

  async run(message, args) {
    try {
      let channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[0]) ||
        message.channel;

      if (!channel) {
        return message.channel.send('❌ Invalid channel. Mention a valid channel or provide a valid ID.');
      }

      // Check if the bot has permissions in the target channel
      if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
        return message.channel.send('❌ I do not have permission to send messages in the specified channel.');
      }

      if (!channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.AddReactions)) {
        return message.channel.send('❌ I do not have permission to add reactions in the specified channel.');
      }

      const ticketEmbed = new EmbedBuilder()
        .setTitle('🎫 Ticket System')
        .setColor(config.color || '#2F3136')
        .setTimestamp()
        .setDescription(`React with ${config.emoji || '🎟️'} to create a ticket.`);

      const ticketMessage = await channel.send({ embeds: [ticketEmbed] });
      await ticketMessage.react(config.emoji || '🎟️');
    } catch (error) {
      console.error('Error in ticket command:', error);
      message.channel.send('❌ An error occurred while setting up the ticket system.');
    }
  }
};
