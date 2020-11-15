const utiles = require("../../utiles");
const rolesAndTimeData = require("../../data/rolesAndTime");

module.exports = function upgrade(time, id, msg) {
  const member = msg.guild.members.cache.get(id);
  const { timeObj, roleArr } = rolesAndTimeData();
  const timeArr = [];

  if (msg.member.roles.cache.has(roleArr[roleArr.length - 1]))
    return msg.reply("Posiadasz już najwyższą role");

  utiles.removeRole(msg, roleArr);

  const roles = async (roleArr, roleID) => {
    if (utiles.userRolesExist(msg, roleArr)) {
      const role = msg.guild.roles.cache.get(roleID);
      return {
        name: role.name,
        id: role.id,
        color: role.color,
      };
    }
  };

  const embMsg = async (roleData, msg) => {
    msg.delete();
    try {
      const role = await roleData;
      const userRoleExist = await utiles.userRolesExist(msg, roleArr);

      return msg.channel.send({
        embed: {
          title: "Ulepszone role",
          color: 0xe6357c,
          author: { name: msg.author.username },
          description:
            userRoleExist === undefined
              ? `Otrzymałeś właśnie nową rage 🔥 , nazwa rangi: ${await role.name} oraz color danej rangi: ${await role.color} `
              : `Posiadasz już obecnie nową range 😁, spędź trochę więcej czasu na kanale głosowym by dostać kolejną 🔥  `,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const checkTimeAndGiveRole = async (
    firstValue,
    promiseSecondValue,
    promiseRole,
    msg
  ) => {
    const secondValue = await promiseSecondValue;
    const roleArr = await promiseRole.reverse();
    let index;

    const val = secondValue.some((val) => {
      if (firstValue >= val) {
        const i = secondValue
          .slice()
          .reverse()
          .findIndex((val) => {
            if (firstValue >= val) {
              return (val = true);
            }
          });
        index = i;

        return (val = true);
      }
    });
    if (val) {
      member.roles.add(roleArr[index]);
      return embMsg(roles(roleArr, roleArr[index]), msg);
    }
    msg.delete();
    return msg.channel.send({
      embed: {
        color: 0xe6357c,
        author: { name: msg.author.username },
        description: `Nie odpowiednia ilość czasu, jeżeli chcesz dowiedzieć się jaki masz aktualnie czas, wpisze $time ⏲
           Natomiast jeżeli chcesz zobaczyć ile czasu potrzebujesz spędzić na kanlę, żeby dostać taką rangę wpisz $need 🚀`,
      },
    });
  };
  const iterationOverTimeObj = async () => {
    for (let key in timeObj) {
      timeArr.push(await timeObj[key]);
    }
    return timeArr;
  };

  checkTimeAndGiveRole(time, iterationOverTimeObj(), roleArr, msg);
};
