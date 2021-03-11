const { Command } = require('discord.js-commando');
const db = require('quick.db');
const Pagination = require('discord-paginationembed');

module.exports = class MyPlaylistsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ap',
      aliases: ['mps', 'my-queues', 'my-saved-queues', 'playlists'],
      group: 'music',
      memberName: 'ap',
      guildOnly: true,
      description: 'Menampilkan semua playlist kamu!'
    });
  }

  run(message) {
    message.channel.bulkDelete(1);
    // check if user has playlists or user is in the db
    const dbUserFetch = db.get(message.member.id);
    if (!dbUserFetch) {
      message.reply('Kamu tidak punya playlist!');
      return;
    }
    const savedPlaylistsClone = dbUserFetch.savedPlaylists;
    if (savedPlaylistsClone.length == 0) {
      message.reply('Kamu tidak punya playlist!');
      return;
    }
    const playlistsEmbed = new Pagination.FieldsEmbed()
      .setArray(savedPlaylistsClone)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(5)
      .formatField('# - Playlist', function(e) {
        return `**${savedPlaylistsClone.indexOf(e) + 1}**: ${e.name}`;
      });

    playlistsEmbed.embed.setColor('#ff7373').setTitle('Playlist simpanan kamu');
    playlistsEmbed.build();
  }
};
