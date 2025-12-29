
import React, { useState } from 'react';
import { Copy, Check, Trash2, Download, LayoutList, MessageSquareText, Palette, Info, Edit3, ChevronDown, ChevronUp, Image as ImageIcon, Type as TypeIcon, Calendar } from 'lucide-react';
import { GeneratedResult } from '../types';

interface ResultCardProps {
  result: GeneratedResult;
  onDelete: (id: string) => void;
  onTweak: (result: GeneratedResult) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onDelete, onTweak }) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [briefCopied, setBriefCopied] = useState<string | null>(null);

  if (!result || !result.request) return null;

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    if (type === 'main') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setBriefCopied(type);
      setTimeout(() => setBriefCopied(null), 2000);
    }
  };

  const handleDownload = () => {
    if (!result.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `realprize-${result.id}.png`;
    link.click();
  };

  const toneDisplay = Array.isArray(result.request.tone) 
    ? result.request.tone.join(', ') 
    : String(result.request.tone || '');

  return (
    <div id={`result-${result.id}`} className="bg-white rounded-apple-xl shadow-apple overflow-hidden border border-[#E5E5EA] apple-transition hover:shadow-apple-hover">
      {/* HEADER */}
      <div 
        className={`px-10 py-8 flex items-center justify-between cursor-pointer select-none transition-all ${isCollapsed ? 'bg-white' : 'bg-[#FBFBFD] border-b border-[#E5E5EA]'}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-8 flex-1 min-w-0">
          <div className={`p-3.5 rounded-apple-lg transition-all transform ${isCollapsed ? 'bg-apple-light text-apple-gray scale-95' : 'bg-apple-blue text-white scale-100 shadow-xl shadow-apple-blue/25'}`}>
            {result.imageUrl ? <ImageIcon size={22} /> : <TypeIcon size={22} />}
          </div>
          <div className="flex flex-col min-w-0 gap-1.5">
            <h3 className="text-[19px] font-bold text-black leading-tight truncate">
              {result.request.campaignTitle || "Untitled Campaign"}
            </h3>
            <div className="flex gap-3 items-center text-[14px] text-apple-gray font-semibold">
              <span className="text-apple-blue font-bold tracking-tight">{result.request.platform}</span>
              <span className="opacity-30">•</span>
              <span className="truncate opacity-80">{toneDisplay}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-5 ml-8" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onTweak(result)} 
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#F2F2F7] text-[#007AFF] hover:bg-[#E5E5EA] rounded-apple-lg transition-all active:scale-95 font-bold text-[15px]"
          >
            <Edit3 size={16} />
            <span>Tweak</span>
          </button>
          <button 
            onClick={() => onDelete(result.id)} 
            className="p-2.5 text-[#C7C7CC] hover:text-[#FF3B30] hover:bg-[#FF3B3010] rounded-full transition-all"
            title="Delete campaign"
          >
            <Trash2 size={22} />
          </button>
          <div className="text-apple-gray ml-4 opacity-30">
            {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5EA] animate-in slide-in-from-top-6 duration-700">
          {/* SOCIAL CONTENT */}
          <div className="flex-1">
            <div className="p-12">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[13px] font-bold text-apple-gray uppercase tracking-widest">Drafted Content</span>
                <button
                  onClick={() => handleCopy(result.content, 'main')}
                  className={`text-[15px] font-bold transition-all px-4 py-2 rounded-full ${copied ? 'bg-[#34C75915] text-[#34C759]' : 'text-apple-blue hover:bg-apple-blue/10'}`}
                >
                  {copied ? 'Copied to clipboard' : 'Copy message'}
                </button>
              </div>
              <div className="text-[18px] leading-relaxed text-black font-normal bg-[#F2F2F7]/40 p-10 rounded-apple-xl border border-[#E5E5EA] shadow-inner selection:bg-apple-blue/20">
                {result.content}
              </div>
            </div>

            {result.imageUrl && (
              <div className="relative group/img border-t border-[#E5E5EA] bg-[#FBFBFD]">
                <img src={result.imageUrl} alt="AI Artwork" className="w-full h-auto object-cover max-h-[600px]" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button onClick={handleDownload} className="bg-white text-black px-8 py-4 rounded-full shadow-apple-hover flex items-center gap-3 font-bold text-[15px] transform transition-all hover:scale-105 active:scale-95">
                    <Download size={20} /> Save Artwork
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DESIGNER GUIDE */}
          <div className="lg:w-[400px] bg-[#FBFBFD] p-12 space-y-12">
            <div className="flex items-center gap-4 text-black font-bold text-[19px]">
              <div className="p-2 bg-apple-blue/10 rounded-apple">
                <LayoutList size={22} className="text-apple-blue" />
              </div>
              <span>Designer Guide</span>
            </div>

            {result.asanaBrief && (
              <div className="space-y-10">
                <BriefItem 
                  label="Description" 
                  value={result.asanaBrief.description} 
                  onCopy={() => handleCopy(result.asanaBrief!.description, 'desc')}
                  isCopied={briefCopied === 'desc'}
                />
                <BriefItem 
                  label="Look & Feel" 
                  value={result.asanaBrief.lookAndFeel} 
                  onCopy={() => handleCopy(result.asanaBrief!.lookAndFeel, 'look')}
                  isCopied={briefCopied === 'look'}
                />
                <BriefItem 
                  label="Messaging Hierarchy" 
                  value={result.asanaBrief.messagingHierarchy} 
                  onCopy={() => handleCopy(result.asanaBrief!.messagingHierarchy, 'hierarchy')}
                  isCopied={briefCopied === 'hierarchy'}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BriefItem = ({ label, value, onCopy, isCopied }: { label: string, value: string, onCopy: () => void, isCopied: boolean }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <span className="text-[13px] font-bold text-apple-gray uppercase tracking-widest">{label}</span>
      <button onClick={onCopy} className={`text-[12px] font-bold px-3 py-1 rounded-full transition-all ${isCopied ? 'bg-[#34C75915] text-[#34C759]' : 'text-apple-blue hover:bg-apple-blue/10'}`}>
        {isCopied ? 'Done' : 'Copy'}
      </button>
    </div>
    <div className="text-[14px] text-[#3A3A3C] bg-white p-5 rounded-apple-lg border border-[#E5E5EA] shadow-sm leading-relaxed font-medium">
      {value}
    </div>
  </div>
);

export default ResultCard;
