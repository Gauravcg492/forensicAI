# Forensic AI Reporter

A desktop application that leverages AI (OpenAI GPT and Google Gemini) to analyze forensic evidence and generate detailed reports.

## Features

- Support for multiple AI providers (OpenAI GPT and Google Gemini)
- Custom prompt input for specialized analysis
- Real-time progress tracking
- PDF report generation
- Sleek modern desktop interface

## Prerequisites

- Node.js (v14 or higher)
- npm
- sluethkit
- OpenAI API key and/or Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Gauravcg492/forensicAI.git
cd forensicAI
```

2. Install dependencies:
```bash
npm install
```
For sleuthkit refer to : <https://github.com/sleuthkit/sleuthkit>

3. Create a `.env` file in the root directory and add your API keys:
```env
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
```

## Usage

1. Start the application in development mode:
```bash
npm start
```

## How it Works

1. Select your preferred AI provider (OpenAI or Gemini)
2. Upload a forensic evidence file using the file picker
3. (Optional) Enter a custom prompt for specialized analysis
4. Click "Analyze" to begin the analysis
5. Monitor real-time progress
6. View and save the generated PDF report

## Project Structure

```
forensicAI/
.
├── assets
│   ├── assets.d.ts
|   |── ...
│   ├── icons
│   │   ├── ...
│   │   └── disk.png
│   └── prompts
│       ├── get_fls.txt
│       ├── get_fsstat.txt
│       ├── get_icat.txt
│       ├── get_report.txt
│       └── get_tool_report.txt
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── release
│   └── app
│       ├── package-lock.json
│       └── package.json
├── src
│   ├── __tests__
│   │   └── App.test.tsx
│   ├── main
│   │   ├── analyze.ts
│   │   ├── gen-ai
│   │   │   ├── ai.ts
│   │   │   ├── gemini.ts
│   │   │   ├── gen-ai.ts
│   │   │   └── gpt.ts
│   │   ├── main.ts
│   │   ├── menu.ts
│   │   ├── preload.ts
│   │   ├── util.ts
│   │   └── utilities.ts
│   └── renderer
│       ├── App.css
│       ├── App.tsx
│       ├── index.ejs
│       ├── index.tsx
│       └── preload.d.ts
└── tsconfig.json
```

## Technologies Used

- Electron
- React
- TypeScript
- OpenAI API
- Google Gemini API
- Slueth Kit

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Initial Boilerplate - [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- OpenAI for GPT API - <https://www.npmjs.com/package/openapi>
- Google for Gemini API - <https://ai.google.dev/gemini-api/docs#javascript>
- SluethKit - <https://github.com/sleuthkit/sleuthkit>
