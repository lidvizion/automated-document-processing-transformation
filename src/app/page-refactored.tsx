'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Download, CheckCircle, AlertCircle, RefreshCw, 
  X, Settings, History, Trash2, Eye, FileCheck, Zap, Shield, 
  BarChart3, Calendar, Menu, ChevronRight, Star, Sparkles,
  Clock, Users, Award, ArrowRight
} from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Import our new components and utilities
import { UploadZone, UploadedFile } from '../components/UploadZone';
import { ProcessingTimeline, ProcessingStep, defaultProcessingSteps } from '../components/ProcessingTimeline';
import { useProcessingHistory } from '../hooks/useProcessingHistory';
import { useWorkspaceContext, useUserId } from '../contexts/WorkspaceContext';
import { logger } from '../lib/logger';

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

interface ProcessingSettings {
  batesStartNumber: number;
  outputFormat: 'docx' | 'pdf' | 'both';
}

export default function DocumentProcessing() {
  // Get user context securely
  const { workspace } = useWorkspaceContext();
  const userId = useUserId();
  
  // Use React Query for processing history
  const { history, addHistoryEntry, isLoading: historyLoading } = useProcessingHistory(userId);

  // State management
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>({
    batesStartNumber: 100,
    outputFormat: 'both',
  });
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced file upload handler using the new UploadZone component
  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Log successful uploads
    const successfulUploads = files.filter(f => !f.error);
    if (successfulUploads.length > 0) {
      logger.info('Files uploaded successfully', {
        count: successfulUploads.length,
        fileNames: successfulUploads.map(f => f.file.name),
        workspaceId: workspace?.id,
        userId,
      });
    }

    // Log failed uploads
    const failedUploads = files.filter(f => f.error);
    if (failedUploads.length > 0) {
      logger.warn('Some files failed to upload', {
        count: failedUploads.length,
        errors: failedUploads.map(f => ({ name: f.file.name, error: f.error })),
      });
    }
  }, [workspace?.id, userId]);

  // Enhanced processing with structured logging
  const handleProcessDocuments = useCallback(async () => {
    if (uploadedFiles.length === 0) return;

    const startTime = Date.now();
    setIsProcessing(true);
    setCurrentStep(0);
    setProcessingResult(null);

    try {
      logger.info('Starting document processing', {
        fileCount: uploadedFiles.length,
        settings: processingSettings,
        workspaceId: workspace?.id,
        userId,
      });

      const steps: ProcessingStep[] = defaultProcessingSteps.map(step => ({
        ...step,
        status: 'pending' as const,
      }));

      const actions: ProcessingAction[] = [];
      const logs: LogEntry[] = [];

      // Simulate processing steps with proper logging
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setCurrentStep(i + 1);
        
        // Update step status
        steps[i] = { ...step, status: 'active' };
        
        logger.info(`Processing step: ${step.name}`, {
          stepId: step.id,
          stepIndex: i,
          totalSteps: steps.length,
        });

        // Simulate step processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Generate mock actions and logs for this step
        switch (step.id) {
          case 'upload':
            logs.push({
              ts: new Date().toISOString(),
              level: 'info',
              msg: `Uploaded ${uploadedFiles.length} files successfully`,
            });
            break;
          case 'analysis':
            logs.push({
              ts: new Date().toISOString(),
              level: 'info',
              msg: 'Document structure analyzed',
            });
            break;
          case 'conversion':
            actions.push({
              type: 'convert',
              to: 'DOCX',
              pages: 12,
              applied: true,
            });
            logs.push({
              ts: new Date().toISOString(),
              level: 'success',
              msg: 'Converted to DOCX format',
            });
            break;
          case 'bates':
            actions.push({
              type: 'bates',
              range: `${processingSettings.batesStartNumber.toString().padStart(6, '0')}-${(processingSettings.batesStartNumber + 25).toString().padStart(6, '0')}`,
              applied: true,
            });
            logs.push({
              ts: new Date().toISOString(),
              level: 'success',
              msg: 'Bates numbering applied',
            });
            break;
          case 'renaming':
            actions.push({
              type: 'rename',
              from: 'contract.pdf',
              to: 'ACME-MSA-v2.pdf',
              applied: true,
            });
            logs.push({
              ts: new Date().toISOString(),
              level: 'success',
              msg: 'Files renamed according to business rules',
            });
            break;
          case 'generation':
            logs.push({
              ts: new Date().toISOString(),
              level: 'success',
              msg: 'Structured PDF generated',
            });
            break;
          case 'logging':
            logs.push({
              ts: new Date().toISOString(),
              level: 'info',
              msg: 'Processing logs generated',
            });
            break;
          case 'completion':
            logs.push({
              ts: new Date().toISOString(),
              level: 'success',
              msg: 'Processing completed successfully',
            });
            break;
        }

        // Mark step as completed
        steps[i] = { ...step, status: 'completed', duration: Date.now() - startTime };
      }

      const duration = Date.now() - startTime;
      const result: ProcessingResult = { actions, logs };
      setProcessingResult(result);

      // Add to processing history using React Query
      await addHistoryEntry({
        filesCount: uploadedFiles.length,
        status: 'completed',
        duration,
        userId,
        workspaceId: workspace?.id,
      });

      logger.info('Document processing completed', {
        duration,
        fileCount: uploadedFiles.length,
        actionsCount: actions.length,
        logsCount: logs.length,
        workspaceId: workspace?.id,
        userId,
      });

    } catch (error) {
      logger.error('Document processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        workspaceId: workspace?.id,
        userId,
      });

      // Add failed entry to history
      await addHistoryEntry({
        filesCount: uploadedFiles.length,
        status: 'failed',
        duration: Date.now() - startTime,
        userId,
        workspaceId: workspace?.id,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, processingSettings, workspace?.id, userId, addHistoryEntry]);

  // Enhanced download functionality
  const handleDownload = useCallback(async (type: 'docx' | 'pdf' | 'logs') => {
    if (!processingResult) return;

    try {
      logger.info('Starting file download', { type, workspaceId: workspace?.id, userId });

      switch (type) {
        case 'docx':
          const docxBlob = new Blob(['Mock DOCX content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          saveAs(docxBlob, 'processed-document.docx');
          break;
        case 'pdf':
          const pdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
          saveAs(pdfBlob, 'structured-document.pdf');
          break;
        case 'logs':
          const logsBlob = new Blob([JSON.stringify(processingResult.logs, null, 2)], { type: 'application/json' });
          saveAs(logsBlob, 'processing-logs.json');
          break;
      }

      logger.info('File download completed', { type, workspaceId: workspace?.id, userId });
    } catch (error) {
      logger.error('File download failed', {
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
        workspaceId: workspace?.id,
        userId,
      });
    }
  }, [processingResult, workspace?.id, userId]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">Document Workflows</h1>
              {workspace && (
                <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {workspace.name}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Zone */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Documents</h2>
              <UploadZone 
                onFilesUploaded={handleFilesUploaded}
                maxFiles={10}
                disabled={isProcessing}
              />
            </div>

            {/* Processing Timeline */}
            {(uploadedFiles.length > 0 || isProcessing) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Processing Timeline</h2>
                <ProcessingTimeline
                  steps={defaultProcessingSteps}
                  currentStep={currentStep}
                  isProcessing={isProcessing}
                />
              </div>
            )}

            {/* Results */}
            {processingResult && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Processing Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleDownload('docx')}
                    className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <FileCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-900">Download DOCX</div>
                    <div className="text-xs text-slate-500">Editable document</div>
                  </button>
                  
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-900">Download PDF</div>
                    <div className="text-xs text-slate-500">With Bates numbers</div>
                  </button>
                  
                  <button
                    onClick={() => handleDownload('logs')}
                    className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-900">Download Logs</div>
                    <div className="text-xs text-slate-500">Processing report</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Process Button */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <button
                  onClick={handleProcessDocuments}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Process Documents'}
                </button>
              </div>
            )}

            {/* Processing History */}
            {showHistory && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
                {historyLoading ? (
                  <div className="text-sm text-slate-500">Loading...</div>
                ) : history.length > 0 ? (
                  <div className="space-y-3">
                    {history.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {item.filesCount} files
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No processing history yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
