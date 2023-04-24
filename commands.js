import { Client, GatewayIntentBits, NewsChannel } from 'discord.js';
import fs from 'fs-extra';

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
export function assign_audio(server_id, user_id, audio_url)
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
export function remove_audio(server_id, user_id, audio_url)
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
export function list_audios(server_id, user_id)
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
export function readAudiosJson()
{
  if (!fs.existsSync("./personalizedAudios.json"))
  {
    fs.writeFileSync("./personalizedAudios.json", "{}");
  }
  return JSON.parse(fs.readFileSync("./personalizedAudios.json"));
}