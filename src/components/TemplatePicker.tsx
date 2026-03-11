import React from 'react';
import { TemplateType, TemplateSettings } from '../types';
import { LayoutTemplate, Check } from 'lucide-react';

interface TemplatePickerProps {
  onSelect: (template: TemplateType) => void;
}

const TEMPLATES: { id: TemplateType; name: string; description: string; color: string }[] = [
  { id: 'minimal', name: 'Minimal Corporate', description: 'Clean, simple, and professional.', color: '#0f172a' },
  { id: 'luxury', name: 'Luxury Dark', description: 'Premium dark mode invoice.', color: '#18181b' },
  { id: 'international', name: 'International Trade', description: 'Optimized for cross-border trade.', color: '#0369a1' },
  { id: 'manufacturing', name: 'Manufacturing Export', description: 'Detailed specs and shipping.', color: '#b45309' },
  { id: 'logistics', name: 'Logistics Pro', description: 'Focus on shipping and tracking.', color: '#1d4ed8' },
  { id: 'modern', name: 'Modern Elegant', description: 'High-end spacing and typography.', color: '#4c1d95' },
];

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ onSelect }) => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight">Choose a Template</h2>
        <p className="mt-4 text-lg text-slate-400">Select a starting point for your professional invoice.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((t) => (
          <div 
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="group relative bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300"
          >
            <div className="aspect-[4/3] bg-slate-900/50 relative overflow-hidden flex items-center justify-center border-b border-slate-700/50">
              <div 
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: t.color }}
              />
              <LayoutTemplate className="w-16 h-16 text-slate-600 group-hover:text-slate-400 group-hover:scale-110 transition-all duration-500" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: t.color }}
                />
              </div>
              <p className="text-sm text-slate-400">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
