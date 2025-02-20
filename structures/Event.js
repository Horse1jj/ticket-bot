const { Partials } = require('discord.js');

module.exports = class Event {
  constructor(client, name, options = {}) {
    this.name = name;
    this.partials = [
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
      Partials.GuildMember,
      Partials.User,
      Partials.GuildScheduledEvent
    ];
    this.client = client;
    this.type = options.once ? 'once' : 'on';
    this.emitter =
      (typeof options.emitter === 'string' ? this.client[options.emitter] : options.emitter) || this.client;
  }

  async run(...args) {
    throw new Error(`The run method has not been implemented in ${this.name}`);
  }

  reload() {
    return this.store.load(this.file.path);
  }
};
