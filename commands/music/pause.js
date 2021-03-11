const { Command } = require('discord.js-commando');

module.exports = class PauseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      aliases: ['pause-song', 'hold', 'stop'],
      memberName: 'pause',
      group: 'music',
      description: 'Pause lagu yang sedang diputar!',
      guildOnly: true
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.reply(
        ':no_entry: Masuk terlebih dahulu kedalam voice channel dan Coba lagi!'
      );

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.say(':x: Tidak ada lagu yang diputar!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Masuk terlebih dahulu kedalam voice channel dan Coba lagi!`
      );
      return;
    }

    message.say(
      ':pause_button: Lagu di paused! Untuk melanjutkan lagu, gunakan perintah resume'
    );

    message.guild.musicData.songDispatcher.pause();
  }
};
