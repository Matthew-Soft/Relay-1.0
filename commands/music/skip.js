const { Command } = require('discord.js-commando');

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: ['skip-song', 'advance-song', 'next'],
      memberName: 'skip',
      group: 'music',
      description: 'Melewati lagu yang sedang diputar!',
      guildOnly: true
    });
  }

  run(message) {
    message.channel.bulkDelete(1);
    const voiceChannel = message.member.voice.channel;
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
    } else if (message.guild.triviaData.isTriviaRunning) {
      return message.reply(`Tidak bisa melewati Kuis! Akhiri kuis dengan prefix ${prefix}stop-kuis`);
    }
    message.guild.musicData.loopSong = false;
    message.guild.musicData.songDispatcher.end();
  }
};
