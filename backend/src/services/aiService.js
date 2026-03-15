const { GoogleGenerativeAI } = require("@google/generative-ai");

// Safeguard against invalid or missing API keys
const apiKey = process.env.GEMINI_API_KEY;
console.log("DEBUG: GEMINI_API_KEY prefix:", apiKey ? apiKey.substring(0, 4) : 'null');
console.log("DEBUG: GEMINI_API_KEY length:", apiKey ? apiKey.length : 0);
const isValidKey = apiKey && apiKey.split('').every(c => c.charCodeAt(0) < 128) && apiKey.startsWith('AIza') && apiKey.length > 30;

let genAI = null;
if (isValidKey) {
  genAI = new GoogleGenerativeAI(apiKey.trim());
} else {
  console.warn("WARNING: GEMINI_API_KEY is missing or invalid. AI features will be unavailable.");
}

const MODEL_NAME = "gemini-1.5-flash";


const SYSTEM_PROMPT = `
You are the PrithviNet AI Copilot, an expert in environmental compliance, policy, and data analysis.
Your goal is to assist the Central Environmental Authority in monitoring pollution and simulating interventions.
You have access to real-time data on Air (PM2.5, PM10, SO2, NOx, CO, Ozone), Water (pH, DO, BOD, COD, Turbidity), and Noise pollution.
Keep responses concise, professional, and data-driven.
`;

const analyzeEnvironmentalData = async (userPrompt, contextData) => {
  if (!genAI) {
    return "AI Service is currently unavailable (Invalid API Configuration). Please check GEMINI_API_KEY.";
  }


  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
    ${SYSTEM_PROMPT}
    Context Data: ${JSON.stringify(contextData)}
    User Request: ${userPrompt}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Service Error (Analyze):", error.message);
    if (error.message.includes("API_KEY_INVALID") || error.message.includes("not found")) {
      return "The AI service is currently unavailable or misconfigured. Please check your API key and model settings.";
    }
    return "Failed to generate AI analysis due to a technical issue.";
  }

};

const simulateScenario = async (scenarioDetails, baselineData) => {
  if (!genAI) {
    return "Simulation Service is currently unavailable. Please check GEMINI_API_KEY.";
  }


  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
    ${SYSTEM_PROMPT}
    Baseline Environmental Data: ${JSON.stringify(baselineData)}
    Intervention Scenario: ${JSON.stringify(scenarioDetails)}
    
    Task: Estimate the impact of this intervention on regional pollution levels over the next 7 days. 
    Provide values for key parameters and a textual explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Simulation Error:", error.message);
    return "Failed to simulate scenario. AI service unavailable.";
  }
};

const generateCausalGraph = async (topic) => {
  if (!genAI) {
    return { error: "Causal Graph Service is currently unavailable. Please check GEMINI_API_KEY.", nodes: [], links: [] };
  }


  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
    ${SYSTEM_PROMPT}
    Topic: ${topic}
    
    Task: Generate a causal graph showing how factors interact for this topic.
    Format your response as a valid JSON object with "nodes" (id, label) and "links" (source, target, relationship).
    Only return the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
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

