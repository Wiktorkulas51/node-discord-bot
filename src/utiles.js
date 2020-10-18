const { MessageEmbed } = require("discord.js");

function regulationsAccept(client) {
  const reactionEmoji = "🆗";
  client.on("message", (msg) => {
    if (msg.channel.id === "766995099670020126") {
      if (msg.author.bot) return;

      const MsgEmb = new MessageEmbed()
        .setTitle(`use reaction ${reactionEmoji}`)
        .setDescription(
          `
          if you accept what we have said than you can 
          use reaction ${reactionEmoji} and move forword
          
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
          const mebmer = reactions.message.guild.members.cache.get(user.id);
          if (!msg.author.bot) return;
          switch (name) {
            case reactionEmoji:
              mebmer.roles.add("766979782528598016");
              break;
            case "🔥":
              mebmer.roles.add("767315838662737960");
              break;
            case "🎹":
              mebmer.roles.add("767316060365258753");
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
  console.log(new Date(time).toUTCString());
  console.log("getTimeByData -> msgCreAt", msgCreAt);
  const diff = msgCreAt - new Date(time);
  console.log("getTimeByData -> diff", diff);

  const lastdif = new Date(diff) / (1000 * 60 * 60 * 24);
  const newdata = new Date(lastdif);
  const finalTime =
    newdata.getMilliseconds() +
    " , " +
    newdata.getSeconds() +
    " , " +
    newdata.getHours() +
    " , " +
    newdata.getDay();

  console.log(finalTime);
  return finalTime;
}

function checkTime(msg) {
  const id = msg.author.id;
  fetchUser(msg, id).then((data) => {
    const msgEmbOnTime = new MessageEmbed()
      .setTitle(`Your time`)
      .setDescription(
        `
      User: ${msg.author.tag}
      The time you have been spent on this channel is ${getTimeByData(
        data,
        msg
      )}
        `
      )
      .setColor(0xdd9323);

    msg.channel.send(msgEmbOnTime);
  });
}

module.exports = {
  regulationsAccept,
  checkTime,
  fetchUser,
};
