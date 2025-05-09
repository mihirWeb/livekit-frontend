# Talking avatar

A ThreeJS-powered virtual human being that uses a set of neat [Azure APIs](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-speech-synthesis-viseme) to do some talking!

# Configuration
Update the WebView URL in `config/urls.ts` to point to your desired URL.

# create a `.env.local` in the root directory with
```
LIVEKIT_API_KEY=<your_api_key>
LIVEKIT_API_SECRET=<your_api_secret>
LIVEKIT_URL=wss://<project-subdomain>.livekit.cloud
```
Get the config urls from livekit cloud.

## Run
```
$ npm install
$ npm run dev
```
