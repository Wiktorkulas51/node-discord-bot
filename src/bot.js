require("dotenv").config();
const { Client } = require("discord.js");
const utiles = require("./utiles");
const UserTime = require("./UserTIme");
const { rolesAndTimeData } = require("./rolesAndTime");

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
    const jsonFileObj = await utiles.readingFileSync("usersData.json");

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

      if (CMD_NAME === "time" && args[0] === "all") {
        const id =
          msg.author.id === "278950668558139392" ||
          msg.author.id === "194098078314266625";

        jsonFileObj.forEach((el) => {
          if (id) {
            const { name } = el.userData;
            const { userTimeDiff } = el.userData;
            const time = utiles.timeCounter(userTimeDiff);
            const format = utiles.format(time);
            utiles.checkTime(
              msg,
              time.sec === 0 && time.min === 0
                ? "nie byłes jeszcze na żadnym kanale"
                : format,
              name ? name : msg.author.username
            );
          }
        });
        if (!id) {
          msg.reply("nie masz uprawnień");
        }
      }

      switch (CMD_NAME) {
        case "time":
          if (utiles.isEmpty(jsonFileObj)) {
            msg.delete();
            msg.reply("plik jest pusty, upewnij się, że dołączyłeś na kanał");
            return;
          }

          const userDataObj = await utiles.findUser(jsonFileObj, msg);

          const everyValFalse = userDataObj.arr.every(
            (currentValue) => currentValue === false
          );

          if (userDataObj.filteredValue[0] === true) {
            const { userTimeDiff } = jsonFileObj[userDataObj.index].userData;
            if (CMD_NAME === "time" && args[0] === "left") {
              utiles.timeUserNeedForNextRole(msg, userTimeDiff);
            }

            const time = utiles.timeCounter(userTimeDiff);
            utiles.format(time);
            msg.delete();

            utiles.checkTime(
              msg,
              time.sec === 0 && time.min === 0
                ? "nie byłes jeszcze na żadnym kanale"
                : utiles.format(time),
              jsonFileObj[userDataObj.index].userData.name
            );
          } else if (everyValFalse) {
            msg.delete();
            msg.reply("nie dołączyłeś jeszcze na żaden kanał");
          }
          break;

        case "summon":
          if (msg.member.voice.channel !== null) {
            msg.delete();
            msg.reply(`zamknij leb, już wbijam`);
            msg.member.voice.channel.join().then((connection) => {
              setTimeout(() => {
                connection.disconnect();
              }, 5000);
            });
          } else {
            msg.reply("najpierw wbij na kanal bczqu");
          }
          break;

        case "upgrade":
          const userDataObj2 = await utiles.findUser(jsonFileObj, msg);

          if (userDataObj2.index === -1) {
            msg.delete();
            msg.reply("nie byłeś na żadnym kanale głosowym");
          } else {
            const { userTimeDiff } = jsonFileObj[userDataObj2.index].userData;
            const { useriD } = jsonFileObj[userDataObj2.index].userData;
            msg.delete();
            utiles.addRoleByTime(userTimeDiff, useriD, msg);
          }
          break;

        case "play":
          msg.reply("nawet o tym nie wspominaj");
          break;

        //end this
        case "roles":
          msg.delete();
          msg.channel.send({
            embed: {
              title: "Role",
              color: 0xe6357c,
              author: { name: msg.author.username },
              description: `
Role jakie są dostępne 
              `,
            },
          });
          break;
        //make a guide
        case "guide":
          msg.delete();
          msg.channel.send({
            embed: {
              title: "Komendy",
              color: 0xe6357c,
              author: { name: msg.author.username },
              description: `
            Wszystkie komendy zaczynają się od prefixa $, żeby komenda się wykonała musisz wpisać $ + słowo

              $time, zwraca ilość 

              $time all, komenda tylko dla Morysa oraz wiktora

              $summon, summonujesz bota na kanał

              $upgrade, po sędzonej określonej ilości czasu możesz wpisać tą komendę i dostać ciekawą rangę

              $play, nic dodać nic ująć

              $role jakie można dostac po określonej ilości czasu
              `,
            },
          });
          break;

        default:
          break;
      }
    }
  } catch (error) {
    console.log(error);
  }
});

utiles.regulationsAccept(client);

//on key create role

client.login(process.env.DISCORD_BOT_TOKEN);
