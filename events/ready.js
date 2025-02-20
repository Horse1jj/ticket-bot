const Event = require('../structures/Event');
const config = require('../config.json');

module.exports = class extends Event {
  async run() {
    const activities = [
      { name: `${config.bot_name || 'Ticket bot'}`, type: 3 }, // WATCHING = 3
      { name: 'Pavlov Prison Life', type: 3 },
    ];

    this.client.user.setPresence({
      status: 'online',
      activities: [activities[0]],
    });

    let activity = 1;

    setInterval(() => {
      const dynamicActivities = [
        { name: `${config.prefix}help | ${this.client.guilds.cache.size} guilds`, type: 3 },
        { name: `${config.prefix}help | ${this.client.users.cache.size} users`, type: 3 },
      ];

      const allActivities = [...activities, ...dynamicActivities];

      if (activity >= allActivities.length) activity = 0;

      this.client.user.setActivity({
        name: allActivities[activity].name,
        type: allActivities[activity].type,
      });

      activity++;
    }, 35000);
  }
};
