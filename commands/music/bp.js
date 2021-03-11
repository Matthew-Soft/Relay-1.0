const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class CreatePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bp',
      group: 'music',
      memberName: 'bp',
      guildOnly: true,
      description: 'Buat sebuah playlist lagu!',
      args: [
        {
          key: 'playlistName',
          prompt: 'Apa nama playlist yang ingin kamu buat ?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
    // check if the user exists in the db
    if (!db.get(message.member.id)) {
      db.set(message.member.id, {
        savedPlaylists: [{ name: playlistName, urls: [] }]
      });
      message.reply(`Playlist kamu sudah dibuat, nama playlistnya adalah **${playlistName}**`);
      return;
    }
    // make sure the playlist name isn't a duplicate
    var savedPlaylistsClone = db.get(message.member.id).savedPlaylists;
    if (
      savedPlaylistsClone.filter(function searchForDuplicate(playlist) {
        return playlist.name == playlistName;
      }).length > 0
    ) {
      message.reply(
        `Sudah ada playlist **${playlistName}** yang kamu buat, coba lagi!`
      );
      return;
    }
    // create and save the playlist in the db
    savedPlaylistsClone.push({ name: playlistName, urls: [] });
    db.set(`${message.member.id}.savedPlaylists`, savedPlaylistsClone);
    message.reply(`Playlist kamu sudah dibuat, nama playlistnya adalah **${playlistName}**`);
  }
};
