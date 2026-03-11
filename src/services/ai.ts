import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { InvoiceData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    invoice_meta: {
      type: Type.OBJECT,
      properties: {
        invoiceNumber: { type: Type.STRING, description: "Invoice number, generate a random one if not provided (e.g., INV-2023-001)" },
        issueDate: { type: Type.STRING, description: "Invoice date in YYYY-MM-DD format. Use today if not provided." },
        dueDate: { type: Type.STRING, description: "Due date in YYYY-MM-DD format." },
        type: { type: Type.STRING, description: "commercial, proforma, packing_list, or standard" }
      }
    },
    currency: { type: Type.STRING, description: "Currency code (e.g., USD, RMB, EUR, NAD, ZWL)" },
    seller: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        taxId: { type: Type.STRING },
        website: { type: Type.STRING },
        contactPerson: { type: Type.STRING }
      }
    },
    buyer: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        taxId: { type: Type.STRING },
        website: { type: Type.STRING },
        contactPerson: { type: Type.STRING }
      }
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Product or service name" },
          description: { type: Type.STRING },
          model: { type: Type.STRING },
          specification: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
          amount: { type: Type.NUMBER, description: "quantity * unitPrice" },
        },
        required: ["item", "quantity", "unitPrice", "amount"]
      }
    },
    tax: {
      type: Type.OBJECT,
      properties: {
        rate: { type: Type.NUMBER },
        amount: { type: Type.NUMBER }
      }
    },
    shipping: { type: Type.NUMBER },
    discount: { type: Type.NUMBER },
    subtotal: { type: Type.NUMBER },
    total: { type: Type.NUMBER },
    notes: { type: Type.STRING },
    payment_details: { type: Type.STRING },
    bank_details: { type: Type.STRING },
    qr_payment_link: { type: Type.STRING },
    template_settings: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        primaryColor: { type: Type.STRING },
        secondaryColor: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        tableStyle: { type: Type.STRING },
        borderStyle: { type: Type.STRING },
        fontPairing: { type: Type.STRING },
        logoPlacement: { type: Type.STRING },
        headerLayout: { type: Type.STRING },
        footerLayout: { type: Type.STRING },
        showTax: { type: Type.BOOLEAN },
        showShipping: { type: Type.BOOLEAN },
        showSignature: { type: Type.BOOLEAN },
        showStamp: { type: Type.BOOLEAN },
        showPaymentQR: { type: Type.BOOLEAN }
      }
    },
    language_settings: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING, description: "en, zh, or mixed" }
      }
    }
  },
  required: ["invoice_meta", "currency", "seller", "buyer", "items", "subtotal", "total"]
};

export async function generateInvoiceData(
  prompt: string,
  files: { data: string; mimeType: string }[] = [],
  existingData?: InvoiceData | null
): Promise<InvoiceData> {
  try {
    const parts: any[] = [];
    
    let systemInstruction = `You are an expert AI Invoice Generator. Your task is to extract, understand, organize, and format information into a structured invoice.
    You must support multilingual data (especially Chinese and English).
    Calculate the amounts, subtotal, tax, shipping, and grand total accurately if they are not explicitly provided.
    If the user provides an existing invoice context, update it with the new instructions.
    Ensure the output strictly follows the provided JSON schema.`;

    if (existingData) {
      parts.push({ text: `Existing Invoice Data: ${JSON.stringify(existingData)}` });
      parts.push({ text: `User Instructions to update the invoice: ${prompt}` });
    } else {
      parts.push({ text: `User Instructions: ${prompt}` });
    }

    for (const file of files) {
      parts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: invoiceSchema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        temperature: 0.1,
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const parsedData = JSON.parse(response.text);
    
    // Add unique IDs to items
    if (parsedData.items) {
      parsedData.items = parsedData.items.map((item: any) => ({
        ...item,
        id: uuidv4()
      }));
    }

    return parsedData as InvoiceData;
  } catch (error) {
    console.error("Error generating invoice data:", error);
    throw error;
  }
}

export async function generateLogo(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Generate a professional, clean, minimal company logo for an invoice. Background should be solid white. ${prompt}` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating logo:", error);
    throw error;
  }
}
