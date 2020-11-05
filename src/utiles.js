const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

function regulationsAccept(client) {
  const reactionEmoji = "🆗";
  client.on("message", (msg) => {
    if (msg.channel.id === "769641089668874321") {
      if (msg.author.bot) return;

      const MsgEmb = new MessageEmbed()
        .setTitle(`use reaction ${reactionEmoji}`)
        .setDescription(
          `
          Żeby otrzymać dostęp do kanału zostaw reakcję poniżej:🆗
          
          Jeśli chcecie uprawnienia do DJ'a, wybierzcie reakcje poniżej :musical_keyboard:🎹
          
          Jeśli chcecie otrzymywać powiadomienia odnośnie darmowych gier oraz promocji, wybierzcie reakcje poniżej:🧅

          jęśli chcecie uprawnienia do kanału NSFW: 🔥

          
        `
        )
        .setColor(0xdd9323)
        .setFooter(`ID: ${msg.author.id}`);

      msg.channel.send(MsgEmb).then((msg) => {
        msg.react(reactionEmoji);
        msg.react("🎹");
        msg.react("🧅");
        msg.react("🔥");
        client.on("messageReactionAdd", (reactions, user) => {
          const { name } = reactions.emoji;
          const member = reactions.message.guild.members.cache.get(user.id);
          if (user.username === "nodeBot-test") return;
          switch (name) {
            case reactionEmoji:
              member.roles.add("772170235100135455");
              break;
            case "🔥":
              member.roles.add("772170250166206535");
              break;
            case "🎹":
              member.roles.add("772170236765929553");
              break;
            case "🧅":
              member.roles.add("772170248329101312");
            default:
              break;
          }
        });
        client.on("messageReactionRemove", (reactions, user) => {
          const { name } = reactions.emoji;
          const mebmer = reactions.message.guild.members.cache.get(user.id);
          switch (name) {
            case reactionEmoji:
              mebmer.roles.remove("772170235100135455");
              break;
            case "🔥":
              mebmer.roles.remove("772170250166206535");
              break;
            case "🎹":
              mebmer.roles.remove("772170236765929553");
              break;
            case "🧅":
              mebmer.roles.remove("772170248329101312");
            default:
              break;
          }
        });
      });
    }
  });
}

function fetchUser(msg, id) {
  const user = msg.guild.members.fetch(id);
  return user;
}

function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

function readingFileSync(fileName) {
  const fileDate = fs.readFileSync(path.join(__dirname, "./files", fileName));
  if (isEmpty(fileDate)) {
    console.log(fileDate);
    return null;
  }
  return JSON.parse(fileDate);
}

const format = ({ sec, min, hours, days, months, years }) => {
  const pluralize = (word, count) => {
    if (!count) return;

    const maybePluralWord = `${word}${count > 1 ? "s" : ""}`;
    return `${count} ${maybePluralWord}`;
  };

  return [
    pluralize("year", years % 365),
    pluralize("month", months % 12),
    pluralize("day", days % 7),
    pluralize("hour", hours % 24),
    pluralize("minute", min % 60),
    pluralize("second", sec % 60),

    console.log(),
  ]
    .filter(Boolean)
    .join(", ");
};

function timeCounter(val) {
  const diff = val;

  let secDiff = Math.abs(diff) / 1000;
  let minDiff = secDiff / 60;
  const hoursDiff = minDiff / 60;
  const daysDiff = hoursDiff / 31;
  const monthsDiff = daysDiff / 12;
  const yearsDiff = monthsDiff / 365;

  return {
    sec: Math.floor(secDiff),
    min: Math.floor(minDiff),
    hours: Math.floor(hoursDiff),
    days: Math.floor(daysDiff),
    months: Math.floor(monthsDiff),
    years: Math.floor(yearsDiff),
  };
}

function getTimeByData(data, msg) {
  const timeWhenUserJoined = data.joinedTimestamp;
  const msgCreatedAt = msg.createdAt;
  const diff = new Date(msgCreatedAt).getTime() - timeWhenUserJoined;
  const time1 = timeWhenUserJoined;
  const time2 = msgCreatedAt;
  // const forFormat1 = timeCounter(time1);
  // const forFormat2 = timeCounter(time2);
  // console.log(forFormat1);
  // console.log(forFormat2);
  const time = timeCounter(diff);
  return format(time);
}

function checkTime(msg, timeData, name) {
  const id = msg.author.id;
  fetchUser(msg, id).then((data) => {
    const msgEmbOnTime = new MessageEmbed()
      .setTitle(`Czas spędzony na kanale`)

      .setAuthor(`Użytkownik: ${name}`)

      .setDescription(
        `
      Czas liczony od dołączenia do kanału:  ${getTimeByData(data, msg)}

      Czas spędzony na kanałach głosowych:  ${timeData}

        `
      )
      .setColor("#e6357c");

    msg.channel.send(msgEmbOnTime);
  });
}
async function findUser(file, msg, arr = []) {
  for (let key of file) {
    const check =
      msg.author.username === key.userData.name &&
      msg.author.id === key.userData.useriD;
    arr.push(await check);
  }

  let index;
  const specCase = arr.filter((val) => {
    const i = arr.findIndex((val) => val === true);
    index = i;
    return val === true;
  });

  return { arr: arr, specCase: specCase, index: index };
}

function addRoleByTime(time, id, msg) {
  const member = msg.guild.members.cache.get(id);
  console.log(time);
  if (time >= 3600000) {
    member.roles.add("772186320650108948");
    msg.reply(`otrzymałeś właśnie nową rangę :)`);
  } else {
    msg.reply("nie odpowiednia ilość czasu");
  }
}

// function play(guild, song, queue, ytdl) {
//   let serverQueue = queue.get(guild.id);
//   console.log("serQ", serverQueue);
//   console.log("leng", serverQueue.songs);

//   if (!song) {
//     console.log("!song");
//     serverQueue.voiceChannel.leave();
//     queue.delete(guild.id);
//     return;
//   }

//   const dispatcher = serverQueue.connection
//     .play(ytdl(song.url))
//     .on("finish", () => {
//       serverQueue.songs.shift();
//       serverQueue.songs[0]
//         ? play(guild, serverQueue.songs[0], queue, ytdl)
//         : serverQueue.connection.disconnect();
//     })
//     .on("error", () => {
//       console.log(error);
//     });

//   dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
// }

function play(connection, msg, ytdl, servers) {
  const server = servers[msg.guild.id];

  connection
    .play(ytdl(server.queue[0]))
    .on("finish", () => {
      server.queue.shift();
      server.queue[0]
        ? play(connection, msg, ytdl, servers)
        : connection.disconnect();
    })
    .on("error", () => {
      console.log(error);
    });
}

module.exports = {
  regulationsAccept,
  checkTime,
  fetchUser,
  format,
  timeCounter,
  readingFileSync,
  isEmpty,
  findUser,
  addRoleByTime,
  play,
};
