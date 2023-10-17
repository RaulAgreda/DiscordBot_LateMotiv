const { SlashCommandBuilder } = require('discord.js');
const userAudios = require('../personalizedAudiosFunctions.js');

const supported_extensions = [".mp3", ".wav", ".ogg", ".flac"];

/**
 * !assign_audio @User audio.mp3
 * @param {string} user_id 
 * @param {string} audio_url 
 */
async function assignAudio(user_id, audio_url)
{
  let personalized_audios = await userAudios.getAudios(user_id);

  if (!(user_id in personalized_audios))
  {
    personalized_audios[user_id] = [];
  }
  if (personalized_audios[user_id].includes(audio_url)) return;
  personalized_audios[user_id].push(audio_url);
  userAudios.writeAudiosJson(personalized_audios);
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
		const audio = interaction.options.getString('url');
		if (!supported_extensions.some(ext => audio.endsWith(ext))) {
			await interaction.reply("Unsupported file extension");
		}
		else {
			assignAudio(user, audio);
			await interaction.reply(`Assigned audio to ${user_name??user}`);
		}
	},
};
