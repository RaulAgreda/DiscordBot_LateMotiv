const fs = require('fs');
const model = require('./audios.model.js');

/**
 * Reads the personalized audios json
 * @returns {Object} the personalized audios json
 */
function readAudiosJson()
{
  if (!fs.existsSync("./personalizedAudios.json"))
  {
    fs.writeFileSync("./personalizedAudios.json", "{}");
  }
  return JSON.parse(fs.readFileSync("./personalizedAudios.json"));
}

/**
 * Writes the personalized audios json
 * @param {Object} personalized_audios 
 */
function writeAudiosJson(personalized_audios)
{
  fs.writeFileSync("./personalizedAudios.json", JSON.stringify(personalized_audios, null, 2));
}

function getAudios(userId)
{ 
  try
  {
    return model.findOne({ userId: userId });

  }
  catch (e)
  {
    console.log(e);
    return null;
  }
}

function setAudios(userId, audios)
{
  return model.findOneAndUpdate({ userId: userId }, { audios: audios });
}

module.exports = {
    readAudiosJson: readAudiosJson,
    writeAudiosJson: writeAudiosJson,
    getAudios: getAudios,
    setAudios: setAudios
}