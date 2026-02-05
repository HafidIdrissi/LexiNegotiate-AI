
import React, { useState } from 'react';
import { Clause, RiskLevel } from '../types';
import { generateSpeech } from '../services/geminiService';

interface ClauseCardProps {
  clause: Clause;
  onViewComparison: (clause: Clause) => void;
}

const ClauseCard: React.FC<ClauseCardProps> = ({ clause, onViewComparison }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSuccessStories, setShowSuccessStories] = useState(false);

  const riskColors = {
    [RiskLevel.HIGH]: 'border-red-500 bg-red-50',
    [RiskLevel.MEDIUM]: 'border-yellow-500 bg-yellow-50',
    [RiskLevel.LOW]: 'border-green-500 bg-green-50'
  };

  const badgeColors = {
    [RiskLevel.HIGH]: 'bg-red-200 text-red-800',
    [RiskLevel.MEDIUM]: 'bg-yellow-200 text-yellow-800',
    [RiskLevel.LOW]: 'bg-green-200 text-green-800'
  };

  const handlePlayScript = async () => {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      const audioBuffer = await generateSpeech(clause.negotiationScript);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const formatCurrency = (val: number, symbol: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val).replace('€', symbol);
  };

  const financials = clause.detailedFinancials;
  const score = clause.negotiabilityScore;

  const getNegotiabilityStatus = () => {
    if (score >= 70) return { icon: '✅', text: "High Leverage Detected", color: 'text-green-700' };
    if (score < 30) return { icon: '⚠️', text: "Strict Standard", color: 'text-amber-700' };
    return { icon: '📊', text: "Negotiable with Strategy", color: 'text-indigo-700' };
  };

  const status = getNegotiabilityStatus();

  return (
    <div className={`border-l-4 p-5 mb-4 rounded-r-xl shadow-sm bg-white transition-all hover:shadow-md ${riskColors[clause.riskLevel]}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${badgeColors[clause.riskLevel]}`}>
            {clause.riskLevel} RISK
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">{clause.category}</h3>
        </div>
        {financials && (
          <div className="text-right">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Max Exposure</span>
            <span className="text-sm font-bold text-red-600">{formatCurrency(financials.immediateRisk, financials.currency)}</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Impact Analysis</h4>
          <p className="text-slate-700 text-sm leading-relaxed mb-4">{clause.simplifiedText}</p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase">📊 Negotiability</h4>
              <span className="text-sm font-black text-slate-800">{score}/100</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mb-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${score < 30 ? 'bg-amber-400' : score < 70 ? 'bg-indigo-400' : 'bg-green-500'}`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <p className={`text-[11px] font-medium italic ${status.color}`}>
               {status.icon} "{clause.negotiabilityExplanation}"
            </p>
          </div>

          {financials && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl shadow-inner border border-slate-700">
              <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
                <i className="fa-solid fa-coins"></i>
                Financial Protection Map
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between border-t border-slate-700 mt-2 pt-2">
                  <span className="text-green-400 font-bold italic">Negotiation Savings:</span>
                  <span className="text-sm font-black text-green-400">{formatCurrency(financials.comparisonSavings, financials.currency)}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="bg-white/50 p-4 rounded-lg border border-slate-200 flex flex-col">
          {/* Confidence Booster Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Community Data</h4>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">📈 {clause.stats.successRate}% Success</span>
            </div>
            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <p className="text-[11px] text-indigo-800 font-medium leading-relaxed">
                In our database of similar contracts, {clause.stats.successRate}% of counter-proposals were accepted within {clause.stats.avgResolutionDays} days.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowSuccessStories(!showSuccessStories)}
            className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 text-xs font-bold rounded-xl mb-4 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${showSuccessStories ? 'fa-eye-slash' : 'fa-trophy'}`}></i>
            {showSuccessStories ? 'Hide Success Stories' : 'Show Success Stories'}
          </button>

          {showSuccessStories && (
            <div className="space-y-3 mb-4 animate-fadeIn">
              {clause.successStories.map((story, sidx) => (
                <div key={sidx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{story.title}</span>
                    <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i>
                  </div>
                  <p className="text-[11px] italic text-slate-600 mb-2">"{story.counterProposal}"</p>
                  <div className="bg-slate-50 p-2 rounded-lg text-[9px] text-slate-500 border-l-2 border-green-400">
                    <strong>Partner:</strong> "{story.landlordResponse}"
                  </div>
                </div>
              ))}
              <p className="text-[8px] text-slate-400 italic text-center">* Simulated data for demonstration purposes</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-auto">
            <button 
              onClick={() => onViewComparison(clause)}
              className="flex-1 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <i className="fa-solid fa-code-compare"></i>
              Open Editor
            </button>
            <button 
              onClick={handlePlayScript}
              disabled={isPlaying}
              className={`px-3 py-2 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-50 flex items-center justify-center gap-1.5 transition-colors ${isPlaying ? 'opacity-50' : ''}`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-spinner fa-spin' : 'fa-volume-high'}`}></i>
              Hear Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClauseCard;
