import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";

GlobalWorkerOptions.workerSrc = workerUrl;

const extractTextFromPDF = async (file) => {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let fullText = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    fullText += content.items.map((i) => i.str).join(" ") + "\n";
  }
  return fullText;
};

const extractTextFromDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const isDocx = (file) =>
  file.name.toLowerCase().endsWith(".docx") ||
  file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Pulls the text out of a resume file in the browser. Scanned/image-only PDFs
 * yield nothing readable, so callers get a clear error rather than empty text.
 */
export const extractResumeText = async (file) => {
  if (!file) throw new Error("No file selected");

  let text = "";
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    text = await extractTextFromPDF(file);
  } else if (isDocx(file)) {
    text = await extractTextFromDocx(file);
  } else if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    text = await file.text();
  } else {
    throw new Error("Unsupported file. Please upload a PDF, DOCX or TXT.");
  }

  if (!text || text.trim().length < 50) {
    throw new Error("Could not read enough text from this file. Try a text-based PDF or DOCX.");
  }
  return text.trim();
};
