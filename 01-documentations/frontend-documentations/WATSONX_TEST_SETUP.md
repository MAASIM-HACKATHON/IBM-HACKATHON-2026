# Watsonx Test Setup

This sample is only a lightweight smoke test for the AI integration.

What it does:
- Validates email-generator inputs in the client
- Sends one prompt to Watsonx through the Vite dev server
- Returns a generated subject line and email body

What it does not do yet:
- Resume parsing
- CV generation
- ATS scoring
- Production-ready backend security

## Files Added

- `client/.env.example`
- `client/src/config/watsonx.ts`
- `client/src/services/watsonxService.ts`
- `client/src/hooks/useWatsonxEmailGenerator.ts`
- `client/src/utilities/system-utils/emailGenerator.ts`
- `client/src/pages/system-page/HomePage.tsx`
- `client/vite.config.ts`

## Simple Architecture

The current test flow is:

1. User fills the form in `client/src/pages/system-page/HomePage.tsx`
2. The form calls `useWatsonxEmailGenerator.ts`
3. The hook validates inputs and builds the prompt with `emailGenerator.ts`
4. The hook sends the prompt through `watsonxService.ts`
5. The browser calls `/api/watsonx/test`
6. `vite.config.ts` acts as a local proxy
7. The proxy gets an IBM IAM token from your API key
8. The proxy calls Watsonx text generation
9. The generated text comes back to the page

## What Each File Does

### `client/src/pages/system-page/HomePage.tsx`

This is the test UI.

Change this file when you want to:
- Add or remove form fields
- Change labels, placeholders, or layout
- Show more output on screen

### `client/src/config/watsonx.ts`

This file contains the default form values and select options.

Change this file when you want to:
- Change default form data
- Change purpose options
- Change tone options
- Change refinement options

### `client/src/utilities/system-utils/emailGenerator.ts`

This is the most important file for AI behavior.

It contains:
- Input validation
- Prompt construction
- Response parsing

Change this file when you want to:
- Add stronger instructions for the AI
- Change how the prompt is written
- Change the output format
- Add more rule-based validation

### `client/src/hooks/useWatsonxEmailGenerator.ts`

This connects the UI to the service layer.

Change this file when you want to:
- Change request flow
- Add loading behavior
- Handle errors differently
- Store more metadata from the response

### `client/src/services/watsonxService.ts`

This is the frontend service file.

Change this file when you want to:
- Change the request endpoint
- Change request/response typing
- Reuse the Watsonx request in other pages

### `client/vite.config.ts`

This file is acting like a temporary backend for local testing.

Change this file when you want to:
- Change the model ID behavior
- Change generation parameters
- Change how the IBM API call is made

Important:
- This is only for local testing
- In the real project, move this logic into Laravel

## Where To Put The API Key

Create this file:

```bash
client/.env.local
```

Use this content:

```env
WATSONX_API_KEY=your_new_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_REGION=us-south
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
WATSONX_API_VERSION=2025-02-11
```

## Required Values

### `WATSONX_API_KEY`
Your IBM Cloud API key.

### `WATSONX_PROJECT_ID`
Get this from your Watsonx project:
- Open the project
- Go to `Manage`
- Copy the `Project ID`

### `WATSONX_REGION`
Use the region that matches your Watsonx project, for example:
- `us-south`
- `eu-de`
- `eu-gb`
- `jp-tok`

### `WATSONX_MODEL_ID`
The sample defaults to:

```env
ibm/granite-3-8b-instruct
```

## How To Run

From `client/`:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Docker Run

This Docker setup is for local development and Watsonx key testing only.

Before starting Docker, create:

```bash
client/.env.local
```

Then run from the project root:

```bash
docker compose up --build
```

Open:

```bash
http://localhost:5173
```

To stop it:

```bash
docker compose down
```

## Docker Files

- `docker-compose.yml`
- `client/Dockerfile`
- `client/.dockerignore`

## How The Test Works

1. The browser sends your form data to `/api/watsonx/test`
2. `vite.config.ts` reads the secret from `client/.env.local`
3. The dev server exchanges the API key for an IAM token
4. The dev server calls Watsonx text generation
5. The page shows the generated email subject and body

## How To Change The Form

If you want to add a new field like:
- user name
- years of experience
- preferred writing style

Then update these files:

1. `client/src/utilities/system-utils/emailGenerator.ts`
   Add the new property to `EmailFormValues`
2. `client/src/config/watsonx.ts`
   Add the default value
3. `client/src/pages/system-page/HomePage.tsx`
   Add the new input field
4. `client/src/utilities/system-utils/emailGenerator.ts`
   Insert the new value into the prompt

## How To Add AI Instructions

There are now two ways to do this.

### Option 1: Change instruction in the UI

Use the `Extra AI instruction` textarea in the page.

Example instructions:
- `Keep the email short and modern.`
- `Mention teamwork and willingness to learn.`
- `Avoid exaggerated claims.`
- `Sound confident but not arrogant.`

This is best when you want to test different prompt instructions quickly.

### Option 2: Change instruction in code

Edit:

```bash
client/src/utilities/system-utils/emailGenerator.ts
```

Inside `buildEmailPrompt()`, you can change lines such as:
- base role instruction
- tone instruction
- structure instruction
- refinement instruction

This is best when you want permanent prompt behavior for the app.

## Example Prompt Customization

If you want the AI to always sound more human, you can add a line in `buildEmailPrompt()` like:

```ts
'Write naturally and avoid robotic wording.',
```

If you want stronger ATS-style resume behavior later, you can use the same pattern:

```ts
'Use action verbs and emphasize measurable impact when possible.',
```

## Where To Change The Model

If you want to test another Watsonx model, change either:

- `client/.env.local`
- or the fallback in `client/vite.config.ts`

Example:

```env
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```

## Where To Change Generation Settings

Generation parameters are currently in:

```bash
client/vite.config.ts
```

Look for:

```ts
parameters: {
  max_new_tokens: 260,
  min_new_tokens: 80,
  repetition_penalty: 1.05,
}
```

You can tune those if the response is too long, too short, or too repetitive.

## Important Note

This proxy is for local testing only.

For the real project, move the Watsonx call to your Laravel backend so the API key stays on the server in all environments.

## About The API Key

If IBM gave you a downloaded JSON file with an `apikey` field, that is generally the correct type of credential for Watsonx access.

However, the key alone is still not enough. You also need:

- A valid Watsonx project ID
- The correct Watsonx region
- Access permission for that key to use the project and runtime service

If the key was shared anywhere publicly or pasted into chat, rotate it immediately and use a new one.

## Quick Troubleshooting

- `Missing Watsonx configuration`:
  Your `.env.local` file is missing a required value.

- `401`:
  The API key is invalid or expired.

- `403`:
  The API key does not have access to the Watsonx project or service.

- Generation fails even with a valid key:
  Check that the region and project ID match the same Watsonx project.
