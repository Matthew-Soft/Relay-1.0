const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unmute',
      aliases: ['unmute-user'],
      memberName: 'unmute',
      group: 'guild',
      description:
        'Unmute user yang di tagged',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES'],
      clientPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'userToUnmute',
          prompt:
            'Tolong mention user yang ingin di Unmute dengan @ atau berikan ID nya.',
          type: 'member'
        }
      ]
    });
  }

  async run(message, { userToUnmute }) {
    const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!mutedRole)
      return message.channel.send(
        ':x: Role "Muted" Tidak ada, Buat dulu role-nya lalu coba lagi.'
      );
    const user = userToUnmute;
    if (!user)
      return message.channel.send(':x: Mohon dicoba kembali dengan User yang Valid.');
    user.roles
      .remove(mutedRole)
      .then(() => {
        const unmuteEmbed = new MessageEmbed()
          .addField('Unmuted:', userToUnmute)
          .setColor('#008000');
        message.channel.send(unmuteEmbed);
      })
      .catch(err => {
        message.say(
          ':x: Gagal Unmute user ini!'
        );
        return console.error(err);
      });
  }
};
