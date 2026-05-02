import { type ReactElement, useRef } from 'react';
import type { UploadedFile } from '../../../types/resume.types';

interface FileUploadSectionProps {
  uploadedFile?: UploadedFile;
  loading: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onClearFile: () => void;
}

function FileUploadSection({
  uploadedFile,
  loading,
  onFileUpload,
  onClearFile,
}: FileUploadSectionProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onFileUpload(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await onFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-lg backdrop-blur">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
            <svg className="h-5 w-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Upload Resume</h2>
            <p className="text-sm text-slate-400">PDF, DOCX, or TXT (Max 10MB)</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!uploadedFile ? (
          <div
            className="relative cursor-pointer rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center transition hover:border-purple-400/50 hover:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-400/10">
              <svg className="h-8 w-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-medium text-white">
              Click to upload or drag and drop
            </p>
            <p className="mt-2 text-xs text-slate-400">
              PDF, DOCX, or TXT up to 10MB
            </p>

            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
                <span className="text-sm text-purple-300">Processing...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20">
                  <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-emerald-100">{uploadedFile.name}</p>
                  <p className="mt-1 text-sm text-emerald-200/70">
                    {formatFileSize(uploadedFile.size)} • {uploadedFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClearFile}
                className="shrink-0 rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-400/20"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FileUploadSection;
