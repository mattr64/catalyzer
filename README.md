# 🐱 The Catalyzer - Pazuzu Detection System

A fun web app that uses AI to detect if your cat is in "Pazuzu mode" (attack/chaos mode) or calm mode!

Built for Dill, the Tortoiseshell Terror.

## Features

- 📸 Upload cat photos (drag & drop or click)
- 🔧 Server-side image resizing (keeps API costs low)
- 🤖 Gemini AI analysis for cat behavior detection
- 😈 Pazuzu threat level meter
- 🎨 Fun, dramatic UI with tortoiseshell-inspired colors

## Setup

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Copy it

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
GEMINI_API_KEY=your_key_here
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The app will be running at `http://localhost:3000`

## Deployment

### Railway / Render / Fly.io

1. Push to GitHub
2. Connect your repo
3. Set the `GEMINI_API_KEY` environment variable
4. Deploy!

### Docker (optional)

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## How It Works

The app uses Gemini's vision capabilities to analyze cat photos for behavioral indicators:

**Pazuzu Mode Indicators:**
- Direct, intense "lock-on" stare
- Dilated pupils
- Forward-focused, tense ears
- Coiled body posture
- Tense brow/forehead

**Calm Mode Indicators:**
- Soft, relaxed eyes
- Normal pupils
- Relaxed ears
- Melted/draped body posture
- Smooth brow

## Tech Stack

- **Backend:** Node.js + Express
- **Image Processing:** Sharp
- **AI:** Google Gemini 2.0 Flash
- **Frontend:** Vanilla HTML/CSS/JS

## License

MIT - Made with 🧡 for Dill the Tortie
