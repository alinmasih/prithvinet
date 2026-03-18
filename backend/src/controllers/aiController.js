const db = require('../config/localDb');
const aiService = require('../services/aiService');

// @desc    Chat with AI Copilot
// @route   POST /api/ai/chat
// @access  Private
const chatWithCopilot = async (req, res) => {
  try {
    const { message } = req.body;
    
    // 1. Fetch recent monitoring logs
    const recentReadings = db.prepare(`
      SELECT l.*, u.name as user_name 
      FROM monitoring_logs l
      LEFT JOIN users u ON l.submitted_by = u.id
      ORDER BY l.timestamp DESC LIMIT 10
    `).all();

    const mappedReadings = recentReadings.map(l => ({
      ...l,
      value: JSON.parse(l.value || '{}'),
      submitted_by: { name: l.user_name || 'System' }
    }));

    // 2. Fetch System Summary Stats for better AI "intelligence"
    const stats = {
      total_industries: db.prepare("SELECT COUNT(*) as count FROM industries").get()?.count || 0,
      total_complaints: db.prepare("SELECT COUNT(*) as count FROM complaints").get()?.count || 0,
      active_alerts: db.prepare("SELECT COUNT(*) as count FROM alerts WHERE status != 'Resolved'").get()?.count || 0,
      recent_locations: db.prepare("SELECT DISTINCT location FROM monitoring_logs ORDER BY timestamp DESC LIMIT 5").all().map(l => l.location)
    };
    
    const analysis = await aiService.analyzeEnvironmentalData(message, { 
      recentReadings: mappedReadings,
      systemContext: stats 
    });

    res.json({ content: analysis });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate intervention scenario
// @route   POST /api/ai/simulate
// @access  Private
const simulateIntervention = async (req, res) => {
  try {
    const { scenario } = req.body;
    
    // Fetch baseline data from SQLite
    const baseline = db.prepare(`
      SELECT * FROM monitoring_logs 
      ORDER BY timestamp DESC LIMIT 20
    `).all();

    const mappedBaseline = baseline.map(l => ({
      ...l,
      value: JSON.parse(l.value || '{}')
    }));
    
    const result = await aiService.simulateScenario(scenario, mappedBaseline);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get causal graph for a topic
// @route   GET /api/ai/causal-graph
// @access  Private
const getCausalGraph = async (req, res) => {
  try {
    const { topic } = req.query;
    const graph = await aiService.generateCausalGraph(topic || "Industrial Pollution");
    res.json(graph);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  chatWithCopilot,
  simulateIntervention,
  getCausalGraph
};
