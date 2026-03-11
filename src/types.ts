export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxId?: string;
  website?: string;
  contactPerson?: string;
}

export interface InvoiceItem {
  id: string;
  item: string;
  description: string;
  model: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceMeta {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  type: 'commercial' | 'proforma' | 'packing_list' | 'standard';
}

export interface TemplateSettings {
  id: TemplateType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tableStyle: 'minimal' | 'bordered' | 'striped';
  borderStyle: 'rounded' | 'sharp';
  fontPairing: 'modern' | 'classic' | 'mono';
  logoPlacement: 'left' | 'center' | 'right';
  headerLayout: 'standard' | 'split' | 'minimal';
  footerLayout: 'standard' | 'minimal' | 'columns';
  showTax: boolean;
  showShipping: boolean;
  showSignature: boolean;
  showStamp: boolean;
  showPaymentQR: boolean;
}

export interface LanguageSettings {
  primary: 'en' | 'zh' | 'mixed';
}

export interface InvoiceData {
  invoice_meta: InvoiceMeta;
  seller: CompanyInfo;
  buyer: CompanyInfo;
  items: InvoiceItem[];
  currency: string;
  tax: {
    rate: number;
    amount: number;
  };
  shipping: number;
  discount: number;
  subtotal: number;
  total: number;
  notes: string;
  payment_details: string;
  bank_details: string;
  qr_payment_link?: string;
  logo?: string;
  template_settings: TemplateSettings;
  language_settings: LanguageSettings;
}

export type TemplateType = 'minimal' | 'luxury' | 'international' | 'manufacturing' | 'logistics' | 'modern';

export interface AppState {
  invoice: InvoiceData | null;
  template: TemplateType;
  primaryColor: string;
  isGenerating: boolean;
  error: string | null;
}
