import { pdfjs } from 'react-pdf';

// Use webpack's public path to load the worker
const pdfjsWorker = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
