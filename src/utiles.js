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
    pluralize("Year", years % 365),
    pluralize("Month", months % 12),
    pluralize("Day", days % 7),
    pluralize("Houur", hours % 24),
    pluralize("Minute", min % 60),
    pluralize("Secund", sec % 60),

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

// function getTimeByData(data, msg) {
//   const timeWhenUserJoined = data.joinedTimestamp;
//   const msgCreatedAt = msg.createdAt;
//   console.log("getTimeByData -> msgCreatedAt", msgCreatedAt);
//   const diff = timeWhenUserJoined - new Date(msgCreatedAt).getTime();

//   const time1 = timeWhenUserJoined;
//   const time2 = msgCreatedAt;
//   const time = timeCounter(diff);
//   return format(time);
// }

function checkTime(msg, timeData, name) {
  const id = msg.author.id;
  fetchUser(msg, id).then((data) => {
    const msgEmbOnTime = new MessageEmbed()
      .setTitle(`Czas spędzony na kanale`)

      .setAuthor(`Użytkownik: ${name}`)

      // Czas liczony od dołączenia do kanału:  ${getTimeByData(data, msg)}
      .setDescription(
        `
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
  const filteredValue = arr.filter((val) => {
    const i = arr.findIndex((val) => val === true);
    index = i;
    return val === true;
  });

  return { arr: arr, filteredValue: filteredValue, index: index };
}

function addRoleByTime(time, id, msg) {
  const member = msg.guild.members.cache.get(id);
  let role;

  const roles = async (role) => {
    let userRole;
    msg.guild.roles.cache.each((data) => {
      if (role === data.id) {
        const dataObj = {
          id: data.id,
          name: data.name,
          color: data.color,
        };
        userRole = dataObj;
      } else {
        return "something went wrong";
      }
    });

    return userRole;
  };

  const embMsg = async (role, msg) => {
    //bug
    console.log("wokrs", await role);

    return msg.channel.send({
      embed: {
        color: 0xdd9323,
        author: { name: msg.author.username },
        description: `otrzymałeś właśnie nową rage, nazwa rangi: ${await role.name} i color: ${await role.color} `,
      },
    });
  };
  if (time >= 3600000) {
    // if (member.roles.get(role)) msg.reply("posiadasz już taką rolę");
    role = "772186320650108948";
    member.roles.add(role);
    embMsg(roles(role), msg);
  } else {
    msg.reply(
      `nie odpowiednia ilość czasu, jeżeli chcesz dowiedzieć się jaki masz aktualnie czas, wpisze $time ⏲`
    );
  }
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
};
