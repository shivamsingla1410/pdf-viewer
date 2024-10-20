'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useSpring, animated } from 'react-spring';

// Set the workerSrc to the local file path
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

interface PDFViewerProps {
  file: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePrevious = () => {
    if (pageNumber > 1) {
      setFlipDirection('left');
      setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
    }
  };

  const handleNext = () => {
    if (pageNumber < (numPages ?? 1)) {
      setFlipDirection('right');
      setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages ?? 1));
    }
  };

  const handleBookmark = () => {
    if (!bookmarks.includes(pageNumber)) {
      setBookmarks([...bookmarks, pageNumber]);
    }
  };

  const handleJumpToPage = (page: number) => {
    setFlipDirection(page > pageNumber ? 'right' : 'left');
    setPageNumber(page);
  };

  const [props, set] = useSpring(() => ({
    transform: 'rotateY(0deg)',
  }));

  useEffect(() => {
    set({
      transform: flipDirection === 'right' ? 'rotateY(0deg)' : 'rotateY(0deg)',
      from: { transform: flipDirection === 'right' ? 'rotateY(-180deg)' : 'rotateY(180deg)' },
      reset: true,
      config: { duration: 500 },
    });
  }, [pageNumber]);

  return (
    <div className="pdf-viewer">
      <div className="navigation">
        <button onClick={handlePrevious} disabled={pageNumber <= 1}>Previous</button>
        <span>{pageNumber} / {numPages}</span>
        <button onClick={handleNext} disabled={pageNumber >= (numPages ?? 1)}>Next</button>
        <button onClick={handleBookmark}>Bookmark</button>
      </div>
      <animated.div style={props} className="page-container">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      </animated.div>
      <div className="bookmarks">
        <h3>Bookmarks</h3>
        <ul>
          {bookmarks.map((page, index) => (
            <li key={index} onClick={() => handleJumpToPage(page)}>Page {page}</li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .pdf-viewer {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .navigation {
          margin-top: 10px;
        }
        .page-container {
          width: 100%;
          max-width: 600px;
          border: 1px solid #ccc;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transform-style: preserve-3d;
          perspective: 1000px;
          margin-top: 10px;
        }
        .bookmarks {
          margin-top: 20px;
        }
        .bookmarks ul {
          list-style-type: none;
          padding: 0;
        }
        .bookmarks li {
          cursor: pointer;
          color: blue;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;
