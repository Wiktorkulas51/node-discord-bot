require("dotenv").config();
const { Client } = require("discord.js");
const utiles = require("./utiles");
const UserTime = require("./UserTIme");

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
const prefix = "$";

client.on("voiceStateUpdate", (oldMember, newMember) => {
  const newUser = new UserTime(oldMember, newMember);
  newUser.time();
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  try {
    const jsonData = await utiles.readingFileSync("usersData.json");

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
      if (CMD_NAME === "summon") {
        msg.reply(`zamknij leb, już wbijam`);
        // msg.member.voice.channel.join();
      }

      if (CMD_NAME === "time" && !args.length) {
        console.log(!args.length);

        //check whitch user is doing this

        if (utiles.isEmpty(jsonData)) {
          msg.delete();
          msg.reply("plik jest pusty, upewnij się, że dołączyłeś na kanał");
        }

        const dataObj = await utiles.findUser(jsonData, msg);

        const everyFalse = dataObj.arr.every(
          (currentValue) => currentValue === false
        );

        if (dataObj.specCase[0] === true) {
          const diff = jsonData[dataObj.index].userData.userTimeDiff;

          const time = utiles.timeCounter(diff);
          utiles.format(time);

          msg.delete();

          utiles.checkTime(
            msg,
            time.sec === 0 && time.min === 0
              ? "nie byłes jeszcze na żadnym kanale"
              : utiles.format(time),
            jsonData[dataObj.index].userData.name
          );
        } else if (everyFalse) {
          msg.delete();
          msg.reply("nie dołączyłeś jeszcze na żaden kanał");
        }
      }

      if (CMD_NAME === "time" && args[0] === "all") {
        const id =
          msg.author.id === "278950668558139392" ||
          msg.author.id === "194098078314266625";

        jsonData.forEach((el) => {
          if (id) {
            const diff = el.userData.userTimeDiff;
            const time = utiles.timeCounter(diff);
            const format = utiles.format(time);
            utiles.checkTime(
              msg,
              time.sec === 0 && time.min === 0
                ? "nie byłes jeszcze na żadnym kanale"
                : format,
              el.userData.name ? el.userData.name : msg.author.username
            );
          }
        });
        if (!id) {
          msg.reply("nie masz uprawnień");
        }
      }

      if (CMD_NAME === "upgrade") {
        const dataObj = await utiles.findUser(jsonData, msg);
        if (dataObj.index === -1) {
          msg.delete();
          msg.reply("nie byłeś na żadnym kanale głosowym");
        } else {
          const diff = jsonData[dataObj.index].userData.userTimeDiff;
          const id = jsonData[dataObj.index].userData.useriD;
          msg.delete();

          utiles.addRoleByTime(diff, id, msg);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

utiles.regulationsAccept(client);

//on key create role

client.login(process.env.DISCORD_BOT_TOKEN);
