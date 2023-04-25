// Token is stored in .env file
import { config } from 'dotenv';
import { Client, Collection, GatewayIntentBits, GuildMember } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnection, VoiceConnectionStatus, AudioPlayer } from "@discordjs/voice";
import path from 'path';
import fs from 'fs';
import * as https from 'https';
import * as commandsH from './commandsHandler.js';
config();

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
})

/*=========================== COMMANDS SECTION ===========================*/
client.commands = new Collection();

const commandsPath = "./commands";
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
  console.log(filePath)
  async function loadCommand(filePath) {
    const command = await import(filePath);
    return command;
  }
  
	const command = await loadCommand(filePath);
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
/*=========================== END COMMANDS SECTION ========================*/

/**
 * Plays one of the user's audios if exists, otherwise plays the default audio
 * @param {GuildMember | "leave"} member the member who is joining a channel, or "leave" if a user is leaving a channel
 * @param {import('discord.js').VoiceBasedChannel} channel the voice channel
 * @example playLateMotiv("leave") plays a random leave audio
 */
async function playLateMotiv(member, channel)
{
  if (!channel) channel = member.voice.channel;
  let audios;
  const personalized_audios = commandsH.readAudiosJson()[channel.guild.id];
  if (member === "leave" | member === "default")
  {
    audios = personalized_audios[member];
    if (!audios) return;
  }
  else if (member.id in personalized_audios)
  {
    audios = personalized_audios[member.id];
  }

  const voice_channel_connection = await connectToChannel(channel);
  // Play the member audio if exists, otherwise play the default audio
  play_sound(audios.random(), voice_channel_connection);
}

/**
 * Plays a sound if the user is joining a channel
 * @param {string} sound the sound to play
 * @param {VoiceConnection} voice_channel_connection the voice channel connection
 * @returns
 * @example play_sound("rickroll.mp3")
 */

function play_sound(sound, voice_channel_connection)
{
  if (!voice_channel_connection) return;
  console.log("playing sound: " + sound);
  if (sound.startsWith("http"))
    https.get(sound, (stream) => {channel_play_sound(stream, voice_channel_connection)});
  else
    channel_play_sound("./media/" + sound, voice_channel_connection);
}

function channel_play_sound(input, voice_channel_connection)
{
  const resource = createAudioResource(input, {
    inlineVolume: true
    });
  const player = createAudioPlayer();
  voice_channel_connection.subscribe(player);
  player.play(resource);
  player.on(AudioPlayerStatus.Idle, () => {
    player.stop();
    voice_channel_connection.destroy();
  });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

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

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;
  const args = message.content.slice(1).trim().split(/ +/g);
  console.log(args);
  // Get server id
  const server_id = message.guild.id;
  const command = args.shift().toLowerCase();
  if (command === "help") 
  {
    message.reply(`Available commands:
    !help - Shows this message
    !assign @User sound_url - Assigns a sound to a user
    !assign @User [attatchment] - Assigns a sound to a user
    !list @User - Lists all the sounds of the user
    !remove @User sound_url - Removes a sound from a user`)
  }
  else if (command === "assign")
  {
    let user = message.mentions.users.first();
    if (!user && args[0] !== "leave" && args[0] !== "default")
    {
      message.reply("User not found");
      return;
    }
    else
      user = user.id;
    let file = message.attachments.first();
    if (!file)
      file = args[1];
    else
      file = file.url
    console.log(file);
    try {
      commandsH.assign_audio(server_id, user, file);
    }
    catch (e) {
      message.reply("Error assigning audio");
      console.log(e);
    }
  }
  else if (command === "list")
  {
    const user = message.mentions.users.first();
    if (!user)
    {
      const option = args[0];
      if (option == "leave" || option == "default")
      {
        const leave_audios = commandsH.list_audios(server_id, option);
        if (leave_audios.length === 0)
          message.reply(`No ${option} audios found`);
        else
          message.reply(`${option} audios:\n` + leave_audios.join("\n\n"));
        return;
      }
    }
    try {
      const user_audios = commandsH.list_audios(server_id, user.id);
      if (user_audios.length === 0)
        message.reply(`No audios found for ${user.username}`);
      else
        message.reply(`Audios of ${user.username}:
        ${user_audios.join("\n\n")}`);
    }
    catch (e) {
      message.reply("Error listing audios");
      console.log(e);
    }
  }
  else if (command === "remove")
  {
    const user = message.mentions.users.first();
    const file_url = args[1];
    try {
      commandsH.remove_audio(server_id, user.id, file_url);
    }
    catch (e) {
      message.reply("Error removing audio");
      console.log(e);
    }
  }
  else if (command === "test")
  {
    // test.example(message.channel);
    test.modal_example(message.channel);
  }
});

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
  return connection;
}

client.login(process.env.TOKEN);