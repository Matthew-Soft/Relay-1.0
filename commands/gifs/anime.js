const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');

// Skips loading if not found in config.json
if (!tenorAPI) return;

module.exports = class AnimegifCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'anime',
      group: 'gifs',
      aliases: ['anime', 'anime'],
      memberName: 'anime',
      description:
        'Berikan aku nama sebuah acara anime atau seorang karakter anime, dan aku akan Mengirim Hasil Pencariannya!',
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  run(message) {
    fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=anime&limit=1`)
      .then(res => res.json())
      .then(json => message.say(json.results[0].url))
      .catch(e => {
        message.say(':x: Gagal mencari GIF yang kamu inginkan!');
        return;
      });
  }
};
