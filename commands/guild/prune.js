const { Command } = require('discord.js-commando');

module.exports = class PruneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prune',
      aliases: ['delete-messages', 'bulk-delete', 'purge', 'clear'],
      description: 'Penghapus Pesan Lama di Channel sampai dengan 99 Pesan.',
      group: 'guild',
      memberName: 'prune',
      guildOnly: true,
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
      args: [
        {
          key: 'deleteCount',
          prompt: 'Berapa banyak Pesan Lama yang ingin dihapus ?',
          type: 'integer',
          validate: deleteCount => deleteCount < 100 && deleteCount > 0
        }
      ]
    });
  }

  run(message, { deleteCount }) {
    message.channel
      .bulkDelete(deleteCount)
      .then(messages => message.say(`Sukses Menghapus ${messages.size} Pesan.`))
      .catch(e => {
        console.error(e);
        return message.say(
          ':x: Gagal menghapus pesan!'
        );
      });
  }
};
