# Automated Document Workflows

A comprehensive document processing application that handles end-to-end document automation including format conversion, layout preservation, routing, logging, and integration simulation.

## Features

- **Document Upload**: Support for PDF, JPG, and PNG files
- **Format Conversion**: Convert scanned documents to DOCX and structured PDFs
- **Bates Numbering**: Automatic application of Bates stamps for legal document tracking
- **File Renaming**: Intelligent file renaming based on processing rules
- **Processing Timeline**: Real-time visual feedback of document processing steps
- **Logging System**: Comprehensive logging with timestamps and status tracking
- **Download Management**: Generate and download processed documents and logs

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Operations**: File-saver for download functionality
- **State Management**: React hooks (useState, useCallback)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd automated-document-workflows
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Update the environment variables with your actual values:
   - `NEXT_PUBLIC_LV_API_URL`: Your API endpoint
   - `NEXT_PUBLIC_LV_API_KEY`: Your API key
   - `NEXT_PUBLIC_STORAGE_BUCKET`: Storage bucket name
   - `NEXT_PUBLIC_REGION`: AWS region or equivalent

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
automated-document-workflows/
├── src/
│   └── app/
│       ├── layout.tsx          # Root layout component
│       ├── page.tsx            # Main document processing interface
│       └── globals.css         # Global styles
├── public/
│   ├── sample/
│   │   └── contract.pdf        # Sample PDF for testing
│   └── mock/
│       └── response.json       # Mock API response data
├── manifest.json               # Application manifest
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## Usage

### Document Upload
1. Click "Choose files" or drag and drop documents into the upload area
2. Supported formats: PDF, JPG, PNG
3. Multiple files can be uploaded simultaneously

### Document Processing
1. After uploading files, click "Process Documents"
2. Watch the real-time processing timeline with status updates
3. Processing includes:
   - Document structure analysis
   - Format conversion to DOCX
   - Bates numbering application
   - File renaming according to rules
   - Report generation

### Download Results
Once processing is complete, download:
- **DOCX File**: Editable document format
- **Structured PDF**: PDF with Bates numbers applied
- **Processing Log**: Detailed processing report with timestamps

## API Integration

The application is designed to integrate with external APIs for:
- Document conversion services
- Cloud storage platforms
- Enterprise document management systems

Mock data is provided for development and demonstration purposes.

## Mock Data Structure

### Response Format (`/public/mock/response.json`)
```json
{
  "actions": [
    {
      "type": "rename",
      "from": "contract.pdf",
      "to": "ACME-MSA-v2.pdf"
    },
    {
      "type": "bates",
      "range": "000100-000125"
    },
    {
      "type": "convert",
      "to": "DOCX",
      "pages": 12
    }
  ],
  "logs": [
    {
      "ts": "2025-09-16T12:00:00Z",
      "level": "info",
      "msg": "Converted to DOCX"
    }
  ]
}
```

## Features in Detail

### Timeline Visualization
- Real-time progress indicators
- Step-by-step processing visualization
- Status icons for each processing stage

### File Management
- Before/after thumbnail previews
- File size and type information
- Processing status indicators

### Download System
- Simulated file generation using Blob API
- Multiple output formats
- Comprehensive logging files

## Target Use Cases

- **Legal Teams**: Document conversion with Bates numbering
- **Administrative Workflows**: Bulk document processing and renaming
- **Enterprise Integration**: Document routing and logging for compliance
- **Document Management**: Format standardization and archival

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
