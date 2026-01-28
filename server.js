import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// The Pazuzu Detection Prompt
const PAZUZU_PROMPT = `You are an expert cat behavior analyst specializing in detecting "Pazuzu mode" - the state when a cat is in attack/chaos/crazy mode, ready to pounce or cause mischief.

Analyze this cat photo and determine if the cat is in PAZUZU MODE (chaotic/attack ready) or CALM MODE (relaxed/peaceful).

Look for these PAZUZU indicators:
- Direct, intense "lock-on" stare (targeting, not just looking)
- Dilated pupils (especially in normal lighting)
- Forward-focused, tense ears ("alert triangle" position)
- Body weight shifted forward, coiled posture
- Paws positioned together, ready to launch
- Tense brow/forehead (micro-furrowing above eyes)
- Tail up and alert, possibly twitching
- Overall stillness that feels like "predator patience"
- The unmistakable "I'm about to cause chaos" energy

Look for these CALM indicators:
- Soft, relaxed eyes (possibly slow-blink ready)
- Normal pupils for the lighting
- Ears relaxed, possibly slightly outward
- Body melted/draped, loose posture
- Paws casually placed, not positioned
- Smooth, relaxed brow
- Tail down or loosely curled
- Overall "observing" rather than "hunting" vibe

IMPORTANT: If this image does not contain a cat, respond with exactly:
{"is_cat": false}

If this IS a cat, respond with this exact JSON format:
{
    "is_cat": true,
    "is_pazuzu": true/false,
    "confidence": 0-100,
    "threat_level": "MINIMAL" | "LOW" | "MODERATE" | "HIGH" | "MAXIMUM" | "RUN",
    "observations": [
        "observation about eyes",
        "observation about ears", 
        "observation about body posture",
        "observation about overall vibe"
    ],
    "summary": "A brief, fun one-liner about the cat's current state"
}

Be playful and fun with your observations! This is for entertainment.
Respond ONLY with the JSON, no other text.`;

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'The Catalyzer is ready to detect Pazuzu! 🐱' });
});

// Analyze endpoint
app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        console.log(`📸 Received image: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);

        // Resize image with sharp
        const resizedBuffer = await sharp(req.file.buffer)
            .resize(1024, 1024, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        console.log(`🔧 Resized to ${(resizedBuffer.length / 1024).toFixed(1)}KB`);

        // Convert to base64
        const base64Image = resizedBuffer.toString('base64');

        // Call Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent([
            PAZUZU_PROMPT,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                }
            }
        ]);

        const response = result.response;
        const text = response.text();
        
        console.log('🤖 Gemini response:', text);

        // Parse JSON from response
        let analysis;
        try {
            // Clean up potential markdown code blocks
            const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysis = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', parseError);
            return res.status(500).json({ 
                error: 'Failed to parse analysis',
                raw: text 
            });
        }

        console.log(`✅ Analysis complete: ${analysis.is_cat ? (analysis.is_pazuzu ? 'PAZUZU!' : 'Calm') : 'Not a cat'}`);
        
        res.json(analysis);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed', 
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`
🐱 ═══════════════════════════════════════════════════════ 🐱
   
   THE CATALYZER - Pazuzu Detection System v1.0
   
   Server running on http://localhost:${PORT}
   
   Ready to analyze cats for chaotic energy! 😈
   
🐱 ═══════════════════════════════════════════════════════ 🐱
    `);
});
