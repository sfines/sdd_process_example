# Deployment Instructions

## Pushing Code to GitHub

Since the GitHub integration doesn't support write operations, follow these manual steps:

### Step 1: Download/Copy Files from Figma Make

You'll need to manually copy these files from Figma Make:

**Main App:**
- `/App.tsx`

**Components:**
- `/components/HomePage.tsx`
- `/components/RoomView.tsx`
- `/components/DiceRoller.tsx`
- `/components/RollHistory.tsx`
- `/components/PlayerList.tsx`
- `/components/RoomSettings.tsx`
- `/components/PermalinkPage.tsx`
- All `/components/ui/*` files (shadcn components)

**Backend:**
- `/supabase/functions/server/index.tsx`

**Styles:**
- `/styles/globals.css`

**Protected files (reference only, don't copy):**
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`
- `/components/figma/ImageWithFallback.tsx`

**Generated files:**
- `/README.md`
- `/.gitignore`
- `/DEPLOYMENT.md` (this file)

### Step 2: Clone the Target Repository

```bash
# Clone the repository
git clone https://github.com/sfines/sdd_process_example.git
cd sdd_process_example
```

### Step 3: Create Feature Branch

```bash
# Create and switch to the new branch
git checkout -b feature/figma-design-implementation
```

### Step 4: Copy Files

Copy all the files from Figma Make into the cloned repository, maintaining the directory structure:

```
sdd_process_example/
├── App.tsx
├── README.md
├── .gitignore
├── DEPLOYMENT.md
├── components/
│   ├── HomePage.tsx
│   ├── RoomView.tsx
│   ├── DiceRoller.tsx
│   ├── RollHistory.tsx
│   ├── PlayerList.tsx
│   ├── RoomSettings.tsx
│   ├── PermalinkPage.tsx
│   └── ui/
│       └── [all shadcn components]
├── supabase/
│   └── functions/
│       └── server/
│           └── index.tsx
└── styles/
    └── globals.css
```

### Step 5: Stage and Commit

```bash
# Add all new files
git add .

# Commit with descriptive message
git commit -m "feat: implement D&D Dice Roller from Figma design

- Add mobile-first multiplayer dice rolling interface
- Implement real-time room synchronization
- Add DM-led mode with hidden rolls
- Support all D&D dice types (d4-d100)
- Add advantage/disadvantage mechanics
- Implement DC system with pass/fail indicators
- Add roll history and permalinks
- Create Supabase backend with Hono server
- Include complete documentation"
```

### Step 6: Push to GitHub

```bash
# Push the branch to GitHub
git push -u origin feature/figma-design-implementation
```

### Step 7: Create Pull Request

1. Go to https://github.com/sfines/sdd_process_example
2. Click "Compare & pull request" for your new branch
3. Add a description of the changes
4. Submit the pull request

---

## Alternative: Using GitHub Desktop

If you prefer a GUI:

1. **Clone with GitHub Desktop:**
   - Open GitHub Desktop
   - File → Clone Repository
   - Enter: `sfines/sdd_process_example`

2. **Create Branch:**
   - Click "Current Branch" dropdown
   - Click "New Branch"
   - Name it: `feature/figma-design-implementation`

3. **Copy Files:**
   - Manually copy all files from Figma Make to the repository folder

4. **Commit:**
   - Review changes in GitHub Desktop
   - Add commit message
   - Click "Commit to feature/figma-design-implementation"

5. **Push:**
   - Click "Push origin"

6. **Create PR:**
   - Click "Create Pull Request" in GitHub Desktop
   - Or visit the GitHub website

---

## Setting Up for Development

After cloning the repo, you'll need to:

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Supabase

This project requires Supabase for the backend. You'll need to:

1. Create a Supabase project at https://supabase.com
2. Set up environment variables:
   ```bash
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Deploy the Edge Function:
   ```bash
   supabase functions deploy make-server-3028a7ac
   ```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

---

## Production Deployment

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist` or `build`
3. Add environment variables (Supabase keys)
4. Deploy

### Backend Deployment (Supabase Edge Functions)

The backend is already configured for Supabase Edge Functions. Deploy with:

```bash
supabase functions deploy make-server-3028a7ac
```

---

## Notes

- The Figma Make version uses protected system files that won't be included in the export
- You may need to recreate some Supabase-specific configurations
- Ensure all environment variables are properly set in your deployment environment
- The app uses polling for real-time updates; consider upgrading to WebSockets for production

---

**Questions?** Check the main README.md for architecture details and API documentation.
