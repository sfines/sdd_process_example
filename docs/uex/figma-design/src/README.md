# D&D Dice Roller - Multiplayer Real-Time Dice Rolling

A mobile-first, web-based multiplayer D&D dice roller with complete transparency and zero-friction entry. Built with React, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- 🎲 **Real-time dice rolling** - All players see rolls instantly
- 👥 **Multiplayer rooms** - Create or join rooms with simple codes (e.g., ALPHA-1234)
- 🔒 **Zero friction** - No accounts needed, just create/join and play
- 📜 **Complete roll history** - Every roll is recorded and visible to all
- 🔗 **Permalinks** - Share cryptographically verified roll results
- 🎯 **DC (Difficulty Check) system** - Set target numbers for pass/fail indicators

### Advanced Features
- 🎭 **DM-led mode** - Promote rooms to have a Dungeon Master with special abilities
- 👁️ **Hidden rolls** - DMs can make secret rolls and reveal them later
- ⚔️ **Advantage/Disadvantage** - Full D&D 5e mechanics support
- 🎲 **All dice types** - d4, d6, d8, d10, d12, d20, d100
- ⚡ **Quick presets** - Save common roll configurations
- 📱 **Mobile-first design** - Optimized for phone use during game sessions
- 🌙 **Dark theme** - Gaming-aesthetic dark mode with high contrast

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Backend**: Supabase Edge Functions (Hono web server)
- **Database**: Supabase KV Store
- **Real-time**: Polling-based updates (2s intervals)

## Project Structure

```
/
├── App.tsx                          # Main app with routing
├── components/
│   ├── HomePage.tsx                 # Landing page with create/join
│   ├── RoomView.tsx                 # Main game interface
│   ├── DiceRoller.tsx              # Dice rolling component
│   ├── RollHistory.tsx             # Roll feed display
│   ├── PlayerList.tsx              # Player drawer
│   ├── RoomSettings.tsx            # Room management
│   ├── PermalinkPage.tsx           # Public roll verification
│   └── ui/                         # shadcn/ui components
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx           # Hono web server
│           └── kv_store.tsx        # KV database utilities (protected)
├── utils/
│   └── supabase/
│       └── info.tsx                # Supabase config (protected)
└── styles/
    └── globals.css                 # Global styles & theme
```

## API Endpoints

The backend server runs on Supabase Edge Functions:

- `POST /make-server-3028a7ac/rooms/create` - Create new room
- `POST /make-server-3028a7ac/rooms/join` - Join existing room
- `GET /make-server-3028a7ac/rooms/:roomCode` - Get room data
- `GET /make-server-3028a7ac/rooms/:roomCode/players` - Get players in room
- `POST /make-server-3028a7ac/rooms/:roomCode/presence` - Update player presence
- `POST /make-server-3028a7ac/rooms/:roomCode/roll` - Create new roll
- `GET /make-server-3028a7ac/rooms/:roomCode/rolls` - Get all rolls
- `POST /make-server-3028a7ac/rooms/:roomCode/rolls/:rollId/reveal` - Reveal hidden roll
- `POST /make-server-3028a7ac/rooms/:roomCode/dc` - Set/clear DC
- `POST /make-server-3028a7ac/rooms/:roomCode/promote` - Promote to DM-led
- `POST /make-server-3028a7ac/rooms/:roomCode/close` - Close room
- `GET /make-server-3028a7ac/rolls/:rollId` - Get single roll (for permalinks)

## User Flows

### Create Room (Target: 15 seconds)
1. Click "Create Room"
2. Enter player name
3. Get room code
4. Copy & share link

### Join Room
1. Click "Join Room"
2. Enter room code & player name
3. Instant entry to game

### Roll Dice (Target: 1-2 seconds)
1. Set modifier (simple mode) or configure dice (advanced mode)
2. Click "Roll"
3. Result appears instantly for all players

### DM Hidden Roll (Target: 3 seconds)
1. Toggle "Hidden Roll"
2. Roll dice
3. Result visible only to DM
4. Click "Reveal" when ready

## Design Philosophy

**"Get out of the way"** - The interface is designed to be invisible during gameplay. Players should think about their game, not the tool.

**Trust through transparency** - All rolls are visible with complete history. Permalinks provide cryptographic verification that rolls cannot be altered.

## Accessibility

- ✅ WCAG AA compliant high contrast
- ✅ Minimum 44px touch targets
- ✅ Keyboard navigation support
- ✅ Screen reader friendly (ARIA labels)
- ✅ Focus indicators on all interactive elements

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## Development Notes

### Protected Files
Do not modify these system files:
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`
- `/components/figma/ImageWithFallback.tsx`

### Environment Variables
The following Supabase secrets are pre-configured:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

### Real-time Updates
The app uses polling (2s intervals) for real-time sync. Player presence is updated every 5 seconds, with a 15-second timeout for online status.

## Deployment

This app is built on **Figma Make** and is designed for rapid prototyping. For production deployment:

1. Export code from Figma Make
2. Set up Supabase project with Edge Functions
3. Configure environment variables
4. Deploy frontend to hosting service (Vercel, Netlify, etc.)
5. Deploy backend to Supabase Edge Functions

## Known Limitations

- **Ephemeral rooms** - Rooms are temporary and will expire
- **No authentication** - No user accounts or profiles
- **Prototype-grade** - Built for rapid prototyping, not production scale
- **PII warning** - Not designed for collecting personally identifiable information

## Future Enhancements

Potential improvements for production:
- WebSocket-based real-time instead of polling
- Persistent room storage with TTL
- Room history export
- Custom dice roll sounds
- Dice roll animations
- Mobile app versions (React Native)
- Multiple DM support
- Room passwords/privacy controls

## License

Built with Figma Make - for prototyping and demonstration purposes.

## Support

For issues or questions about Figma Make, visit the Figma Make documentation.

---

**Roll with confidence. Trust through transparency.** 🎲
