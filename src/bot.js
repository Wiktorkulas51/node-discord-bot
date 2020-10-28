require("dotenv").config();
const { Client } = require("discord.js");
const utiles = require("./utiles");
const UserTime = require("./UserTIme");

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
const prefix = "$";

client.on("voiceStateUpdate", (oldMember, newMember) => {
  if (newMember.member.user.id !== oldMember.member.user.id) {
    console.log("turess");
  }
  const newUser = new UserTime(oldMember, newMember);
  newUser.time();
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
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
      const jsonData = await utiles.readingFileSync("usersData.json");
      //check whitch user is doing this

      jsonData.forEach(async (el) => {
        if (
          msg.author.username !== el.userData.name &&
          msg.author.id !== el.userData.useriD
        ) {
          const diff = el.userData.userTimeDiff;
          const time = utiles.timeCounter(diff);
          await utiles.format(time);

          msg.delete();
          msg.reply(
            time.sec === 0 && time.min === 0
              ? "nie byłes jeszcze na żadnym kanale"
              : utiles.format(time)
          );
        }
      });

      // utiles.checkTime(msg);
    }
  }
});

utiles.regulationsAccept(client);

//on key create role

client.login(process.env.DISCORD_BOT_TOKEN);
