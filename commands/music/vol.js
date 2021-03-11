const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'vol',
      aliases: ['change-volume', 'v', 'vol'],
      group: 'music',
      memberName: 'vol',
      guildOnly: true,
      description: 'Mengatur volume lagu yang sedang diputar!',
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'wantedVolume',
          prompt:
            ':loud_sound: Berapa besar volume musik yang ingin diinginkan? dari 1 sampai 200!',
          type: 'integer',
          // default: 25,
          validate: function(wantedVolume) {
            return wantedVolume >= 1 && wantedVolume <= 200;
          }
        }
      ]
    });
  }

  run(message, { wantedVolume }) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.reply(
        ':no_entry: Masuk ke dalam voice channel dulu lalu coba lagi!'
      );

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply(':x: Tidak ada lagu yang sedang diputar!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Kamu hanya bisa menggunakan perintah ini jika kamu berada di Voice Channel bersama saya!`
      );
      return;
    }
    const volume = wantedVolume / 100;
    message.guild.musicData.volume = volume;
    db.set(`${message.member.guild.id}.serverSettings.volume`, volume );
    message.guild.musicData.songDispatcher.setVolume(volume);
    message.say(`:loud_sound: Sukses mengganti Volume: ${wantedVolume}%!`);
  }
};
