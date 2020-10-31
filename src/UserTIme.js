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

  async updateDiff(joind, left, diffTime) {
    if (diffTime === null) {
      const diff = joind - (await left);
      return Math.abs(diff);
    } else {
      const diff = joind - left;
      console.log("UserTime -> updateDiff -> left", left);
      console.log("UserTime -> updateDiff -> joind", joind);
      console.log("diff", diff);

      const addedDiffTime = Math.abs(diff) + diffTime;
      console.log("UserTime -> updateDiff -> addedDiffTime", addedDiffTime);
      return addedDiffTime;
    }
  }

  async findUser(file, arr = []) {
    for (let key of file) {
      let check =
        key.userData.useriD === this.user.id && this.name === key.userData.name;
      arr.push(await check);
    }

    let index;
    const specCase = arr.filter((val) => {
      const i = arr.findIndex((val) => val === true);
      index = i;
      return val === true;
    });

    return { arr: arr, specCase: specCase, index: index };
  }

  keyGen() {
    let key = randkey.get({
      length: 10,
      numbers: true,
    });
    return key;
  }

  checkDir(dirName) {
    const status = () => {
      fs.accessSync(
        path.join(
          __dirname,
          dirName === "usersData.json" ? "./files/usersData.json" : dirName
        ),
        fs.constants.F_OK
      );
    };
    if (status) {
      return "EEXIST";
    } else {
      fs.mkdirSync(
        path.join(
          __dirname,
          dirName === "usersData.json" ? "./files/usersData.json" : dirName,
          (err) => (err ? console.log(err) : "EEXIST")
        )
      );
    }
  }

  async time() {
    try {
      let key = this.keyGen();

      const jsonData = await utiles.readingFileSync("usersData.json");
      this.userObj.userJoind = new Date().getTime();

      if (utiles.isEmpty(jsonData)) {
        console.log("empty");
        let userData = JSON.stringify(this.userObj, null, 4);
        if (this.checkDir("usersData.json")) {
          fs.appendFileSync(
            path.join(__dirname, "./files", "usersData.json"),
            `[{"key":"${key}", "userData":${userData}} ]`
          );
        }
      } else {
        if (this.newMember.channelID) {
          this.userObj.userJoind = new Date().getTime();

          let counter = 0;

          const dataObj = await this.findUser(jsonData);

          const everyFalse = dataObj.arr.every(
            (currentValue) => currentValue === false
          );
          const specCase = dataObj.arr.filter((val) => val === true);
          //zeby zobaczyc czy wiecej niz jeden index zwroci prawde jezeli tak to wtedy nie idz daje

          if (specCase[0] === true) {
            console.log("user exist");
            const jsonUserJoinedData =
              jsonData[dataObj.index].userData.userJoind;
            console.log(
              "UserTime -> time -> jsonUserJoinedData",
              jsonUserJoinedData
            );

            replace({
              regex: `"userJoind": ${
                jsonUserJoinedData ? jsonUserJoinedData : null
              },`,
              replacement: `"userJoind": ${this.userObj.userJoind},`,
              paths: [path.join(__dirname, "./files", "usersData.json")],
              recursive: true,
              silent: true,
            });

            return;
          } else if (everyFalse || jsonData.length === 1) {
            if (counter >= 1) {
              return;
            }
            counter++;

            console.log("inny user");
            key = this.keyGen();
            let userData = JSON.stringify(this.userObj, null, 4);
            console.log(userData);

            if (this.checkDir("usersData.json")) {
              replace({
                regex: `}} `,
                replacement: `}}, {"key":"${key}", "userData":${userData}} `,
                paths: [path.join(__dirname, "./files", "usersData.json")],
                recursive: true,
                silent: true,
              });
            }
          }
        }

        if (this.oldMember.channelID) {
          this.userObj.userLeft = new Date().getTime();
          const dataObj = this.findUser(jsonData);
          // const specCase = (await dataObj).specCase;

          console.log((await dataObj).arr);

          const jsonUserLeftData =
            jsonData[(await dataObj).index].userData.userLeft;
          console.log("UserTime -> time -> jsonUserLeftData", jsonUserLeftData);
          const jsonUserDiffData =
            jsonData[(await dataObj).index].userData.userTimeDiff;
          console.log("UserTime -> time -> jsonUserDiffData", jsonUserDiffData);
          const jsonUserJoinedData = await jsonData[(await dataObj).index]
            .userData.userJoind;
          console.log(
            "UserTime -> time -> jsonUserJoinedData",
            jsonUserJoinedData
          );

          if (jsonData[(await dataObj).index].userData) {
            replace({
              regex: `"userLeft": ${
                jsonUserLeftData ? jsonUserLeftData : null
              },`,
              replacement: `"userLeft": ${this.userObj.userLeft},`,
              paths: [path.join(__dirname, "./files", "usersData.json")],
              recursive: true,
              silent: true,
            });

            const diff = this.updateDiff(
              jsonUserJoinedData,
              this.userObj.userLeft,
              jsonUserDiffData
            );

            if (diff) {
              replace({
                regex: `"userTimeDiff": ${
                  jsonUserDiffData ? jsonUserDiffData : null
                }`,
                replacement: `"userTimeDiff": ${await diff}`,
                paths: [path.join(__dirname, "./files", "usersData.json")],
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
