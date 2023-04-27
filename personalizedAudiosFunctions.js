const fs = require('fs');

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

module.exports = {
    readAudiosJson: readAudiosJson,
    writeAudiosJson: writeAudiosJson
}