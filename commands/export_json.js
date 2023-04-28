const { SlashCommandBuilder } = require('discord.js');
const jsonFunction = require('../personalizedAudiosFunctions.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export_json')
        .setDescription('exports the json file'),
    /** @param {import('discord.js').Interaction} interaction */
    async execute(interaction) {
        await interaction.reply("Not implemented yet");
    }
};
