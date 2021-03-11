const { Command } = require('discord.js-commando');

module.exports = class RemoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hapus',
      memberName: 'hapus',
      group: 'music',
      description: 'Hapus sebuah lagu dari Antrian!',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          prompt:
            ':wastebasket: Nomor antrian lagu keberapa yang ingin dihapus dari antrian?',
          type: 'integer'
        }
      ]
    });
  }
  run(message, { songNumber }) {
    if (songNumber < 1 || songNumber >= message.guild.musicData.queue.length) {
      return message.reply(':x: Mohon masukkan nomor antrian yang Valid!');
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(':no_entry: Masuk terlebih dahulu kedalam voice channel dan Coba lagi!');
      return;
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      message.reply(':x: Tidak ada lagu yang sedang diputar!');
      return;
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Kamu hanya bisa menggunakan perintah ini jika kamu berada di Voice Channel bersama saya!`
      );
      return;
    }

    message.guild.musicData.queue.splice(songNumber - 1, 1);
    message.say(`:wastebasket: Sukses menghapus lagu nomor ${songNumber} dari antrian!`);
  }
};
