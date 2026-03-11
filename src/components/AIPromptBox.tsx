import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { fileToBase64 } from '../lib/utils';

interface AIPromptBoxProps {
  onGenerate: (prompt: string, files: { data: string; mimeType: string }[]) => Promise<void>;
  isGenerating: boolean;
}

export const AIPromptBox: React.FC<AIPromptBoxProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<{ file: File; data: string; mimeType: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const processedFiles = await Promise.all(
        newFiles.map(async (file: File) => {
          const data = await fileToBase64(file);
          return { file, data, mimeType: file.type };
        })
      );
      setFiles((prev) => [...prev, ...processedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && files.length === 0) return;
    
    await onGenerate(prompt, files.map(f => ({ data: f.data, mimeType: f.mimeType })));
    setPrompt('');
    setFiles([]);
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-bold text-white">AI Invoice Generator</h2>
      </div>
      
      <p className="text-sm text-slate-400 mb-6">
        Describe the invoice you want to create, or upload a photo/PDF of an existing invoice, purchase order, or product list.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create an invoice for 5 LED screens, model P2.5, price 1390 RMB per square meter, buyer in Namibia, shipping from Guangzhou..."
            className="w-full min-h-[120px] p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm text-slate-100 placeholder-slate-500"
            disabled={isGenerating}
          />
          
          {files.length > 0 && (
            <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1 bg-slate-800 border border-slate-600 px-2 py-1 rounded-md text-xs shadow-sm text-slate-200">
                  {f.mimeType.includes('image') ? <ImageIcon className="w-3 h-3 text-indigo-400" /> : <FileText className="w-3 h-3 text-rose-400" />}
                  <span className="truncate max-w-[100px]">{f.file.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-400 ml-1">&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*,application/pdf"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-700/50"
              disabled={isGenerating}
            >
              <Upload className="w-4 h-4" />
              Upload Image/PDF
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isGenerating || (!prompt.trim() && files.length === 0)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
