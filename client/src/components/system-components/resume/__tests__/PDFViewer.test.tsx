import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PDFViewer from '../PDFViewer';

// Mock react-pdf
vi.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess, file }: any) => {
    // Simulate successful load
    setTimeout(() => {
      onLoadSuccess?.({ numPages: 2 });
    }, 100);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, scale }: any) => (
    <div data-testid={`pdf-page-${pageNumber}`} data-scale={scale}>
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  },
}));

describe('PDFViewer Component', () => {
  const mockPdfUrl = 'blob:mock-pdf-url';
  const defaultProps = {
    pdfUrl: mockPdfUrl,
    title: 'Test Resume',
    subtitle: 'Test Subtitle',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PDFViewer {...defaultProps} />);
    expect(screen.getByText('Test Resume')).toBeInTheDocument();
  });

  it('displays title and subtitle', () => {
    render(<PDFViewer {...defaultProps} />);
    expect(screen.getByText('Test Resume')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders PDF document', async () => {
    render(<PDFViewer {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });
  });

  it('loads PDF document successfully', async () => {
    render(<PDFViewer {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    });
  });

  it('displays badge when provided', () => {
    render(
      <PDFViewer
        {...defaultProps}
        badge={{ text: 'Original', color: 'blue' }}
      />
    );
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('shows download button when enabled', () => {
    render(<PDFViewer {...defaultProps} enableDownload={true} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('hides download button when disabled', () => {
    render(<PDFViewer {...defaultProps} enableDownload={false} />);
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  it('displays navigation controls after PDF loads', async () => {
    render(<PDFViewer {...defaultProps} enableNavigation={true} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    });
  });

  it('displays zoom controls after PDF loads', async () => {
    render(<PDFViewer {...defaultProps} enableZoom={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('accepts pdfFile prop instead of pdfUrl', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    render(<PDFViewer pdfFile={mockFile} title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onLoadSuccess callback when PDF loads', async () => {
    const onLoadSuccess = vi.fn();
    render(<PDFViewer {...defaultProps} onLoadSuccess={onLoadSuccess} />);
    
    await waitFor(() => {
      expect(onLoadSuccess).toHaveBeenCalledWith(2);
    });
  });

  it('displays keyboard shortcuts help', () => {
    render(<PDFViewer {...defaultProps} />);
    expect(screen.getByText(/Shortcuts:/)).toBeInTheDocument();
  });
});
