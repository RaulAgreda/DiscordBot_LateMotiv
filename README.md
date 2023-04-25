# DiscordBot_LateMotiv

Welcome to DiscordBot_LateMotiv! This bot allows you to add Late Motivs to your friends in Discord. 

## Getting Started

To get started, follow these simple steps:

1. Create a `media` folder in the root directory of the project and add your audio files there.
2. Modify the `personalizedAudios.js` file in the root directory and add an entry for each of your friends. Each entry should include the JSON ID of your friend and a list of the audio files you want to play for them. If you don't want to play any audio for someone, just leave their entry blank. The "default" entry will be played if someone who is not assigned any audio joins the channel. The "leave" entry will be played when someone disconnects.
The id is used to avoid any matching names, and they are put in a .js file for comfort, so you can add comments indicating who are the audios for.

## License

This project is licensed under the MIT License. See the LICENSE file for details.