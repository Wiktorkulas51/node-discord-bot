const fs = require("fs");
const path = require("path");
const randkey = require("random-keygen");
const replace = require("replace-in-file");

module.exports = class UserTime {
  constructor(oldMember, newMember) {
    this.oldMember = oldMember;
    this.newMember = newMember;
    this.user = this.newMember.member.user;
    this.name = this.newMember.member.user.username;
    this.userTimeJoined = null;
    this.diff = null;
    this.userTimeLeft = null;
    this.userObj = {
      name: this.name,
      useriD: this.user.id,
      userJoind: this.userTimeJoined,
      userLeft: this.userTimeLeft,
      userTimeDiff: this.diff,
    };
  }

  changeNumbers(val) {
    const valInTime = new Date(val);
    const valInSec = valInTime.getSeconds();
    // const valInMin = valInTime.getMinutes();
    // const valInHours = valInTime.getHours();
    // const valInDays = valInTime.getDay();
    // const valInMonths = valInTime.getMonth();
    // const valInYears = valInTime.getFullYear();
    // console.log(val);
    // if (valInSec <= 59 && valInMin <= 59 && valInMonths <= 12) {
    //   return `Time: Months:${valInMonths} days:${
    //     valInHours <= 24 ? valInDays : 0
    //   } hours:${
    //     valInMin <= 59 ? valInHours : 0
    //   } Min:${valInMin} sec${valInSec}`;
    // }
    let min = 0;
    let hours = 0;
    let days = 0;
    let weeks = 0;
    let month = 0;
    let year = 0;
    if (valInSec <= 59) {
      min++;
      if (min >= 59) {
        hours++;
        if (hours !== 24) {
          min = 0;
          days++;
          if (days !== 7) {
            hours = 0;
            weeks++;
          }
          if (weeks !== 4) {
            days = 0;
            month++;
            if (month !== 12) {
              month = 0;
              year++;
              return `Time years: ${year} months: ${month} weeks: ${weeks} days: ${days} hours: ${hours} min: ${min} sec:${valInSec}`;
            }
          }
        }
        return `Time min: ${min} sec: ${valInSec}`;
      }
      return `Time min: ${min} sec: ${valInSec}`;
    }
  }

  async checkDiff(joind, left, diffTime) {
    if (diffTime === null) {
      const diff = joind - (await left);
      console.log("diff", diff, "left", left);
      return Math.abs(diff);
    } else {
      const diff = joind - left;
      console.log("secDiff", diff);
      const addedDiffTime = diff + diffTime;
      console.log("addeddiff", addedDiffTime);
      return addedDiffTime;
    }
  }

  async replaceFunc(options) {
    try {
      const results = await replace(options);
      console.log("Replacement results:", results);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }

  keyGen() {
    let key = randkey.get({
      length: 10,
      numbers: true,
    });
    return key;
  }

  isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  readingFileSync(fileName) {
    const fileDate = fs.readFileSync(path.join(__dirname, "./files", fileName));
    if (this.isEmpty(fileDate)) {
      console.log(fileDate);
      return null;
    }
    return JSON.parse(fileDate);
  }

  checkDir(dirName) {
    fs.access(
      path.join(
        __dirname,
        dirName === "usersData.json" ? "./files/usersData.json" : dirName
      ),
      fs.constants.F_OK,
      (err) => {
        console.log(`${dirName} ${err ? "does not exist" : "exists"}`);
      }
    );
    fs.mkdir(
      path.join(
        __dirname,
        dirName === "usersData.json" ? "./files/usersData.json" : dirName
      ),
      (err) => {
        if (err.code === "EEXIST") return;
      }
    );
  }

  async time() {
    try {
      let key = this.keyGen();

      const jsonDate = await this.readingFileSync("usersData.json");

      if (this.newMember.channelID) {
        console.log(jsonDate);

        this.userObj.userJoind = Date.now();
        const dateNow = Date.now();

        if (jsonDate.userData.useriD !== this.user.id) {
          console.log("inny user");
          key = this.keyGen();
          let userData = JSON.stringify(this.userObj, null, 4);
          if (!this.checkDir("usersData.json")) {
            fs.appendFile(
              path.join(__dirname, "./files", "usersData.json"),
              `{ "key":"${key}", "userData":${userData}}`,
              (err) => {
                if (err) throw err;
              }
            );
          }
        }

        if (this.isEmpty(jsonDate)) {
          console.log("empty");
          let userData = JSON.stringify(this.userObj, null, 4);
          if (!this.checkDir("usersData.json")) {
            fs.appendFile(
              path.join(__dirname, "./files", "usersData.json"),
              `{ "key":"${key}", "userData":${userData}}`,
              (err) => {
                if (err) throw err;
              }
            );
          }
        } else {
          const jsonUserJoinedData = jsonDate.userData.userJoind;

          console.log(
            "UserTime -> time -> jsonUserJoinedData",
            jsonUserJoinedData
          );

          if (
            this.name === jsonDate.userData.name &&
            jsonDate.userData.useriD === this.user.id
          ) {
            const options = {
              files: path.join(__dirname, "./files", "usersData.json"),
              from: `"userJoind": ${
                jsonUserJoinedData ? jsonUserJoinedData : null
              },`,
              to: `"userJoind": ${dateNow},`,
            };
            this.replaceFunc(options);
          }
        }
      }

      if (this.oldMember.channelID) {
        this.userObj.userLeft = Date.now();
        const jsonUserLeftData = jsonDate.userData.userLeft;
        const jsonUserDiffData = jsonDate.userData.userTimeDiff;
        console.log("userleft", jsonUserLeftData);

        const options = {
          files: path.join(__dirname, "./files", "usersData.json"),
          from: `"userLeft": ${jsonUserLeftData ? jsonUserLeftData : null},`,
          to: `"userLeft": ${this.userObj.userLeft},`,
        };
        await this.replaceFunc(options);

        const diff = this.checkDiff(
          jsonDate.userData.userJoind,
          (await jsonUserLeftData) === null
            ? this.userObj.userLeft
            : jsonUserLeftData,
          jsonUserDiffData
        );
        const val = this.changeNumbers(await diff);
        console.log("val", val);

        if (diff) {
          const options = {
            files: path.join(__dirname, "./files", "usersData.json"),
            from: `"userTimeDiff": ${
              jsonUserDiffData ? jsonUserDiffData : null
            }`,
            to: `"userTimeDiff": ${await diff}`,
          };
          this.replaceFunc(options);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
};
