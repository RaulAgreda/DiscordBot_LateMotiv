const { Client, Collection, GatewayIntentBits, GuildMember, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnection, VoiceConnectionStatus, AudioPlayer } = require("@discordjs/voice");
const https = require('https');
const path = require('path');
const fs = require('fs');
const commandsH = require(path.join(__dirname, 'commandsHandler.js'));
const jsonFunction = require(path.join(__dirname, 'personalizedAudiosFunctions.js'));
require('dotenv').config();

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const supported_extensions = [".mp3", ".wav", ".ogg", ".flac"];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,

    ]
})

//#region Commands
/* ==================== Load commands ==================== */
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
//#endregion

/* ==================== Load events ==================== */

/* Start the bot */
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

/* On join or leave */
client.on('voiceStateUpdate', (oldState, newState) => {
  
  if (oldState.member.user.bot) return;
  // If the user is joining a channel
  if (oldState.channelId !== newState.channelId && newState.channelId !== null) {
    playLateMotiv(newState.member);
  }
  // If the user is leaving a channel
  else if (oldState.channelId !== null && newState.channelId === null) {
    playLateMotiv("leave", oldState.channel);
  }
});

/**
 * Plays one of the user's audios if exists, otherwise plays the default audio
 * @param {GuildMember | "leave"} member the member who is joining a channel, or "leave" if a user is leaving a channel
 * @param {import('discord.js').VoiceBasedChannel} channel the voice channel
 * @example playLateMotiv("leave") plays a random leave audio
 */
function playLateMotiv(member, channel)
{
  if (!channel) channel = member.voice.channel;
  let audios;
  const personalized_audios = jsonFunction.readAudiosJson();
  if (member === "leave")
    audios = personalized_audios[member];
  else
    audios = personalized_audios[member.id in personalized_audios ? member.id : "default"];

  if (!audios) return;

  // Play the member audio if exists, otherwise play the default audio
  play_sound(audios.random(), channel);
}

/**
 * Plays a sound if the user is joining a channel
 * @param {string} sound the sound to play
 * @param {Channel} channel the voice channel connection
 * @returns
 * @example play_sound("rickroll.mp3")
 */
async function play_sound(sound, channel)
{
  const voice_channel_connection = await connectToChannel(channel);
  console.log("playing sound: " + sound);

  if (!supported_extensions.some(ext => sound.endsWith(ext)))
  {
    console.log("Unsupported file extension");
    return;
  }
  // Play the sound
  https.get(sound, (stream) => {
    const resource = createAudioResource(stream, {
      inlineVolume: true
      });
    const player = createAudioPlayer();
    voice_channel_connection.subscribe(player);
    player.play(resource);
    player.on(AudioPlayerStatus.Idle, () => {
      player.stop();
      voice_channel_connection.destroy();
    });
  });
}

client.login(process.env.TOKEN);