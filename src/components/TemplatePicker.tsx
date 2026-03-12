import React from 'react';
import { TemplateType, InvoiceData } from '../types';
import { InvoicePreview } from './InvoicePreview';

interface TemplatePickerProps {
  onSelect: (template: TemplateType) => void;
}

const TEMPLATES: { id: TemplateType; name: string; description: string; color: string }[] = [
  { id: 'minimal', name: 'Minimal Corporate', description: 'Clean, simple, and professional.', color: '#0f172a' },
  { id: 'luxury', name: 'Luxury Dark', description: 'Premium dark mode invoice.', color: '#18181b' },
  { id: 'premium_export', name: 'Premium Export Trading', description: 'Optimized for cross-border trade.', color: '#0369a1' },
  { id: 'bold_branded', name: 'Bold Branded', description: 'Strong visual identity.', color: '#b45309' },
  { id: 'light_elegant', name: 'Light Elegant', description: 'High-end spacing and typography.', color: '#1d4ed8' },
  { id: 'dark_professional', name: 'Dark Accent Professional', description: 'Modern dark accents.', color: '#4c1d95' },
];

const dummyInvoice: InvoiceData = {
  seller: {
    name: "Acme Corporation",
    address: "123 Innovation Drive\nTech City, TC 90210\nUnited States",
    email: "billing@acmecorp.com",
    phone: "+1 (555) 123-4567",
    taxId: "US-987654321"
  },
  buyer: {
    name: "Global Industries Ltd.",
    address: "456 Enterprise Way\nBusiness District, BD 10001\nUnited Kingdom",
    email: "accounts@globalind.co.uk",
    taxId: "GB-123456789",
    phone: "+44 20 7946 0958"
  },
  invoice_meta: {
    invoiceNumber: "INV-2026-001",
    issueDate: "2026-03-12",
    dueDate: "2026-04-11",
    type: "commercial"
  },
  items: [
    {
      id: "1",
      item: "Premium Widget Pro",
      description: "High-performance industrial widget",
      quantity: 50,
      unitPrice: 120.00,
      amount: 6000.00,
      model: "PWP-100",
      specification: "Industrial grade"
    },
    {
      id: "2",
      item: "Service & Maintenance",
      description: "Annual support contract",
      quantity: 1,
      unitPrice: 1500.00,
      amount: 1500.00,
      model: "SMC-1",
      specification: "24/7 Support"
    }
  ],
  subtotal: 7500.00,
  tax: { rate: 10, amount: 750.00 },
  discount: 0,
  shipping: 250.00,
  total: 8500.00,
  currency: "USD",
  notes: "Thank you for your business.",
  payment_details: "Please pay within 30 days.",
  bank_details: "Bank: Global Bank\nAccount: 123456789\nSWIFT: GBANKUS33",
  template_settings: {
    id: 'minimal',
    primaryColor: '#0f172a',
    secondaryColor: '#64748b',
    accentColor: '#3b82f6',
    fontPairing: 'modern',
    tableStyle: 'minimal',
    borderStyle: 'rounded',
    logoPlacement: 'left',
    headerLayout: 'standard',
    footerLayout: 'standard',
    showTax: true,
    showShipping: true,
    showSignature: false,
    showStamp: false,
    showPaymentQR: false
  },
  language_settings: {
    primary: 'en'
  }
};

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ onSelect }) => {
  return (
    <div className="max-w-[1600px] w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight">Choose a Template</h2>
        <p className="mt-4 text-lg text-slate-400">Select a starting point for your professional invoice.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((t) => {
          // Customize dummy data slightly for each template to show variety
          const templateData = {
            ...dummyInvoice,
            template_settings: {
              ...dummyInvoice.template_settings,
              primaryColor: t.color,
              accentColor: t.color,
              fontPairing: t.id === 'luxury' || t.id === 'light_elegant' ? 'classic' : t.id === 'bold_branded' ? 'modern' : 'modern',
              tableStyle: t.id === 'premium_export' || t.id === 'dark_professional' ? 'striped' : t.id === 'bold_branded' ? 'bordered' : 'minimal',
              headerLayout: t.id === 'light_elegant' ? 'split' : t.id === 'minimal' ? 'minimal' : 'standard',
            }
          };

          return (
            <div 
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="group relative bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[1/1.2] bg-slate-900 relative overflow-hidden flex items-start justify-center border-b border-slate-700/50 p-4">
                {/* Scale down the preview to fit the container */}
                <div className="origin-top scale-[0.35] sm:scale-[0.4] md:scale-[0.3] lg:scale-[0.35] xl:scale-[0.4] w-[800px] pointer-events-none shadow-2xl transition-transform duration-500 group-hover:scale-[0.37] sm:group-hover:scale-[0.42] md:group-hover:scale-[0.32] lg:group-hover:scale-[0.37] xl:group-hover:scale-[0.42]">
                  <InvoicePreview 
                    data={templateData} 
                    template={t.id} 
                    primaryColor={t.color} 
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-800 flex-grow flex flex-col justify-between z-10">
                <div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
