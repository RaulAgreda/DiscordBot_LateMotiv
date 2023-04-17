// Token is stored in .env file
import { config } from 'dotenv';
import { Client, GatewayIntentBits, NewsChannel } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
config();

Array.random = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

const personalized_audios = {
  "discord_id": ["audio1.mp3", "audio2.mp3", "..."],
  "199930872592334848": ["EPIC_CHOIR_SUSPENSE.mp3"], // Ruch
  "227110468102258688": ["CUQUIN_CURUCUANCUANCUAN.mp3"], // Iker
  "460396771709943808": ["pensar_mas_rapido.mp3"], // Drew
  "511564292064280577": ["EVERYBODY_PUT_YOUR_HANDS_IN_THE_AIR.mp3", "dry-fart.mp3"], //Daniel
  "465564985091817483": ["HA_GAAAAY.mp3"], // Óscar
  "648252095098519583": ["squirtle.mp3"], // Lana
  "510933427277791232": ["me_la_cojo.mp3"], // Miau
  "default": "rickroll.mp3",
  "leave": ["y_se_marcho.mp3", "league-of-legends-un-invocador-a-dejado-la-partida.mp3"]
}

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

async function playLateMotiv(member)
{
  voice_channel_connection = await connectToChannel(member.voice.channel);
  let audio;
  if (personalized_audios[member.id])
  audio = Array.random(personalized_audios[member.id]);
  else
    audio = personalized_audios["default"];
  play_sound(audio);
}

async function leaveSound(id)
{
  voice_channel_connection = await connectToChannel(id);
  play_sound(Array.random(personalized_audios["leave"]));
}

function play_sound(sound)
{
  if (!voice_channel_connection) return;
  const player = createAudioPlayer();
  console.log("./media/" + sound + ".mp3");
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
  if (oldState.channelId !== newState.channelId && newState.channelId !== null) {
    playLateMotiv(newState.member);
  }
  else if (oldState.channelId !== null && newState.channelId === null) {
    leaveSound(oldState.channel);
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