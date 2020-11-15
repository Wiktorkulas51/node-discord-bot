const { MessageEmbed } = require("discord.js");

module.exports = function (client) {
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
        .setColor(0xe6357c)
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
};
