const { SlashCommandBuilder } = require('discord.js');
const jsonFunction = require('../personalizedAudiosFunctions.js');

/**
 * !assign_audio @User audio.mp3
 * @param {string} user_id 
 * @param {string} audio_url 
 */
function assignAudio(user_id, audio_url)
{
  let personalized_audios = jsonFunction.readAudiosJson();
  if (!(user_id in personalized_audios))
  {
    personalized_audios[user_id] = [];
  }
  if (personalized_audios[user_id].includes(audio_url)) return;
  personalized_audios[user_id].push(audio_url);
  jsonFunction.writeAudiosJson(personalized_audios);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assign')
		.setDescription('assigns an audio url to user')
		.addStringOption(option =>
			option.setName('user')
				.setDescription('user to assign audio to | default | leave')
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
		assignAudio(user, interaction.options.getString('url'));
		await interaction.reply(`Assigned audio to ${user_name??user}`);
	},
};
