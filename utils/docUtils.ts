import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import FileSaver from 'file-saver';

// Extract raw text from an uploaded DOCX file
export const extractTextFromDocx = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file buffer"));
          return;
        }
        
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Generate and download a new DOCX file from text
export const generateAndDownloadDocx = async (text: string, originalFileName: string) => {
  // Split text by newlines to create paragraphs
  // Using regex to handle both \n and \r\n
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: lines.map(line => 
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: 24, // 12pt font
            }),
          ],
          spacing: {
            after: 200, // Spacing after paragraph
          }
        })
      ),
    }],
  });

  const blob = await Packer.toBlob(doc);
  const newFileName = `Modified_${originalFileName}`;
  
  // Handle file-saver import variations:
  // - Some environments export the function as 'default'
  // - Others export an object with 'saveAs' property as 'default'
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, newFileName);
};