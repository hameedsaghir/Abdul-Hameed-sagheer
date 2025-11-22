import React, { useState, useEffect } from 'react';
import { Bot, FileDown, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { ProcessingStatus, AlertState } from './types';
import { extractTextFromDocx, generateAndDownloadDocx } from './utils/docUtils';
import { rewriteDocumentContent } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { Button } from './components/Button';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [originalText, setOriginalText] = useState<string>("");
  const [modifiedText, setModifiedText] = useState<string>("");
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Auto-dismiss alerts
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus(ProcessingStatus.READING);
    try {
      const text = await extractTextFromDocx(selectedFile);
      setOriginalText(text);
      setStatus(ProcessingStatus.IDLE);
      setAlert({ type: 'info', message: 'File loaded successfully. Ready for your instructions.' });
    } catch (error) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
      setAlert({ type: 'error', message: 'Failed to read the Word document. Please try another file.' });
      setFile(null);
    }
  };

  const handleProcess = async () => {
    if (!originalText || !prompt) {
      setAlert({ type: 'error', message: 'Please upload a file and provide instructions.' });
      return;
    }

    setStatus(ProcessingStatus.GENERATING);
    try {
      const result = await rewriteDocumentContent(originalText, prompt);
      setModifiedText(result);
      setStatus(ProcessingStatus.COMPLETE);
      setAlert({ type: 'success', message: 'Processing complete! Your document is ready.' });
    } catch (error) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
      setAlert({ type: 'error', message: 'AI processing failed. Please try again later.' });
    }
  };

  const handleDownload = async () => {
    if (!modifiedText || !file) return;
    try {
      await generateAndDownloadDocx(modifiedText, file.name);
      setAlert({ type: 'success', message: 'Download started!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to generate download file.' });
    }
  };

  const handleReset = () => {
    setFile(null);
    setOriginalText("");
    setModifiedText("");
    setPrompt("");
    setStatus(ProcessingStatus.IDLE);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="min-h-screen bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
        
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">DocuFlow AI</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                 <span>Powered by Gemini 2.5</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Alert Notification */}
          {alert && (
            <div className={`fixed top-24 right-4 sm:right-8 z-50 p-4 rounded-lg shadow-xl border backdrop-blur-xl flex items-center space-x-3 animate-in slide-in-from-right max-w-md
              ${alert.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-200' : 
                alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200' : 
                'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'}`}>
              {alert.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {alert.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {alert.type === 'info' && <Bot className="w-5 h-5" />}
              <p>{alert.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Input */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Transform your Documents</h1>
                <p className="text-slate-400 text-lg">Upload a Word document and tell our AI how to improve, rewrite, or translate it.</p>
              </div>

              {/* Step 1: Upload */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-sm border border-indigo-500/30">1</div>
                  <h2 className="text-lg font-semibold text-white">Upload Document</h2>
                </div>
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  selectedFile={file}
                  onClear={handleReset}
                />
              </div>

              {/* Step 2: Prompt */}
              <div className={`bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl transition-opacity duration-500 ${!file ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center space-x-3 mb-4">
                   <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-sm border border-indigo-500/30">2</div>
                   <h2 className="text-lg font-semibold text-white">Your Instructions</h2>
                </div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Rewrite this article in a more professional tone, fix grammar errors, and summarize the introduction."
                    className="w-full h-40 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                  />
                  <div className="absolute bottom-4 right-4">
                     <Bot className="w-5 h-5 text-indigo-500 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className={`${!file || !prompt ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Button 
                  onClick={handleProcess}
                  isLoading={status === ProcessingStatus.GENERATING}
                  disabled={!file || !prompt || status === ProcessingStatus.GENERATING}
                  className="w-full py-4 text-lg shadow-indigo-500/20"
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {status === ProcessingStatus.GENERATING ? 'AI is working...' : 'Generate New Version'}
                </Button>
              </div>

            </div>

            {/* Right Column: Preview & Download */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24">
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full shadow-2xl flex flex-col min-h-[500px]">
                  
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileDown className="w-5 h-5 mr-2 text-indigo-400" />
                    Output Preview
                  </h3>

                  {status === ProcessingStatus.COMPLETE && modifiedText ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-y-auto max-h-[400px] mb-6 shadow-inner">
                        <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-light">
                          {modifiedText}
                        </p>
                      </div>
                      
                      <div className="mt-auto space-y-3">
                         <Button 
                          onClick={handleDownload}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                          icon={<FileDown className="w-5 h-5" />}
                        >
                          Download .docx
                        </Button>
                        <Button 
                          onClick={handleReset}
                          variant="secondary"
                          className="w-full"
                        >
                          Start Over
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-900/20 p-8">
                       {status === ProcessingStatus.GENERATING ? (
                         <div className="text-center space-y-4">
                           <div className="relative">
                             <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                             <div className="absolute inset-0 flex items-center justify-center">
                               <Bot className="w-6 h-6 text-indigo-400 animate-pulse" />
                             </div>
                           </div>
                           <p className="text-indigo-300 font-medium animate-pulse">AI is rewriting your document...</p>
                           <p className="text-xs text-slate-500 max-w-[200px] mx-auto">This might take a few seconds depending on the length.</p>
                         </div>
                       ) : (
                         <>
                            <div className="bg-slate-800 p-4 rounded-full mb-4">
                              <ArrowRight className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-center">Uploaded document preview and AI output will appear here.</p>
                         </>
                       )}
                    </div>
                  )}
                  
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default App;