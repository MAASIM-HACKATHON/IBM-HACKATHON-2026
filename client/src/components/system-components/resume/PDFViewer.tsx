/**
 * PDFViewer Component
 * Professional PDF viewer with zoom, navigation, and download controls
 */

import { useState, useCallback, useEffect, type ReactElement } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import toast from 'react-hot-toast';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF.js worker - use local worker from node_modules
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Props interface
export interface PDFViewerProps {
  // PDF Source (one required)
  pdfUrl?: string;
  pdfFile?: File;
  
  // Display Options
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    color: 'blue' | 'green' | 'purple' | 'yellow' | 'emerald';
  };
  
  // Behavior
  initialScale?: number;
  initialPage?: number;
  enableDownload?: boolean;
  enableZoom?: boolean;
  enableNavigation?: boolean;
  
  // Callbacks
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
  onPageChange?: (page: number) => void;
  onZoomChange?: (scale: number) => void;
  
  // Styling
  className?: string;
  height?: string | number;
}

// Zoom levels
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const DEFAULT_SCALE = 1.0;

function PDFViewer({
  pdfUrl,
  pdfFile,
  title,
  subtitle,
  badge,
  initialScale = DEFAULT_SCALE,
  initialPage = 1,
  enableDownload = true,
  enableZoom = true,
  enableNavigation = true,
  onLoadSuccess,
  onLoadError,
  onPageChange,
  onZoomChange,
  className = '',
  height = '700px',
}: PDFViewerProps): ReactElement {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(initialScale);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Get PDF source
  const pdfSource = pdfFile || pdfUrl;

  // Handle successful PDF load
  const handleLoadSuccess = useCallback(
    ({ numPages: loadedPages }: { numPages: number }) => {
      setNumPages(loadedPages);
      setIsLoading(false);
      setError(null);
      setRetryCount(0);
      onLoadSuccess?.(loadedPages);
      toast.success('PDF loaded successfully');
    },
    [onLoadSuccess]
  );

  // Handle PDF load error
  const handleLoadError = useCallback(
    (err: Error) => {
      console.error('PDF load error:', err);
      setIsLoading(false);
      setError(err.message || 'Failed to load PDF');
      onLoadError?.(err);
      
      if (retryCount < 3) {
        toast.error(`Failed to load PDF. Retrying... (${retryCount + 1}/3)`);
      } else {
        toast.error('Failed to load PDF after multiple attempts');
      }
    },
    [onLoadError, retryCount]
  );

  // Retry loading
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  }, []);

  // Navigation handlers
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  }, [currentPage, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (numPages && currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  }, [currentPage, numPages, onPageChange]);

  const goToPage = useCallback(
    (page: number) => {
      if (numPages && page >= 1 && page <= numPages) {
        setCurrentPage(page);
        onPageChange?.(page);
      }
    },
    [numPages, onPageChange]
  );

  // Zoom handlers
  const zoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(scale);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      const newScale = ZOOM_LEVELS[currentIndex + 1];
      if (newScale !== undefined) {
        setScale(newScale);
        onZoomChange?.(newScale);
        toast.success(`Zoom: ${Math.round(newScale * 100)}%`);
      }
    }
  }, [scale, onZoomChange]);

  const zoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(scale);
    if (currentIndex > 0) {
      const newScale = ZOOM_LEVELS[currentIndex - 1];
      if (newScale !== undefined) {
        setScale(newScale);
        onZoomChange?.(newScale);
        toast.success(`Zoom: ${Math.round(newScale * 100)}%`);
      }
    }
  }, [scale, onZoomChange]);

  const resetZoom = useCallback(() => {
    setScale(DEFAULT_SCALE);
    onZoomChange?.(DEFAULT_SCALE);
    toast.success('Zoom reset to 100%');
  }, [onZoomChange]);

  // Download handler
  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } else if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    }
  }, [pdfUrl, pdfFile, title]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'Home':
          e.preventDefault();
          goToPage(1);
          break;
        case 'End':
          e.preventDefault();
          if (numPages) goToPage(numPages);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousPage, goToNextPage, zoomIn, zoomOut, resetZoom, goToPage, numPages]);

  // Badge color classes
  const badgeColors = {
    blue: 'bg-blue-400/20 text-blue-300',
    green: 'bg-green-400/20 text-green-300',
    purple: 'bg-purple-400/20 text-purple-300',
    yellow: 'bg-yellow-400/20 text-yellow-300',
    emerald: 'bg-emerald-400/20 text-emerald-300',
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          {badge && (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${badgeColors[badge.color]}`}>
              {badge.text}
            </span>
          )}
        </div>

        {/* Download Button */}
        {enableDownload && (
          <button
            onClick={handleDownload}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            type="button"
            title="Download PDF"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </span>
          </button>
        )}
      </div>

      {/* Controls */}
      {(enableNavigation || enableZoom) && !error && numPages && (
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/30 px-4 py-2">
          {/* Navigation Controls */}
          {enableNavigation && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-200 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
                title="Previous page (←)"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-xs text-slate-300 min-w-[80px] text-center">
                Page {currentPage} of {numPages}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-200 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
                title="Next page (→)"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          {enableZoom && (
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                disabled={scale <= (ZOOM_LEVELS[0] ?? 0.25)}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-200 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
                title="Zoom out (-)"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <button
                onClick={resetZoom}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/10 min-w-[60px]"
                type="button"
                title="Reset zoom (0)"
              >
                {Math.round(scale * 100)}%
              </button>
              
              <button
                onClick={zoomIn}
                disabled={scale >= (ZOOM_LEVELS[ZOOM_LEVELS.length - 1] ?? 2.0)}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-200 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
                title="Zoom in (+)"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* PDF Content */}
      <div
        className="flex-1 overflow-auto bg-slate-900/20"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {error ? (
          // Error State
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-400/10 p-3">
                  <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Failed to Load PDF</h3>
              <p className="mb-4 text-sm text-slate-400">{error}</p>
              <button
                onClick={handleRetry}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                type="button"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          // PDF Document
          <div className="flex justify-center p-4">
            <Document
              file={pdfSource}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
                    <p className="text-sm text-slate-400">Loading PDF...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm text-red-400">Error loading PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
                  </div>
                }
                className="shadow-lg"
              />
            </Document>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="border-t border-white/10 bg-slate-900/30 px-4 py-2">
        <p className="text-xs text-slate-500">
          <span className="font-medium">Shortcuts:</span> ← → (navigate) | + - (zoom) | 0 (reset) | Home/End (first/last page)
        </p>
      </div>
    </div>
  );
}

export default PDFViewer;

// Made with Bob