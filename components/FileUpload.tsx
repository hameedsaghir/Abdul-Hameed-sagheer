import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.docx')) {
      onFileSelect(files[0]);
    } else {
      alert("Please upload a valid .docx file");
    }
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <div className="relative group bg-slate-800/50 border border-indigo-500/30 rounded-xl p-6 flex items-center justify-between transition-all hover:border-indigo-500/60">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">
              {selectedFile.name}
            </h3>
            <p className="text-slate-400 text-sm">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        <button 
          onClick={onClear}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <label 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-500/10' 
          : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600'}
      `}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-700/50'}`}>
          <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
        </div>
        <p className="mb-2 text-lg font-medium text-white">
          <span className="text-indigo-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-slate-400">
          Microsoft Word Documents (.docx)
        </p>
      </div>
      <input 
        type="file" 
        className="hidden" 
        accept=".docx"
        onChange={handleInputChange}
      />
    </label>
  );
};