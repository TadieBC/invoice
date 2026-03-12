export interface CompanyInfo {
  name: string;
  contactPerson?: string;
  address: string;
  phone: string;
  email: string;
  taxId?: string;
  website?: string;
  bankName?: string;
  bankAddress?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
}

export interface InvoiceItem {
  id: string;
  itemNumber?: string;
  item: string;
  description: string;
  model: string;
  specification: string;
  hsCode?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  netWeight?: string;
  grossWeight?: string;
  cbm?: string;
}

export interface InvoiceMeta {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  type: 'commercial' | 'proforma' | 'packing_list' | 'standard';
  incoterm?: string;
  paymentTerm?: string;
  shipmentMethod?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  countryOfOrigin?: string;
  productCategory?: string;
}

export interface CommercialTerms {
  ttTerms?: string;
  bankTransferInstructions?: string;
  validity?: string;
  shippingTerms?: string;
  deliveryLeadTime?: string;
  packagingTerms?: string;
  warrantyTerms?: string;
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
  commercial_terms?: CommercialTerms;
  qr_payment_link?: string;
  logo?: string;
  template_settings: TemplateSettings;
  language_settings: LanguageSettings;
}

export type TemplateType = 'minimal' | 'luxury' | 'premium_export' | 'bold_branded' | 'light_elegant' | 'dark_professional';

export interface AppState {
  invoice: InvoiceData | null;
  template: TemplateType;
  primaryColor: string;
  isGenerating: boolean;
  error: string | null;
}
