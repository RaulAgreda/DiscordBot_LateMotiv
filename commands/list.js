const { SlashCommandBuilder, GuildMember } = require('discord.js');
const dbFunctions = require('../dbFunctions.js');

/**
 * !list_audios @User
 * @param {string} server_id 
 * @param {string} user_id 
 * @returns 
 */
async function listAudios(user_id)
{
  return await dbFunctions.getAudios(user_id);
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
		const audios_list = listAudios(user);
		if (audios_list.length === 0)
			await interaction.reply(`No audios for ${user_name??user}`);
		else
			await interaction.reply(`List of audios for ${user_name??user}:\n${audios_list.join('\n')}`);
	},
};
