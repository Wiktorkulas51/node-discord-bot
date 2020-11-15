const fs = require("fs");
const path = require("path");
const rolesAndTimeData = require("./data/rolesAndTime");

function fetchUser(msg, id) {
  const user = msg.guild.members.fetch(id);
  return user;
}

function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

function readingFileSync(fileName) {
  const fileDate = fs.readFileSync(path.join(__dirname, "./data", fileName));
  if (isEmpty(fileDate)) return null;

  return JSON.parse(fileDate);
}

const format = ({ sec, min, hours, days, months, years }) => {
  const pluralize = (word, count) => {
    if (!count) return;

    const maybePluralWord = `${word}${count > 1 ? "s" : ""}`;
    return `${count} ${maybePluralWord}`;
  };

  return [
    pluralize("Year", years % 365),
    pluralize("Month", months % 12),
    pluralize("Day", days % 7),
    pluralize("Houur", hours % 24),
    pluralize("Minute", min % 60),
    pluralize("Secund", sec % 60),

    console.log(),
  ]
    .filter(Boolean)
    .join(", ");
};

function timeCounter(val) {
  const diff = val;

  let secDiff = Math.abs(diff) / 1000;
  let minDiff = secDiff / 60;
  const hoursDiff = minDiff / 60;
  const daysDiff = hoursDiff / 31;
  const monthsDiff = daysDiff / 12;
  const yearsDiff = monthsDiff / 365;

  return {
    sec: Math.floor(secDiff),
    min: Math.floor(minDiff),
    hours: Math.floor(hoursDiff),
    days: Math.floor(daysDiff),
    months: Math.floor(monthsDiff),
    years: Math.floor(yearsDiff),
  };
}

function checkTime(msg, timeData, name) {
  return msg.channel.send({
    embed: {
      color: 0xe6357c,
      title: "Czas spędzony na kanale",
      author: { name: name },
      description: `Czas spędzony na kanałach głosowych:  ${timeData} `,
    },
  });
}

async function findUser(file, msg, arr = []) {
  if (isEmpty(file)) return;
  for (let key of file) {
    const check =
      msg.author.username === key.userData.name &&
      msg.author.id === key.userData.useriD;
    arr.push(await check);
  }

  let index;
  const filteredValue = arr.filter((val) => {
    const i = arr.findIndex((val) => val === true);
    index = i;
    return val === true;
  });

  return { arr: arr, filteredValue: filteredValue, index: index };
}

function removeRole(msg, arr) {
  for (let i = 0; i <= arr.length; i++) {
    if (msg.member.roles.cache.has(arr[i])) msg.member.roles.remove(arr[i]);
  }
}

async function userRolesExist(msg, arr) {
  const user = await fetchUser(msg, msg.member.id);

  const roleExist = arr.find((firstEl) => {
    return user._roles.find((secEl) => firstEl === secEl);
  });
  return roleExist;
}

//end this func
async function timeUserNeedForNextRole(msg, userTimeDIff) {
  const { timeObj, roleArr } = rolesAndTimeData();

  if (msg.member.roles.cache.has(roleArr[roleArr.length - 1]))
    return msg.reply("Posiadasz już najwyższą role");

  const howMuchTimeUserNeed = () => {
    for (let key in timeObj) {
      const objKey = timeObj[key];
      const diff = userTimeDIff - objKey;

      if (Math.sign(diff) === -1) {
        return timeCounter(diff);
      }
    }
  };

  const checkUserRoles = async () => {
    const user = await fetchUser(msg, msg.member.id);
    if (userTimeDIff <= timeObj.hour) {
      return 0;
    }

    let index = roleArr.findIndex((el) => {
      return user._roles.findIndex((val) => val === el) !== -1;
    });
    if (index === -1) {
      return msg.reply("wpisz $upgrade");
    }
    return (index += 1);
  };

  const roleInfo = async () => {
    const index = await checkUserRoles();

    const roleID = roleArr[index];
    try {
      const roleName = await msg.guild.roles
        .fetch(roleID)
        .then((el) => el.name);

      return roleName;
    } catch (error) {
      console.log(error);
    }
  };

  msg.delete();

  return msg.channel.send({
    embed: {
      title: "Czas brakujący do danej Rangi",
      color: 0xe6357c,
      author: { name: msg.author.username },
      description: `
    tyle czasu ci brakuje: ${format(howMuchTimeUserNeed())}  
    do rangi: ${await roleInfo()}
    `,
    },
  });
}

module.exports = {
  checkTime,
  fetchUser,
  format,
  timeCounter,
  readingFileSync,
  isEmpty,
  findUser,
  removeRole,
  userRolesExist,
  // addRoleByTime,
  timeUserNeedForNextRole,
};
