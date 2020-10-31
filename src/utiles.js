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
              member.roles.add("766979782528598016");
              break;
            case "🔥":
              member.roles.add("767315838662737960");
              break;
            case "🎹":
              member.roles.add("767316060365258753");
            case "🧅":
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
            case "🧅":
              member.roles.remove("767316060365258753");
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
  const timeWhenUserJoined = data.joinedAt;
  const msgCreatedAt = msg.createdAt;
  const diff = new Date(msgCreatedAt).getTime() - timeWhenUserJoined;
  const time = timeCounter(diff);
  return format(time);
}

function checkTime(msg, timeData) {
  const id = msg.author.id;
  fetchUser(msg, id).then((data) => {
    const msgEmbOnTime = new MessageEmbed()
      .setTitle(`Czas spędzony na kanale`)

      .setAuthor(`Użytkownik:  ${msg.author.tag}`)

      .setDescription(
        `
      Czas liczony od dołączenia do kanału:  ${getTimeByData(data, msg)}

      Czas spędzony na kanałach głosowych:  ${timeData}

        `
      )
      .setColor("RANDOM");

    msg.channel.send(msgEmbOnTime);
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
};
