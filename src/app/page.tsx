'use client';

import { useState } from 'react';
import PDFViewer from '../components/PDFViewer';
import './globals.css';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div>
            <h1>PDF Viewer</h1>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            {file && <PDFViewer file={URL.createObjectURL(file)} />}
        </div>
    );
}
