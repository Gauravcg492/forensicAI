import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import diskIcon from '../../assets/icons/disk.png';
import './App.css';
import { useState } from 'react';

function Hello() {
  const [filePath, setFilePath] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [progress, setProgress] = useState<string[]>([]);

  window.electron.onProgress((message: string) => {
    let messages = [...progress, message]
    setProgress(messages.slice(-5))
  });

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
      setProgress([]);

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
        <div className="progress-container">
          <div className="progress-bar"></div>
        </div>
        <div className="progress-messages">
          {progress.map((msg, index) => (
            <p key={index} className={`progress-text ${index === progress.length - 1 ? 'latest-message' : ''}`}style={{ animationDelay: `${index * 0.2}s` }}>
              {msg}
            </p>
          ))}
        </div>
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
        <img width="100" alt="icon" src={icon} />
        <h1>Forensic AI</h1>
      </div>
      <div className="upload-container">
        <div className="upload-box">
          <img className='upload-icon' alt="icon" src={diskIcon} />
          <p className="upload-text" style={{ margin: '5px'}}>{filePath || 'Select file to analyze'}</p>
          <button type="button" className="upload-button" onClick={handleFileExplorer}>
            Select from device
          </button>
        </div>
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
