const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      aliases: ['kick-member', 'throw'],
      memberName: 'kick',
      group: 'guild',
      description: 'Meng-Kick User yang di tagged.',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      clientPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToKick',
          prompt:
            'Tolong mention user yang ingin di kick dengan @ atau berikan ID nya.',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Apa tujuan kamu meng-kick user ini?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { userToKick, reason }) {
    const extractNumber = /\d+/g;
    const userToKickID = userToKick.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToKickID));
    if (user == undefined)
      return message.channel.send(':x: Mohon dicoba kembali dengan User yang Valid.');
    user
      .kick(reason)
      .then(() => {
        const kickEmbed = new MessageEmbed()
          .addField('Kicked:', userToKick)
          .addField('Alasan:', reason)
          .setColor('#420626');
        message.channel.send(kickEmbed);
      })
      .catch(err => {
        message.say(
          ':x: Gagal Meng-Kick user, Aku tidak punya Kuasa untuk Meng-Kick User ini!'
        );
        return console.error(err);
      });
  }
};
