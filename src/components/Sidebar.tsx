import React from 'react';
import { InvoiceData, TemplateType, TemplateSettings } from '../types';
import { LayoutTemplate, Palette, Image as ImageIcon, Loader2, Sparkles, Settings2 } from 'lucide-react';
import { fileToBase64 } from '../lib/utils';
import { generateLogo } from '../services/ai';

interface SidebarProps {
  invoice: InvoiceData;
  onChange: (data: InvoiceData) => void;
  template: TemplateType;
  setTemplate: (t: TemplateType) => void;
  primaryColor: string;
  setPrimaryColor: (c: string) => void;
  onLogoUpload: (url: string) => void;
}

const TEMPLATES: { id: TemplateType; name: string }[] = [
  { id: 'minimal', name: 'Minimal Corporate' },
  { id: 'luxury', name: 'Luxury Dark' },
  { id: 'international', name: 'International Trade' },
  { id: 'manufacturing', name: 'Manufacturing Export' },
  { id: 'logistics', name: 'Logistics Pro' },
  { id: 'modern', name: 'Modern Elegant' },
];

const COLORS = [
  '#0f172a', // slate-900
  '#4f46e5', // indigo-600
  '#0284c7', // sky-600
  '#16a34a', // green-600
  '#dc2626', // red-600
  '#ea580c', // orange-600
  '#9333ea', // purple-600
  '#0d9488', // teal-600
];

export const Sidebar: React.FC<SidebarProps> = ({
  invoice,
  onChange,
  template,
  setTemplate,
  primaryColor,
  setPrimaryColor,
  onLogoUpload,
}) => {
  const [isGeneratingLogo, setIsGeneratingLogo] = React.useState(false);
  const [logoPrompt, setLogoPrompt] = React.useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      onLogoUpload(`data:${e.target.files[0].type};base64,${base64}`);
    }
  };

  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim()) return;
    setIsGeneratingLogo(true);
    try {
      const url = await generateLogo(logoPrompt);
      onLogoUpload(url);
      setLogoPrompt('');
    } catch (error) {
      console.error(error);
      alert('Failed to generate logo');
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const updateSettings = (key: keyof TemplateSettings, value: any) => {
    onChange({
      ...invoice,
      template_settings: {
        ...invoice.template_settings,
        [key]: value,
      },
    });
  };

  const settings = invoice.template_settings || {} as TemplateSettings;

  return (
    <div className="w-full lg:w-72 space-y-8">
      {/* Template Selection */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-slate-100 font-semibold">
          <LayoutTemplate className="w-5 h-5" />
          <h3>Template</h3>
        </div>
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                template === t.id
                  ? 'bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 border border-transparent'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-slate-100 font-semibold">
          <Palette className="w-5 h-5" />
          <h3>Theme Colors</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Primary Color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={`primary-${c}`}
                  onClick={() => {
                    setPrimaryColor(c);
                    updateSettings('primaryColor', c);
                  }}
                  className={`w-8 h-8 rounded-full shadow-sm transition-transform ${
                    primaryColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 ring-offset-slate-800' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Secondary Color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={`secondary-${c}`}
                  onClick={() => updateSettings('secondaryColor', c)}
                  className={`w-6 h-6 rounded-full shadow-sm transition-transform ${
                    settings.secondaryColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 ring-offset-slate-800' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Accent Color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={`accent-${c}`}
                  onClick={() => updateSettings('accentColor', c)}
                  className={`w-6 h-6 rounded-full shadow-sm transition-transform ${
                    settings.accentColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 ring-offset-slate-800' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-slate-100 font-semibold">
          <Settings2 className="w-5 h-5" />
          <h3>Layout & Style</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Font Pairing</label>
            <select
              value={settings.fontPairing || 'modern'}
              onChange={(e) => updateSettings('fontPairing', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="modern">Modern Sans</option>
              <option value="classic">Classic Serif</option>
              <option value="mono">Technical Mono</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Table Style</label>
            <select
              value={settings.tableStyle || 'minimal'}
              onChange={(e) => updateSettings('tableStyle', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="minimal">Minimal</option>
              <option value="bordered">Bordered</option>
              <option value="striped">Striped</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Border Style</label>
            <select
              value={settings.borderStyle || 'rounded'}
              onChange={(e) => updateSettings('borderStyle', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="rounded">Rounded</option>
              <option value="sharp">Sharp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Logo Placement</label>
            <select
              value={settings.logoPlacement || 'left'}
              onChange={(e) => updateSettings('logoPlacement', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Header Layout</label>
            <select
              value={settings.headerLayout || 'standard'}
              onChange={(e) => updateSettings('headerLayout', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="standard">Standard</option>
              <option value="split">Split</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Footer Layout</label>
            <select
              value={settings.footerLayout || 'standard'}
              onChange={(e) => updateSettings('footerLayout', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="standard">Standard</option>
              <option value="minimal">Minimal</option>
              <option value="columns">Columns</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logo Upload / Generate */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-slate-100 font-semibold">
          <ImageIcon className="w-5 h-5" />
          <h3>Company Logo</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block w-full border-2 border-dashed border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-700/50 transition-colors">
              <span className="text-sm text-slate-400">Click to upload logo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or Generate AI Logo</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="e.g., A blue tech company logo"
              value={logoPrompt}
              onChange={(e) => setLogoPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={handleGenerateLogo}
              disabled={isGeneratingLogo || !logoPrompt.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGeneratingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
