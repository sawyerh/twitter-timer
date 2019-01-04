## Overview

An [Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) that fires daily and deletes your Tweets and Twitter likes that older than 14 days.

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
1. Configure app settings by copying `local.settings.example.json` as `local.settings.json`.
1. Optionally, install the Azure Functions extension for Visual Studio Code. If you use the extension for deploying, you'll need [.NET](https://dotnet.microsoft.com/download) in your path.

## Local testing

1. `func host start`
1. Then make a `POST` request to `http://localhost:7071/admin/functions/DeleteTweets` with a JSON body of `{}`

## Deploying

You can deploy this Function to Azure [a number of ways](https://docs.microsoft.com/en-us/azure/azure-functions/deployment-zip-push). I use [Visual Studio Code](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-function-vs-code).

In Visual Studio Code, via the Azure Functions extension:

1. Click the Azure icon in the sidebar, then sign in if you haven't already
1. Click the "Deploy to Function App..." icon

## Additional info

- [Create a function in Azure that is triggered by a timer](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-scheduled-function)