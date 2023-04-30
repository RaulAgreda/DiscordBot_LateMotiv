const { Client, Collection, GatewayIntentBits, GuildMember, Events, NewsChannel } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnection, VoiceConnectionStatus, AudioPlayer } = require("@discordjs/voice");
const https = require('https');
const path = require('path');
const fs = require('fs');
const jsonFunction = require(path.join(__dirname, 'personalizedAudiosFunctions.js'));
require('dotenv').config();

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const supported_extensions = [".mp3", ".wav", ".ogg", ".flac"];
let voice_channel_connection = undefined;

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
client.on('voiceStateUpdate', async (oldState, newState) => {
  
  if (newState.member.user.bot) return;
  // If the user is joining a channel
  if (newState.channelId !== null && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
    voice_channel_connection = await connectToChannel(newState.channel);
    playLateMotiv(newState.member);
  }
  // If the user is leaving a channel
  else if (oldState.channelId !== null && newState.channelId === null) {
    // if the user is the last one in the channel
    if (oldState.channel.members.size === 1) {
      if (voice_channel_connection)
      {
        voice_channel_connection.destroy();
        voice_channel_connection = null;
      }
    }
    else {
      if (!voice_channel_connection) 
        voice_channel_connection = await connectToChannel(oldState.channel);
      playLateMotiv(newState.member, true);
    }
  }
});

/**
 * Plays one of the user's audios if exists, otherwise plays the default audio
 * @param {GuildMember | "leave"} member the member who is joining a channel, or "leave" if a user is leaving a channel
 * @param {import('discord.js').VoiceBasedChannel} channel the voice channel
 * @example playLateMotiv("leave") plays a random leave audio
 */
function playLateMotiv(member, left = false)
{
  channel = member.voice.channel;
  let audios;
  const personalized_audios = jsonFunction.readAudiosJson();
  if (left) // Leave audios
    audios = personalized_audios["leave"];
  else // User audios or default if not exists
    audios = personalized_audios[member.id in personalized_audios ? member.id : "default"];
  if (!audios) return;
  // If the user doesn't have any audios, play the default audio
  if (audios.length === 0)
    audios = personalized_audios["default"]; 

  // Play the member audio if exists, otherwise play the default audio
  play_sound(audios.random());
}

/**
 * Plays a sound if the user is joining a channel
 * @param {string} sound the sound to play
 * @param {Channel} channel the voice channel connection
 * @returns
 * @example play_sound("rickroll.mp3")
 */
function play_sound(sound)
{
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
    player.on(AudioPlayerStatus.Idle, () => {player.stop();});
  });
}

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
  return connection;
}

client.login(process.env.TOKEN);
