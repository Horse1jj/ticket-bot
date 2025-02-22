const Command = require('../../structures/Command');
const { inspect } = require('util');

module.exports = class EvalCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: 'eval',
      aliases: ['boteval'],
      description: `Evaluates JavaScript code.`,
      category: 'Owner',
      ownerOnly: true,
    });
  }

  async run(message, args) {
    const input = args.join(' ');
    if (!input) return message.channel.send(`❌ What do I evaluate?`);

    // Security check: Block access to sensitive variables
    if (/token|process\.env/gi.test(input)) {
      return message.channel.send(`❌ Access denied.`);
    }

    try {
      let output = eval(input);

      // If the output is a promise, await it
      if (output instanceof Promise) output = await output;
      
      // Format output
      output = inspect(output, { depth: 1 });
      if (output.length > 1024) output = '⚠️ Output too large to display.';

      message.channel.send(`\`\`\`js\n${output}\`\`\``);
    } catch (err) {
      message.channel.send(`\`\`\`js\nError: ${err.message}\`\`\``);
    }
  }
};
