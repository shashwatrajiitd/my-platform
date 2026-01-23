# Portfolio Web - Next.js Frontend

Production-grade Next.js frontend with App Router and TypeScript.

## Architecture

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout (Netflix shell)
│   │   ├── page.tsx           # Profile selection screen
│   │   └── profile/
│   │       └── [profileId]/   # Dynamic profile routes
│   │
│   ├── profiles/               # CORE DOMAIN - Profile isolation
│   │   ├── developer/
│   │   ├── recruiter/
│   │   ├── stalker/
│   │   └── adventurer/
│   │
│   ├── components/             # Shared components
│   │   ├── netflix/           # Netflix-style UI components
│   │   └── shared/            # Common components
│   │
│   ├── services/              # API clients
│   │   ├── api-client.ts      # API base-url + helpers
│   │   └── rag-client.ts      # RAG SSE client
│   │
│   ├── styles/                # Global styles
│   │   ├── globals.css
│   │   └── netflix-theme.css
│   │
│   └── config/                # Configuration
│       ├── profiles.ts        # Profile definitions
│       └── routes.ts          # Route constants
│
└── public/                    # Static assets
```

## Profile Isolation

Each profile is a self-contained domain with:
- `layout/` - Profile-specific layouts
- `sections/` - Profile sections (About, Experience, etc.)
- `components/` - Profile-specific components
- `data/` - Profile data and content
- `config.ts` - Profile configuration

## Development

```bash
npm run dev
```

## Key integrations

- **RAG (SSE)**: `apps/web/src/services/rag-client.ts` → `/api/rag/chat`
- **Python execution (SSE)**: Developer IDE uses `/api/code/run/stream`
- **Drag-to-scroll carousel**: custom draggable scrollbar in `ContinueWatchingPreview`
