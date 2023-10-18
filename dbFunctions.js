const fs = require('fs');
const { model } = require('./audios.model.js');
const { connectDB } = require("./db.js");

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

async function getAudios(userId)
{ 
  try
  {
    // If not connected to db, connect
    await connectDB();
    const doc = await model.findOne({ userId: userId });
    return doc['audios']
  }
  catch (e)
  {
    // console.log(e);
    return null;
  }
}

async function setAudios(userId, audios)
{
  await connectDB();
  if (!audios || audios.length == 0)
  {
    console.log("Deleting user");
    try
    {
      return await model.deleteOne({ userId: userId });
    }
    catch (e)
    {
      console.log(e);
    }
  }
  else
  {
    try 
    {
      return await model.findOneAndUpdate({ userId: userId }, { audios: audios }, { upsert: true });
    }
    catch (e)
    {
      console.log(e);
    }
  }
}

module.exports = {
    readAudiosJson: readAudiosJson,
    writeAudiosJson: writeAudiosJson,
    getAudios: getAudios,
    setAudios: setAudios
}