
import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  AlignLeft, 
  Sparkles, 
  History, 
  Loader2,
  Zap,
  Coins,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  X,
  ClipboardPaste,
  MessageSquare,
  Palette,
  RotateCcw,
  Sparkle,
  Search,
  Tag,
  Plus,
  ArrowRight,
  ImageIcon as ImageIconLucide
} from 'lucide-react';
import { Platform, Length, Tone, GeneratedResult } from './types';
import { generateCopywriting, generateSocialImage } from './services/geminiService';
import OptionSelector from './components/OptionSelector';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [campaignTitle, setCampaignTitle] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.Facebook);
  const [length, setLength] = useState<Length>(Length.Three);
  const [tones, setTones] = useState<Tone[]>([Tone.Fun]);
  const [visualConcept, setVisualConcept] = useState('');
  const [copyTopic, setCopyTopic] = useState('');
  const [includeImage, setIncludeImage] = useState(true);
  const [refImage, setRefImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [refiningResult, setRefiningResult] = useState<GeneratedResult | null>(null);
  const [refinementText, setRefinementText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tweakInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('socialMuseHistory');
    if (saved) {
      try { setGeneratedResults(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('socialMuseHistory', JSON.stringify(generatedResults));
  }, [generatedResults]);

  useEffect(() => {
    if (refiningResult && tweakInputRef.current) {
      tweakInputRef.current.focus();
    }
  }, [refiningResult]);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setRefImage({ data: base64.split(',')[1], mimeType: file.type, preview: base64 });
      setIncludeImage(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeRefImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTweak = (result: GeneratedResult) => {
    setRefiningResult(result);
    setCampaignTitle(result.request.campaignTitle);
    setPlatform(result.request.platform);
    setLength(result.request.length);
    setTones(result.request.tone);
    setVisualConcept(result.request.visualConcept);
    setCopyTopic(result.request.copyTopic);
    setIncludeImage(!!result.imageUrl);
    setRefinementText('');
    document.querySelector('.sidebar-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!copyTopic.trim() && !visualConcept.trim() && !refiningResult) {
        setError("Missing content or concept.");
        return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const textPromise = generateCopywriting(copyTopic, visualConcept, platform, length, tones, refinementText, refiningResult?.content);
      const shouldRegenerateImage = refiningResult ? (refinementText.toLowerCase().includes('image') || refinementText.toLowerCase().includes('look')) : true;
      
      const imagePromise = (includeImage && visualConcept.trim() && shouldRegenerateImage)
        ? generateSocialImage(
            visualConcept, 
            platform, 
            tones, 
            refImage ? { data: refImage.data, mimeType: refImage.mimeType } : undefined
          ) 
        : Promise.resolve(refiningResult?.imageUrl);

      const [copyResult, imageUrl] = await Promise.all([textPromise, imagePromise]);
      
      const newResult: GeneratedResult = {
        id: Math.random().toString(36).substr(2, 9),
        content: copyResult.socialCopy,
        asanaBrief: copyResult.asanaBrief,
        imageUrl,
        request: { campaignTitle: campaignTitle || "New Campaign", visualConcept, copyTopic, platform, length, tone: tones },
        timestamp: Date.now()
      };

      setGeneratedResults(prev => [newResult, ...prev]);
      setRefiningResult(null);
      setRefinementText('');
    } catch (e: any) {
      setError("AI generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  const filteredResults = generatedResults.filter(r => 
    r.request.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F2F2F7]">
      {/* SIDEBAR */}
      <aside className="w-full md:w-[440px] glass-sidebar border-r border-[#D1D1D6] flex flex-col h-screen sticky top-0 z-20 shadow-xl md:shadow-none">
        <div className="p-10 md:p-12 sidebar-content overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white rounded-apple-lg shadow-apple overflow-hidden border border-[#E5E5EA] flex items-center justify-center">
                <img 
                  src="https://www.google.com/s2/favicons?domain=realprize.com&sz=128" 
                  alt="RealPrize Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black leading-tight tracking-tight">Social Design</h1>
                <p className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-widest mt-0.5">Creative Assistant</p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {refiningResult && (
              <div className="p-6 bg-white rounded-apple-lg border border-[#007AFF]/30 space-y-5 animate-in slide-in-from-top-4 duration-300 shadow-xl shadow-apple-blue/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-apple-blue font-bold text-[13px] uppercase tracking-wider">
                    <RotateCcw size={16} /> <span>Refining Campaign</span>
                  </div>
                  <button onClick={() => setRefiningResult(null)} className="p-1.5 hover:bg-apple-light rounded-full text-apple-gray transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <textarea 
                  ref={tweakInputRef}
                  className="w-full p-5 rounded-apple bg-[#F2F2F7] focus:bg-white focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all resize-none text-[15px] border-none shadow-inner"
                  rows={4}
                  placeholder="What should be changed? (e.g. Make it shorter, use a funnier tone...)"
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex gap-3">
                   <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`flex-1 py-3.5 rounded-apple-lg font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${isLoading ? 'bg-[#E5E5EA] text-[#8E8E93]' : 'bg-[#007AFF] text-white hover:bg-apple-blue/90'}`}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    Apply Changes
                  </button>
                </div>
                <p className="text-[11px] text-apple-gray text-center font-medium opacity-60 italic">Tip: Press Cmd + Enter to apply instantly</p>
              </div>
            )}

            <div className="space-y-10">
              <div className="space-y-3 ml-1">
                <label className="text-[12px] font-bold text-apple-gray uppercase tracking-widest">Campaign Name</label>
                <input 
                  type="text"
                  className="w-full px-5 py-4 rounded-apple-lg bg-white border border-[#E5E5EA] focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all text-[16px] shadow-sm font-medium"
                  placeholder="e.g. Winter Sale 2025"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>

              <div className="space-y-10">
                <OptionSelector label="Destination Platform" options={Object.values(Platform)} value={platform} onChange={setPlatform} />
                <OptionSelector label="Desired Tones" options={Object.values(Tone)} value={tones} onChange={setTones} multiSelect={true} />
                <OptionSelector label="Copy Length" options={Object.values(Length)} value={length} onChange={setLength} />
              </div>

              <div className="space-y-10 pt-4">
                <div 
                  onClick={() => setIncludeImage(!includeImage)}
                  className={`flex items-center justify-between p-6 rounded-apple-xl border transition-all cursor-pointer ${includeImage ? 'bg-white border-[#007AFF] shadow-apple-hover' : 'bg-[#E3E3E8]/30 border-transparent opacity-60'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-apple transition-colors ${includeImage ? 'bg-apple-blue text-white' : 'bg-apple-gray/20 text-apple-gray'}`}>
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-[17px] font-bold">Generate Visual</span>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${includeImage ? 'bg-apple-blue border-apple-blue shadow-lg' : 'border-apple-gray'}`}>
                    {includeImage && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </div>

                {includeImage && (
                  <div className="space-y-6 ml-1 animate-in slide-in-from-top-4">
                    <div className="space-y-3">
                      <label className="text-[12px] font-bold text-apple-gray uppercase tracking-widest">Visual Concept</label>
                      <textarea 
                        className="w-full p-5 rounded-apple-lg bg-white border border-[#E5E5EA] focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all resize-none text-[15px] border-none shadow-sm font-medium"
                        rows={3}
                        placeholder="Describe the 3D scene artwork..."
                        value={visualConcept}
                        onChange={(e) => setVisualConcept(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[12px] font-bold text-apple-gray uppercase tracking-widest">Composition Reference</label>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      {refImage ? (
                        <div className="relative group rounded-apple-lg overflow-hidden border-2 border-apple-blue/30 shadow-sm aspect-video bg-white">
                          <img src={refImage.preview} alt="Reference" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={removeRefImage}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video rounded-apple-lg border-2 border-dashed border-[#D1D1D6] hover:border-apple-blue hover:bg-apple-blue/5 transition-all flex flex-col items-center justify-center gap-3 text-apple-gray hover:text-apple-blue bg-white/50 group"
                        >
                          <div className="p-3 bg-white rounded-full shadow-sm border border-[#E5E5EA] group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                          </div>
                          <span className="text-[14px] font-bold tracking-tight">Upload Inspiration</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4 ml-1">
                  <label className="text-[12px] font-bold text-apple-gray uppercase tracking-widest">Key Message Topic</label>
                  <textarea 
                    className="w-full p-5 rounded-apple-lg bg-white border border-[#E5E5EA] focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all resize-none text-[15px] border-none shadow-sm font-medium"
                    rows={4}
                    placeholder="What is the core message of this campaign?"
                    value={copyTopic}
                    onChange={(e) => setCopyTopic(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-10">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full py-5 rounded-apple-xl font-bold text-[18px] flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-xl ${isLoading ? 'bg-[#E5E5EA] text-[#8E8E93]' : 'bg-[#007AFF] text-white hover:bg-apple-blue/90 hover:shadow-apple-blue/30'}`}
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                {isLoading ? 'Crafting Assets...' : (refiningResult ? 'Create New Campaign' : 'Create Campaign')}
              </button>
              {error && <p className="text-[#FF3B30] text-[14px] font-bold text-center mt-6 animate-in slide-in-from-bottom-2">{error}</p>}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 md:p-20 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="space-y-3">
              <h2 className="text-[42px] font-bold text-black tracking-tight leading-tight">Campaigns</h2>
              <p className="text-[20px] text-[#8E8E93] font-medium">Your historical creative suite.</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-apple-gray group-focus-within:text-apple-blue transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Find a campaign..."
                className="w-full pl-14 pr-6 py-4 rounded-apple-xl bg-white border border-[#E5E5EA] focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all text-[17px] shadow-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-10 pb-32">
            {filteredResults.map((result) => (
              <ResultCard key={result.id} result={result} onDelete={(id) => setGeneratedResults(prev => prev.filter(r => r.id !== id))} onTweak={handleTweak} />
            ))}
            {filteredResults.length === 0 && (
              <div className="text-center py-56 text-apple-gray animate-in fade-in zoom-in-95">
                <Sparkles size={72} className="mx-auto mb-8 opacity-10" />
                <p className="text-[22px] font-medium text-apple-gray/40">Your creative journey begins here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
