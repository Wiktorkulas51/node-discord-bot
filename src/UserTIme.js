const fs = require("fs");
const path = require("path");
const randkey = require("random-keygen");
const utiles = require("./utiles");
const replace = require("replace");

module.exports = class UserTime {
  constructor(oldMember, newMember) {
    this.oldMember = oldMember;
    this.newMember = newMember;
    this.user = this.newMember.member.user;
    this.name = this.newMember.member.user.username;
    this.userTimeJoined = null;
    this.diff = null;
    this.userTimeLeft = null;
    this.userDiff = null;
    this.userObj = {
      name: this.name,
      useriD: this.user.id,
      userJoind: this.userTimeJoined,
      userLeft: this.userTimeLeft,
      userTimeDiff: this.diff,
    };
  }

  async findUser(file, arr = []) {
    for (let key of file) {
      const check =
        key.userData.useriD === this.user.id && this.name === key.userData.name;
      arr.push(await check);
    }

    let index;

    const filteredValue = arr.filter((val) => {
      const i = arr.findIndex((val) => val === true);
      index = i;
      return val === true;
    });
    //bug
    console.log(filteredValue);
    return { arr: arr, filteredValue: filteredValue, index: index };
  }

  async updateDiff(joind, left, diffTime) {
    if (diffTime === null) {
      const diff = joind - (await left);
      return Math.abs(diff);
    } else {
      const diff = joind - left;
      return Math.abs(diff) + diffTime;
    }
  }

  keyGen() {
    let key = randkey.get({
      length: 10,
      numbers: true,
    });
    return key;
  }

  async time() {
    try {
      let key = this.keyGen();

      const jsonFileObj = await utiles.readingFileSync("usersData.json");
      this.userObj.userJoind = new Date().getTime();
      //bugs
      if (utiles.isEmpty(jsonFileObj)) {
        console.log("empty");
        let userData = JSON.stringify(this.userObj, null, 4);
        fs.appendFileSync(
          path.join(__dirname, "./data", "usersData.json"),
          `[{"key":"${key}", "userData":${userData}} ]`
        );
      } else {
        if (this.newMember.channelID) {
          this.userObj.userJoind = new Date().getTime();

          const userDataObj = await this.findUser(jsonFileObj);

          const everyValFalse = userDataObj.arr.every(
            (currentValue) => currentValue === false
          );

          if (userDataObj.filteredValue[0] === true) {
            console.log("user exist");
            const jsonUserJoinedData =
              jsonFileObj[userDataObj.index].userData.userJoind;

            replace({
              regex: `"userJoind": ${
                jsonUserJoinedData ? jsonUserJoinedData : null
              },`,
              replacement: `"userJoind": ${this.userObj.userJoind},`,
              paths: [path.join(__dirname, "./data", "usersData.json")],
              recursive: true,
              silent: true,
            });
          } else if (everyValFalse || jsonFileObj.length === 1) {
            console.log("inny user");
            key = this.keyGen();
            let userData = JSON.stringify(this.userObj, null, 4);
            console.log(userData);

            replace({
              regex: `}} `,
              replacement: `}}, {"key":"${key}", "userData":${userData}} `,
              paths: [path.join(__dirname, "./data", "usersData.json")],
              recursive: true,
              silent: true,
            });
          }
        }

        if (this.oldMember.channelID) {
          this.userObj.userLeft = new Date().getTime();
          const userDataObj = await this.findUser(jsonFileObj);
          const { userLeft } = jsonFileObj[userDataObj.index].userData;
          const { userTimeDiff } = jsonFileObj[userDataObj.index].userData;
          const { userJoind } = jsonFileObj[userDataObj.index].userData;

          if (jsonFileObj[userDataObj.index].userData) {
            replace({
              regex: `"userLeft": ${userLeft ? userLeft : null},`,
              replacement: `"userLeft": ${this.userObj.userLeft},`,
              paths: [path.join(__dirname, "./data", "usersData.json")],
              recursive: true,
              silent: true,
            });

            const diff = this.updateDiff(
              userJoind,
              this.userObj.userLeft,
              userTimeDiff
            );

            if (diff) {
              replace({
                regex: `"userTimeDiff": ${userTimeDiff ? userTimeDiff : null}`,
                replacement: `"userTimeDiff": ${await diff}`,
                paths: [path.join(__dirname, "./data", "usersData.json")],
                recursive: true,
                silent: true,
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
};
