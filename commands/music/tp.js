const { Command } = require('discord.js-commando');
const db = require('quick.db');
const Pagination = require('discord-paginationembed');

module.exports = class CreatePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tp',
      group: 'music',
      aliases: ['my-playlist', 'show-playlist', 'songs-in'],
      memberName: 'tp',
      guildOnly: true,
      description: 'Menampilkan lagu simpanan Kamu',
      args: [
        {
          key: 'playlistName',
          prompt: 'Apa Nama Playlist yang ingin kamu Lihat?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
    // check if user has playlists or user is in the db
    const dbUserFetch = db.get(message.member.id);
    if (!dbUserFetch) {
      message.reply('Kamu tidak punya Playlist!');
      return;
    }
    const savedPlaylistsClone = dbUserFetch.savedPlaylists;
    if (savedPlaylistsClone.length == 0) {
      message.reply('Kamu tidak punya Playlist!');
      return;
    }

    let found = false;
    let location;
    for (let i = 0; i < savedPlaylistsClone.length; i++) {
      if (savedPlaylistsClone[i].name == playlistName) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      const urlsArrayClone = savedPlaylistsClone[location].urls;
      if (urlsArrayClone.length == 0) {
        message.reply(`Playlist **${playlistName}** Kosong!`);
      }
      const savedSongsEmbed = new Pagination.FieldsEmbed()
        .setArray(urlsArrayClone)
        .setAuthorizedUsers([message.member.id])
        .setChannel(message.channel)
        .setElementsPerPage(10)
        .formatField('# - Lagu', function(e) {
          return `**${urlsArrayClone.indexOf(e) + 1}**: ${e.title}`;
        });
      savedSongsEmbed.embed.setColor('#ff7373').setTitle('Isi Playlist');
      savedSongsEmbed.build();
    } else {
      message.reply(`Kamu Tidak punya Playlist ${playlistName}`);
    }
  }
};
