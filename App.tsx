
import React, { useState } from 'react';
import { analyzeContract } from './services/geminiService';
import { ContractAnalysis, Clause } from './types';
import RiskGauge from './components/RiskGauge';
import ClauseCard from './components/ClauseCard';
import NegotiationChat from './components/NegotiationChat';
import ComparisonModal from './components/ComparisonModal';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setIsPdf(file.type === 'application/pdf');
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!inputText && !imagePreview) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeContract(inputText, imagePreview || undefined);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Analysis failed. Please try again.";
      alert(msg.includes("image") ? "The document could not be processed. Try copying the text instead or ensure the image is clear." : msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setInputText('');
    setImagePreview(null);
    setIsPdf(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!analysis) return;
    
    const shareText = `LexiNegotiate Analysis: Risk Score ${analysis.riskScore}/100. ${analysis.overallRecommendation}`;
    const shareUrl = window.location.href;
    const isStandardUrl = shareUrl.startsWith('http://') || shareUrl.startsWith('https://');

    const shareData: any = {
      title: 'LexiNegotiate Contract Analysis',
      text: shareText
    };

    if (isStandardUrl) {
      shareData.url = shareUrl;
    }

    try {
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share(shareData);
      } else {
        throw new Error('Share API not supported');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      try {
        const copyContent = isStandardUrl ? `${shareText}\n${shareUrl}` : shareText;
        await navigator.clipboard.writeText(copyContent);
        alert('Analysis summary and link copied to clipboard!');
      } catch (clipboardErr) {
        alert('Clipboard copy failed. Please copy the URL from your browser.');
      }
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined) return '€0,00';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-file-signature text-white text-lg"></i>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">LEXI<span className="text-indigo-600">NEGOTIATE</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full border border-slate-800 shadow-sm">
              <i className="fa-solid fa-wand-magic-sparkles text-indigo-400 text-[10px]"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Powered by Gemini 3</span>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
              Hackathon Edition
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 print:mt-0">
        {!analysis && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Sign with <span className="text-indigo-600">Confidence.</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload your contract and let our AI find the traps, explain the legal jargon, and draft your counter-proposals in seconds.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Paste Contract Text</label>
                <textarea 
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all text-sm leading-relaxed"
                  placeholder="Paste your legal document content here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or upload a document</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <div className="h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                    <i className="fa-solid fa-file-arrow-up text-slate-400 text-2xl mb-2"></i>
                    <span className="text-sm font-semibold text-slate-600">Upload Photo / PDF</span>
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                  </div>
                </label>
                
                {imagePreview ? (
                  <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {isPdf ? (
                      <div className="flex flex-col items-center">
                        <i className="fa-solid fa-file-pdf text-red-500 text-3xl mb-1"></i>
                        <span className="text-[10px] font-bold text-slate-500">PDF Document Ready</span>
                      </div>
                    ) : (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button 
                      onClick={() => { setImagePreview(null); setIsPdf(false); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </div>
                ) : (
                  <div className="h-32 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center italic text-slate-400 text-xs text-center px-4">
                    Captured document preview will appear here
                  </div>
                )}
              </div>

              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing || (!inputText && !imagePreview)}
                className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Analyzing Risks...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt"></i>
                    Analyze Contract Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Dashboard Stats */}
            <div className="lg:col-span-4 space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">
                <RiskGauge score={analysis.riskScore} />

                {/* Global Financial Impact Summary */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Total Financial Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Potential Exposure</span>
                      <p className="text-2xl font-black text-red-400">{formatCurrency(analysis.totalPotentialExposure)}</p>
                    </div>
                    <div className="p-3 bg-green-900/30 rounded-xl border border-green-800/50">
                      <span className="text-[10px] text-green-400 uppercase font-bold">Total Negotiable Savings</span>
                      <p className="text-xl font-black text-green-400">{formatCurrency(analysis.totalPotentialSavings)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Executive Summary</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">
                    {analysis.summary}
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">Primary Advice</h4>
                    <p className="text-slate-600 text-sm italic">{analysis.overallRecommendation}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 print:hidden">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Negotiation Assistant</h3>
                  <NegotiationChat contractContext={analysis.summary + "\n" + analysis.clauses.map(c => c.category + ": " + c.riskExplanation).join("\n")} />
                </div>
                
                <button 
                  onClick={reset}
                  className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors print:hidden"
                >
                  Analyze New Document
                </button>
              </div>
            </div>

            {/* Clauses List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Risk Breakdown ({analysis.clauses.length} Issues)</h2>
                <div className="flex gap-3 print:hidden">
                  <button 
                    type="button"
                    onClick={handlePrint}
                    title="Export PDF"
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-file-pdf text-lg"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={handleShare}
                    title="Share Analysis"
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-share-nodes text-lg"></i>
                  </button>
                </div>
              </div>
              
              {analysis.clauses.map((clause) => (
                <ClauseCard 
                  key={clause.id} 
                  clause={clause} 
                  onViewComparison={(c) => setSelectedClause(c)} 
                />
              ))}

              {analysis.clauses.length === 0 && (
                <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-check text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Document Looks Great!</h3>
                  <p className="text-slate-500 mt-2">No significant risks or deviations from industry standards were found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ComparisonModal 
        clause={selectedClause} 
        onClose={() => setSelectedClause(null)} 
      />
    </div>
  );
};

export default App;
