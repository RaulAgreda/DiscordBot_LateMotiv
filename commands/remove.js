const { SlashCommandBuilder } = require('discord.js');
const jsonFunction = require('../personalizedAudiosFunctions.js');

/**
 * !remove @User audio.mp3
 * @param {string} user_id 
 * @param {string} audio_url 
 */
function removeAudio(user_id, audio_url)
{
  let personalized_audios = jsonFunction.readAudiosJson();
  if (!(user_id in personalized_audios)) return;
  personalized_audios[user_id].remove(audio_url);
  jsonFunction.writeAudiosJson(personalized_audios);
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
		const user_str = interaction.options.getString('user').replace(/\D/g, "");
		const user = interaction.client.users.cache.get(user_str);
		removeAudio(user.id, interaction.options.getString('url'));
		await interaction.reply(`Removed audio from ${user.username}`);
	},
};