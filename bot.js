const { Client, Collection, GatewayIntentBits, GuildMember, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnection, VoiceConnectionStatus, AudioPlayer } = require("@discordjs/voice");
const https = require('https');
const commandsH = require('./commandsHandler.js');
const path = require('path');
const fs = require('fs');
const { Channel } = require('diagnostics_channel');
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
        GatewayIntentBits.GuildVoiceStates
    ]
})

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
  const personalized_audios = commandsH.readAudiosJson()[channel.guild.id];
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
    if (!user)
    {
      user = args[0];
      if (user !== "leave" && user !== "default")
      {
        message.reply("User not found");
        return;
      }
    }
    else
      user = user.id;
    let file = message.attachments.first();
    if (!file)
      file = args[1];
    else
      file = file.url
    if (!file.endsWith(".mp3"))
    {
      message.reply("Only mp3 files are supported");
      return;
    }
    // else if (commandsH.readAudiosJson()[server_id][user].indexOf(file) !== -1)
    // {
    //   message.reply("Audio already assigned");
    //   return;
    // }
    try {
      commandsH.assignAudio(server_id, user, file);
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
        const leave_audios = commandsH.listAudios(server_id, option);
        if (leave_audios.length === 0)
          message.reply(`No ${option} audios found`);
        else
          message.reply(`${option} audios:\n` + leave_audios.join("\n\n"));
        return;
      }
    }
    try {
      const user_audios = commandsH.listAudios(server_id, user.id);
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
      commandsH.removeAudio(server_id, user.id, file_url);
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