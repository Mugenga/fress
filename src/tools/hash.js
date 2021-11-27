const bcrypt = require("bcrypt");
const logger = require("../logging");

const hashingPwd = async (saltRound, pwd) => {
  try {
    const salt = await bcrypt.genSalt(saltRound);
    const hashed = await bcrypt.hash(pwd, salt);
    return hashed;
  } catch (error) {
    logger.info(error);
  }
};

const comparePwd = async (pwd, dbPwd) => {
  try {
    const password = await bcrypt.compare(pwd, dbPwd);
    return password;
  } catch (error) {
    logger.info(error);
  }
};

// const saltRounds = 10;
// async function run() {
//   const newHashedPwd = await hashingPwd(saltRounds, '1234');
//   console.log(newHashedPwd);
// }

// run();

module.exports.hashPwd = hashingPwd;
module.exports.pwdCompare = comparePwd;
