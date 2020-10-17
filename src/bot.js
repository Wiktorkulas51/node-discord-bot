require("dotenv").config();
const { default: Collection } = require("@discordjs/collection");
const { Client } = require("discord.js");
const utiles = require("./utiles");

const client = new Client({
  partials: ["MESSAGE", "REACTION"],
});
const prefix = "$";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
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
  }
  // msg.awaitReactions(filter,{}).then(collected=>collected.first())
});

utiles.regulationsAccept(client);

client.on("messageReactionAdd", (reactions, user) => {
  const { name } = reactions.emoji;
  const mebmer = reactions.message.guild.members.cache.get(user.id);
  if (reactions.message.id === "766983722087219251") {
    switch (name) {
      case "💩":
        mebmer.roles.add("766979755199037440");
        break;
      case "🍎":
        mebmer.roles.add("766979782528598016");
        break;

      case "🍌":
        mebmer.roles.add("766979796005552160");
        break;

      default:
        break;
    }
  }
});

client.on("messageReactionRemove", (reactions, user) => {
  const { name } = reactions.emoji;
  const mebmer = reactions.message.guild.members.cache.get(user.id);
  if (reactions.message.id === "766983722087219251") {
    switch (name) {
      case "💩":
        mebmer.roles.remove("766979755199037440");
        break;
      case "🍎":
        mebmer.roles.remove("766979782528598016");
        break;

      case "🍌":
        mebmer.roles.remove("766979796005552160");
        break;

      default:
        break;
    }
  }
});

//on key create role

client.login(process.env.DISCORD_BOT_TOKEN);
