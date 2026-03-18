import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingDown, 
  Lightbulb,
  Zap,
  ChevronRight,
  Share2,
  Activity
} from 'lucide-react';
import { chatWithAI, getCausalGraph } from '../api/ai';
import PageBranding from '../components/PageBranding';

const AICopilot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am PrithviNet AI Copilot. While I specialize in Chhattisgarh\'s environmental data, I can now assist you with any general question or system analysis. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [causalGraph, setCausalGraph] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      
      // If the message seems related to a causal analysis, try to fetch a graph
      if (input.toLowerCase().includes('effect') || input.toLowerCase().includes('impact') || input.toLowerCase().includes('why')) {
        const graph = await getCausalGraph(input);
        setCausalGraph(graph);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while processing your request. Please ensure the Gemini API key is configured." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-160px)] space-y-4 md:space-y-6 animate-fade-in pb-10">
      <PageBranding title="AI Environmental Intelligence" />
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-primary/5 p-6 rounded-3xl border border-primary/10 gap-6 sm:gap-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">AI Environmental Copilot</h1>
            <p className="text-[10px] text-text-muted flex items-center gap-1 font-bold italic uppercase tracking-[0.2em] mt-1">
              <Sparkles size={12} className="text-primary" /> Multi-modal Analysis Active
            </p>
          </div>

        </div>
        <div className="hidden sm:flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-text-muted hover:text-white transition-all">Export Report</button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20">System Health</button>
        </div>

      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-visible lg:overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 glass-morphism rounded-[2.5rem] p-5 md:p-8 flex flex-col gap-6 min-h-[500px] lg:min-h-0 overflow-hidden relative">

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 md:pr-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[90%] md:max-w-[80%] flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary' : 'bg-white/10'}`}>
                    {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-primary" />}
                  </div>
                  <div className={`p-4 md:p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary/20 text-white rounded-tr-none border border-primary/20' : 'bg-white/5 border border-white/10 text-white rounded-tl-none shadow-sm'}`}>

                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="w-10 h-10 bg-primary/50 rounded-xl flex items-center justify-center mr-4">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="p-5 bg-white/5 rounded-2xl rounded-tl-none border border-white/5 text-xs italic text-text-muted">
                  AI is analyzing data...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
              <QuickAction icon={TrendingDown} text="Predict Pollution" onClick={() => setInput("What is the pollution forecast for the upcoming weekend in Raipur?")} />
              <QuickAction icon={Lightbulb} text="Suggest Mitigation" onClick={() => setInput("Suggest some noise mitigation strategies for industrial areas near residential zones.")} />
              <QuickAction icon={Zap} text="Simulate Shutdown" onClick={() => setInput("What would be the effect on PM2.5 if we shut down the top 5 emitting industries for 3 days?")} />
          </div>

          <form onSubmit={handleSend} className="relative mt-auto">
            <input 
              type="text" 
              placeholder="Ask AI anything (e.g. 'What is the capital of India?' or 'Summarize recent alerts')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 md:pl-6 pr-14 md:pr-16 py-4 md:py-5 outline-none focus:border-primary transition-all text-sm font-medium text-white placeholder:text-text-muted"
            />

            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-all disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Visual/Causal Graph Section */}
        {causalGraph && (
          <div className="w-full lg:w-80 glass-morphism rounded-[2.5rem] p-6 flex flex-col gap-6 animate-slide-in-right">

             <div className="flex items-center gap-2 text-primary">
                <Share2 size={18} />
                <h3 className="text-lg font-bold">Causal Analysis</h3>
             </div>
             <div className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col gap-4 overflow-y-auto min-h-[300px]">
                {causalGraph.nodes && causalGraph.nodes.map((node, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="px-4 py-2 bg-white/10 border border-white/10 shadow-lg rounded-lg text-[10px] font-bold text-white">

                      {node.label}
                    </div>
                    {idx < causalGraph.nodes.length - 1 && (
                      <div className="h-4 w-px bg-white/20 my-1 relative">
                        <div className="absolute -bottom-1 -left-[3px] border-t-4 border-l-4 border-r-4 border-transparent border-t-white/20"></div>
                      </div>
                    )}
                  </div>
                ))}
             </div>
             <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                   <Activity size={14} className="text-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-tight">Key Relationship</span>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                   {causalGraph.links && causalGraph.links[0] ? causalGraph.links[0].relationship : 'Causal linkage found'}
                </p>
             </div>
             <button 
                onClick={() => setCausalGraph(null)}
                className="w-full py-3 bg-white/5 rounded-xl text-[10px] font-bold hover:bg-white/10 transition-all"
             >
                Clear Visualization
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, text, onClick }) => (
  <button onClick={onClick} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-primary/20 transition-all group text-left">
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-primary" />
      <span className="text-[11px] font-bold text-text-muted group-hover:text-white transition-colors">{text}</span>
    </div>
    <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

export default AICopilot;
