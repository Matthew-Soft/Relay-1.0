const { Command } = require('discord.js-commando');

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ul',
      aliases: [`repeat`],
      group: 'music',
      memberName: 'ul',
      guildOnly: true,
      description: 'Mengulang lagu yang sedang diputar!'
    });
  }

  run(message) {
    if (!message.guild.musicData.isPlaying) {
      return message.say(':x: Tidak ada lagu yang sedang diputar!');
    } else if (
      message.guild.musicData.isPlaying &&
      message.guild.triviaData.isTriviaRunning
    ) {
      return message.say(':x: Tidak bisa memutar lagu saat sedang kuis!');
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      message.reply(
        ` Masuk terlebih dahulu kedalam voice channel dan Coba lagi!`
      );
      return;
    }

    if (message.guild.musicData.loopSong) {
      message.guild.musicData.loopSong = false;
      message.channel.send(
        `Lagu **${message.guild.musicData.nowPlaying.title}** sudah tidak lagi diputar berulang kali :repeat: `
      );
    } else {
      message.guild.musicData.loopSong = true;
      message.channel.send(
        `Lagu **${message.guild.musicData.nowPlaying.title}** sekarang diputar berulang kali :repeat: `
      );
    }
  }
};
