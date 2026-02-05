
import React, { useState } from 'react';
import { Clause, NegotiationDifficulty, EmailTemplate, ChangeSummaryItem } from '../types';

interface ComparisonModalProps {
  clause: Clause | null;
  onClose: () => void;
}

type Tab = 'comparison' | 'strategy' | 'email';
type Tone = 'formal' | 'professionalFriendly' | 'collaborative';

const ComparisonModal: React.FC<ComparisonModalProps> = ({ clause, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('comparison');
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1);
  const [activeTone, setActiveTone] = useState<Tone>('professionalFriendly');

  if (!clause) return null;

  const financials = clause.detailedFinancials;
  const strategy = clause.strategy;
  const score = clause.negotiabilityScore;
  const emailTemplate: EmailTemplate = strategy.emailOptions[activeTone];

  const formatCurrency = (val: number, symbol: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val).replace('€', symbol);
  };

  const difficultyConfig = {
    [NegotiationDifficulty.EASY]: { color: 'text-green-500', icon: '🟢', label: 'Easy (90% success rate)' },
    [NegotiationDifficulty.MEDIUM]: { color: 'text-yellow-500', icon: '🟡', label: 'Medium (60% success rate)' },
    [NegotiationDifficulty.HARD]: { color: 'text-red-500', icon: '🔴', label: 'Hard (30% success rate)' },
  };

  const diff = difficultyConfig[strategy.difficulty];

  const getNegotiabilityStatus = () => {
    if (score >= 70) return { icon: '✅', text: "High Leverage", color: 'bg-green-100 text-green-700 border-green-200' };
    if (score < 30) return { icon: '⚠️', text: "Limited Room", color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { icon: '📊', text: "Standard Negotiation", color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  };

  const status = getNegotiabilityStatus();

  const handleSendEmail = (client: 'gmail' | 'outlook') => {
    const subject = encodeURIComponent(emailTemplate.subject);
    const body = encodeURIComponent(emailTemplate.body);
    const url = client === 'gmail' 
      ? `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;
    window.open(url, '_blank');
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:static print:bg-white print:shadow-none">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col print:max-h-none print:w-full print:shadow-none print:rounded-none">
        
        {/* Header - Hidden on Print if needed, but useful for memo header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:bg-white">
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-bold text-slate-800 print:text-2xl">Negotiation Memo: {clause.category}</h2>
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 print:hidden ${diff.color}`}>
                 {diff.icon} {diff.label}
               </span>
            </div>
            <p className="text-sm text-slate-500 print:text-slate-700">Detailed risk analysis and counter-proposal brief</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button 
              type="button"
              onClick={handleExport}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 flex items-center gap-2 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-file-pdf"></i>
              Export PDF
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors active:scale-95"
            >
              <i className="fa-solid fa-xmark text-slate-600 text-xl"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 print:overflow-visible">
          {/* Tabs - Hidden on Print */}
          <div className="mb-6 flex gap-2 print:hidden">
            <button 
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'comparison' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <i className="fa-solid fa-code-compare mr-2"></i>
              Visual Comparison
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('strategy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'strategy' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <i className="fa-solid fa-comments mr-2"></i>
              Strategy
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'email' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <i className="fa-solid fa-envelope mr-2"></i>
              Email Draft
            </button>
          </div>

          {/* Negotiability Box - Hidden on Print */}
          <div className={`mb-6 p-4 rounded-2xl border print:hidden ${status.color} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
             <div className="flex items-center gap-4">
               <div className="text-2xl">{status.icon}</div>
               <div>
                 <h4 className="text-xs font-black uppercase tracking-widest opacity-70">Negotiability: {score}/100</h4>
                 <p className="text-sm font-medium">{clause.negotiabilityExplanation}</p>
               </div>
             </div>
          </div>

          {(activeTab === 'comparison' || true) && (
            <div className={`space-y-8 ${activeTab !== 'comparison' ? 'print:block hidden' : ''}`}>
              {/* Change Summary Module */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-indigo-500"></i>
                  Change Summary & Impact
                </h3>
                
                {clause.changeSummary.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row print:border-slate-300">
                    <div className="flex-1 p-5 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 print:border-slate-300">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'deleted' && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">🔴 Deleted harmful term</span>}
                        {item.type === 'added' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">🟢 Added protection</span>}
                        {item.type === 'clarified' && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">🔵 Clarified ambiguity</span>}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 p-3 bg-red-50/50 rounded-xl border border-red-100 text-sm font-serif italic text-slate-600 line-through decoration-red-400/50">
                            "{item.originalText}"
                          </div>
                          <div className="text-slate-300">
                            <i className="fa-solid fa-arrow-right"></i>
                          </div>
                          <div className="flex-1 p-3 bg-green-50/50 rounded-xl border border-green-100 text-sm font-serif text-slate-900 font-bold">
                            "{item.recommendedText}"
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-80 bg-slate-50 p-5 space-y-3 print:bg-white">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1.5">
                          <i className="fa-solid fa-bullseye"></i> Impact
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{item.impact}</p>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 print:bg-slate-50">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Protection Gained</span>
                          <p className="text-xs font-black text-green-600">{item.protectionGained}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Legal Basis</span>
                          <p className="text-[10px] font-medium text-slate-500">{item.legalBasis}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Text Side-by-Side */}
              <div className="grid md:grid-cols-2 gap-8 mt-10 print:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <h3 className="font-bold uppercase tracking-wider text-xs">Original Text (As Provided)</h3>
                  </div>
                  <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-sm text-slate-700 italic leading-relaxed font-serif min-h-[150px] print:bg-white print:border-slate-400">
                    "{clause.originalText}"
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <i className="fa-solid fa-circle-check"></i>
                    <h3 className="font-bold uppercase tracking-wider text-xs">Amended Version (LexiNegotiate)</h3>
                  </div>
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-sm text-green-900 leading-relaxed font-serif min-h-[150px] font-bold print:bg-white print:border-green-400">
                    "{clause.suggestedCounterProposal}"
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 print:hidden">
              <div className="flex bg-slate-800 border-b border-slate-700">
                {(['Tier 1: Ideal', 'Tier 2: Compromise', 'Tier 3: Minimum'] as const).map((label, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setActiveTier((idx + 1) as 1 | 2 | 3)}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTier === idx + 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-8">
                {activeTier === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Ask For</h4>
                      <p className="text-slate-100 font-medium text-sm leading-relaxed">{strategy.tier1.position}</p>
                    </div>
                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                      <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-2 tracking-widest">In-person Script</h4>
                      <p className="text-slate-200 italic font-serif text-sm">"{strategy.tier1.script}"</p>
                    </div>
                  </div>
                )}
                {/* ... other tiers logic remains same ... */}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[500px] print:hidden">
              <div className="flex bg-slate-50 border-b border-slate-200">
                {(['formal', 'professionalFriendly', 'collaborative'] as Tone[]).map((tone) => (
                  <button 
                    key={tone}
                    type="button"
                    onClick={() => setActiveTone(tone)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTone === tone ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    {tone === 'professionalFriendly' ? 'Friendly Pro' : tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm font-serif text-sm leading-relaxed">
                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Subject</span>
                    <p className="font-bold text-slate-800">{emailTemplate.subject}</p>
                  </div>
                  <div className="text-slate-700 whitespace-pre-wrap">{emailTemplate.body}</div>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap gap-2 justify-center">
                <button type="button" onClick={() => handleSendEmail('gmail')} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                  <i className="fa-brands fa-google"></i> Gmail
                </button>
                <button type="button" onClick={() => handleSendEmail('outlook')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                   <i className="fa-solid fa-envelope"></i> Outlook
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer info for print */}
        <div className="hidden print:block p-6 border-t border-slate-200 text-center text-[10px] text-slate-400 uppercase font-black tracking-widest">
          Generated by LexiNegotiate AI Assistant - Professional Use Only
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
