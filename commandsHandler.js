const fs = require('fs');

Array.prototype.remove = function(x) {
	const index = this.indexOf(x);
	if (index > -1) { // only splice array when item is found
		this.splice(index, 1); // 2nd parameter means remove one item only
	}
	return this;
}
/**
 * !assign_audio @User audio.mp3
 * @param {string} server_id 
 * @param {string} user_id 
 * @param {string} audio_url 
 */
function assignAudio(server_id, user_id, audio_url)
{
  let personalized_audios = readAudiosJson();
  if (!(server_id in personalized_audios))
  {
	  personalized_audios[server_id] = {};
  }
  if (!(user_id in personalized_audios[server_id]))
  {
    personalized_audios[server_id][user_id] = [];
  }
  personalized_audios[server_id][user_id].push(audio_url);
  fs.writeFileSync("./personalizedAudios.json", JSON.stringify(personalized_audios));
}

/**
 * !remove_audio @User audio.mp3
 * @param {string} server_id 
 * @param {string} user_id 
 * @param {string} audio_url 
 * @returns 
 */
function removeAudio(server_id, user_id, audio_url)
{
  let personalized_audios = readAudiosJson();
  if (!(server_id in personalized_audios))
    return;
  if (!(user_id in personalized_audios[server_id]))
    return;
  personalized_audios[server_id][user_id].remove(audio_url);
  fs.writeFileSync("./personalizedAudios.json", JSON.stringify(personalized_audios));
}

/**
 * !list_audios @User
 * @param {string} server_id 
 * @param {string} user_id 
 * @returns 
 */
function listAudios(server_id, user_id)
{
  let personalized_audios = readAudiosJson();
  if (!(server_id in personalized_audios))
    return [];
  if (!(user_id in personalized_audios[server_id]))
    return [];
  return personalized_audios[server_id][user_id];
}

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

module.exports = {
  assignAudio: assignAudio,
  removeAudio: removeAudio,
  listAudios: listAudios,
  readAudiosJson: readAudiosJson
}