const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class DeletePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hp',
      group: 'music',
      memberName: 'hp',
      guildOnly: true,
      description: 'Menghapus sebuah playlist yang pernah kamu buat',
      args: [
        {
          key: 'playlistName',
          prompt: 'Playlist yang mana mau kamu hapus?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
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
      savedPlaylistsClone.splice(location, 1);
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
      message.reply(`Saya sudah menghapus **${playlistName}** dari Playlist simpanan Kamu!`);
    } else {
      message.reply(`Kamu tidak punya Playlist ${playlistName}`);
    }
  }
};
