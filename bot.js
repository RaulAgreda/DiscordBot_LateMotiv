// Token is stored in .env file
import { config } from 'dotenv';
import { Client, GatewayIntentBits, NewsChannel } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import { personalized_audios } from './personalizedAudios.js';
config();

Array.random = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

/**
 * Plays one of the user's audios if exists, otherwise plays the default audio
 * @param {*} member the member who is joining a channel, or "leave" if a user is leaving a channel
 * @example playLateMotiv("leave") plays a random leave audio
 */
async function playLateMotiv(member, channel)
{
  if (!channel) channel = member.voice.channel;
  let audios;
  if (member === "leave")
    audios = personalized_audios["leave"];
  else if (member.id in personalized_audios)
    audios = personalized_audios[member.id];
  else
    audios = personalized_audios["default"];
  
  const voice_channel_connection = await connectToChannel(channel);
  // Play the member audio if exists, otherwise play the default audio
  play_sound(Array.random(audios), voice_channel_connection);
}

/**
 * Plays a sound if the user is joining a channel
 * @param {string} sound the sound to play
 * @returns
 * @example play_sound("rickroll.mp3")
 */
function play_sound(sound, voice_channel_connection)
{
  if (!voice_channel_connection) return;
  const player = createAudioPlayer();
  console.log("./media/" + sound);
  const resource = createAudioResource("./media/" + sound);
  player.play(resource);
  voice_channel_connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, () => {
    player.stop();
    voice_channel_connection.destroy();
  });
}

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

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
  return connection;
}

client.login(process.env.TOKEN);