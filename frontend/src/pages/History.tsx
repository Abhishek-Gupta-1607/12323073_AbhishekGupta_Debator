import { useState, useEffect } from 'react';
import { debateApi } from '../services/api';
import { Clock, Trophy, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const [debates, setDebates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchDebates();
  }, []);

  if (loading) return <div className="text-center py-20 animate-pulse text-gray-500 tracking-widest">LOADING HISTORY...</div>;

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
            <div key={debate.id} className="bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 rounded-xl p-6 transition group cursor-pointer">
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
                  <ChevronRight className="text-gray-600 group-hover:text-gold transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
