const { SlashCommandBuilder } = require('discord.js');
const dbFunctions = require('../dbFunctions.js');

Array.prototype.remove = function(x) {
	const index = this.indexOf(x);
	if (index > -1)  // only splice array when item is found
		this.splice(index, 1); // 2nd parameter means remove one item only
	return this;
}

 /** !remove @User audio.mp3
 * @param {string} user_id 
 * @param {string} audio_url 
 */
async function removeAudio(user_id, audio_url)
{
  let audios = await dbFunctions.getAudios(user_id)
  audios.remove(audio_url);
  await dbFunctions.setAudios(user_id, audios);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('removes an audio url from user')
		.addStringOption(option =>
			option.setName('user')
				.setDescription('user to assign audio to')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('url')
				.setDescription('url to assign to user')
				.setRequired(true)),
	/** @param {import('discord.js').Interaction} interaction */
	async execute(interaction) {
		const user_str = interaction.options.getString('user');
		let user;
		let user_name;
		if (user_str !== "leave" && user_str !== "default")
		{
			user = interaction.client.users.cache.get(user_str.replace(/\D/g, ""));
			user_name = user.username;
			user = user.id;
		}
		else
			user = user_str;
		if (!user) return;
		await removeAudio(user, interaction.options.getString('url'));
		await interaction.reply(`Removed audio from ${user_name??user}`);
	},
};
