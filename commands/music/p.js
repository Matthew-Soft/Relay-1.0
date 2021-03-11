const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);
const db = require('quick.db');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'p',
      aliases: ['play-song', 'add', 'p'],
      memberName: 'p',
      group: 'music',
      description: 'Play lagu apa saja, Langsung dari Youtube!',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'query',
          prompt: ':notes: Lagu atau playlist apa yang harus saya putar?',
          type: 'string',
          validate: function(query) {
            return query.length > 0 && query.length < 200;
          }
        }
      ]
    });
  }

  async run(message, { query }) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.say(':no_entry: Masuk terlebih dahulu kedalam voice channel dan Coba lagi!');
      return;
    }

    if (message.guild.triviaData.isTriviaRunning == true) {
      message.say(':x: Coba lagi setelah kuis telah berakhir!');
      return;
    }

    if (db.get(message.member.id) !== null) {
      const userPlaylists = db.get(message.member.id).savedPlaylists;
      let found = false;
      let location;
      for (let i = 0; i < userPlaylists.length; i++) {
        if (userPlaylists[i].name == query) {
          found = true;
          location = i;
          break;
        }
      }
      if (found) {
        const embed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(':eyes: Waktunya klarifikasi.')
          .setDescription(
            `Kamu punya playlist **${query}**, Maksud kamu, saya memutar playlist kamu atau mencari **${query}** di YouTube?`
          )
          .addField(':arrow_forward: Playlist', '1. Play Playlist Aku!')
          .addField(':mag: YouTube', '2. Cari di YouTube')
          .addField(':x: Cancel', '3. Cancel')
          .setFooter('Pilih dengan cara komen 1 and 3.');
        const clarifyEmbed = await message.channel.send({ embed });
        message.channel
          .awaitMessages(
            function onMessage(msg) {
              return msg.content > 0 && msg.content < 4;
            },
            {
              max: 1,
              time: 30000,
              errors: ['time']
            }
          )
          .then(async function onClarifyResponse(response) {
            const msgContent = response.first().content;
            if (msgContent == 1) {
              if (clarifyEmbed) {
                clarifyEmbed.delete();
              }
              const urlsArray = userPlaylists[location].urls;
              if (urlsArray.length == 0) {
                message.reply(
                  `Playlist ${query} Kosong, tambah lagu dulu untuk memutar lagu!`
                );
                return;
              }
              for (let i = 0; i < urlsArray.length; i++) {
                message.guild.musicData.queue.push(urlsArray[i]);
              }
              if (message.guild.musicData.isPlaying == true) {
                message.channel.send(
                  `Playlist **${query} sudah ditambah di daftar antrian**`
                );
              } else if (message.guild.musicData.isPlaying == false) {
                message.guild.musicData.isPlaying = true;
                PlayCommand.playSong(message.guild.musicData.queue, message);
              }
            } else if (msgContent == 2) {
              await PlayCommand.searchYoutube(query, message, voiceChannel);
              return;
            } else if (msgContent == 3) {
              clarifyEmbed.delete();
              return;
            }
          })
          .catch(function onClarifyError() {
            if (clarifyEmbed) {
              clarifyEmbed.delete();
            }
            return;
          });
        return;
      }
    }

    if (
      // Handles PlayList Links
      query.match(
        /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
      )
    ) {
      const playlist = await youtube.getPlaylist(query).catch(function() {
        message.say(':x: Playlist nya Tidak bisa diputar!');
        return;
      });
      // add 10 as an argument in getVideos() if you choose to limit the queue
      const videosArr = await playlist.getVideos().catch(function() {
        message.say(
          ':x: Gagal memutar Playlist kamu!'
        );
        return;
      });

      // Uncomment if you want the bot to automatically shuffle the playlist

      /*for (let i = videosArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [videosArr[i], videosArr[j]] = [videosArr[j], videosArr[i]];
      }
      */

      for (let i = 0; i < videosArr.length; i++) {
        if (
          videosArr[i].raw.status.privacyStatus == 'private' ||
          videosArr[i].raw.status.privacyStatus == 'privacyStatusUnspecified'
        ) {
          continue;
        } else {
          try {
            const video = await videosArr[i].fetch();
            // this can be uncommented if you choose to limit the queue
            // if (message.guild.musicData.queue.length < 10) {
            //
            message.guild.musicData.queue.push(
              PlayCommand.constructSongObj(
                video,
                voiceChannel,
                message.member.user
              )
            );
            // } else {
            //   return message.say(
            //     `I can't play the full playlist because there will be more than 10 songs in queue`
            //   );
            // }
          } catch (err) {
            return console.error(err);
          }
        }
      }
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message);
      } else if (message.guild.musicData.isPlaying == true) {
        const PlayListEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(`:musical_note: ${playlist.title}`)
          .addField(
            `Playlist kamu ${message.guild.musicData.queue.length} sudah ditambahkan ke daftar antrian!`,
            playlist.url
          )
          .setThumbnail(playlist.thumbnails.high.url)
          .setURL(playlist.url);
        message.say(PlayListEmbed);
        // @TODO add the the position number of queue of the when a playlist is added
        return;
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (
      query.match(/^(http(s)?:\/\/)?(m.)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)
    ) {
      query = query
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      const id = query[2].split(/[^0-9a-z_\-]/i)[0];
      let failedToGetVideo = false;
      const video = await youtube.getVideoByID(id).catch(function() {
        message.say(':x: Gagal mendapatkan VideoID Youtube!');
        failedToGetVideo = true;
      });
      if (failedToGetVideo) return;
      // // can be uncommented if you don't want the bot to play live streams
      // if (video.raw.snippet.liveBroadcastContent === 'live') {
      //   return message.say("I don't support live streams!");
      // }
      // // can be uncommented if you don't want the bot to play videos longer than 1 hour
      // if (video.duration.hours !== 0) {
      //   return message.say('I cannot play videos longer than 1 hour');
      // }
      // // can be uncommented if you want to limit the queue
      // if (message.guild.musicData.queue.length > 10) {
      //   return message.say(
      //     'There are too many songs in the queue already, skip or wait a bit'
      //   );
      // }
      message.guild.musicData.queue.push(
        PlayCommand.constructSongObj(video, voiceChannel, message.member.user)
      );
      if (
        message.guild.musicData.isPlaying == false ||
        typeof message.guild.musicData.isPlaying == 'undefined'
      ) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message);
      } else if (message.guild.musicData.isPlaying == true) {
        const addedEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(`:musical_note: ${video.title}`)
          .addField(
            `Sudah ditambahkan ke Daftar antrian. `,
            `Urutan antrian lagunya berada di #${message.guild.musicData.queue.length}`
          )
          .setThumbnail(video.thumbnails.high.url)
          .setURL(video.url);
        message.say(addedEmbed);
        return;
      }
    }

    // if user provided a song/video name
    await PlayCommand.searchYoutube(query, message, voiceChannel);
  }
  static playSong(queue, message) {
    const classThis = this; // use classThis instead of 'this' because of lexical scope below
    if (queue[0].voiceChannel == undefined) {
      // happens when loading a saved playlist
      queue[0].voiceChannel = message.member.voice.channel;
    }
    if (message.guild.me.voice.channel !== null) {
      if (message.guild.me.voice.channel.id !== queue[0].voiceChannel.id) {
        queue[0].voiceChannel = message.guild.me.voice.channel;
      }
    }
    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              filter: 'audio',
              quality: 'highestaudio',
              highWaterMark: 1 << 25
            })
          )
          .on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            if (!db.get(`${message.guild.id}.serverSettings.volume`))
              dispatcher.setVolume(message.guild.musicData.volume);
            else
              dispatcher.setVolume(
                db.get(`${message.guild.id}.serverSettings.volume`)
              );

            const videoEmbed = new MessageEmbed()
              .setThumbnail(queue[0].thumbnail)
              .setColor('#ff0000')
              .addField(':notes: Lagu yang Sedang diputar:', queue[0].title)
              .addField(':stopwatch: Durasi:', queue[0].duration)
              .setURL(queue[0].url)
              .setFooter(
                `Diminta oleh : ${queue[0].memberDisplayName}`,
                queue[0].memberAvatar
              );

            if (queue[1] && !message.guild.musicData.loopSong)
              videoEmbed.addField(':track_next: Lagu Selanjutnya:', queue[1].title);
            message.say(videoEmbed);
            message.guild.musicData.nowPlaying = queue[0];
            queue.shift();
            return;
          })
          .on('finish', function() {
            queue = message.guild.musicData.queue;
            if (message.guild.musicData.loopSong) {
              queue.unshift(message.guild.musicData.nowPlaying);
            } else if (message.guild.musicData.loopQueue) {
              queue.push(message.guild.musicData.nowPlaying);
            }
            if (queue.length >= 1) {
              classThis.playSong(queue, message);
              return;
            } else {
              message.guild.musicData.isPlaying = false;
              message.guild.musicData.nowPlaying = null;
              message.guild.musicData.songDispatcher = null;
              if (
                message.guild.me.voice.channel &&
                message.guild.musicData.skipTimer
              ) {
                message.guild.me.voice.channel.leave();
                message.guild.musicData.skipTimer = false;
                return;
              }
              if (message.guild.me.voice.channel) {
                setTimeout(function onTimeOut() {
                  if (
                    message.guild.musicData.isPlaying == false &&
                    message.guild.me.voice.channel
                  ) {
                    message.guild.me.voice.channel.leave();
                    message.channel.send(
                      ':zzz: Tidak ada aktifitas lagi? Saya istirahat dulu ya!'
                    );
                  }
                }, 90000);
              }
            }
          })
          .on('error', function(e) {
            message.say(':x: Gagal memutar lagu!');
            console.error(e);
            if (queue.length > 1) {
              queue.shift();
              classThis.playSong(queue, message);
              return;
            }
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.isPlaying = false;
            message.guild.musicData.nowPlaying = null;
            message.guild.musicData.loopSong = false;
            message.guild.musicData.songDispatcher = null;
            message.guild.me.voice.channel.leave();
            return;
          });
      })
      .catch(function() {
        message.say(':no_entry: Aku tidak punya kuasa untuk masuk ke voice channel kamu!');
        message.guild.musicData.queue.length = 0;
        message.guild.musicData.isPlaying = false;
        message.guild.musicData.nowPlaying = null;
        message.guild.musicData.loopSong = false;
        message.guild.musicData.songDispatcher = null;
        if (message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave();
        }
        return;
      });
  }

  static async searchYoutube(query, message, voiceChannel) {
    const videos = await youtube.searchVideos(query, 5).catch(async function() {
      await message.say(
        ':x: Gagal mencari Video yang kamu maksud!'
      );
      return;
    });
    if (videos.length < 5 || !videos) {
      message.say(
        `:x: Gagal mencari Video yang kamu maksud, Tolong coba lagi atau ganti kata pencarian nya.`
      );
      return;
    }
    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(
        `${i + 1}: [${videos[i].title
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")}](${videos[i].shortURL})`
      );
    }
    vidNameArr.push('cancel');
    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`:mag: Hasil Pencarian!`)
      .addField(':notes: Hasil ke 1', vidNameArr[0])
      .setURL(videos[0].url)
      .addField(':notes: Hasil ke 2', vidNameArr[1])
      .addField(':notes: Hasil ke 3', vidNameArr[2])
      .addField(':notes: Hasil ke 4', vidNameArr[3])
      .addField(':notes: Hasil ke 5', vidNameArr[4])
      .setThumbnail(videos[0].thumbnails.high.url)
      .setFooter('Pilih lagu yang akan diputar, komen 1 - 5')
      .addField(':x: Cancel', 'to cancel ');
    var songEmbed = await message.channel.send({ embed });
    message.channel
      .awaitMessages(
        function(msg) {
          return (
            (msg.content > 0 && msg.content < 6) || msg.content === 'cancel'
          );
        },
        {
          max: 1,
          time: 60000,
          errors: ['time']
        }
      )
      .then(function(response) {
        const videoIndex = parseInt(response.first().content);
        if (response.first().content === 'cancel') {
          songEmbed.delete();
          
          return;
        }
        youtube
          .getVideoByID(videos[videoIndex - 1].id)
          .then(function(video) {
            // // can be uncommented if you don't want the bot to play live streams
            // if (video.raw.snippet.liveBroadcastContent === 'live') {
            //   songEmbed.delete();
            
            //   return message.say("I don't support live streams!");
            // }

            // // can be uncommented if you don't want the bot to play videos longer than 1 hour
            // if (video.duration.hours !== 0) {
            //   songEmbed.delete();
            
            //   return message.say('I cannot play videos longer than 1 hour');
            // }

            // // can be uncommented if you don't want to limit the queue
            // if (message.guild.musicData.queue.length > 10) {
            //   songEmbed.delete();
            
            //   return message.say(
            //     'There are too many songs in the queue already, skip or wait a bit'
            //   );
            // }
            message.guild.musicData.queue.push(
              PlayCommand.constructSongObj(
                video,
                voiceChannel,
                message.member.user
              )
            );
            if (message.guild.musicData.isPlaying == false) {
              message.guild.musicData.isPlaying = true;
              if (songEmbed) {
                songEmbed.delete();
                message.channel.bulkDelete(2);
              }
              PlayCommand.playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
              if (songEmbed) {
                songEmbed.delete();
                message.channel.bulkDelete(2);
              }
              const addedEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle(`:musical_note: ${video.title}`)
                .addField(
                  `Sudah ditambahkan kedalam daftar antrian. `,
                  `Lagu kamu ada di antrian ke #${message.guild.musicData.queue.length}`
                )
                .setThumbnail(video.thumbnails.high.url)
                .setURL(video.url);
              message.say(addedEmbed);
              return;
            }
          })
          .catch(function() {
            if (songEmbed) {
              songEmbed.delete();
              message.channel.bulkDelete(3);
            }
            message.say(
              ':x: Gagal mengambil VideoID Youtube.'
            );
            return;
          });
      })
      .catch(function() {
        if (songEmbed) {
          songEmbed.delete();
          message.channel.bulkDelete(3);
        }
        message.say(
          ':x: Coba lagi dan komen 1-5 atau cancel.'
        );
        return;
      });
  }

  static constructSongObj(video, voiceChannel, user) {
    let duration = this.formatDuration(video.duration);
    if (duration == '00:00') duration = ':red_circle: Live Stream';
    return {
      url: `https://www.youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnails.high.url,
      voiceChannel,
      memberDisplayName: user.username,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }
  // prettier-ignore
  static formatDuration(durationObj) {
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
      durationObj.minutes ? durationObj.minutes : '00'
    }:${
      (durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
    return duration;
  }
};
