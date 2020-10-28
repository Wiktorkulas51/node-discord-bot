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
     asd
          
        `
        )
        .setColor(0xdd9323)
        .setFooter(`ID: ${msg.author.id}`);

      msg.channel.send(MsgEmb).then((msg) => {
        msg.react(reactionEmoji);
        msg.react("🔥");
        msg.react("🎹");
        client.on("messageReactionAdd", (reactions, user) => {
          const { name } = reactions.emoji;
          const member = reactions.message.guild.members.cache.get(user.id);
          if (user.username === "nodeBot-test") return;
          switch (name) {
            case reactionEmoji:
              member.roles.add("766979782528598016");
              break;
            case "🔥":
              member.roles.add("767315838662737960");
              break;
            case "🎹":
              member.roles.add("767316060365258753");
            default:
              break;
          }
        });
        client.on("messageReactionRemove", (reactions, user) => {
          const { name } = reactions.emoji;
          const mebmer = reactions.message.guild.members.cache.get(user.id);
          switch (name) {
            case reactionEmoji:
              mebmer.roles.remove("766979782528598016");

              break;
            case "🔥":
              mebmer.roles.remove("767315838662737960");
              break;
            case "🎹":
              mebmer.roles.remove("767316060365258753");
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

function getTimeByData(data, msg) {
  const time = data.joinedTimestamp;
  const msgCreAt = msg.createdAt;
  const diff = new Date(msgCreAt).getTime() - time;
  console.log("dif", new Date(diff));
  const timeInHours = new Date(diff).getHours();
  const timeInDays = new Date(diff).getDay();
  //time sie nie sprawdza
  return `${timeInDays} days and ${timeInHours} hours`;
}

function checkTime(msg) {
  const id = msg.author.id;
  fetchUser(msg, id).then((data) => {
    const msgEmbOnTime = new MessageEmbed()
      .setTitle(`Your time`)
      .setDescription(
        `
      User: ${msg.author.tag}
      Time from joined: ${getTimeByData(data, msg)}
        `
      )
      .setColor(0xdd9323);

    msg.channel.send(msgEmbOnTime);
  });
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
  ]
    .filter(Boolean)
    .join(", ");
};

function timeCounter(val) {
  const diff = val;

  let secDiff = Math.abs(diff) / 1000;
  let minDiff = secDiff / 60;
  const hoursDiff = minDiff / 24;
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

module.exports = {
  regulationsAccept,
  checkTime,
  fetchUser,
  format,
  timeCounter,
  readingFileSync,
  isEmpty,
};
