const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { newsAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');

// Skips loading if not found in config.json
if (!newsAPI) return;

module.exports = class GlobalNewsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'wnews',
      aliases: ['global-news', 'reuters'],
      group: 'other',
      memberName: 'wnews',
      description: 'Mengambil 5 Berita Headline Di Dunia saat ini!',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    // powered by NewsAPI.org
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?sources=reuters&pageSize=5&apiKey=${newsAPI}`
      );
      const json = await response.json();
      const articleArr = json.articles;
      let processArticle = article => {
        const embed = new MessageEmbed()
          .setColor('#FF4F00')
          .setTitle(article.title)
          .setURL(article.url)
          .setAuthor(article.author)
          .setDescription(article.description)
          .setThumbnail(article.urlToImage)
          .setTimestamp(article.publishedAt)
          .setFooter('API didukung oleh NewsAPI.org');
        return embed;
      };
      async function processArray(array) {
        for (const article of array) {
          const msg = await processArticle(article);
          message.say(msg);
        }
      }
      await processArray(articleArr);
    } catch (e) {
      message.say(':x: Gagal mengambil Berita!');
      return console.error(e);
    }
  }
};
