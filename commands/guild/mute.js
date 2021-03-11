const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mute',
      aliases: ['mute-user'],
      memberName: 'mute',
      group: 'guild',
      description:
        'Mute user yang di tagged (jika admin sudah membuat role "Muted")',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES'],
      clientPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'userToMute',
          prompt:
            'Tolong mention user yang ingin di Mute dengan @ atau berikan ID nya.',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'Apa tujuan kamu me-mute user ini?',
          type: 'string',
          default: message => `${message.author.tag} Requested, tanpa alasan yang jelas.`
        }
      ]
    });
  }

  async run(message, { userToMute, reason }) {
    const mutedRole = message.guild.roles.cache.find(
      role => role.name === 'Muted'
    );
    if (!mutedRole)
      return message.channel.send(
        ':x: Role "Muted" Tidak ada, Buat dulu role-nya lalu coba lagi.'
      );
    const user = userToMute;
    if (!user)
      return message.channel.send(':x: Mohon dicoba kembali dengan User yang Valid.');
    user.roles
      .add(mutedRole)
      .then(() => {
        const muteEmbed = new MessageEmbed()
          .addField('Muted:', user)
          .addField('Alasan', reason)
          .setColor('#420626');
        message.channel.send(muteEmbed);
      })
      .catch(err => {
        message.say(
          ':x: Gagal Me-Mute user ini!'
        );
        return console.error(err);
      });
  }
};
