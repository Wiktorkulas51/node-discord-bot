require("dotenv").config();
const { Client, MessageEmbed } = require("discord.js");
const utiles = require("./utiles");
const UserTime = require("./UserTIme");
const ytdl = require("ytdl-core");

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
const prefix = "$";

let servers = {};

client.on("voiceStateUpdate", (oldMember, newMember) => {
  const newUser = new UserTime(oldMember, newMember);
  newUser.time();
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  try {
    const jsonData = await utiles.readingFileSync("usersData.json");

    if (msg.author.bot) return;
    if (msg.content.startsWith(prefix)) {
      const [CMD_NAME, ...args] = msg.content
        .trim()
        .substring(prefix.length)
        .split(/\s+/);
      console.log(CMD_NAME, args);

      // if (CMD_NAME === "role") {
      //   msg.reply("choose your roles");
      //   if (msg.content === "choose your roles") {
      //     console.log(msg.reactions);
      //   }
      // }

      if (CMD_NAME === "time" && !args.length) {
        //check whitch user is doing this

        if (utiles.isEmpty(jsonData)) {
          msg.delete();
          msg.reply("plik jest pusty, upewnij się, że dołączyłeś na kanał");
        }

        const dataObj = await utiles.findUser(jsonData, msg);

        const everyFalse = dataObj.arr.every(
          (currentValue) => currentValue === false
        );

        if (dataObj.specCase[0] === true) {
          const diff = jsonData[dataObj.index].userData.userTimeDiff;

          const time = utiles.timeCounter(diff);
          utiles.format(time);
          msg.delete();

          utiles.checkTime(
            msg,
            time.sec === 0 && time.min === 0
              ? "nie byłes jeszcze na żadnym kanale"
              : utiles.format(time),
            jsonData[dataObj.index].userData.name
          );
        } else if (everyFalse) {
          msg.delete();
          msg.reply("nie dołączyłeś jeszcze na żaden kanał");
        }
      }

      if (CMD_NAME === "time" && args[0] === "all") {
        const id =
          msg.author.id === "278950668558139392" ||
          msg.author.id === "194098078314266625";

        jsonData.forEach((el) => {
          if (id) {
            const diff = el.userData.userTimeDiff;
            const time = utiles.timeCounter(diff);
            const format = utiles.format(time);
            utiles.checkTime(
              msg,
              time.sec === 0 && time.min === 0
                ? "nie byłes jeszcze na żadnym kanale"
                : format,
              el.userData.name ? el.userData.name : msg.author.username
            );
          }
        });
        if (!id) {
          msg.reply("nie masz uprawnień");
        }
      }

      switch (CMD_NAME) {
        case "summon":
          if (msg.member.voice.channel !== null) {
            msg.delete();
            msg.reply(`zamknij leb, już wbijam`);
            msg.member.voice.channel.join().then((connection) => {
              setTimeout(() => {
                connection.disconnect();
              }, 5000);
            });
          } else {
            msg.reply("najpierw wbij na kanal bczqu");
          }
          // msg.member.voice.channel.join();
          break;
        case "play":
          // const queue = new Map();

          // const serverQueue = queue.get(msg.guild.id);
          // if (
          //   !voiceConnection.channel
          //     .permissionsFor(client.user)
          //     .has("CONNECT") ||
          //   !voiceConnection.channel.permissionsFor(client.user).has("SPEAK")
          // )
          //   return msg.channel.send("I do not have permission!");
          if (args.length === 0) {
            msg.reply("musisz podać link");
          }

          const voiceConnection = msg.member.voice;

          if (!voiceConnection.channel)
            return msg.channel.send("musisz wejść na kanał głosowy");

          if (!servers[msg.guild.id])
            servers[msg.guild.id] = {
              queue: [],
            };
          const serv = servers[msg.guild.id];

          serv.queue.push(args[0]);

          const songinfo = await ytdl.getInfo(args[0]);

          const song = {
            title: songinfo.videoDetails.title,
            url: songinfo.videoDetails.video_url,
          };
          //on comm show every song in que

          //bug
          if (serv.queue.length === 1) {
            const msgEmb = new MessageEmbed()
              .setColor("e6357c")
              .setTitle("Muzyka 🎵🎵🎵")
              .setAuthor(`Author wiadomości: ${msg.author.username}`)
              .setURL(args[0])
              .setDescription(`Aktualnie gra: ${song.title}`);
            msg.channel.send(msgEmb);
          } else if (serv.queue.length > 1) {
            const msgEmb = new MessageEmbed()
              .setColor("e6357c")
              .setTitle("Muzyka 🎵🎵🎵")
              .setAuthor(`Author wiadomości: ${msg.author.username}`)
              .setURL(args[0])
              .setDescription(`Dodano do kolejki: ${song.title}`);
            msg.channel.send(msgEmb);
          }

          if (voiceConnection.channel) {
            const connection = await voiceConnection.channel.join();
            utiles.play(connection, msg, ytdl, servers);
          }

          // if (!serverQueue) {
          //   const queueConst = {
          //     textChannel: msg.channel,
          //     voiceChannel: voiceConnection.channel,
          //     connection: null,
          //     songs: [],
          //     volume: 5,
          //     playing: true,
          //   };

          //   queue.set(msg.guild.id, queueConst);
          //   console.log("q", serverQueue);
          //   queueConst.songs.push(song);

          //   try {

          //     const connection = await voiceConnection.channel.join();
          //     queueConst.connection = connection;
          //     play(msg.guild, queueConst.songs[0], queue, ytdl);
          //   } catch (error) {
          //     console.log(error);
          //     queue.delete(msg.guild.id);
          //     return msg.channel.send(
          //       `There was an error playing the song! Error: ${error}`
          //     );
          //   }
          // } else {
          //   console.log("else");
          //   serverQueue.songs.push(song);
          //   return msg.channel.send(
          //     `${song.title} has been added to the queue!`
          //   );
          // }

          break;
        case "upgrade":
          const dataObj = await utiles.findUser(jsonData, msg);
          if (dataObj.index === -1) {
            msg.delete();
            msg.reply("nie byłeś na żadnym kanale głosowym");
          } else {
            const diff = jsonData[dataObj.index].userData.userTimeDiff;
            const id = jsonData[dataObj.index].userData.useriD;
            msg.delete();

            utiles.addRoleByTime(diff, id, msg);
          }
          break;

        default:
          break;
      }
    }
  } catch (error) {
    console.log(error);
  }
});

utiles.regulationsAccept(client);

//on key create role

client.login(process.env.DISCORD_BOT_TOKEN);
