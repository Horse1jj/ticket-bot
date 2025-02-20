const Event = require('../../structures/Event');
const Discord = require('discord.js');

module.exports = class extends Event {

  async run(guild) {
    try {
      console.log(`--| I just joined ${guild.name} |--`);
      console.log(`Guild ID: ${guild.id}`);
      console.log(`Total Members: ${guild.memberCount}`);
      console.log(`Owner: ${guild.owner.user.tag}`);

      // Attempt to send a welcome message to the default channel
      const defaultChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 'text');
      
     
