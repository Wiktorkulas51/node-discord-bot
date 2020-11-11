const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { rolesAndTimeData } = require("./rolesAndTime");

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
  if (isEmpty(fileDate)) return null;

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
  return msg.channel.send({
    embed: {
      color: 0xe6357c,
      title: "Czas spędzony na kanale",
      author: { name: name },
      description: `Czas spędzony na kanałach głosowych:  ${timeData} `,
    },
  });

  //   // Czas liczony od dołączenia do kanału:  ${getTimeByData(data, msg)}
}
async function findUser(file, msg, arr = []) {
  if (isEmpty(file)) return;
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
  const { timeObj, roleObj } = rolesAndTimeData();
  const timeArr = [];

  const roles = async (role) => {
    let userRole;
    msg.guild.roles.cache.each((data) => {
      if (!member._roles.find((value) => value === role)) {
        role === data.id
          ? (userRole = {
              id: data.id,
              name: data.name,
              color: data.color,
            })
          : "soemthing went wrong";
      } else {
        return (userRole = undefined);
      }
    });
    return userRole;
  };

  const embMsg = async (roleData, msg) => {
    const role = await roleData;
    if (role === undefined) {
      return msg.channel.send({
        embed: {
          title: "Ulepszone role",
          color: 0xe6357c,
          author: { name: msg.author.username },
          description: `Posiadasz już obecnie nową range 😁, spędź trochę więcej czasu na kanale głosowym by dostać kolejną 🔥  `,
        },
      });
    } else {
      return msg.channel.send({
        embed: {
          title: "Ulepszone role",
          color: 0xe6357c,
          author: { name: msg.author.username },
          description: `Otrzymałeś właśnie nową rage 🔥 , nazwa rangi: ${await role.name} oraz color danej rangi: ${await role.color} `,
        },
      });
    }
  };

  const checkTimeAndGiveRole = async (
    firstValue,
    promiseSecondValue,
    promiseRole,
    msg
  ) => {
    const secondValue = await promiseSecondValue;
    const role = await promiseRole.reverse();
    let index;

    const val = secondValue.some((val) => {
      if (firstValue >= val) {
        const i = secondValue
          .slice()
          .reverse()
          .findIndex((val) => {
            if (firstValue >= val) {
              return (val = true);
            }
          });
        index = i;

        return (val = true);
      }
    });

    if (val) {
      embMsg(roles(roles), msg);
      return member.roles.add(role[index]);
    }

    return msg.channel.send({
      embed: {
        color: 0xe6357c,
        author: { name: msg.author.username },
        description: `Nie odpowiednia ilość czasu, jeżeli chcesz dowiedzieć się jaki masz aktualnie czas, wpisze $time ⏲
         Natomiast jeżeli chcesz zobaczyć ile czasu potrzebujesz spędzić na kanlę, żeby dostać taką rangę wpisz $need 🚀`,
      },
    });
  };
  const iterationOverTimeObj = async () => {
    for (let key in timeObj) {
      timeArr.push(await timeObj[key]);
    }
    return timeArr;
  };

  checkTimeAndGiveRole(time, iterationOverTimeObj(), roleObj, msg);
}

//end this func
function timeUserNeedForNextRole(msg, userTimeDIff) {
  const { timeObj, roleObj } = rolesAndTimeData();

  const timeData = (msg, timeObj) => {
    for (let key in timeObj) {
      const objKey = timeObj[key];
      const diff = userTimeDIff - objKey;
      if (Math.sign(diff)) {
        return timeCounter(diff);
      }
    }

    const roleData = (msg, roleObj) => {
      roleObj.forEach((el) => {
        msg.guild.roles.fetch(el);
      });
    };

    msg.delete();
    return msg.channel.send({
      embed: {
        title: "Czas brakujący do danej Rangi",
        color: 0xe6357c,
        author: { name: msg.author.username },
        description: `
      tyle czasu ci brakuje: ${format(timeData())}  do rangi:
          `,
      },
    });
  };
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
  rolesAndTimeData,
  timeUserNeedForNextRole,
};
