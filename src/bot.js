require("dotenv").config();
const { Client } = require("discord.js");
const utiles = require("./utiles");
const UserTime = require("./UserTIme");
const ytdl = require("ytdl-core");
const { play } = require("./utiles");

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
          const queue = new Map();
          if (args.length === 0) {
            msg.reply("musisz podać link");
          }

          const serverQueue = queue.get(msg.guild.id);
          const voiceConnection = msg.member.voice;

          if (!voiceConnection)
            return msg.channel.send("musisz wejść na kanał głosowy");

          // if (!servers[msg.guild.id])
          //   servers[msg.guild.id] = {
          //     queue: [],
          //   };
          // let serv = servers[msg.guild.id];

          // serv.queue.push(args[0]);
          // if (
          //   !voiceConnection.channel
          //     .permissionsFor(client.user)
          //     .has("CONNECT") ||
          //   !voiceConnection.channel.permissionsFor(client.user).has("SPEAK")
          // )
          //   return msg.channel.send("I do not have permission!");
          const songinfo = await ytdl.getInfo(args[0]);
          const song = {
            title: songinfo.title,
            url: songinfo.videoDetails.video_url,
          };

          if (!serverQueue) {
            const queueConst = {
              textChannel: msg.channel,
              voiceChannel: voiceConnection.channel,
              connection: null,
              songs: [],
              volume: 5,
              playing: true,
            };

            queue.set(msg.guild.id, queueConst);
            queueConst.songs.push(song);

            // if (voiceConnection) {
            //   console.log("true");
            //   console.log("asd", msg.member.voice.channel.join());
            //   const connection = await msg.member.voice.channel.join();

            //   console.log("func", utiles.play(connection, msg, servers, ytdl));
            //   utiles.play(connection, msg, servers, ytdl);
            // }

            try {
              const connection = await voiceConnection.channel.join();
              queueConst.connection = connection;
              play(msg.guild, queueConst.songs[0], queue, ytdl);
            } catch (error) {
              console.log(error);
              queue.delete(msg.guild.id);
              return msg.channel.send(
                `There was an error playing the song! Error: ${error}`
              );
            }
          } else {
            serverQueue.songs.push(song);
            return msg.channel.send(
              `${song.title} has been added to the queue!`
            );
          }

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
