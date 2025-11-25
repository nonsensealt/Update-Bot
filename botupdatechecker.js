require('dotenv').config();
const fetch = require('node-fetch');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const GAME_ID = '112757576021097';
const UNIVERSE_ID = '7072674902'; // Determined from Roblox API using the place ID
const ROBLOX_API_URL = `https://games.roblox.com/v1/games?universeIds=${UNIVERSE_ID}`;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = process.env.ROLE_ID;
// Allow overriding last_update location (useful for persistent volumes on hosting)
const LAST_UPDATE_FILE = process.env.LAST_UPDATE_FILE || path.join(__dirname, 'last_update.txt');

async function checkUpdate() {
  try {
    console.log('Checking for updates...');
    const response = await fetch(ROBLOX_API_URL);
    const data = await response.json();
    const game = data.data[0];
    if (!game) {
      console.log('No game data returned from Roblox.');
      return;
    }
    const currentUpdate = new Date(game.updated);
    console.log(`Current update time: ${currentUpdate}`);

    let lastUpdate = null;
    if (fs.existsSync(LAST_UPDATE_FILE)) {
      const lastUpdateStr = fs.readFileSync(LAST_UPDATE_FILE, 'utf8');
      lastUpdate = new Date(lastUpdateStr);
      console.log(`Last checked update: ${lastUpdate}`);
    }

    if (!lastUpdate || currentUpdate > lastUpdate) {
      // Fetch the game thumbnail
      const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${UNIVERSE_ID}&countPerUniverse=1&type=GameThumbnail&size=512x512&format=Png&isCircular=false`);
      const thumbData = await thumbResponse.json();
      const imageUrl = thumbData.data[0]?.thumbnails[0]?.imageUrl || 'https://via.placeholder.com/512x512.png';

      // Send webhook
      const unixTimestamp = Math.floor(new Date(game.updated).getTime() / 1000);
      const prettyName = game.name || 'Defuse-Division-ALPHA';
      const payload = {};
      if (ROLE_ID) {
        payload.content = `<@&${ROLE_ID}>`;
      }
      payload.embeds = [{
        author: {
          name: 'Roblox Update Bot',
          url: `https://www.roblox.com/games/${GAME_ID}/Defuse-Division-ALPHA`,
          icon_url: imageUrl
        },
        title: `\uD83D\uDD14 ${prettyName} Updated!`,
        description: 'A new build just shipped on Roblox.',
        url: `https://www.roblox.com/games/${GAME_ID}/Defuse-Division-ALPHA`,
        color: 0x2f89ff,
        thumbnail: {
          url: imageUrl
        },
        image: {
          url: imageUrl
        },
        fields: [
          { name: 'Last Update', value: `<t:${unixTimestamp}:F>`, inline: true },
          { name: 'Relative', value: `<t:${unixTimestamp}:R>`, inline: true }
        ],
        footer: {
          text: 'Roblox Update Bot - Defuse Division'
        }
      }];

      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (webhookResponse.ok) {
        console.log('Webhook sent successfully');
        // Update the last update file
        fs.writeFileSync(LAST_UPDATE_FILE, game.updated);
      } else {
        console.log('Failed to send webhook:', webhookResponse.status);
      }
    } else {
      console.log('No new updates');
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// Run initial check
checkUpdate();

// Schedule to run every hour
cron.schedule('0 */1 * * *', checkUpdate);

console.log('Bot is running. Checking for updates every hour.');
