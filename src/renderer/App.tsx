import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { useState } from 'react';

function Hello() {
  const [filePath, setFilePath] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const handleFileExplorer = async () => {
    // Use the secure API exposed by the preload script
    const selectedFilePath = await window.electron.openFile();
    if (selectedFilePath) {
      setFilePath(selectedFilePath);
      console.log('Selected file path:', selectedFilePath);
    }
  };

  const handleButton = async () => {
    console.log('Analyzing file:', filePath);
    console.log('Custom Prompt:', customPrompt);
    if (filePath) {
      setIsAnalyzing(true);
      window.electron.analyze(filePath, customPrompt).then((message) => {
        setMessage(message);
        setIsAnalyzing(false);
      });
    }
  };

  if (isAnalyzing) {
    // Render a loading spinner or message while analyzing
    return (
      <div className="loading">
        <h1>Analyzing...</h1>
        <div className="spinner"></div>
        <p>Please wait while the analysis is being performed.</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="fullscreen-pdf">
        <button type="button" onClick={() => setMessage('')} className="back-button">
          Back
        </button>
        <embed src={message} type="application/pdf" />
      </div>
    );
  }

  return (
    <div>
      <div className="main">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Forensic AI</h1>
      <div className="main">
        <button type="button" onClick={handleFileExplorer}>
          Browse File
        </button>
        <p>Selected File Path: {filePath}</p>
        <textarea
          placeholder="Enter custom prompt here..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={4}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button type="button" onClick={handleButton}>
          Analyze
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
