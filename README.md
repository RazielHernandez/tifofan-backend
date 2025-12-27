# TifoFan Backend (Firebase Functions)

Serverless backend for the TifoFan app using Firebase Functions v2.

## Features
- API-Football integration
- Firestore caching layer
- Secure secrets via Firebase Secret Manager
- Local emulators support

## Local Development
```bash
cd functions
npm install
firebase emulators:start --only functions,firestore
