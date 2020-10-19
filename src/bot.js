require("dotenv").config();
const { Client } = require("discord.js");
const utiles = require("./utiles");

const client = new Client({
  partials: ["MESSAGE", "REACTION"],
});
const prefix = "$";

// client.on("voiceStateUpdate", async (data) => {
//   console.log(
//     "data createdat",
//     await data.guild.createdAt.toLocaleTimeString()
//   );
//   console.log("data joinat", await data.guild.joinedAt.toLocaleTimeString());
//   console.log(
//     "data jointimestamp",
//     await new Date(data.guild.joinedTimestamp).toLocaleTimeString()
//   );
// });

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

    if (CMD_NAME === "time") {
      console.log(msg.member.voice);
      // const connection = msg.member.voice.channel.join();
      // console.log(connection);
      utiles.checkTime(msg);
    }
  }
});

utiles.regulationsAccept(client);

//on key create role

client.login(process.env.DISCORD_BOT_TOKEN);
