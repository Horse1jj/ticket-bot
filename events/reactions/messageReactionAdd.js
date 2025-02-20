const Event = require('../../structures/Event');
const { MessageReaction, User, EmbedBuilder, ChannelType, PermissionsBitField } = require("discord.js");
const moment = require('moment');
const config = require('../../config.json');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = class extends Event {
  async run(messageReaction, user) {
    // Ignore bot reactions
    if (user.bot) return;

    const { message, emoji } = messageReaction;
    const member = message.guild.members.cache.get(user.id);

    let id = user.id.toString().substr(0, 4) + user.discriminator;
    let chann = `ticket-${id}`;

    if (emoji.toString() === config.emoji) {
      let role = config.support_role_id
        ? message.guild.roles.cache.get(config.support_role_id)
        : message.guild.roles.cache.find(r => r.name === "Ticket Support");

      if (!role) {
        role = await message.guild.roles.create({
          name: "Ticket Support",
          permissions: [],
          reason: 'Ticket Support Role created for Ticket System',
        });
      }

      let category = config.category_id
        ? message.guild.channels.cache.get(config.category_id)
        : message.guild.channels.cache.find(c => c.name === "tickets" && c.type === ChannelType.GuildCategory);

      if (!category) {
        category = await message.guild.channels.create({
          name: "tickets",
          type: ChannelType.GuildCategory,
          position: 1,
        });
      }

      let limit = Number(config.ticket_limit) || 1;

      const existingTickets = message.guild.channels.cache.filter(channel => channel.name === chann);
      if (existingTickets.size >= limit) {
        return message.channel.send(`Ticket Limit Reached. Limit: ${limit}`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
      }

      messageReaction.users.remove(user.id).catch(() => {});

      const channel = await message.guild.channels.create({
        name: chann,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `**ID:** ${user.id} | **Tag:** ${user.tag}`,
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AddReactions,
            ],
          },
          {
            id: role.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AddReactions,
            ],
          },
          {
            id: message.guild.members.me.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AddReactions,
              PermissionsBitField.Flags.ManageChannels,
            ],
          },
        ],
        reason: `Ticket created by ${user.tag}`,
      });

      const openEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`Welcome to your ticket ${user}!\n\nPlease describe your issue below.`);

      const closeEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`React with 🗑️ to close this ticket.`);

      await channel.send({ embeds: [openEmbed] });
      const closeMsg = await channel.send({ embeds: [closeEmbed] });
      await closeMsg.react('🗑️');

      const logEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Ticket Created')
        .setTimestamp()
        .addFields([
          { name: 'User', value: `${user}`, inline: true },
          { name: 'Channel', value: `${channel.name}`, inline: true },
          { name: 'Date', value: moment(new Date()).format("dddd, MMMM Do YYYY"), inline: true },
        ]);

      if (config.log_channel_id) {
        const logChannel = message.guild.channels.cache.get(config.log_channel_id);
        if (logChannel) {
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } else if (emoji.toString() === '🗑️') {
      if (!message.channel.name.startsWith('ticket-')) return;

      const closeEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('Ticket Closed')
        .setTimestamp()
        .addFields([
          { name: 'User', value: `${user}`, inline: true },
          { name: 'Channel', value: `${message.channel.name}`, inline: true },
          { name: 'Date', value: moment(new Date()).format("dddd, MMMM Do YYYY"), inline: true },
        ]);

      if (config.log_channel_id) {
        const logChannel = message.guild.channels.cache.get(config.log_channel_id);
        if (logChannel) {
          logChannel.send({ embeds: [closeEmbed] });
        }
      }

      await message.channel.delete();
    }
  }
};
