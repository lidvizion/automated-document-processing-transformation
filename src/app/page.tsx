'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
  Upload, FileText, Download, CheckCircle, AlertCircle, RefreshCw, 
  X, Settings, History, Trash2, Eye, FileCheck, Zap, Shield, 
  BarChart3, Calendar, Menu, ChevronRight, Star, Sparkles,
  Clock, Users, Award, ArrowRight
} from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface ProcessingAction {
  type: string;
  from?: string;
  to?: string;
  range?: string;
  pages?: number;
  applied?: boolean;
}

interface LogEntry {
  ts: string;
  level: string;
  msg: string;
}

interface ProcessingResult {
  actions: ProcessingAction[];
  logs: LogEntry[];
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  processed?: boolean;
  progress?: number;
  error?: string;
  size: number;
  uploadedAt: Date;
}

interface ProcessingSettings {
  batesStartNumber: number;
  outputFormat: 'docx' | 'pdf' | 'both';
}

interface ProcessingHistory {
  id: string;
  timestamp: Date;
  filesCount: number;
  status: 'completed' | 'failed' | 'cancelled';
  duration: number;
}

export default function DocumentProcessing() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>({
    batesStartNumber: 100,
    outputFormat: 'both',
  });
  const [processingHistory, setProcessingHistory] = useState<ProcessingHistory[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Enhanced file upload with validation and progress
  const handleFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Validate file type and size
      if (!file.type.match(/(application\/pdf|image\/(jpeg|jpg|png|gif|webp))/)) {
        setUploadedFiles(prev => [...prev, {
          id: fileId,
          file,
          preview: '',
          error: 'Unsupported file format. Please use PDF, JPG, PNG, GIF, or WebP.',
          size: file.size,
          uploadedAt: new Date(),
        }]);
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setUploadedFiles(prev => [...prev, {
          id: fileId,
          file,
          preview: '',
          error: 'File too large. Maximum size is 50MB.',
          size: file.size,
          uploadedAt: new Date(),
        }]);
        return;
      }

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFiles(prev => [...prev, {
          id: fileId,
          file,
          preview: e.target?.result as string,
          size: file.size,
          uploadedAt: new Date(),
        }]);
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }, 200);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileUpload(event.target.files);
    }
  }, [handleFileUpload]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Enhanced processing with better simulation
  const processDocuments = useCallback(async () => {
    const validFiles = uploadedFiles.filter(file => !file.error);
    if (validFiles.length === 0) return;

    const startTime = Date.now();
    setIsProcessing(true);
    setCurrentStep(0);
    
    // Enhanced processing steps
    const steps = [
      'Scanning document structure and metadata...',
      'Performing OCR analysis...',
      'Converting to target format...',
      'Applying Bates numbering and stamps...',
      'Optimizing and compressing...',
      'Generating security metadata...',
      'Creating processing reports...',
      'Finalizing output files...',
    ];

    // Simulate realistic processing time based on file count and size
    const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    const baseTime = Math.max(500, Math.min(2000, totalSize / 1024)); // 500ms to 2s per step
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, baseTime + Math.random() * 500));
    }

    // Load mock response and enhance it
    try {
      const response = await fetch('/mock/response.json');
      const baseResult: ProcessingResult = await response.json();
      
      // Enhance result with current settings
      const enhancedResult: ProcessingResult = {
        ...baseResult,
        actions: [
          ...baseResult.actions,
          {
            type: 'format',
            to: processingSettings.outputFormat,
          },
          {
            type: 'bates_custom',
            range: `${String(processingSettings.batesStartNumber).padStart(6, '0')}-${String(processingSettings.batesStartNumber + 25).padStart(6, '0')}`,
          },
        ],
        logs: [
          ...baseResult.logs,
          {
            ts: new Date().toISOString(),
            level: 'info',
            msg: `Processed ${validFiles.length} files with ${processingSettings.outputFormat} output format`,
          },
          {
            ts: new Date().toISOString(),
            level: 'info',
            msg: `Bates numbering applied starting from ${String(processingSettings.batesStartNumber).padStart(6, '0')}`,
          },
          {
            ts: new Date().toISOString(),
            level: 'success',
            msg: `Processing completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`,
          },
        ],
      };
      
      setProcessingResult(enhancedResult);
      
      // Mark files as processed with progress
      setUploadedFiles(prev => prev.map(file => 
        file.error ? file : { ...file, processed: true, progress: 100 }
      ));
      
      // Add to history
      const historyEntry: ProcessingHistory = {
        id: `hist-${Date.now()}`,
        timestamp: new Date(),
        filesCount: validFiles.length,
        status: 'completed',
        duration: Date.now() - startTime,
      };
      setProcessingHistory(prev => [historyEntry, ...prev]);
      
    } catch (error) {
      console.error('Failed to load processing result:', error);
    }

    setIsProcessing(false);
  }, [uploadedFiles, processingSettings]);

  // File management functions
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  }, []);

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const selectAllFiles = useCallback(() => {
    const validFileIds = uploadedFiles.filter(file => !file.error).map(file => file.id);
    setSelectedFiles(validFileIds);
  }, [uploadedFiles]);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
    setSelectedFiles([]);
    setProcessingResult(null);
  }, []);

  const retryFailedFiles = useCallback(() => {
    const failedFiles = uploadedFiles.filter(file => file.error);
    failedFiles.forEach(fileData => {
      handleFileUpload([fileData.file]);
      removeFile(fileData.id);
    });
  }, [uploadedFiles, handleFileUpload, removeFile]);


  const generateMockDocx = useCallback(async () => {
    try {
      // Create a proper DOCX file using JSZip
      const zip = new JSZip();
      
      // Add required DOCX structure
      // 1. [Content_Types].xml
      const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
      
      // 2. _rels/.rels
      const mainRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
      
      // 3. word/document.xml (main content)
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
        <w:t>DocuFlow Pro</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="24"/>
        </w:rPr>
        <w:t>Processed Document</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>Document Information:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Original File: ${uploadedFiles[0]?.file.name || 'document.pdf'}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Processing Date: ${new Date().toLocaleString()}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Bates Range: ${String(processingSettings.batesStartNumber).padStart(6, '0')}-${String(processingSettings.batesStartNumber + 25).padStart(6, '0')}</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>Processing Summary:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>This document has been successfully processed using DocuFlow Pro's automated document processing workflow. The system has applied the following transformations and enhancements:</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>Processing Settings Applied:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
                        <w:t>• Output Format: ${processingSettings.outputFormat.toUpperCase()}</w:t>
                      </w:r>
                    </w:p>
                    <w:p>
                      <w:r>
                        <w:t>• Bates Start Number: ${String(processingSettings.batesStartNumber).padStart(6, '0')}</w:t>
                      </w:r>
                    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:i/></w:rPr>
        <w:t>Generated by DocuFlow Pro - Intelligent Document Processing Platform</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
      
      // Add files to ZIP structure
      zip.file('[Content_Types].xml', contentTypes);
      zip.folder('_rels')?.file('.rels', mainRels);
      zip.folder('word')?.file('document.xml', documentXml);
      
      // Generate the DOCX file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'ACME-MSA-v2.docx');
      
    } catch (error) {
      console.error('Error generating DOCX:', error);
      // Fallback to simple text file if DOCX generation fails
      const fallbackContent = `DocuFlow Pro - Processed Document

Original File: ${uploadedFiles[0]?.file.name || 'document.pdf'}
Processing Date: ${new Date().toLocaleString()}
Bates Range: ${String(processingSettings.batesStartNumber).padStart(6, '0')}-${String(processingSettings.batesStartNumber + 25).padStart(6, '0')}

This document has been processed using DocuFlow Pro.

Processing Settings:
- Output Format: ${processingSettings.outputFormat.toUpperCase()}
- Bates Start Number: ${String(processingSettings.batesStartNumber).padStart(6, '0')}`;
      
      const blob = new Blob([fallbackContent], { type: 'text/plain' });
      saveAs(blob, 'ACME-MSA-v2.txt');
    }
  }, [uploadedFiles, processingSettings]);

  const generateMockPdf = useCallback(() => {
    // Create a proper PDF structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 800
>>
stream
BT
/F1 16 Tf
50 720 Td
(DocuFlow Pro - Processed Document) Tj
0 -30 Td
/F1 12 Tf
(Original File: ${uploadedFiles[0]?.file.name || 'document.pdf'}) Tj
0 -20 Td
(Processing Date: ${new Date().toLocaleString()}) Tj
0 -20 Td
(Bates Range: ${String(processingSettings.batesStartNumber).padStart(6, '0')}-${String(processingSettings.batesStartNumber + 25).padStart(6, '0')}) Tj
0 -40 Td
(This document has been successfully processed using) Tj
0 -15 Td
(DocuFlow Pro's automated document processing workflow.) Tj
0 -30 Td
(Processing Settings:) Tj
0 -20 Td
(- Output Format: ${processingSettings.outputFormat.toUpperCase()}) Tj
0 -15 Td
(- Bates Start Number: ${String(processingSettings.batesStartNumber).padStart(6, '0')}) Tj
0 -15 Td
(- Range: ${String(processingSettings.batesStartNumber).padStart(6, '0')}-${String(processingSettings.batesStartNumber + 25).padStart(6, '0')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000265 00000 n 
0000001117 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1184
%%EOF`;

    // Create a blob with proper MIME type for PDF
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    saveAs(blob, 'ACME-MSA-v2.pdf');
  }, [uploadedFiles, processingSettings]);

  const generateLogFile = useCallback(() => {
    if (!processingResult) return;
    
    // Create a comprehensive log file with proper formatting
    const logHeader = `DocuFlow Pro - Processing Log
Generated: ${new Date().toLocaleString()}
Files Processed: ${uploadedFiles.filter(f => !f.error).length}
Settings Used: ${JSON.stringify(processingSettings, null, 2)}

=== PROCESSING LOG ===
`;
    
    const logEntries = processingResult.logs
      .map(log => `[${new Date(log.ts).toLocaleString()}] ${log.level.toUpperCase()}: ${log.msg}`)
      .join('\n');
    
    const logFooter = `

=== SUMMARY ===
Total Actions: ${processingResult.actions.length}
Actions Performed:
${processingResult.actions.map(action => `- ${action.type.toUpperCase()}: ${
  action.type === 'rename' ? `${action.from} → ${action.to}` :
  action.type === 'bates' ? `Range ${action.range}` :
  action.type === 'convert' ? `To ${action.to}, ${action.pages} pages` :
  action.type === 'ocr' ? `${action.pages} pages processed` :
  action.type === 'compress' ? `Level: ${action.to}` :
  action.type === 'watermark' ? `${action.applied ? 'Applied' : 'Not Applied'}` :
  'Completed'
}`).join('\n')}

Log generated by DocuFlow Pro v1.0
`;

    const fullLogContent = logHeader + logEntries + logFooter;
    
    // Create blob with proper text MIME type
    const blob = new Blob([fullLogContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'processing-log.txt');
  }, [processingResult, uploadedFiles, processingSettings]);

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative logo-hover cursor-pointer">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white icon-hover" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent text-hover cursor-pointer">
                  DocuFlow Pro
                </h1>
                <p className="text-xs lg:text-sm text-slate-500 -mt-1">
                  Intelligent Document Processing
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`nav-item flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                  showSettings 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                }`}
              >
                <Settings className="w-4 h-4 mr-2 icon-hover" />
                Settings
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`nav-item flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                  showHistory 
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-600'
                }`}
              >
                <History className="w-4 h-4 mr-2 icon-hover" />
                History
                {processingHistory.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full badge-hover">
                    {processingHistory.length}
                  </span>
                )}
              </button>
              {uploadedFiles.length > 0 && (
                <button
                  onClick={clearAllFiles}
                  className="nav-item flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 mr-2 icon-hover" />
                  Clear All
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200/60 fade-in">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors touch-target"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
                <button
                  onClick={() => {
                    setShowHistory(!showHistory);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors touch-target"
                >
                  <History className="w-5 h-5 mr-3" />
                  History
                  {processingHistory.length > 0 && (
                    <span className="ml-auto px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">
                      {processingHistory.length}
                    </span>
                  )}
                </button>
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={() => {
                      clearAllFiles();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-left text-rose-600 hover:bg-rose-50 rounded-lg transition-colors touch-target"
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    Clear All Files
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto py-6 lg:py-12 space-y-6 lg:space-y-8">
        {/* Hero Section */}
        {uploadedFiles.length === 0 && !isProcessing && !processingResult && (
          <div className="text-center py-8 lg:py-16 fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Professional Document Processing
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4 lg:mb-6">
              Transform Your Documents
              <span className="block text-indigo-600">In Seconds</span>
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-8 lg:mb-12">
              Convert scans to editable formats, apply Bates numbering, and automate your document workflows with enterprise-grade precision.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center p-6 card feature-card cursor-pointer">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 feature-icon">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Lightning Fast</h3>
                <p className="text-slate-600 text-sm">Process multiple documents in seconds with our optimized pipeline.</p>
              </div>
              <div className="text-center p-6 card feature-card cursor-pointer">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 feature-icon">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Secure & Private</h3>
                <p className="text-slate-600 text-sm">Your documents are processed securely with enterprise-grade encryption.</p>
              </div>
              <div className="text-center p-6 card feature-card cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 feature-icon">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Professional Quality</h3>
                <p className="text-slate-600 text-sm">Get consistent, high-quality results every time.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="card card-elevated p-6 lg:p-8 border-l-4 border-indigo-500 slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-slate-900">Processing Settings</h3>
                  <p className="text-sm text-slate-500">Customize your document processing preferences</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSettings(false);
                  console.log('Settings panel closed');
                }}
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors touch-target z-10 relative"
                title="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Bates Start Number
                </label>
                <input
                  type="number"
                  value={processingSettings.batesStartNumber}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 100;
                    console.log('Bates number changed to:', newValue);
                    setProcessingSettings(prev => ({
                      ...prev,
                      batesStartNumber: newValue
                    }));
                  }}
                  className="input-hover w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  placeholder="Enter start number (e.g., 100)"
                  min="1"
                  max="999999"
                />
                <p className="text-xs text-slate-500">
                  Sequential numbering will start from this number (e.g., 000100, 000101, 000102...)
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Output Format
                </label>
                <select
                  value={processingSettings.outputFormat}
                  onChange={(e) => {
                    const newFormat = e.target.value as 'docx' | 'pdf' | 'both';
                    console.log('Output format changed to:', newFormat);
                    setProcessingSettings(prev => ({
                      ...prev,
                      outputFormat: newFormat
                    }));
                  }}
                  className="input-hover w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="both">Both DOCX and PDF</option>
                  <option value="docx">DOCX Only (Editable)</option>
                  <option value="pdf">PDF Only (Structured)</option>
                </select>
                <p className="text-xs text-slate-500">
                  Choose which file formats to generate from your documents
                </p>
              </div>
              
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="card card-elevated p-6 lg:p-8 border-l-4 border-emerald-500 slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <History className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-slate-900">Processing History</h3>
                  <p className="text-sm text-slate-500">Your recent document processing sessions</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowHistory(false);
                  console.log('History panel closed');
                }}
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors touch-target z-10 relative"
                title="Close history"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {processingHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-medium text-slate-900 mb-2">No History Yet</h4>
                <p className="text-slate-500">Your processing history will appear here once you start processing documents.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {processingHistory.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {entry.filesCount} {entry.filesCount === 1 ? 'file' : 'files'} processed
                        </div>
                        <div className="text-sm text-slate-500">
                          {entry.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        entry.status === 'failed' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {entry.status}
                      </span>
                      <span className="text-sm text-slate-500 hidden sm:block">
                        {(entry.duration / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* File Upload Section */}
        <div className="card card-elevated p-6 lg:p-8 fade-in">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-slate-900">Upload Documents</h3>
              <p className="text-sm text-slate-500">Drag and drop your files or click to browse</p>
            </div>
          </div>
          
          <div 
            className={`upload-area relative border-2 border-dashed rounded-xl p-8 lg:p-12 text-center cursor-pointer ${
              isDragOver 
                ? 'border-indigo-400 bg-indigo-50 scale-[1.02]' 
                : 'border-slate-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`transition-transform duration-300 ${isDragOver ? 'scale-110' : ''}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Upload className={`w-8 h-8 text-white ${isDragOver ? 'animate-bounce' : ''}`} />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="cursor-pointer group">
                <span className="text-xl lg:text-2xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Choose files to upload
                </span>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <p className="text-slate-600 mt-2 lg:text-lg">
                  or drag and drop files here
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-sm text-slate-500">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-rose-500" />
                PDF Documents
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                Images (JPG, PNG, GIF, WebP)
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-emerald-500" />
                Up to 50MB per file
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="card card-elevated p-6 lg:p-8 slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FileCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-slate-900">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <p className="text-sm text-slate-500">
                    {uploadedFiles.filter(f => !f.error).length} ready • {uploadedFiles.filter(f => f.error).length} failed
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={selectAllFiles}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors touch-target"
                >
                  Select All
                </button>
                {uploadedFiles.some(file => file.error) && (
                  <button
                    onClick={retryFailedFiles}
                    className="flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors touch-target"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry Failed
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {uploadedFiles.map((fileData) => (
                <div key={fileData.id} className={`file-card relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  fileData.error ? 'border-rose-200 bg-rose-50' :
                  fileData.processed ? 'border-emerald-200 bg-emerald-50' :
                  selectedFiles.includes(fileData.id) ? 'border-indigo-300 bg-indigo-50 shadow-md' :
                  'border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(fileData.id)}
                        onChange={() => toggleFileSelection(fileData.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded mr-3 flex-shrink-0 touch-target"
                        disabled={!!fileData.error}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          {fileData.file.type === 'application/pdf' ? (
                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                              <FileText className="w-4 h-4 text-rose-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate text-sm" title={fileData.file.name}>
                              {fileData.file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatFileSize(fileData.size)} • {fileData.uploadedAt.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-2">
                      {fileData.error ? (
                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      ) : fileData.processed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : uploadProgress[fileData.id] !== undefined ? (
                        <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
                      ) : null}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFile(fileData.id);
                          console.log('File removed:', fileData.file.name);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors touch-target z-10 relative"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadProgress[fileData.id] !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress[fileData.id])}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[fileData.id]}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {fileData.error && (
                    <div className="text-xs text-rose-600 bg-rose-100 rounded-lg p-2 mb-3">
                      {fileData.error}
                    </div>
                  )}
                  
                  {/* Image Preview */}
                  {fileData.file.type.startsWith('image/') && fileData.preview && !fileData.error && (
                    <div className="relative w-full h-20 bg-slate-100 rounded-lg overflow-hidden">
          <Image
                        src={fileData.preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* PDF Icon */}
                  {fileData.file.type === 'application/pdf' && !fileData.error && (
                    <div className="flex items-center justify-center h-20 bg-rose-50 rounded-lg">
                      <FileText className="w-8 h-8 text-rose-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200 space-y-4 sm:space-y-0">
              <div className="text-sm text-slate-600">
                {uploadedFiles.filter(f => !f.error).length} valid files
                {uploadedFiles.some(f => f.error) && (
                  <span className="text-rose-600 ml-2">• {uploadedFiles.filter(f => f.error).length} failed</span>
                )}
                {selectedFiles.length > 0 && (
                  <span className="text-indigo-600 ml-2">• {selectedFiles.length} selected</span>
                )}
              </div>
              
              <button
                onClick={processDocuments}
                disabled={isProcessing || uploadedFiles.filter(f => !f.error).length === 0}
                className="btn-primary px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed touch-target text-base lg:text-lg"
              >
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 mr-2" />
                )}
                {isProcessing ? 'Processing...' : `Process ${uploadedFiles.filter(f => !f.error).length} Files`}
                {!isProcessing && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Processing Timeline */}
        {isProcessing && (
          <div className="card card-elevated p-6 lg:p-8 border-l-4 border-purple-500 scale-in">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-slate-900">Processing Timeline</h3>
                <p className="text-sm text-slate-500">Your documents are being processed</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { step: 'Scanning document structure and metadata', icon: Eye },
                { step: 'Performing OCR analysis', icon: FileText },
                { step: 'Converting to target format', icon: RefreshCw },
                { step: 'Applying Bates numbering and stamps', icon: FileCheck },
                { step: 'Optimizing and compressing', icon: Zap },
                { step: 'Generating security metadata', icon: Shield },
                { step: 'Creating processing reports', icon: BarChart3 },
                { step: 'Finalizing output files', icon: Download },
              ].map((item, index) => {
                const Icon = item.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={index} className={`processing-step flex items-center p-4 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-indigo-50 border-l-4 border-indigo-500 scale-105' :
                    isCompleted ? 'bg-emerald-50' :
                    'bg-slate-50'
                  }`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 transition-all duration-300 ${
                      isActive ? 'bg-indigo-500 animate-pulse' :
                      isCompleted ? 'bg-emerald-500' :
                      'bg-slate-300'
                    }`}>
                      {isActive ? (
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium transition-colors duration-300 ${
                        isActive ? 'text-indigo-900' :
                        isCompleted ? 'text-emerald-900' :
                        'text-slate-500'
                      }`}>
                        {item.step}
                      </div>
                      {isActive && (
                        <div className="text-sm text-indigo-600 mt-1">In progress...</div>
                      )}
                      {isCompleted && (
                        <div className="text-sm text-emerald-600 mt-1">Completed</div>
                      )}
                    </div>
                    
                    {isActive && (
                      <div className="ml-4">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(((currentStep + 1) / 8) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / 8) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Results */}
        {processingResult && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 fade-in">
            {/* Actions Performed */}
            <div className="card card-elevated p-6 lg:p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Actions Performed</h3>
                  <p className="text-sm text-slate-500">Summary of processing operations</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {processingResult.actions.map((action, index) => (
                  <div key={index} className="flex items-start p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 capitalize mb-1">{action.type}</div>
                      <div className="text-sm text-slate-600">
                        {action.type === 'rename' && (
                          <>From: {action.from} → To: {action.to}</>
                        )}
                        {action.type === 'bates' && (
                          <>Range: {action.range}</>
                        )}
                        {action.type === 'bates_custom' && (
                          <>Custom Range: {action.range}</>
                        )}
                        {action.type === 'convert' && (
                          <>To: {action.to}, Pages: {action.pages}</>
                        )}
                        {action.type === 'format' && (
                          <>Output Format: {action.to?.toUpperCase()}</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Logs */}
            <div className="card card-elevated p-6 lg:p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Processing Logs</h3>
                  <p className="text-sm text-slate-500">Detailed processing information</p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {processingResult.logs.map((log, index) => (
                  <div key={index} className="text-sm p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      {log.level === 'success' && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                      )}
                      {log.level === 'info' && (
                        <AlertCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-slate-500 text-xs mr-2 flex-shrink-0">
                        {new Date(log.ts).toLocaleTimeString()}
                      </span>
                      <span className="text-slate-700">{log.msg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Download Section */}
        {processingResult && (
          <div className="card card-elevated p-6 lg:p-8 border-l-4 border-emerald-500 fade-in">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <Download className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-slate-900">Download Processed Files</h3>
                <p className="text-sm text-slate-500">Your documents are ready for download</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* DOCX Download - Only show if format includes DOCX */}
              {(processingSettings.outputFormat === 'docx' || processingSettings.outputFormat === 'both') && (
                <button
                  onClick={async () => {
                    console.log('DOCX download clicked');
                    try {
                      await generateMockDocx();
                      console.log('DOCX download completed');
                    } catch (error) {
                      console.error('DOCX download failed:', error);
                    }
                  }}
                  className="download-card group w-full p-6 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-400 touch-target cursor-pointer"
                  title="Click to download DOCX file"
                >
                  <div className="download-icon w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-900 mb-2">DOCX File</div>
                    <div className="text-sm text-slate-500 mb-3">Editable document format</div>
                    <div className="text-xs text-blue-600 font-medium">
                      {uploadedFiles.filter(f => !f.error).length} files • Click to download
                    </div>
                  </div>
                </button>
              )}
              
              {/* PDF Download - Only show if format includes PDF */}
              {(processingSettings.outputFormat === 'pdf' || processingSettings.outputFormat === 'both') && (
                <button
                  onClick={() => {
                    console.log('PDF download clicked');
                    try {
                      generateMockPdf();
                      console.log('PDF download completed');
                    } catch (error) {
                      console.error('PDF download failed:', error);
                    }
                  }}
                  className="download-card group w-full p-6 border-2 border-dashed border-rose-200 rounded-xl hover:border-rose-400 hover:bg-rose-50 transition-all duration-400 touch-target cursor-pointer"
                  title="Click to download PDF file"
                >
                  <div className="download-icon w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-200 transition-colors">
                    <FileCheck className="w-8 h-8 text-rose-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-900 mb-2">Structured PDF</div>
                    <div className="text-sm text-slate-500 mb-3">With Bates numbering</div>
                    <div className="text-xs text-rose-600 font-medium">
                      Range: {String(processingSettings.batesStartNumber).padStart(6, '0')}-{String(processingSettings.batesStartNumber + 25).padStart(6, '0')} • Click to download
                    </div>
                  </div>
                </button>
              )}
              
              {/* Log Download - Always available */}
              <button
                onClick={() => {
                  console.log('Log download clicked');
                  try {
                    generateLogFile();
                    console.log('Log download completed');
                  } catch (error) {
                    console.error('Log download failed:', error);
                  }
                }}
                className="download-card group w-full p-6 border-2 border-dashed border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-400 touch-target cursor-pointer"
                title="Click to download processing log"
              >
                <div className="download-icon w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-900 mb-2">Processing Log</div>
                  <div className="text-sm text-slate-500 mb-3">Detailed processing report</div>
                  <div className="text-xs text-emerald-600 font-medium">
                    {processingResult.logs.length} log entries • Click to download
                  </div>
                </div>
              </button>
            </div>
            
            {/* Download All Button - Respects output format setting */}
            <div className="text-center">
              <button
                onClick={async () => {
                  console.log('Download all clicked, format:', processingSettings.outputFormat);
                  try {
                    let downloadCount = 0;
                    
                    // Download based on selected format
                    if (processingSettings.outputFormat === 'docx' || processingSettings.outputFormat === 'both') {
                      await generateMockDocx();
                      downloadCount++;
                    }
                    
                    if (processingSettings.outputFormat === 'pdf' || processingSettings.outputFormat === 'both') {
                      setTimeout(() => generateMockPdf(), 800);
                      downloadCount++;
                    }
                    
                    // Always download log
                    setTimeout(() => generateLogFile(), downloadCount * 800);
                    
                    console.log(`Initiated ${downloadCount + 1} downloads based on ${processingSettings.outputFormat} format`);
                  } catch (error) {
                    console.error('Download all failed:', error);
                  }
                }}
                className="btn-primary px-8 py-4 rounded-xl font-semibold flex items-center mx-auto touch-target text-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download {processingSettings.outputFormat === 'both' ? 'All Files' : 
                         processingSettings.outputFormat === 'docx' ? 'DOCX + Log' : 'PDF + Log'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <p className="text-sm text-slate-500 mt-2">
                Will download {processingSettings.outputFormat === 'both' ? 'DOCX, PDF, and log files' :
                              processingSettings.outputFormat === 'docx' ? 'DOCX and log files only' :
                              'PDF and log files only'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="mt-16 lg:mt-24 bg-slate-900 text-white">
        <div className="container mx-auto py-12 lg:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">DocuFlow Pro</h3>
                <p className="text-slate-400 text-sm">Intelligent Document Processing</p>
              </div>
            </div>
            
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Transform your document workflows with enterprise-grade automation and precision processing.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="font-semibold mb-2">Secure Processing</h4>
                <p className="text-sm text-slate-400">Enterprise-grade security for your sensitive documents</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold mb-2">Lightning Fast</h4>
                <p className="text-sm text-slate-400">Process multiple documents in seconds</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2">Team Collaboration</h4>
                <p className="text-sm text-slate-400">Built for teams and enterprise workflows</p>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400">
              <p>&copy; 2025 DocuFlow Pro. Built with precision and care.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
>>>>>>> iv-document-process
