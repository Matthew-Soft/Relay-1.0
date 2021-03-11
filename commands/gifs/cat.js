const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');

// Skips loading if not found in config.json
if (!tenorAPI) return;

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kucing',
      aliases: ['foto-kucing', 'kucing'],
      group: 'gifs',
      memberName: 'kucing',
      description: 'Mengirim Foto GIF Kucing, Khusus untukmu!',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  run(message) {
    fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=cat&limit=1`)
      .then(res => res.json())
      .then(json => message.say(json.results[0].url))
      .catch(err => {
        message.say(':x: Gagal mencari GIF yang kamu inginkan!');
        return console.error(err);
      });
  }
};
