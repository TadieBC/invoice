import React, { useState, useRef, useEffect } from 'react';
import { AIPromptBox } from './components/AIPromptBox';
import { Sidebar } from './components/Sidebar';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { TemplatePicker } from './components/TemplatePicker';
import { InvoiceData, TemplateType } from './types';
import { generateInvoiceData } from './services/ai';
import { useReactToPrint } from 'react-to-print';
import { FileText, Edit3, Download, Printer, Loader2, ArrowLeft } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<'template-selection' | 'generation'>('template-selection');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [template, setTemplate] = useState<TemplateType>(() => {
    const saved = localStorage.getItem('invoice_template');
    return (saved as TemplateType) || 'minimal';
  });
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    const saved = localStorage.getItem('invoice_color');
    return saved || '#0f172a';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  
  useEffect(() => {
    const savedInvoice = localStorage.getItem('invoice_data');
    if (savedInvoice) {
      try {
        setInvoice(JSON.parse(savedInvoice));
      } catch (e) {
        console.error('Failed to parse saved invoice data', e);
      }
    }
  }, []);

  useEffect(() => {
    if (invoice) {
      localStorage.setItem('invoice_data', JSON.stringify(invoice));
    }
  }, [invoice]);

  useEffect(() => {
    localStorage.setItem('invoice_template', template);
  }, [template]);

  useEffect(() => {
    localStorage.setItem('invoice_color', primaryColor);
  }, [primaryColor]);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice?.invoice_meta?.invoiceNumber ? `Invoice-${invoice.invoice_meta.invoiceNumber}` : 'Invoice',
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const getSmartFilename = () => {
    if (!invoice) return 'Invoice.pdf';
    
    // 1. Receiver Company
    let receiverName = invoice.buyer?.name || 'Buyer';
    receiverName = receiverName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    
    // 2. Product Category
    let productLabel = 'Goods';
    if (invoice.items && invoice.items.length > 0) {
      productLabel = invoice.items[0].item || 'Goods';
      productLabel = productLabel.split(' ')[0]; // Take first word for brevity
      productLabel = productLabel.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    }
    
    // 3. Invoice Number
    let invoiceNo = invoice.invoice_meta?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
    invoiceNo = invoiceNo.replace(/[^a-zA-Z0-9-]/g, '_');
    
    // 4. Date
    let date = invoice.invoice_meta?.issueDate || new Date().toISOString().split('T')[0];
    date = date.replace(/[^a-zA-Z0-9-]/g, '_');
    
    let filename = `${receiverName}_${productLabel}_${invoiceNo}_${date}.pdf`;
    
    // Clean up filename
    filename = filename.replace(/_+/g, '_').replace(/^_|_$/g, '');
    
    return filename;
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !invoice) return;
    
    setIsDownloading(true);
    try {
      const element = printRef.current;
      const filename = getSmartFilename();
      
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: 800, // Force width to match preview
          onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
            // Fix unsupported color functions (oklch, color-mix, etc.) by applying computed styles
            const originalElements = element.querySelectorAll('*');
            const clonedElements = clonedElement.querySelectorAll('*');
            
            // Apply to root element too
            const rootComputed = window.getComputedStyle(element);
            clonedElement.style.color = rootComputed.color;
            clonedElement.style.backgroundColor = rootComputed.backgroundColor;
            clonedElement.style.borderColor = rootComputed.borderColor;

            for (let i = 0; i < originalElements.length; i++) {
              const orig = originalElements[i] as HTMLElement;
              const clone = clonedElements[i] as HTMLElement;
              if (!orig || !clone) continue;
              
              const computed = window.getComputedStyle(orig);
              // html2canvas struggles with oklch/color-mix, but getComputedStyle resolves them to rgb/rgba
              clone.style.color = computed.color;
              clone.style.backgroundColor = computed.backgroundColor;
              clone.style.borderColor = computed.borderColor;
              
              // Also fix SVG strokes and fills
              if (orig instanceof SVGElement) {
                clone.style.fill = computed.fill;
                clone.style.stroke = computed.stroke;
              }
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      await (html2pdf as any)().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      // Fallback retry logic
      try {
        console.log('Attempting fallback PDF generation...');
        handlePrint(); // Fallback to browser print dialog
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        alert('Failed to generate PDF. Please try again or use the Print option.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerate = async (prompt: string, files: { data: string; mimeType: string }[]) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateInvoiceData(prompt, files, invoice);
      
      // Preserve logo and qr_payment_link if they exist
      if (invoice?.logo && !data.logo) {
        data.logo = invoice.logo;
      }
      if (invoice?.qr_payment_link && !data.qr_payment_link) {
        data.qr_payment_link = invoice.qr_payment_link;
      }
      
      setInvoice(data);
      setActiveTab('preview');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (url: string) => {
    if (invoice) {
      setInvoice({ ...invoice, logo: url });
    }
  };

  const handleTemplateSelect = (selectedTemplate: TemplateType) => {
    setTemplate(selectedTemplate);
    
    // If we already have an invoice, update its template settings to match the new template
    if (invoice) {
      const templateColors: Record<TemplateType, string> = {
        minimal: '#0f172a',
        luxury: '#18181b',
        premium_export: '#0369a1',
        bold_branded: '#b45309',
        light_elegant: '#1d4ed8',
        dark_professional: '#4c1d95'
      };
      
      const newColor = templateColors[selectedTemplate] || primaryColor;
      setPrimaryColor(newColor);
      
      setInvoice({
        ...invoice,
        template_settings: {
          ...invoice.template_settings,
          id: selectedTemplate,
          primaryColor: newColor,
          accentColor: newColor,
          fontPairing: selectedTemplate === 'luxury' || selectedTemplate === 'light_elegant' ? 'classic' : 'modern',
          tableStyle: selectedTemplate === 'premium_export' || selectedTemplate === 'dark_professional' ? 'striped' : selectedTemplate === 'bold_branded' ? 'bordered' : 'minimal',
          headerLayout: selectedTemplate === 'light_elegant' ? 'split' : selectedTemplate === 'minimal' ? 'minimal' : 'standard',
        }
      });
    }
    
    setStep('generation');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step === 'generation' && (
              <button 
                onClick={() => setStep('template-selection')}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Back to Templates"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">AI Invoice Generator</h1>
            </div>
          </div>
          
          {step === 'generation' && invoice && activeTab === 'preview' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'template-selection' ? (
          <TemplatePicker onSelect={handleTemplateSelect} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: AI Input & Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-8">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                    <div className="mt-0.5">
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-red-300">Generation Failed</h3>
                      <p className="mt-1 opacity-90">{error}</p>
                    </div>
                  </div>
                )}
                <AIPromptBox onGenerate={handleGenerate} isGenerating={isGenerating} />
                
                {invoice && (
                  <Sidebar
                    invoice={invoice}
                    onChange={setInvoice}
                    template={template}
                    setTemplate={setTemplate}
                    primaryColor={primaryColor}
                    setPrimaryColor={setPrimaryColor}
                    onLogoUpload={handleLogoUpload}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Preview / Editor */}
            <div className="lg:col-span-8">
              {isGenerating ? (
                <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-700 p-12 text-center h-full flex flex-col items-center justify-center min-h-[600px] backdrop-blur-sm">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-indigo-500/20">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Generating your invoice...</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Our AI is extracting the details, organizing the line items, and formatting your professional invoice. This usually takes 10-15 seconds.
                  </p>
                </div>
              ) : !invoice ? (
                <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-700 p-12 text-center h-full flex flex-col items-center justify-center min-h-[600px] backdrop-blur-sm">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                    <FileText className="w-10 h-10 text-slate-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">No Invoice Generated Yet</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Use the AI Prompt Box on the left to describe your invoice, or upload a document/image to get started.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-700 bg-slate-900/50">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                        activeTab === 'preview'
                          ? 'text-indigo-400 bg-slate-800 border-b-2 border-indigo-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Live Preview
                    </button>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                        activeTab === 'edit'
                          ? 'text-indigo-400 bg-slate-800 border-b-2 border-indigo-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                      Manual Edit
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-slate-100/5">
                    <div className={`overflow-x-auto pb-4 custom-scrollbar ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
                      <div className="min-w-[800px] rounded-lg shadow-2xl overflow-hidden">
                        <InvoicePreview 
                          ref={printRef} 
                          data={invoice} 
                          template={template} 
                          primaryColor={primaryColor} 
                        />
                      </div>
                    </div>
                    
                    {activeTab === 'edit' && (
                      <InvoiceEditor data={invoice} onChange={setInvoice} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
