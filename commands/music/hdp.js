const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class SaveToPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hdp',
      aliases: ['hapus-dari-playlist', 'remove-song'],
      group: 'music',
      memberName: 'hdp',
      guildOnly: true,
      description: 'Hapus lagu dari playlist kamu.',
      args: [
        {
          key: 'playlist',
          prompt: 'Dari Playlist apa lagu yang ingin dihapus?',
          type: 'string'
        },
        {
          key: 'index',
          prompt:
            'Nomor antrian lagu keberapa yang ingin dihapus dari playlist kamu?',
          type: 'string',
          validate: function validateIndex(index) {
            return index > 0;
          }
        }
      ]
    });
  }

  async run(message, { playlist, index }) {
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
      if (savedPlaylistsClone[i].name == playlist) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      const urlsArrayClone = savedPlaylistsClone[location].urls;
      if (urlsArrayClone.length == 0) {
        message.reply(`**${playlist}** is empty!`);
        return;
      }

      if (index > urlsArrayClone.length) {
        message.reply(
          `Nomor antrian lagu tidak Valid dengan antrian di Playlist!`
        );
        return;
      }
      const title = urlsArrayClone[index - 1].title;
      urlsArrayClone.splice(index - 1, 1);
      savedPlaylistsClone[location].urls = urlsArrayClone;
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
      message.reply(
        `Saya telah menghapus **${title}** dari Playlist **${savedPlaylistsClone[location].name}**`
      );
      return;
    } else {
      message.reply(`Kamu tidak punya Playlist **${playlist}**`);
      return;
    }
  }
};
