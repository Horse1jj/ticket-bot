const Event = require('../../structures/Event');
const { Permissions, Collection, MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const permissions = require('../../permissions.json');
const moment = require('moment');
require("moment-duration-format");

module.exports = class extends Event {
  constructor(...args) {
    super(...args);

    this.impliedPermissions = new Permissions([
      "VIEW_CHANNEL",
      "SEND_MESSAGES",
      "SEND_TTS_MESSAGES",
      "EMBED_LINKS",
      "ATTACH_FILES",
      "READ_MESSAGE_HISTORY",
      "MENTION_EVERYONE",
      "USE_EXTERNAL_EMOJIS",
      "ADD_REACTIONS"
    ]);

    this.ratelimits = new Collection();
  }

  async run(message) {
    try {
      if (!message.guild || message.author.bot) return;

      const mentionRegex = new RegExp(`^<@!?${this.client.user.id}>$`);
      const mentionRegexPrefix = new RegExp(`^<@!?${this.client.user.id}>`);
      
      // Respond with prefix if bot is mentioned
      if (message.content.match(mentionRegex)) {
        return message.channel.send(`Hello there! My prefix for this server is **${config.prefix}**.`)
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
      }

      // Determine the prefix
      const prefix = message.content.match(mentionRegexPrefix) ? mentionRegexPrefix[0] : config.prefix;
      if (!message.content.startsWith(prefix)) return;

      // Extract command and arguments
      const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = this.client.commands.get(cmd.toLowerCase()) || 
                      this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

      if (!command) return;

      // Apply rate limiting
      const rateLimit = this.checkRateLimit(message, cmd);
      if (typeof rateLimit === "string") {
        return message.channel.send(`⏳ Please wait **${rateLimit}** before using \`${cmd}\` again.`);
      }

      // Permission checks
      if (!this.hasBotPermissions(message, command)) return;
      if (!this.hasUserPermissions(message, command)) return;

      // Owner-only command check
      if (command.ownerOnly && !config.developers.includes(message.author.id)) {
        return message.channel.send("🚫 This command is restricted to bot owners.");
      }

      // Execute the command
      await command.run(message, args);
    } catch (error) {
      console.error(error);
      message.channel.send("❌ An unexpected error occurred. Please contact the developer.");
    }
  }

  /**
   * Checks if the user is rate-limited.
   */
  checkRateLimit(message, cmd) {
    try {
      const command = this.client.commands.get(cmd.toLowerCase()) || 
                      this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));
      if (message.author.permLevel > 4) return false;

      const cooldown = command.cooldown * 1000;
      const userLimits = this.ratelimits.get(message.author.id) || {};

      if (!userLimits[command.name]) {
        userLimits[command.name] = Date.now() - cooldown;
      }

      const timeDiff = Date.now() - userLimits[command.name];
      if (timeDiff < cooldown) {
        return moment.duration(cooldown - timeDiff).format("H[h] m[m] s[s]", 1);
      }

      userLimits[command.name] = Date.now();
      this.ratelimits.set(message.author.id, userLimits);
      return false;
    } catch (error) {
      console.error("Rate limit error:", error);
      return false;
    }
  }

  /**
   * Checks if the bot has necessary permissions for the command.
   */
  hasBotPermissions(message, command) {
    if (!command.botPermission) return true;

    const missing = message.channel.permissionsFor(message.guild.me)
      .missing(command.botPermission)
      .map(p => permissions[p]);

    if (missing.length) {
      const embed = new MessageEmbed()
        .setTitle("🚨 Missing Bot Permissions")
        .setDescription(`Command: \`${command.name}\`\nPermissions Required: **${missing.join(', ')}**`)
        .setColor("RED");

      message.channel.send({ embeds: [embed] });
      return false;
    }

    return true;
  }

  /**
   * Checks if the user has necessary permissions for the command.
   */
  hasUserPermissions(message, command) {
    if (!command.userPermission) return true;

    const missing = message.channel.permissionsFor(message.author)
      .missing(command.userPermission)
      .map(p => permissions[p]);

    if (missing.length) {
      const embed = new MessageEmbed()
        .setTitle("🚨 Missing User Permissions")
        .setDescription(`Command: \`${command.name}\`\nPermissions Required: **${missing.join(', ')}**`)
        .setColor("ORANGE");

      message.channel.send({ embeds: [embed] });
      return false;
    }

    return true;
  }
};
