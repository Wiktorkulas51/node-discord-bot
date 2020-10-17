const { MessageEmbed } = require("discord.js");

function regulationsAccept(client) {
  const reactionEmoji = "🆗";
  client.on("message", (msg) => {
    if (msg.channel.id === "766995099670020126") {
      if (msg.author.bot) return;
      const filter = (reaction, user) => {
        reaction.emoji.name === reactionEmoji && user.id === msg.author.id;
      };

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

      msg.channel.send(MsgEmb).then(async (msg) => {
        if (await msg.react(reactionEmoji)) {
          //   msg.awaitReactions(filter, { time: 15000 }).then((collected) => {
          //     const reaction = collected.first();
          //     console.log(reaction, reaction.emoji.name);
          //     if (reaction.emoji.name === reactionEmoji) {
          //     }
          //   });
          console
            .log
            // msg.react(reactionEmoji).then((date) => console.log(date))
            ();
        }
      });
    }
  });
}

module.exports = {
  regulationsAccept,
};
