import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import { useState } from 'react';

function Hello() {
  const [filePath, setFilePath] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileExplorer = async () => {
    // Use the secure API exposed by the preload script
    const selectedFilePath = await window.electron.openFile();
    if (selectedFilePath) {
      setFilePath(selectedFilePath);
      console.log('Selected file path:', selectedFilePath);
    }
  };

  const handleButton = () => {
    console.log('Analyzing file:', filePath);
    if (filePath) {
      window.electron.analyze(filePath);
    }
  };

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
