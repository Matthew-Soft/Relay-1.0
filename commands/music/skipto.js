const { Command } = require('discord.js-commando');

module.exports = class SkipToCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skipto',
      memberName: 'skipto',
      group: 'music',
      description:
        'Melewati lagu yang ada di antrian menurut nomor antrian!',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          prompt:
            'Nomor antrian keberapa lagu yang ingin di lewatkan ?, Nomor antrian harus lebih dari 1!',
          type: 'integer'
        }
      ]
    });
  }

  run(message, { songNumber }) {
    if (songNumber < 1 && songNumber >= message.guild.musicData.queue.length) {
      return message.reply(':x: Nomor antrian lagu tidak Valid dengan antrian di Playlist!');
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.reply(
        ':no_entry: Masuk terlebih dahulu kedalam voice channel dan Coba lagi!'
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

    if (message.guild.musicData.queue < 1) {
      message.say(':x: Tidak ada lagu di dalam antrian!');
      return;
    }

    if (!message.guild.musicData.loopQueue) {
      message.guild.musicData.queue.splice(0, songNumber - 1);
      message.guild.musicData.loopSong = false;
      message.guild.musicData.songDispatcher.end();
    } else if (message.guild.musicData.loopQueue) {
      const slicedBefore = message.guild.musicData.queue.slice(
        0,
        songNumber - 1
      );
      const slicedAfter = message.guild.musicData.queue.slice(songNumber - 1);
      message.guild.musicData.queue = slicedAfter.concat(slicedBefore);
      message.guild.musicData.songDispatcher.end();
    }
  }
};
