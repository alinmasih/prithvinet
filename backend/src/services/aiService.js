const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Groq = require("groq-sdk");

// --- Configuration ---

// Gemini Configuration
const geminiApiKey = process.env.GEMINI_API_KEY;
const isGeminiValid = geminiApiKey && geminiApiKey.startsWith('AIza') && geminiApiKey.length > 30;
let genAI = null;
if (isGeminiValid) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

// OpenAI Configuration
const openaiApiKey = process.env.OPENAI_API_KEY;
const isOpenAIValid = openaiApiKey && openaiApiKey !== 'your_openai_api_key_here' && openaiApiKey.startsWith('sk-');
let openai = null;
if (isOpenAIValid) {
  openai = new OpenAI({
    apiKey: openaiApiKey,
  });
}

// Groq Configuration
const groqApiKey = process.env.GROQ_API_KEY;
const isGroqValid = groqApiKey && groqApiKey !== 'your_groq_api_key_here' && groqApiKey.startsWith('gsk_');
let groq = null;
if (isGroqValid) {
  groq = new Groq({
    apiKey: groqApiKey,
  });
}

if (!isGeminiValid && !isOpenAIValid && !isGroqValid) {
  console.warn("WARNING: All AI keys (Gemini, OpenAI, Groq) are missing or invalid. AI features will be unavailable.");
}

const GEMINI_MODEL = "gemini-1.5-flash";
const OPENAI_MODEL = "gpt-4o";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `
You are the PrithviNet AI Copilot, a specialized intelligence for the Chhattisgarh Environmental Conservation Board (CECB).

### Your Role:
1. **Environmental Expert**: Your primary expertise is environmental compliance, pollution monitoring (Air, Water, Noise), and policy simulation in Chhattisgarh.
2. **Helpful Assistant**: While you are an environmental specialist, you are also a helpful AI. You should answer any general question given to you (even if not about ecology) in a professional and helpful manner.
3. **Professional Persona**: Maintain a professional, data-driven, and actionable tone even when answering general queries.

### Environmental Data Guidelines (For Contextual Queries):
- Chhattisgarh Monitoring: You will receive data from monitoring logs. 
- Air Parameters: PM2.5, PM10, SO2, NOx, CO, Ozone. Units are generally µg/m³ except for CO (mg/m³).
- Water Parameters: pH, DO (Dissolved Oxygen), BOD (Biochemical Oxygen Demand), COD (Chemical Oxygen Demand), Turbidity. 
- Noise: Levels in Decibels (dB).
- Context interpretation: When provided with 'recentReadings' or 'systemContext', analyze the trends across locations in Chhattisgarh (e.g., Raipur, Bilaspur, Bhilai).

If a question is completely unrelated to your primary role, answer it directly but you may briefly mention if there's any environmental relevance if applicable.
`;

// --- Helpers ---

const getAIResponse = async (prompt, systemPrompt = SYSTEM_PROMPT) => {
  // 1. Try Gemini (User's preferred primary)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error:", error.message);
      console.log("Gemini failed, trying next provider...");
    }
  }

  // 2. Try OpenAI (Secondary)
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI Error:", error.message);
      console.log("OpenAI failed, trying next provider...");
    }
  }

  // 3. Try Groq (Tertiary / Free Alternative)
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Groq Error:", error.message);
    }
  }

  throw new Error("No AI service available or all providers failed (Quota/Config issues)");
};

// --- Exported Services ---

const analyzeEnvironmentalData = async (userPrompt, contextData) => {
  try {
    console.log('DEBUG: analyzeEnvironmentalData prompt:', userPrompt);
    const prompt = `
    Context Data: ${JSON.stringify(contextData)}
    User Request: ${userPrompt}
    `;
    const response = await getAIResponse(prompt);
    console.log('DEBUG: AI Response received successfully');
    return response;
  } catch (error) {
    console.error("AI Service Error (Analyze):", error);
    return "The AI service is currently unavailable or misconfigured. Please check your API keys.";
  }
};

const simulateScenario = async (scenarioDetails, baselineData) => {
  try {
    const prompt = `
    Baseline Environmental Data: ${JSON.stringify(baselineData)}
    Intervention Scenario: ${JSON.stringify(scenarioDetails)}
    
    Task: Estimate the impact of this intervention on regional pollution levels over the next 7 days. 
    Provide values for key parameters and a textual explanation.
    `;
    return await getAIResponse(prompt);
  } catch (error) {
    console.error("Simulation Error:", error.message);
    return "Failed to simulate scenario. AI service unavailable.";
  }
};

const generateCausalGraph = async (topic) => {
  const systemPrompt = `
  ${SYSTEM_PROMPT}
  Task: Generate a causal graph showing how factors interact for a given topic.
  Format your response as a valid JSON object with "nodes" (id, label) and "links" (source, target, relationship).
  Only return the JSON.
  `;

  try {
    const responseText = await getAIResponse(`Topic: ${topic}`, systemPrompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "AI response was not valid JSON" };
  } catch (error) {
    console.error("Causal Graph Error:", error.message);
    return { error: "Failed to generate causal graph. AI service unavailable.", nodes: [], links: [] };
  }
};

module.exports = {
  analyzeEnvironmentalData,
  simulateScenario,
  generateCausalGraph
};

