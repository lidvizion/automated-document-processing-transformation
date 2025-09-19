'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertCircle, Clock, FileText, 
  RefreshCw, Zap, Shield, Download, BarChart3 
} from 'lucide-react';
import { logger } from '../lib/logger';

export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number;
  error?: string;
}

export interface ProcessingTimelineProps {
  steps: ProcessingStep[];
  currentStep: number;
  isProcessing: boolean;
  onStepComplete?: (stepId: string) => void;
  onError?: (stepId: string, error: string) => void;
}

export function ProcessingTimeline({ 
  steps, 
  currentStep, 
  isProcessing, 
  onStepComplete,
  onError 
}: ProcessingTimelineProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [errorSteps, setErrorSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Update completed steps based on current step
    const newCompletedSteps = new Set<string>();
    for (let i = 0; i < currentStep; i++) {
      newCompletedSteps.add(steps[i].id);
    }
    setCompletedSteps(newCompletedSteps);

    // Log progress
    if (currentStep > 0 && currentStep <= steps.length) {
      const currentStepData = steps[currentStep - 1];
      logger.info('Processing step completed', {
        stepId: currentStepData.id,
        stepName: currentStepData.name,
        progress: `${currentStep}/${steps.length}`,
      });
    }
  }, [currentStep, steps]);

  const handleStepError = (stepId: string, error: string) => {
    setErrorSteps(prev => new Set(prev).add(stepId));
    logger.error('Processing step failed', {
      stepId,
      error,
      progress: `${currentStep}/${steps.length}`,
    });
    onError?.(stepId, error);
  };

  const getStepIcon = (step: ProcessingStep, index: number) => {
    const IconComponent = step.icon;
    const isCompleted = completedSteps.has(step.id);
    const hasError = errorSteps.has(step.id);
    const isActive = index === currentStep - 1 && isProcessing;

    if (hasError) {
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
    
    if (isCompleted) {
      return <CheckCircle className="w-6 h-6 text-emerald-500" />;
    }
    
    if (isActive) {
      return (
        <div className="relative">
          <IconComponent className="w-6 h-6 text-blue-500" />
          <RefreshCw className="w-3 h-3 text-blue-500 absolute -top-1 -right-1 animate-spin" />
        </div>
      );
    }
    
    return <IconComponent className="w-6 h-6 text-slate-400" />;
  };

  const getStepStatus = (step: ProcessingStep, index: number) => {
    const isCompleted = completedSteps.has(step.id);
    const hasError = errorSteps.has(step.id);
    const isActive = index === currentStep - 1 && isProcessing;

    if (hasError) return 'error';
    if (isCompleted) return 'completed';
    if (isActive) return 'active';
    return 'pending';
  };

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    return Math.round((currentStep / steps.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Processing Progress</h3>
          <span className="text-sm text-slate-500">
            {currentStep} of {steps.length} steps
          </span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            {isProcessing ? 'Processing...' : 'Ready to start'}
          </span>
          <span className="text-slate-500">{getProgressPercentage()}%</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-200" />
              )}
              
              <div className={`
                flex items-start space-x-4 p-4 rounded-lg transition-all duration-200
                ${status === 'active' ? 'bg-blue-50 border border-blue-200' : ''}
                ${status === 'completed' ? 'bg-emerald-50 border border-emerald-200' : ''}
                ${status === 'error' ? 'bg-red-50 border border-red-200' : ''}
                ${status === 'pending' ? 'bg-slate-50 border border-slate-200' : ''}
              `}>
                {/* Step Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step, index)}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`
                      text-sm font-medium
                      ${status === 'active' ? 'text-blue-900' : ''}
                      ${status === 'completed' ? 'text-emerald-900' : ''}
                      ${status === 'error' ? 'text-red-900' : ''}
                      ${status === 'pending' ? 'text-slate-700' : ''}
                    `}>
                      {step.name}
                    </h4>
                    
                    {status === 'active' && (
                      <div className="flex items-center text-xs text-blue-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Processing...
                      </div>
                    )}
                    
                    {status === 'completed' && step.duration && (
                      <div className="text-xs text-emerald-600">
                        {step.duration}ms
                      </div>
                    )}
                  </div>
                  
                  <p className={`
                    text-sm mt-1
                    ${status === 'active' ? 'text-blue-700' : ''}
                    ${status === 'completed' ? 'text-emerald-700' : ''}
                    ${status === 'error' ? 'text-red-700' : ''}
                    ${status === 'pending' ? 'text-slate-500' : ''}
                  `}>
                    {step.description}
                  </p>
                  
                  {status === 'error' && step.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                      {step.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Default processing steps
export const defaultProcessingSteps: ProcessingStep[] = [
  {
    id: 'upload',
    name: 'File Upload',
    description: 'Validating and uploading documents',
    icon: FileText,
    status: 'pending',
  },
  {
    id: 'analysis',
    name: 'Document Analysis',
    description: 'Analyzing document structure and content',
    icon: BarChart3,
    status: 'pending',
  },
  {
    id: 'conversion',
    name: 'Format Conversion',
    description: 'Converting to DOCX format',
    icon: RefreshCw,
    status: 'pending',
  },
  {
    id: 'bates',
    name: 'Bates Numbering',
    description: 'Applying Bates stamps for legal tracking',
    icon: Shield,
    status: 'pending',
  },
  {
    id: 'renaming',
    name: 'File Renaming',
    description: 'Renaming files according to business rules',
    icon: Zap,
    status: 'pending',
  },
  {
    id: 'generation',
    name: 'PDF Generation',
    description: 'Generating structured PDF with stamps',
    icon: FileText,
    status: 'pending',
  },
  {
    id: 'logging',
    name: 'Log Generation',
    description: 'Creating processing logs and reports',
    icon: BarChart3,
    status: 'pending',
  },
  {
    id: 'completion',
    name: 'Finalization',
    description: 'Preparing files for download',
    icon: Download,
    status: 'pending',
  },
];
