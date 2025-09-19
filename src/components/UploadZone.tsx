'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { fileValidator, FileValidationResult } from '../lib/file-validation';
// Simple console logger for deployment compatibility
const logger = {
  info: (msg: string, context?: Record<string, unknown>) => console.log(`[INFO] ${msg}`, context || ''),
  error: (msg: string, context?: Record<string, unknown>) => console.error(`[ERROR] ${msg}`, context || ''),
  warn: (msg: string, context?: Record<string, unknown>) => console.warn(`[WARN] ${msg}`, context || ''),
  debug: (msg: string, context?: Record<string, unknown>) => console.debug(`[DEBUG] ${msg}`, context || ''),
};

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  processed?: boolean;
  progress?: number;
  error?: string;
  size: number;
  uploadedAt: Date;
  validationResult?: FileValidationResult;
}

interface UploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function UploadZone({ onFilesUploaded, maxFiles = 10, disabled = false }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length > maxFiles) {
      logger.warn('Too many files selected', { 
        selected: fileArray.length, 
        maxAllowed: maxFiles 
      });
      return;
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Enhanced file validation
        const validationResult = await fileValidator.validateFile(file);
        
        if (!validationResult.isValid) {
          logger.warn('File validation failed', { 
            fileName: file.name, 
            error: validationResult.error 
          });
          
          uploadedFiles.push({
            id: fileId,
            file,
            preview: '',
            error: validationResult.error,
            size: file.size,
            uploadedAt: new Date(),
            validationResult,
          });
          continue;
        }

        // Use sanitized file if available
        const fileToUse = validationResult.sanitizedFile || file;

        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const uploadedFile: UploadedFile = {
            id: fileId,
            file: fileToUse,
            preview: e.target?.result as string,
            size: fileToUse.size,
            uploadedAt: new Date(),
            validationResult,
          };

          uploadedFiles.push(uploadedFile);
          
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

          logger.info('File uploaded successfully', { 
            fileName: fileToUse.name, 
            fileSize: fileToUse.size,
            fileType: fileToUse.type 
          });
        };

        reader.onerror = () => {
          logger.error('File reading failed', { fileName: file.name });
          uploadedFiles.push({
            id: fileId,
            file: fileToUse,
            preview: '',
            error: 'Failed to read file',
            size: fileToUse.size,
            uploadedAt: new Date(),
            validationResult,
          });
        };

        reader.readAsDataURL(fileToUse);
      } catch (error) {
        logger.error('File upload error', { 
          fileName: file.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        uploadedFiles.push({
          id: fileId,
          file,
          preview: '',
          error: 'Upload failed',
          size: file.size,
          uploadedAt: new Date(),
        });
      }
    }

    // Wait a bit for all files to process, then call the callback
    setTimeout(() => {
      onFilesUploaded(uploadedFiles);
    }, 100);
  }, [onFilesUploaded, maxFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload, disabled]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-slate-300 hover:border-slate-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center
          ${isDragOver ? 'bg-blue-100' : 'bg-slate-100'}
        `}>
          <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-slate-600'}`} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className="text-slate-600 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </div>
            <div className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-1" />
              JPG, PNG
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Maximum file size: 10MB • Up to {maxFiles} files
          </p>
        </div>
      </div>
    </div>
  );
}
