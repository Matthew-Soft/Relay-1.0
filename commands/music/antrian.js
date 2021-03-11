const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'antrian',
      aliases: ['song-list', 'next-songs', 'q'],
      group: 'music',
      memberName: 'antrian',
      guildOnly: true,
      description: 'Menampilkan antrian lagu!'
    });
  }

  run(message) {
    message.channel.bulkDelete(1);
    if (message.guild.triviaData.isTriviaRunning)
      return message.say(':x: Coba lagi setelah kuis berakhir!');
    if (message.guild.musicData.queue.length == 0)
      return message.say(':x: Tidak ada lagu di antrian!');
    const queueClone = message.guild.musicData.queue;
    const queueEmbed = new Pagination.FieldsEmbed()
      .setArray(queueClone)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .formatField('# - Lagu', function(e) {
        return `**${queueClone.indexOf(e) + 1}**: ${e.title}`;
      });

    queueEmbed.embed.setColor('#ff7373').setTitle('Antrian lagu');
    queueEmbed.build();
  }
};
