const { Command } = require('discord.js-commando');

module.exports = class StopMusicTriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sk',
      aliases: [
        'stop-music-trivia',
        'skip-trivia',
        'end-trivia',
        'stop-trivia'
      ],
      memberName: 'sk',
      group: 'music',
      description: 'Mengakhiri Kuis musik!',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT']
    });
  }
  run(message) {
    if (!message.guild.triviaData.isTriviaRunning)
      return message.say(':x: Tidak ada kuis yang sedang berjalan!');

    if (message.guild.me.voice.channel !== message.member.voice.channel) {
      return message.say(
        ':no_entry: Masuk ke dalam voice channel dulu lalu coba lagi!'
      );
    }

    if (!message.guild.triviaData.triviaScore.has(message.author.username)) {
      return message.say(
        ':stop_sign: Kamu harus ikut di dalam kuis untuk mengakhiri Kuis'
      );
    }

    message.guild.triviaData.triviaQueue.length = 0;
    message.guild.triviaData.wasTriviaEndCalled = true;
    message.guild.triviaData.triviaScore.clear();
    message.guild.musicData.songDispatcher.end();
    return;
  }
};
