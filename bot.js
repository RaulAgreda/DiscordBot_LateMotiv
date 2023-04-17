import { config } from 'dotenv';
import { Client, GatewayIntentBits, NewsChannel } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";

config();

Array.random = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

const personalized_audios = {
  "199930872592334848": ["EPIC_CHOIR_SUSPENSE"], // Ruch
  "227110468102258688": ["CUQUIN_CURUCUANCUANCUAN"], // Iker
  "460396771709943808": ["pensar_mas_rapido"], // Drew
  "511564292064280577": ["EVERYBODY_PUT_YOUR_HANDS_IN_THE_AIR", "dry-fart"], //Daniel
  "465564985091817483": ["HA_GAAAAY"], // Óscar
  "510933427277791232": ["me_la_cojo"], // Miau
  "default": "rickroll",
  "leave": ["y_se_marcho", "league-of-legends-un-invocador-a-dejado-la-partida"]
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
  const resource = createAudioResource("./media/" + sound + ".mp3");
  player.play(resource);
  voice_channel_connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, () => {
    player.stop();
    voice_channel_connection.destroy();
  });
}

client.on('voiceStateUpdate', (oldState, newState) => {
  
  if (oldState.member.user.bot) return;
  if (newState.channelId !== null && oldState.channelId !== newState.channelId) {
    playLateMotiv(newState.member);
  }
  else if (oldState.channelId !== null && newState.channelId === null)
  {
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