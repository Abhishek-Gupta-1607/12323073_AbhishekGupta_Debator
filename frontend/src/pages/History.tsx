import { useState, useEffect } from 'react';
import { debateApi } from '../services/api';
import { Clock, Trophy, ChevronRight, ArrowLeft, Gavel, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [debates, setDebates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebate, setSelectedDebate] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      const response = await debateApi.getDebates();
      setDebates(response.data);
    } catch (err) {
      console.error("Failed to fetch debates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDebate = async (id: number) => {
    setLoadingDetails(true);
    try {
      const response = await debateApi.getDebate(id);
      setSelectedDebate(response.data);
    } catch (err) {
      console.error("Failed to fetch debate details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-gray-500 tracking-widest">LOADING HISTORY...</div>;

  if (selectedDebate) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button 
          onClick={() => setSelectedDebate(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-gold mb-8 transition tracking-widest text-sm"
        >
          <ArrowLeft size={16} /> BACK TO HISTORY
        </button>

        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold max-w-3xl mx-auto leading-relaxed">"{selectedDebate.topic}"</h2>
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <span className="px-3 py-1 bg-gray-900 rounded-full border border-gray-800">Mode: {selectedDebate.mode}</span>
            <span className="px-3 py-1 bg-gray-900 rounded-full border border-gray-800">Rounds: {selectedDebate.rounds}</span>
            <span className="px-3 py-1 bg-gray-900 rounded-full border border-gray-800">Date: {new Date(selectedDebate.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-8">
          {selectedDebate.transcript.map((turn: any, idx: number) => (
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

        {selectedDebate.verdict && (
          <div className="mt-16 bg-gray-900/80 border border-gold/30 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-gray-950 p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-2xl font-serif text-gold flex items-center gap-3">
                <Gavel /> JUDGE'S VERDICT
              </h3>
              <div className="text-right">
                <div className="text-sm text-gray-400 tracking-widest uppercase">Winner</div>
                <div className={`text-3xl font-bold ${
                  selectedDebate.verdict.winner === 'FOR' ? 'text-for' : 
                  selectedDebate.verdict.winner === 'AGAINST' ? 'text-against' : 'text-gold'
                }`}>
                  {selectedDebate.verdict.winner}
                </div>
              </div>
            </div>
            
            <div className="p-8 grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Final Scores</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 font-bold text-for">FOR</div>
                  <div className="flex-grow h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-for" style={{ width: `${selectedDebate.verdict.for_score}%` }}></div>
                  </div>
                  <div className="w-12 text-right font-mono">{selectedDebate.verdict.for_score}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 font-bold text-against">AGAINST</div>
                  <div className="flex-grow h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-against" style={{ width: `${selectedDebate.verdict.against_score}%` }}></div>
                  </div>
                  <div className="w-12 text-right font-mono">{selectedDebate.verdict.against_score}</div>
                </div>

                <h4 className="text-lg font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">Reasoning</h4>
                <p className="text-gray-300 leading-relaxed text-sm">{selectedDebate.verdict.reasoning}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Detailed Criteria (out of 10)</h4>
                <div className="space-y-3">
                  {Object.entries(selectedDebate.verdict.criteria).map(([criterion, scores]: [string, any]) => (
                    <div key={criterion} className="grid grid-cols-3 text-sm items-center">
                      <div className="capitalize text-gray-400">{criterion}</div>
                      <div className="text-center font-mono text-for">{scores.for}</div>
                      <div className="text-center font-mono text-against">{scores.against}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-gray-950 rounded-lg border border-gray-800">
                  <h5 className="font-semibold text-gold mb-2">Final Statement</h5>
                  <p className="text-sm italic text-gray-300">"{selectedDebate.verdict.final_verdict}"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-serif text-paper mb-8 flex items-center gap-3">
        <Clock className="text-gold" />
        DEBATE HISTORY
      </h2>
      
      {debates.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800">
          No debates recorded yet. Head to the Arena to start one.
        </div>
      ) : (
        <div className="space-y-4">
          {debates.map((debate) => (
            <div 
              key={debate.id} 
              onClick={() => handleSelectDebate(debate.id)}
              className="bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 rounded-xl p-6 transition group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">{new Date(debate.created_at).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 bg-gray-950 rounded text-xs border border-gray-800">{debate.mode} • {debate.rounds} rounds</span>
                  </div>
                  <h3 className="text-lg font-semibold text-paper group-hover:text-gold transition">
                    "{debate.topic}"
                  </h3>
                </div>
                
                <div className="flex items-center gap-8 text-sm">
                  {debate.winner && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">WINNER</div>
                      <div className={`font-bold flex items-center justify-center gap-1 ${
                        debate.winner === 'FOR' ? 'text-for' : 
                        debate.winner === 'AGAINST' ? 'text-against' : 'text-gold'
                      }`}>
                        <Trophy size={14} />
                        {debate.winner}
                      </div>
                    </div>
                  )}
                  {loadingDetails ? (
                     <Loader2 className="animate-spin text-gray-500" size={20} />
                  ) : (
                    <ChevronRight className="text-gray-600 group-hover:text-gold transition" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
