const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const Util = require('./structures/Util');
const config = require('./config.json');
const token = config.main_token;

module.exports = class botClient extends Client {
  constructor(options = {}, sentry) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
    });

    this.validate(options);
    this.commands = new Collection();
    this.events = new Collection();
    this.aliases = new Collection();
    this.utils = new Util(this);
    this.config = require('./config.json');
  }

  validate(options) {
    if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

    if (!token) throw new Error('You must pass the token for the client.');
    this.token = token;

    if (!options.prefix) throw new Error('You must pass a prefix for the client.');
    if (typeof options.prefix !== 'string') throw new TypeError('Prefix should be a type of String.');
    this.prefix = options.prefix;
  }

  async start() {
    this.utils.loadCommands();
    this.utils.loadEvents();

    await this.login(this.token);
    console.log('LOADED BOT!');
  }
};
