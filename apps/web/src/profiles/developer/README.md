# Developer Profile

Developer-focused profile showcasing technical skills, code examples, and engineering achievements.

## Structure

```
developer/
├── index.tsx              # Main profile component
├── sections/              # Profile sections
│   ├── Hero.tsx
│   ├── About.tsx          # Code editor section
│   ├── Experience.tsx
│   ├── Skills.tsx
│   ├── Education.tsx
│   ├── Achievements.tsx
│   └── Contact.tsx
├── components/            # Profile-specific components
│   └── CodeEditor.tsx     # Monaco editor with terminal
├── data/                  # Profile data
│   └── experience.ts
└── config.ts             # Profile configuration
```

## Features

- **Code Editor**: Interactive Python code editor with syntax highlighting
- **Terminal Output**: Real-time streaming terminal output (stdout/stderr) via SSE
- **Video Carousel**: Background video carousel in hero section
- **Experience Cards**: Expandable experience cards

## How execution works

- **API**: `POST /api/code/run/stream` (Server-Sent Events)
- **Frontend**: `useCodeExecution` streams events and renders them in `Terminal`
