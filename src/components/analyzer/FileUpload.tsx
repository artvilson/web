import React, { useCallback, useRef, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAnalyzerStore } from '@/lib/analyzer/store';

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const processFiles = useAnalyzerStore(s => s.processFiles);
  const isProcessing = useAnalyzerStore(s => s.isProcessing);
  const progress = useAnalyzerStore(s => s.processingProgress);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf'
    );
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        f => f.type === 'application/pdf'
      );
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    await processFiles(selectedFiles);
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-400 bg-gray-800/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className={`mx-auto mb-3 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} size={40} />
        <p className="text-lg font-medium text-gray-200">
          Drop PDF files here or click to browse
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Supports bank statements, 1095 forms, and other PDF documents
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Upload 10+ files at once • Chase statements auto-detected
        </p>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-700/30">
                <div className="flex items-center gap-2 min-w-0">
                  <File size={14} className="text-red-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {(file.size / 1024).toFixed(0)}KB
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="text-gray-500 hover:text-gray-300 flex-shrink-0 ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full mt-3 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isProcessing ? 'Processing...' : `Upload & Parse ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Processing progress */}
      {isProcessing && progress && (
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-gray-300">
              Processing {progress.current} of {progress.total}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate">{progress.filename}</p>
          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function StatementsSummary() {
  const statements = useAnalyzerStore(s => s.getActiveProjectStatements());

  if (statements.length === 0) return null;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Parsed Statements</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {statements.map(s => (
          <div key={s.id} className="flex items-start justify-between py-2 px-3 rounded-lg bg-gray-700/30">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {s.warnings.length > 0 ? (
                  <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                ) : (
                  <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-200 truncate">{s.uploaded_filename}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>{s.bank}</span>
                {s.account_hint && <span>...{s.account_hint}</span>}
                <span>{s.transaction_count} txns</span>
                {s.period_start && (
                  <span>{s.period_start} to {s.period_end}</span>
                )}
              </div>
              {s.warnings.length > 0 && (
                <div className="mt-1">
                  {s.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-400/80">{w}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-xs text-green-400">+${s.total_in.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-red-400">-${s.total_out.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
