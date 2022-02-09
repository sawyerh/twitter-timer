⚠️ This code has been migrated to https://github.com/sawyerh/twitter-hacks

## Overview

An [Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) that fires daily and deletes your Tweets and Twitter likes that are older than 14 days, and disables retweets from everyone you follow.

This can be adapted to work as an AWS Lambda or Cloud Function if you're more familiar with those platforms.

## Setup

1. Install Azure function CLI tools
    ```
    brew tap azure/functions
    brew install azure-functions-core-tools
    ```
1. Install dependencies
    ```
    npm install
    ```
1. Set [environment variables](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#environment-variables) in Azure or by copying `local.settings.example.json` as `local.settings.json`. Then set the values using [Twitter API keys and tokens](https://developer.twitter.com/en/docs/basics/apps/overview), which you'll need to create in order for your tweets and likes to be deleted.
1. Optionally, install the Azure Functions extension for Visual Studio Code. If you use the extension for deploying, you'll need [.NET](https://dotnet.microsoft.com/download) in your path.

## Customize things

### Change the date threshold

By default, tweets and likes older than **14** days are deleted. To change this number, update the `oldestAllowedDate` variable in [`TwitterTimer/index.js`](TwitterTimer/index.js)

### Safelist Tweets

If there are tweets you want to keep forever, add their IDs to [`TwitterTimer/tweetsToSaveForever.js`](TwitterTimer/tweetsToSaveForever.js). These tweets won't be deleted even if their older than the defined threshold.

## Local testing

1. `npm start`
1. Then make a `POST` request to `http://localhost:7071/admin/functions/TwitterTimer` with a JSON body of `{}`

## Deploying

You can deploy this Function to Azure [a number of ways](https://docs.microsoft.com/en-us/azure/azure-functions/deployment-zip-push). I use [Visual Studio Code](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-function-vs-code).

In Visual Studio Code, via the Azure Functions extension:

1. Click the Azure icon in the sidebar, then sign in if you haven't already
1. Click the "Deploy to Function App..." icon

## Additional info

- [Create a function in Azure that is triggered by a timer](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-scheduled-function)
- [Disabling retweets inspired by @keithk](https://medium.com/@keithkurson/taking-control-of-incoming-media-7cfbe64bd429)
