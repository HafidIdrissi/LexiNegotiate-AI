
import React from 'react';

interface RiskGaugeProps {
  score: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  const getColor = () => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (score < 30) return 'bg-green-100';
    if (score < 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${getBgColor()}`}>
      <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Contract Risk Score</span>
      <div className={`text-6xl font-bold ${getColor()}`}>
        {score}
      </div>
      <div className="w-full h-3 bg-slate-200 rounded-full mt-4 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${score < 30 ? 'bg-green-600' : score < 70 ? 'bg-yellow-500' : 'bg-red-600'}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="mt-4 text-center text-sm text-slate-600 font-medium">
        {score < 30 ? "Generally safe terms, standard for industry." : score < 70 ? "Proceed with caution. Several points need negotiation." : "High risk detected. Major red flags in liability and payment."}
      </p>
    </div>
  );
};

export default RiskGauge;
