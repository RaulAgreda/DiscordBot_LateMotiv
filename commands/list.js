const { SlashCommandBuilder, GuildMember } = require('discord.js');
const jsonFunction = require('../personalizedAudiosFunctions.js');

/**
 * !list_audios @User
 * @param {string} server_id 
 * @param {string} user_id 
 * @returns 
 */
function listAudios(user_id)
{
  let personalized_audios = jsonFunction.readAudiosJson();
  if (!(user_id in personalized_audios))
    return [];
  return personalized_audios[user_id];
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('lists all audios from the given user')
		.addStringOption(option =>
			option.setName('user')
				.setDescription('user to assign audio to')
				.setRequired(true)),
	async execute(interaction) {
		const user_str = interaction.options.getString('user');
		let user;
		if (user_str !== "leave" && user_str !== "default")
			user = interaction.client.users.cache.get(user_str.replace(/\D/g, "")).id;
		else
			user = user_str;
		if (!user) return;
		const audios_list = listAudios(user);
		await interaction.reply(`List of audios for ${user.username??user}:\n${audios_list.join('\n')}`);
	},
};