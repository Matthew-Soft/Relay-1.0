const { Command } = require('discord.js-commando');

module.exports = class MoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pl',
      memberName: 'pl',
      aliases: ['m', 'movesong'],
      description: 'Memindahkan Lagu ke posisi yang diinginkan!',
      group: 'music',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'oldPosition',
          type: 'integer',
          prompt: ':notes: Lagu apa yang ingin kamu pindahkan?'
        },
        {
          key: 'newPosition',
          type: 'integer',
          prompt: ':notes: Mau dipindahkan ke posisi mana lagu ini?'
        }
      ]
    });
  }
  async run(message, { oldPosition, newPosition }) {
    if (
      oldPosition < 1 ||
      oldPosition > message.guild.musicData.queue.length ||
      newPosition < 1 ||
      newPosition > message.guild.musicData.queue.length ||
      oldPosition == newPosition
    ) {
      message.reply(':x: Coba lagi dan Masukkan Letak Posisi lagu yang Valid!');
      return;
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
      return message.reply(':x: Tidak ada lagu yang diputar!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Masuk terlebih dahulu kedalam voice channel dan Coba lagi!`
      );
      return;
    } else if (message.guild.musicData.loopSong) {
      message.reply(
        ':x: Matikan Perintah **ulangi-lagu** Sebelum menggunakan perintah **pindah-lagu**.'
      );
      return;
    }

    const songName = message.guild.musicData.queue[oldPosition - 1].title;

    MoveSongCommand.array_move(
      message.guild.musicData.queue,
      oldPosition - 1,
      newPosition - 1
    );

    message.channel.send(`**${songName}** sukses dipindahkan ke ${newPosition}`);
  }
  // https://stackoverflow.com/a/5306832/9421002
  static array_move(arr, old_index, new_index) {
    while (old_index < 0) {
      old_index += arr.length;
    }
    while (new_index < 0) {
      new_index += arr.length;
    }
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }
};
