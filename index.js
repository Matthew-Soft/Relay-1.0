const { CommandoClient } = require('discord.js-commando');
const { Structures, MessageEmbed, MessageAttachment } = require('discord.js');
const path = require('path');
const { prefix, token, discord_owner_id } = require('./config.json');
const db = require('quick.db');
const Canvas = require('canvas');
const Constants = require('./node_modules/discord.js/src/util/Constants.js');

Constants.DefaultOptions.ws.properties.$browser = `Discord iOS`

Structures.extend('Guild', function(Guild) {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        nowPlaying: null,
        songDispatcher: null,
        skipTimer: false, // only skip if user used leave command
        loopSong: false,
        loopQueue: false,
        volume: 1
      };
      this.triviaData = {
        isTriviaRunning: false,
        wasTriviaEndCalled: false,
        triviaQueue: [],
        triviaScore: new Map()
      };
    }
  }
  return MusicGuild;
});

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: discord_owner_id
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', ':notes: List Perintah Musik:'],
    ['gifs', ':film_frames: List Perintah Gif:'],
    ['other', ':loud_sound: List Perintah Lainnya:'],
    ['guild', ':gear: List Perintah Mengenai Users:']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: false,
    prefix: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

  client.once('ready', () => {
  console.log(`${client.user.tag} sudah Siap!`);
  client.user.setPresence({
    status: 'online',
    activity: {
        name: `,help | ${client.guilds.cache.size} servers.`,
        type: 'WATCHING',
        browser: 'DISCORD IOS'
    }
});

  const Guilds = client.guilds.cache.map(guild => guild.name);
  console.log(Guilds, 'Connected!');
  // Registering font For Cloud Services
});
client.on('voiceStateUpdate', async (___, newState) => {
  if (
    newState.member.user.bot &&
    !newState.channelID &&
    newState.guild.musicData.songDispatcher &&
    newState.member.user.id == client.user.id
  ) {
    newState.guild.musicData.queue.length = 0;
    newState.guild.musicData.songDispatcher.end();
    return;
  }
  if (
    newState.member.user.bot &&
    newState.channelID &&
    newState.member.user.id == client.user.id &&
    !newState.selfDeaf
  ) {
    newState.setSelfDeaf(true);
  }
});

client.login(token);
