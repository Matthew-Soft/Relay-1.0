const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'announce',
      aliases: ['announce', 'print'],
      memberName: 'announce',
      group: 'other',
      description: 'Buat Announcement untuk Anggota Bot!',
      args: [
        {
          key: 'text',
          prompt: ':microphone2: Apa yang ingin Saya Announce?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { text }) {
    message.channel.bulkDelete(3);
    var embed = new MessageEmbed()
      .setTitle(`Announcement`)
      .setColor('#888888')
      .setDescription(text)
      .setTimestamp()
      .setFooter(
        `Announced by ${message.member.displayName}`,
        message.author.displayAvatarURL()
      );
    return message.say(embed);
  }
};
