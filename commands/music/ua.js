const { Command } = require('discord.js-commando');

module.exports = class LoopQueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ua',
      memberName: 'ua',
      aliases: ['ulangi-antrian', 'queue-loop'],
      group: 'music',
      description: 'Mengulang Antrian Lagu sebanyak yang kamu mau (Default nya 1x)!',
      guildOnly: true,
      args: [
        {
          key: 'numOfTimesToLoop',
          default: 1,
          type: 'integer',
          prompt: 'Mau berapa kali antrian lagu nya mau di ulang?'
        }
      ]
    });
  }

  run(message) {
    if (!message.guild.musicData.isPlaying) {
      message.say(':x: Tidak ada lagu yang sedang diputar!');
      return;
    } else if (
      message.guild.musicData.isPlaying &&
      message.guild.triviaData.isTriviaRunning
    ) {
      message.say(':x: Tidak bisa mengulang lagu saat kuis!');
      return;
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      message.reply(
        `:no_entry: Kamu hanya bisa menggunakan perintah ini jika kamu berada di Voice Channel bersama saya!`
      );
      return;
    } else if (message.guild.musicData.queue.length == 0) {
      message.say(`:x: Daftar antrian Kosong, Gagal mengulang lagu!`);
      return;
    } else if (message.guild.musicData.loopSong) {
      message.reply(
        ':x: Matikan dulu perintah **mengulang** sebelum menggunakan perintah ini!'
      );
      return;
    }

    if (message.guild.musicData.loopQueue) {
      message.guild.musicData.loopQueue = false;
      message.channel.send(
        ':repeat: Daftar antrian tidak lagi mengulang lagu yang diputar!'
      );
    } else {
      message.guild.musicData.loopQueue = true;
      message.channel.send(':repeat: Daftar antrian sukses diulang!');
    }
  }
};
