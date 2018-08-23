import 'babel-polyfill';
import config from './config';

config();

import { BotFrameworkAdapter } from 'botbuilder';
import { join } from 'path';
import fetch from 'node-fetch';
import prettyMs from 'pretty-ms';
import restify from 'restify';
import serveHandler from 'serve-handler';

// Create server
const server = restify.createServer();

server.listen(process.env.PORT, () => {
  console.log(`${ server.name } listening to ${ server.url }`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let numActivities = 0;
const up = Date.now();

server.get('/*', async (req, res) => {
  await serveHandler(req, res, {
    directoryListing: ['/**'],
    public: join('../web/build')
  });
});

server.get('/health.txt', async (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('OK');
});

server.get('/ready.txt', async (req, res) => {
  const message = `Bot is up since ${ prettyMs(Date.now() - up) } ago, processed ${ numActivities } activities.`;
  const separator = new Array(message.length).fill('-').join('');

  res.set('Content-Type', 'text/plain');
  res.send(JSON.stringify({
    human: [
      separator,
      message,
      separator
    ],
    computer: {
      numActivities,
      up
    }
  }, null, 2));
});

server.post('/token-generate', async (_, res) => {
  console.log('requesting token');

  try {
    const cres = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
      headers: {
        authorization: `Bearer ${ process.env.DIRECT_LINE_SECRET }`
      },
      method: 'POST'
    });

    const json = await cres.json();

    if ('error' in json) {
      res.send(500);
    } else {
      res.send(json);
    }
  } catch (err) {
    res.send(500);
  }
});

server.post('/token-refresh/:token', async (req, res) => {
  console.log('refreshing token');

  try {
    const cres = await fetch('https://directline.botframework.com/v3/directline/tokens/refresh', {
      headers: {
        authorization: `Bearer ${ req.params.token }`
      },
      method: 'POST'
    });

    const json = await cres.json();

    if ('error' in json) {
      res.send(500);
    } else {
      res.send(json);
    }
  } catch (err) {
    res.send(500);
  }
});

// Listen for incoming requests
server.post('/api/messages/', (req, res) => {
  adapter.processActivity(req, res, async context => {
    numActivities++;

    // On "conversationUpdate"-type activities this bot will send a greeting message to users joining the conversation.
    if (
      context.activity.type === 'conversationUpdate'
      && context.activity.membersAdded[0].name === 'webchat-samples-template'
    ) {
      await context.sendActivity(`Welcome to the Template Bot!`);
    } else if (context.activity.type === 'message') {
      await context.sendActivity(`Echo: \`${ context.activity.text }\``);
    }
  });
});
