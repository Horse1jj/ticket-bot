const Event = require('../../structures/Event');
const Discord = require('discord.js');

module.exports = class extends Event {

  async run(guild) {
    try {
      console.log(`--| I just left ${guild.name} |--`);
      console.log(`Guild ID: ${guild.id}`);
      console.log(`Total Members: ${guild.memberCount}`);
      console.log(`Owner: ${guild.owner.user.tag}`);

      // Optional: You could send notifications/logs to a specific channel or external service, if needed.
      // For example, logging it to a log channel in your bot’s server:

      const logChannel = guild.channels.cache.find(ch => ch.name === 'logs' && ch.type === 'text');
      if (logChannel) {
        logChannel.send(`I just left **${guild.name}**. Guild ID: ${guild.id}.`);
      }

    } catch (error) {
      console.error('Error when handling bot leave event:', error);
    }
  }
};
