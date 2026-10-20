# AquiReminder

This project is a Chrome extension named "AquiReminder" designed to remind users to stay hydrated by drinking water at regular intervals. The extension allows users to set a timer for a specified number of minutes. Once the timer is set, it runs in the background, even if the popup is closed. When the timer expires, an alert window pops up with a reminder message and a sound notification, prompting the user to drink water. The alert window is designed to be attention-grabbing, ensuring that the user doesn't miss the reminder.

The extension uses various Chrome APIs, including alarms for setting up reminders, storage for persisting the timer state, and windows for creating the alert popup. The project is structured into several key files: a manifest file for defining the extension's metadata, a background script for handling alarms, a popup script for managing user interactions, and HTML files for the user interface.

"AquiReminder" is a simple yet effective tool for promoting regular water intake, contributing to better health and well-being for its users.

## Install (unpacked)

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Pin AquiReminder and pick an interval (1–480 minutes).

When a reminder is due the toolbar icon shows `!`. Choose **I drank water!** to start the next interval, or **Snooze 5 min**.

## Development

The extension has no build step. `package.json` only holds dev tooling (git hooks and checks); `npm install` once to enable the hooks.

- `npm run check:locales` — validates `manifest.json` and that every locale has the same keys as `en`.
- Agent and contributor rules: [`AGENTS.md`](AGENTS.md).

Store zip: include only the extension files (`manifest.json`, `*.html`, `*.js` at the root, `styles.css`, `alert.mp3`, `drop.png`, `_locales/`).
