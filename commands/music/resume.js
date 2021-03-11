const { Command } = require('discord.js-commando');

module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      aliases: ['resume-song', 'continue'],
      memberName: 'resume',
      group: 'music',
      description: 'Melanjutkan lagu yang sedang di pause!',
      guildOnly: true
    });
  }

  run(message) {
    message.channel.bulkDelete(1);
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.reply(
        ':no_entry: Masuk terlebih dahulu kedalam voice channel dan Coba lagi!'
      );

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher === null
    ) {
      return message.reply(':x: Tidak ada lagu yang sedang diputar!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Kamu hanya bisa menggunakan perintah ini jika kamu berada di Voice Channel bersama saya!`
      );
      return;
    }

    message.say(':play_pause: Lagu di lanjutkan!');
    message.guild.musicData.songDispatcher.resume();
  }
};
