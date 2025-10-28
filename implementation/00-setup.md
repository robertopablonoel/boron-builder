# Task 00: Project Setup

⏱ **Estimated Time:** 2 hours

## Objectives

- Initialize Next.js 14 project with App Router
- Configure Tailwind CSS
- Set up TypeScript strict mode
- Install all required dependencies
- Configure environment variables
- Create base project structure

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Anthropic API key (get from https://console.anthropic.com/)

## Steps

### 1. Create Next.js Project

```bash
cd /Users/robertonoel/Desktop/repos/boron

# If starting fresh, run this (skip if you already have a Next.js project):
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Answer prompts:
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Turbopack? … No
```

### 2. Install Dependencies

```bash
npm install zustand zod @anthropic-ai/sdk
npm install -D @types/node
```

**Dependency breakdown:**
- `zustand` - State management (chat + funnel state)
- `zod` - Schema validation
- `@anthropic-ai/sdk` - Claude API client

### 3. Configure Environment Variables

Create `.env.local`:

```bash
cat > .env.local << 'EOF'
# Anthropic API Key
ANTHROPIC_API_KEY=your-api-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

**Important:** Add your actual Anthropic API key from https://console.anthropic.com/

### 4. Update `.gitignore`

Add to `.gitignore`:

```bash
cat >> .gitignore << 'EOF'

# Environment files
.env.local
.env.production

# IDE
.vscode/
.idea/

# Zustand persist storage (development)
.zustand-storage
EOF
```

### 5. Create Project Structure

```bash
# Create directories
mkdir -p app/api/chat
mkdir -p components/Builder
mkdir -p components/Renderer
mkdir -p components/Blocks
mkdir -p lib/store
mkdir -p lib/schemas
mkdir -p lib/prompts
mkdir -p lib/ai
mkdir -p public/placeholder-images
```

### 6. Configure TypeScript (Strict Mode)

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 7. Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
};
export default config;
```

### 8. Set Up Base Layout

Update `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boron Builder - AI Funnel Generator",
  description: "Build high-converting eCommerce funnels with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 9. Update Global Styles

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --border: 0 0% 89.8%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  color: rgb(var(--foreground));
  background: rgb(var(--background));
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

### 10. Create Temporary Homepage

Update `app/page.tsx`:

```typescript
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Boron Builder
        </h1>
        <p className="text-lg text-gray-600">
          Setup complete! Ready for implementation.
        </p>
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Next.js configured<br />
            ✓ Tailwind CSS ready<br />
            ✓ Dependencies installed<br />
            ✓ Project structure created
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 11. Test the Setup

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# You should see "Boron Builder - Setup complete!"
```

### 12. Verify API Key

Create a test file to verify Anthropic API key works:

```bash
cat > test-api.ts << 'EOF'
// Run: npx tsx test-api.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testAPI() {
  console.log('Testing Anthropic API...');

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: 'Say "API connection successful!"',
      },
    ],
  });

  console.log('Response:', response.content[0].text);
}

testAPI().catch(console.error);
EOF
```

```bash
# Install tsx for testing
npm install -D tsx

# Test API connection
npx tsx test-api.ts

# Expected output: "API connection successful!"
```

## Acceptance Criteria

- ✅ `npm run dev` starts without errors
- ✅ Browser shows homepage at http://localhost:3000
- ✅ TypeScript has no errors
- ✅ Tailwind CSS styles are applied
- ✅ All directories are created
- ✅ `.env.local` contains valid API key
- ✅ API test script runs successfully
- ✅ Project structure matches plan

## Project Structure Check

Your directory should look like this:

```
boron/
├── app/
│   ├── api/
│   │   └── chat/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Builder/
│   ├── Renderer/
│   └── Blocks/
├── lib/
│   ├── store/
│   ├── schemas/
│   ├── prompts/
│   └── ai/
├── public/
│   └── placeholder-images/
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Troubleshooting

### Error: "Cannot find module '@anthropic-ai/sdk'"

```bash
npm install @anthropic-ai/sdk
```

### Error: API key invalid

1. Check `.env.local` has correct key
2. Restart dev server after adding env vars
3. Get new key from https://console.anthropic.com/

### TypeScript errors

```bash
npm install -D @types/node
npm run build
```

## Next Steps

Once setup is complete and verified:
- ✅ Delete `test-api.ts` (no longer needed)
- ✅ Commit initial setup to git
- ➡️ **Proceed to Task 01: Schema Definitions**

## Quick Test Commands

```bash
# Check for TypeScript errors
npm run build

# Format code (if using prettier)
npx prettier --write .

# Check dependencies
npm list
```

---

**Status:** ✅ Complete this task before moving to Task 01
