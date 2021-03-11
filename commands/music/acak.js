const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

module.exports = class ShuffleQueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'acak',
      memberName: 'acak',
      group: 'music',
      description: 'Mengacak Lagu yang ada di Antrian!',
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
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply(':x: Tidak ada lagu yang sedang diputar!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Kamu hanya bisa menggunakan perintah ini jika kamu berada di Voice Channel bersama saya!`
      );
      return;
    } else if (message.guild.musicData.loopSong) {
      message.reply(
        ':x: Matikan dulu perintah **mengulang** sebelum menggunakan perintah ini!'
      );
      return;
    }
    if (message.guild.musicData.queue.length < 1)
      return message.say(':x: Daftar antrian Kosong, Gagal mengulang lagu!');

    shuffleQueue(message.guild.musicData.queue);

    const queueClone = message.guild.musicData.queue;
    const queueEmbed = new Pagination.FieldsEmbed()
      .setArray(queueClone)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .formatField('# - Lagu', function(e) {
        return `**${queueClone.indexOf(e) + 1}**: ${e.title}`;
      });

    queueEmbed.embed
      .setColor('#ff7373')
      .setTitle(':twisted_rightwards_arrows: Antrian Musik Baru!');
    queueEmbed.build();
  }
};

function shuffleQueue(queue) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}
