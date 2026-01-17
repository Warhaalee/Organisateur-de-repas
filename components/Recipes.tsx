
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Image as ImageIcon, Video, Loader2, Camera, Plus, Zap, CheckCircle2, Upload, FileImage, X, Copy, Check } from 'lucide-react';
import { generateRecipeWithSearchStream, generateRecipeImage, animateRecipeVideo, analyzeRecipeFromImageStream } from '../services/geminiService';
import { Recipe, ImageSize } from '../types';

const Recipes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'photo' | 'manual'>('generate');
  const [query, setQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Form States
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualIngs, setManualIngs] = useState('');
  const [manualInsts, setManualInsts] = useState('');

  const [isImgLoading, setIsImgLoading] = useState(false);
  const [isVidLoading, setIsVidLoading] = useState(false);
  const [imgSize, setImgSize] = useState<ImageSize>(ImageSize.K1);

  const loadingMessages = [
    "Connexion au cortex culinaire...",
    "Analyse visuelle en cours...",
    "Décodage des ingrédients...",
    "Transcription des étapes...",
    "Finalisation de la recette..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating && !streamingText) {
      let idx = 0;
      setLoadingStatus(loadingMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingStatus(loadingMessages[idx]);
      }, 2500);
    } else if (streamingText) {
      setLoadingStatus("Transcription en direct...");
    }
    return () => clearInterval(interval);
  }, [isGenerating, streamingText]);

  const getPartialRecipe = () => {
    if (!streamingText) return null;
    try {
      return JSON.parse(streamingText.trim());
    } catch (e) {
      return null;
    }
  };

  const handleCopyRecipe = () => {
    if (!currentDisplayRecipe) return;
    
    const text = `
🍳 ${currentDisplayRecipe.title.toUpperCase()}
${currentDisplayRecipe.description}

🛒 INGRÉDIENTS :
${currentDisplayRecipe.ingredients?.map((ing: string) => `- ${ing}`).join('\n')}

👨‍🍳 PRÉPARATION :
${currentDisplayRecipe.instructions?.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

Généré par MiamPlanner Pro 🚀
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsGenerating(true);
    setRecipe(null);
    setStreamingText('');
    try {
      const pantry = JSON.parse(localStorage.getItem('miam_pantry') || '[]').map((i: any) => i.name);
      const finalRecipe = await generateRecipeWithSearchStream(query, pantry, (text) => setStreamingText(text));
      setRecipe(finalRecipe);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération.");
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    setIsGenerating(true);
    setRecipe(null);
    setStreamingText('');
    try {
      const finalRecipe = await analyzeRecipeFromImageStream(selectedImage, imageMimeType, (text) => setStreamingText(text));
      setRecipe(finalRecipe);
    } catch (error) {
      console.error(error);
      alert("L'analyse de l'image a échoué.");
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  const handleManualCreate = () => {
    if (!manualTitle.trim()) return;
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: manualTitle,
      description: manualDesc,
      ingredients: manualIngs.split('\n').filter(i => i.trim()),
      instructions: manualInsts.split('\n').filter(i => i.trim()),
      isManual: true
    };
    setRecipe(newRecipe);
    setManualTitle(''); setManualDesc(''); setManualIngs(''); setManualInsts('');
  };

  const handleGenerateImage = async () => {
    if (!recipe) return;
    setIsImgLoading(true);
    try {
      const imageUrl = await generateRecipeImage(recipe.title, imgSize);
      setRecipe({ ...recipe, imageUrl });
    } catch (error) {
      console.error(error);
    } finally {
      setIsImgLoading(false);
    }
  };

  const handleAnimateVideo = async () => {
    if (!recipe?.imageUrl) return;
    setIsVidLoading(true);
    try {
      const videoUrl = await animateRecipeVideo(recipe.title, recipe.imageUrl);
      setRecipe({ ...recipe, videoUrl });
    } catch (error) {
      console.error(error);
    } finally {
      setIsVidLoading(false);
    }
  };

  const partial = getPartialRecipe();
  const currentDisplayRecipe = recipe || partial;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 mb-2">Recettes</h2>
        <p className="text-gray-500 font-medium">Capturez ou imaginez vos prochains repas.</p>
      </header>

      {/* Mode Selector */}
      <div className="flex p-1 bg-gray-200 rounded-2xl mb-8">
        {[
          { id: 'generate', label: 'IA Flash', icon: Sparkles },
          { id: 'photo', label: 'Photo / Scan', icon: Camera },
          { id: 'manual', label: 'Manuel', icon: Plus },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveTab(mode.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === mode.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <mode.icon size={18} />
            <span className="text-sm">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="mb-12">
        {activeTab === 'generate' && (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: Un plat avec du riz et des courgettes..."
                className="w-full p-5 pl-12 bg-white rounded-2xl shadow-sm border border-gray-100 focus:ring-4 focus:ring-orange-500/10 outline-none text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isGenerating}
              className="bg-gray-900 hover:bg-black text-white px-8 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="text-yellow-400" />}
              <span>Générer</span>
            </button>
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="flex flex-col gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-4 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                selectedImage ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
              {selectedImage ? (
                <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={selectedImage} className="w-full h-full object-cover" alt="Source" />
                  {isGenerating && (
                    <div className="absolute inset-0 overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-[scan_2s_infinite]" />
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Upload size={32} />
                  </div>
                  <p className="font-black text-xl text-gray-900 mb-1 text-center">Importez une photo</p>
                  <p className="text-gray-400 text-sm text-center">Capture d'écran, livre de cuisine ou photo de plat</p>
                </>
              )}
            </div>
            {selectedImage && (
              <button
                onClick={handleAnalyzeImage}
                disabled={isGenerating}
                className="bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-orange-100 disabled:opacity-50 transition-all active:scale-95"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <FileImage size={24} />}
                Analyser la photo
              </button>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
            <input
              type="text"
              placeholder="Titre de la recette"
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none font-black text-xl"
            />
            <textarea
              placeholder="Description courte"
              value={manualDesc}
              onChange={e => setManualDesc(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none text-gray-600 h-20 resize-none"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                placeholder="Ingrédients (un par ligne)"
                value={manualIngs}
                onChange={e => setManualIngs(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none h-40 resize-none font-medium"
              />
              <textarea
                placeholder="Instructions (une par ligne)"
                value={manualInsts}
                onChange={e => setManualInsts(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-100 outline-none h-40 resize-none font-medium"
              />
            </div>
            <button
              onClick={handleManualCreate}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-colors"
            >
              Créer la recette
            </button>
          </div>
        )}
      </div>

      {isGenerating && !streamingText && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-6" />
          <p className="text-xl font-black text-gray-900 mb-2">{loadingStatus}</p>
        </div>
      )}

      {currentDisplayRecipe && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-300/50 border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12 relative">
              {/* Copy Button */}
              <button
                onClick={handleCopyRecipe}
                className={`absolute top-8 right-8 p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copié !' : 'Copier'}
              </button>

              <div className="flex justify-between items-start mb-4 pr-16">
                <h3 className="text-3xl font-black text-gray-900 leading-tight">
                  {currentDisplayRecipe.title || "Lecture du titre..."}
                </h3>
              </div>
              
              {currentDisplayRecipe.isManual && <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4">Manuel</span>}
              
              <p className="text-gray-500 mb-8 font-medium">
                {currentDisplayRecipe.description || "Extraction de la description..."}
              </p>
              
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Ingrédients
                  </h4>
                  <ul className="space-y-3">
                    {currentDisplayRecipe.ingredients?.map((ing: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl text-gray-700 font-semibold animate-in fade-in slide-in-from-left">
                        <CheckCircle2 size={16} className="text-orange-300" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Instructions
                  </h4>
                  <div className="space-y-4">
                    {currentDisplayRecipe.instructions?.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                        <span className="text-2xl font-black text-orange-100">{i + 1}</span>
                        <p className="text-gray-700 font-medium leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Google Search Grounding Sources */}
              {currentDisplayRecipe.groundingSources && currentDisplayRecipe.groundingSources.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in duration-1000">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Sources & Grounding
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentDisplayRecipe.groundingSources.map((source: any, i: number) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        <Search size={12} />
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-8 flex flex-col gap-6 lg:border-l border-gray-100">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-inner flex items-center justify-center border border-gray-200">
                {currentDisplayRecipe.imageUrl ? (
                  <img src={currentDisplayRecipe.imageUrl} className="w-full h-full object-cover" alt={currentDisplayRecipe.title} />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto text-gray-200 mb-2" size={48} />
                    <p className="text-gray-300 text-xs font-black uppercase tracking-widest">Image IA</p>
                  </div>
                )}
                {isImgLoading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-orange-500 mb-2" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Création artistique...</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2 bg-gray-200 p-1 rounded-xl">
                  {Object.values(ImageSize).map(size => (
                    <button
                      key={size}
                      onClick={() => setImgSize(size)}
                      className={`py-2 rounded-lg text-[10px] font-black transition-all ${
                        imgSize === size ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGenerateImage}
                  disabled={isImgLoading || isGenerating}
                  className="py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
                >
                  <ImageIcon size={18} /> Générer Image
                </button>

                {currentDisplayRecipe.imageUrl && (
                  <div className="mt-4 pt-6 border-t border-gray-200">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-4 flex items-center justify-center">
                      {currentDisplayRecipe.videoUrl ? (
                        <video src={currentDisplayRecipe.videoUrl} controls className="w-full h-full object-cover" />
                      ) : (
                        <Video className="text-gray-700" size={32} />
                      )}
                      {isVidLoading && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                          <Loader2 className="animate-spin text-white mb-2" size={24} />
                          <span className="text-[10px] text-white font-black uppercase tracking-widest">Production Veo...</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAnimateVideo}
                      disabled={isVidLoading || isGenerating}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Video size={18} /> Animer (VEO)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Recipes;
