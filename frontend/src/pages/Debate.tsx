import { useState } from 'react';
import { debateApi } from '../services/api';
import { Gavel, Play, Loader2 } from 'lucide-react';

export default function DebatePage() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('quick');
  const [rounds, setRounds] = useState(2);
  const [loading, setLoading] = useState(false);
  const [debateResult, setDebateResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a motion or topic.');
      return;
    }
    setError('');
    setLoading(true);
    setDebateResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/debate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mode, rounds })
      });

      if (!response.ok) {
        throw new Error('Failed to start debate');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to read stream');
      const decoder = new TextDecoder();
      
      let currentResult: any = {
        topic, mode, rounds,
        transcript: [],
        execution_trace: []
      };
      
      setDebateResult({...currentResult});
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        
        // Keep the last partial chunk in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.event === 'trace') {
                currentResult.execution_trace.push(data.data);
              } else if (data.event === 'turn') {
                currentResult.transcript.push(data.data);
              } else if (data.event === 'verdict') {
                currentResult.verdict = data.data;
              } else if (data.event === 'complete') {
                currentResult.execution_time = data.data.execution_time;
              } else if (data.event === 'error') {
                setError(data.data);
              }
              setDebateResult({...currentResult});
            } catch (e) {
              console.error("Failed to parse chunk", line);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during the debate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {!loading && !debateResult && (
        <div className="max-w-2xl mx-auto bg-gray-900/50 p-8 rounded-xl border border-gray-800 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Gavel className="text-gold" />
            Configure Debate
          </h2>
          
          <form onSubmit={handleStart} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Motion / Topic</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Artificial Intelligence should replace software engineers."
                className="w-full bg-ink border border-gray-700 rounded-lg p-4 text-paper focus:border-gold focus:ring-1 focus:ring-gold outline-none transition resize-none h-32"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mode</label>
                <select 
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-ink border border-gray-700 rounded-lg p-3 text-paper focus:border-gold outline-none"
                >
                  <option value="quick">Quick Debate</option>
                  <option value="full">Full Debate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Rounds (2-4)</label>
                <select 
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  className="w-full bg-ink border border-gray-700 rounded-lg p-3 text-paper focus:border-gold outline-none"
                >
                  <option value={2}>2 Rounds</option>
                  <option value={3}>3 Rounds</option>
                  <option value={4}>4 Rounds</option>
                </select>
              </div>
            </div>
            
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded">{error}</div>}
            
            <button 
              type="submit"
              className="w-full bg-gold hover:bg-yellow-500 text-ink font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Play fill="currentColor" size={20} />
              START DEBATE
            </button>
          </form>
        </div>
      )}

      {!debateResult && loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <Loader2 className="w-16 h-16 text-gold animate-spin" />
          <h3 className="text-2xl font-light tracking-widest text-gray-300 animate-pulse">ORCHESTRATING DEBATE...</h3>
          <p className="text-gray-500 max-w-md text-center">
            The agents are analyzing the motion, preparing arguments, and engaging in structured rebuttal. This may take a minute or two.
          </p>
        </div>
      )}

      {debateResult && (
        <div className="space-y-12">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold max-w-3xl mx-auto leading-relaxed">"{debateResult.topic}"</h2>
            <div className="flex justify-center gap-4 text-sm text-gray-400">
              <span className="px-3 py-1 bg-gray-900 rounded-full border border-gray-800">Mode: {debateResult.mode}</span>
              <span className="px-3 py-1 bg-gray-900 rounded-full border border-gray-800">Rounds: {debateResult.rounds}</span>
              {debateResult.execution_time !== undefined && (
                <span className="px-3 py-1 bg-gray-900 rounded-full border border-gray-800">Time: {debateResult.execution_time.toFixed(1)}s</span>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {debateResult.transcript.map((turn: any, idx: number) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-3xl ${turn.agent === 'FOR' ? 'mr-auto' : 'ml-auto'}`}
              >
                <div className="flex items-center gap-3 mb-2 px-1">
                  <span className={`text-xs font-bold tracking-widest ${turn.agent === 'FOR' ? 'text-for' : 'text-against'}`}>
                    {turn.agent} AGENT
                  </span>
                  <span className="text-xs text-gray-500 uppercase">Round {turn.round} • {turn.type}</span>
                </div>
                <div className={`p-6 rounded-2xl ${turn.agent === 'FOR' ? 'bg-blue-950/30 border border-blue-900/50 rounded-tl-none' : 'bg-red-950/30 border border-red-900/50 rounded-tr-none'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-200">{turn.content}</p>
                </div>
              </div>
            ))}
          </div>

          {debateResult.verdict && (
            <div className="mt-16 bg-gray-900/80 border border-gold/30 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gray-950 p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-2xl font-serif text-gold flex items-center gap-3">
                  <Gavel /> JUDGE'S VERDICT
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400 tracking-widest uppercase">Winner</div>
                  <div className={`text-3xl font-bold ${
                    debateResult.verdict.winner === 'FOR' ? 'text-for' : 
                    debateResult.verdict.winner === 'AGAINST' ? 'text-against' : 'text-gold'
                  }`}>
                    {debateResult.verdict.winner}
                  </div>
                </div>
              </div>
              
              <div className="p-8 grid md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Final Scores</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 font-bold text-for">FOR</div>
                    <div className="flex-grow h-4 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-for" style={{ width: `${debateResult.verdict.for_score}%` }}></div>
                    </div>
                    <div className="w-12 text-right font-mono">{debateResult.verdict.for_score}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 font-bold text-against">AGAINST</div>
                    <div className="flex-grow h-4 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-against" style={{ width: `${debateResult.verdict.against_score}%` }}></div>
                    </div>
                    <div className="w-12 text-right font-mono">{debateResult.verdict.against_score}</div>
                  </div>

                  <h4 className="text-lg font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">Reasoning</h4>
                  <p className="text-gray-300 leading-relaxed text-sm">{debateResult.verdict.reasoning}</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Detailed Criteria (out of 10)</h4>
                  <div className="space-y-3">
                    {Object.entries(debateResult.verdict.criteria).map(([criterion, scores]: [string, any]) => (
                      <div key={criterion} className="grid grid-cols-3 text-sm items-center">
                        <div className="capitalize text-gray-400">{criterion}</div>
                        <div className="text-center font-mono text-for">{scores.for}</div>
                        <div className="text-center font-mono text-against">{scores.against}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 bg-gray-950 rounded-lg border border-gray-800">
                    <h5 className="font-semibold text-gold mb-2">Final Statement</h5>
                    <p className="text-sm italic text-gray-300">"{debateResult.verdict.final_verdict}"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-12">
            <button 
              onClick={() => setDebateResult(null)}
              className="px-6 py-3 border border-gray-700 hover:border-gold hover:text-gold rounded transition tracking-widest text-sm"
            >
              START NEW DEBATE
            </button>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-800">
            <h4 className="text-sm font-semibold tracking-widest text-gray-500 mb-4">EXECUTION TRACE</h4>
            <div className="bg-gray-950 rounded p-4 h-64 overflow-y-auto font-mono text-xs space-y-2">
              {debateResult.execution_trace.map((trace: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <span className={`w-24 uppercase ${trace.agent === 'orchestrator' ? 'text-gray-500' : trace.agent === 'for' ? 'text-for' : trace.agent === 'against' ? 'text-against' : trace.agent === 'validator' ? 'text-green-500' : 'text-gold'}`}>
                    [{trace.agent}]
                  </span>
                  <span className={`w-20 ${trace.status === 'completed' ? 'text-green-400' : trace.status === 'failed' ? 'text-red-500' : 'text-blue-400'}`}>
                    {trace.status}
                  </span>
                  <span className="text-gray-300">{trace.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
