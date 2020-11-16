require("dotenv").config();
const { Client } = require("discord.js");
const utiles = require("./utiles");
const UserTime = require("./UserTIme");
const regulationsAccept = require("./components/regulations");
const rolesAndTimeData = require("./data/rolesAndTime");

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

      if (CMD_NAME === "roll") {
        return msg.channel.send({
          embed: {
            title: "ROLLOWANKO",
            color: 0xe6357c,
            author: { name: msg.author.username },
            description: `
            Uwaga!
            
            Liczby losowanę są od 1 do ${!args.length ? "100" : args[0]}

             twoja wyrollowana wartość: ${utiles.rolling(msg, args)} 
            `,
          },
        });
      }

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
          const time = require("./components/commands/time");
          time(msg, jsonFileObj, CMD_NAME, args);
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
          const upgrade = require("./components/commands/upgrade");
          const userDataObj2 = await utiles.findUser(jsonFileObj, msg);

          if (userDataObj2.index === -1) {
            msg.delete();
            msg.reply("nie byłeś na żadnym kanale głosowym");
          } else {
            const { userTimeDiff } = jsonFileObj[userDataObj2.index].userData;
            const { useriD } = jsonFileObj[userDataObj2.index].userData;

            upgrade(userTimeDiff, useriD, msg);
          }
          break;

        case "play":
          msg.reply("nawet o tym nie wspominaj");
          break;

        //end this
        case "roles":
          msg.delete();
          const { roleArr } = rolesAndTimeData();
          roleArr.forEach((el) => {
            const role = msg.guild.roles.cache.get(el);

            return msg.channel.send({
              embed: {
                title: "ROLE",
                color: 0xe6357c,
                author: { name: msg.author.username },
                description: `
                  Wszystkie role jakie możesz odblokować po pewnym czasie: ${role.name}
                `,
              },
            });
          });

          break;

        case "guide":
          msg.delete();
          msg.channel.send({
            embed: {
              title: "KOMENDY",
              color: 0xe6357c,
              author: { name: msg.author.username },
              description: `
            Wszystkie komendy zaczynają się od prefixa $, żeby komenda się wykonała musisz wpisać $ + słowo.

              $time, zwraca ilość czasu spędzonego na kanle.

              $time all, komenda tylko dla Morysa i wiktora.

              $time left ile czasu ci brakuje do następnej rangi.

              $summon, summonujesz bota na kanał.

              $upgrade, po sędzonej określonej ilości czasu możesz wpisać tą komendę i dostać ciekawą rangę.

              $play, nic dodać nic ująć.

              $role jakie można dostać rangi.

              $roll losuje dla ciebie wartość liczbową zaczynając od zera do 100, ta komenda przyjume też argument do jakiej wartości ma rollować liczbę.
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

regulationsAccept(client);

//on key create role

client.login(process.env.DISCORD_BOT_TOKEN);
