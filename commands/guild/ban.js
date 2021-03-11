const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      aliases: ['ban-member', 'ban-hammer'],
      memberName: 'ban',
      group: 'guild',
      description: 'Mem-ban orang yang ditag.',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      clientPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToBan',
          prompt:
            'Tolong mention user yang ingin di ban dengan @ atau berikan ID nya.',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Apa tujuan kamu mem-ban user ini?',
          type: 'string'
        },
        {
          key: 'daysDelete',
          prompt:
            'Berapa hari pesan yang ingin Anda hapus dari User ini?',
          type: 'integer',
          validate: function validate(daysDelete) {
            return daysDelete < 8 && daysDelete > 0;
          }
        }
      ]
    });
  }

  async run(message, { userToBan, reason, daysDelete }) {
    const extractNumber = /\d+/g;
    const userToBanID = userToBan.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToBanID));
    if (user == undefined)
      return message.channel.send(':x: Mohon dicoba kembali dengan User yang Valid.');
    user
      .ban({ days: daysDelete, reason: reason })
      .then(() => {
        const banEmbed = new MessageEmbed()
          .addField('Banned:', userToBan)
          .addField('Alasan', reason)
          .setColor('#420626');
        message.channel.send(banEmbed);
      })
      .catch(err => {
        message.say(
          ':x: Gagal mem-ban user, Aku tidak punya Kuasa untuk Mem-Ban User ini!'
        );
        return console.error(err);
      });
  }
};
