import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";

config();

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

let voice_channel_connection;

async function playLateMotiv(channel)
{
  voice_channel_connection = await connectToChannel(channel);
  const player = createAudioPlayer();
  const resource = createAudioResource('./Spiderman.mp3');
  player.play(resource);
  voice_channel_connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, () => {
    player.stop();
    voice_channel_connection.destroy();
  });
}

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channelId === null && newState.channelId !== null) {
    playLateMotiv(newState.member.voice.channel);
  }
});

client.on('messageCreate', async (message) => {
  if (message.content === 'join') {
    const channel = message.member.voice.channel;
    if (!channel) return message.reply('You need to join a voice channel first!');
    voice_channel_connection = await connectToChannel(channel);
    message.reply('I have successfully connected to the channel!');
    const player = createAudioPlayer();
    const resource = createAudioResource('./Spiderman.mp3');
    player.play(resource);
    voice_channel_connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, () => {
      player.stop();
      voice_channel_connection.destroy();
    });
  }
  else if (message.content === 'leave') {
    const channel = message.member.voice.channel;
    if (!channel) return message.reply('You need to join a voice channel first!');
    if (!voice_channel_connection) return message.reply('I am not connected to the channel!');
    voice_channel_connection.destroy();
    message.reply('I have successfully disconnected from the channel!');
  }
  else if (message.content === 'ping') {     
    message.reply('Pong!');
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