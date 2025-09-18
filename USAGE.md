# Usage Guide - Automated Document Workflows

## Quick Start

1. **Access the Application**
   - Open your browser and navigate to: http://localhost:3000
   - The application is now running and ready to use

2. **Upload Documents**
   - Click "Choose files" or drag and drop files into the upload area
   - Supported formats: PDF, JPG, PNG
   - Multiple files can be uploaded simultaneously

3. **Process Documents**
   - After uploading, click "Process Documents"
   - Watch the real-time processing timeline with animated progress indicators
   - Processing simulation includes:
     - Document structure analysis
     - DOCX format conversion
     - Bates numbering (000100-000125)
     - File renaming (contract.pdf → ACME-MSA-v2.pdf)
     - Report generation

4. **Download Results**
   - Once processing completes, three download options are available:
     - **DOCX File**: Editable document format
     - **Structured PDF**: PDF with applied Bates numbers
     - **Processing Log**: Detailed processing report with timestamps

## Features Demonstrated

### Visual Timeline
- ✅ Real-time progress indicators
- ✅ Step-by-step processing visualization
- ✅ Animated status icons for each stage

### File Management
- ✅ Before/after thumbnail previews for images
- ✅ File size and type information display
- ✅ Processing status indicators

### Document Processing Simulation
- ✅ File renaming logic (contract.pdf → ACME-MSA-v2.pdf)
- ✅ Bates stamping simulation (range 000100-000125)
- ✅ Format conversion (PDF/JPG → DOCX)
- ✅ Structured PDF generation

### Logging & Reporting
- ✅ Timestamped processing logs
- ✅ Multiple log levels (info, success)
- ✅ Downloadable log files
- ✅ Action tracking and history

### Download System
- ✅ Blob-based file generation for demonstration
- ✅ Multiple output formats
- ✅ Realistic file naming conventions

## Mock Data

The application uses realistic mock data located in:
- `/public/sample/contract.pdf` - Sample PDF for testing
- `/public/mock/response.json` - Simulated API response with processing results

## Environment Configuration

Copy `env.example` to `.env.local` and configure:
```bash
NEXT_PUBLIC_LV_API_URL=https://api.example.com
NEXT_PUBLIC_LV_API_KEY=your_api_key_here
NEXT_PUBLIC_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_REGION=us-east-1
```

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **File Operations**: File-saver for download functionality
- **State Management**: React hooks (useState, useCallback)

## Target Personas

This application is designed for:
- **Legal Teams**: Document conversion with Bates numbering
- **Administrative Staff**: Bulk document processing and renaming
- **Enterprise Users**: Document routing and logging for compliance
- **Document Managers**: Format standardization and archival workflows
