const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class CovidCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'covid',
      group: 'other',
      aliases: ['covid19', 'coronavirus', 'corona'],
      memberName: 'covid',
      description: 'Menampilkan Data Kasus dan Kematian Covid-19 (*Fitur ini Khusus Selama Masa Pandemi Covid-19 Saja).',
      args: [
        {
          key: 'country',
          prompt:
            'Negara apa yang ingin dicari?? Tulis `semua` untuk menampilkan data Seluruh Dunia.',
          type: 'string',
          default: 'all'
        }
      ]
    });
  }
  async run(message, { country }) {
    if (country === 'semua' || country === 'dunia' || country === 'global') {
      await CovidCommand.getWorldStats()
        .then(data => {
          const covidall = new MessageEmbed()
            .setTitle('Kasus di Seluruh Dunia')
            .setColor('RANDOM')
            .setThumbnail('https://i.imgur.com/a4014ev.png') // World Globe image
            .addField('Total Kasus', data.cases.toLocaleString(), true)
            .addField('Kasus Hari ini', data.todayCases.toLocaleString(), true)
            .addField('Kematian Hari ini', data.todayDeaths.toLocaleString(), true)
            .addField(
              'Kasus Aktif',
              `${data.active.toLocaleString()} (${(
                (data.active / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total Kesembuhan',
              `${data.recovered.toLocaleString()} (${(
                (data.recovered / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total Kematian',
              `${data.deaths.toLocaleString()} (${(
                (data.deaths / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField('Test', `${data.tests.toLocaleString()}`, true)
            .addField(
              'Kasus per Miliar',
              `${data.casesPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Kematian per Miliar',
              `${data.deathsPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Saran untuk Publik dari WHO',
              '[Klik Disini!](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)'
            )
            .setFooter('Terakhir Update')
            .setTimestamp(data.updated);

          message.channel.send(covidall);
        })
        .catch(function onError(err) {
          message.reply(err);
        });
    } else {
      await CovidCommand.getCountryStats(country)
        .then(data => {
          const covidcountry = new MessageEmbed()
            .setTitle(`Data Covid-19 untuk Negara ${data.country}`)
            .setColor('RANDOM')
            .setThumbnail(data.countryInfo.flag)
            .addField('Total Kasus', data.cases.toLocaleString(), true)
            .addField('Kasus Hari ini', data.todayCases.toLocaleString(), true)
            .addField('Kematian Hari ini', data.todayDeaths.toLocaleString(), true)
            .addField(
              'Kasus Aktif',
              `${data.active.toLocaleString()} (${(
                (data.active / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total Kesembuhan',
              `${data.recovered.toLocaleString()} (${(
                (data.recovered / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total Kematian',
              `${data.deaths.toLocaleString()} (${(
                (data.deaths / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField('Test', `${data.tests.toLocaleString()}`, true)
            .addField(
              'Kasus per Miliar',
              `${data.casesPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Kematian per Miliar',
              `${data.deathsPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Saran untuk Publik dari WHO',
              '[Klik Disini!](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)'
            )
            .setFooter('Terakhir Update')
            .setTimestamp(data.updated);

          message.channel.send(covidcountry);
        })
        .catch(function onError(err) {
          message.reply(err);
        });
    }
  }

  static getWorldStats() {
    return new Promise(async function(resolve, reject) {
      const url = 'https://disease.sh/v3/covid-19/all';
      try {
        const body = await fetch(url);
        if (body.status !== 200) {
          reject(
            `Data Covid Gagal diperoleh, coba lagi...`
          );
        }
        const data = await body.json();
        resolve(data);
      } catch (e) {
        console.error(e);
        reject(
          `Data Covid Gagal diperoleh, coba lagi...`
        );
      }
    });
  }
  static getCountryStats(country) {
    return new Promise(async function(resolve, reject) {
      const url = `https://disease.sh/v3/covid-19/countries/${country}`;
      try {
        const body = await fetch(url);
        if (body.status !== 200) {
          reject(
            `Data Covid Gagal diperoleh, Pastikan kamu memasukkan nama negara yang valid!`
          );
        }
        const data = await body.json();
        resolve(data);
      } catch (e) {
        console.error(e);
        reject(
          `Data Covid Gagal diperoleh, Pastikan kamu memasukkan nama negara yang valid!`
        );
      }
    });
  }
};
