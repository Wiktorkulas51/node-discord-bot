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

  checkUser(file) {
    console.log(file);
  }

  async updateDiff(joind, left, diffTime) {
    if (diffTime === null) {
      const diff = joind - (await left);
      return Math.abs(diff);
    } else {
      const diff = joind - left;
      const addedDiffTime = Math.abs(diff) + diffTime;
      return addedDiffTime;
    }
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
        jsonData.forEach(async (el) => {
          const jsonUserJoinedData = el.userData.userJoind;

          if (this.newMember.channelID) {
            this.userObj.userJoind = new Date().getTime();

            // NEXT USER

            const elementID =
              el.userData.useriD === this.user.id &&
              this.name === el.userData.name;

            if (
              !jsonData.some((ele) => {
                const check =
                  ele.userData.useriD === this.user.id &&
                  this.name === ele.userData.name;
                console.log(check);
                return check;
              })
            ) {
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
            } else {
              console.log("user exist");
            }

            if (
              this.name === el.userData.name &&
              el.userData.useriD === this.user.id
            ) {
              replace({
                regex: `"userJoind": ${
                  jsonUserJoinedData ? jsonUserJoinedData : null
                },`,
                replacement: `"userJoind": ${this.userObj.userJoind},`,
                paths: [path.join(__dirname, "./files", "usersData.json")],
                recursive: true,
                silent: true,
              });
            }
          }

          if (this.oldMember.channelID) {
            this.userObj.userLeft = new Date().getTime();
            const jsonUserLeftData = el.userData.userLeft;
            const jsonUserDiffData = el.userData.userTimeDiff;

            if (
              this.name === el.userData.name &&
              el.userData.useriD === this.user.id
            ) {
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
                el.userData.userJoind,
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
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
};
