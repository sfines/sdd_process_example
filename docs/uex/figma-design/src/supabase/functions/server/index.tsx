import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Room creation
app.post('/make-server-3028a7ac/rooms/create', async (c) => {
  try {
    const { roomCode, playerName } = await c.req.json();

    if (!roomCode || !playerName) {
      return c.json({ error: 'Missing roomCode or playerName' }, 400);
    }

    // Check if room already exists
    const existingRoom = await kv.get(`room:${roomCode}`);
    if (existingRoom) {
      return c.json({ error: 'Room code already exists' }, 409);
    }

    // Create room
    const roomData = {
      roomCode,
      mode: 'open',
      creator: playerName,
      createdAt: Date.now(),
    };

    await kv.set(`room:${roomCode}`, roomData);

    // Add creator as first player
    await kv.set(`room:${roomCode}:player:${playerName}`, {
      name: playerName,
      isOnline: true,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
    });

    return c.json(roomData);
  } catch (err) {
    console.error('Error creating room:', err);
    return c.json({ error: 'Failed to create room' }, 500);
  }
});

// Join room
app.post('/make-server-3028a7ac/rooms/join', async (c) => {
  try {
    const { roomCode, playerName } = await c.req.json();

    if (!roomCode || !playerName) {
      return c.json({ error: 'Missing roomCode or playerName' }, 400);
    }

    // Check if room exists
    const room = await kv.get(`room:${roomCode}`);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    // Add player
    await kv.set(`room:${roomCode}:player:${playerName}`, {
      name: playerName,
      isOnline: true,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
    });

    return c.json({ success: true });
  } catch (err) {
    console.error('Error joining room:', err);
    return c.json({ error: 'Failed to join room' }, 500);
  }
});

// Get room data
app.get('/make-server-3028a7ac/rooms/:roomCode', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const room = await kv.get(`room:${roomCode}`);

    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    return c.json(room);
  } catch (err) {
    console.error('Error getting room:', err);
    return c.json({ error: 'Failed to get room' }, 500);
  }
});

// Get players in room
app.get('/make-server-3028a7ac/rooms/:roomCode/players', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const room = await kv.get(`room:${roomCode}`);

    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    // Get all players
    const playerKeys = await kv.getByPrefix(`room:${roomCode}:player:`);
    const now = Date.now();
    const ONLINE_THRESHOLD = 15000; // 15 seconds

    const players = playerKeys.map((player: any) => ({
      name: player.name,
      isOnline: now - player.lastSeen < ONLINE_THRESHOLD,
      isDM: room.mode === 'dm-led' && player.name === room.dm,
    }));

    return c.json({ players });
  } catch (err) {
    console.error('Error getting players:', err);
    return c.json({ error: 'Failed to get players' }, 500);
  }
});

// Update player presence
app.post('/make-server-3028a7ac/rooms/:roomCode/presence', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const { playerName } = await c.req.json();

    const player = await kv.get(`room:${roomCode}:player:${playerName}`);
    if (player) {
      player.lastSeen = Date.now();
      player.isOnline = true;
      await kv.set(`room:${roomCode}:player:${playerName}`, player);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error('Error updating presence:', err);
    return c.json({ error: 'Failed to update presence' }, 500);
  }
});

// Create roll
app.post('/make-server-3028a7ac/rooms/:roomCode/roll', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const rollData = await c.req.json();

    const room = await kv.get(`room:${roomCode}`);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    // Generate roll ID
    const rollId = `${roomCode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create roll with ID and timestamp
    const roll = {
      id: rollId,
      ...rollData,
      timestamp: Date.now(),
    };

    // Store roll
    await kv.set(`room:${roomCode}:roll:${rollId}`, roll);

    return c.json({ success: true, rollId });
  } catch (err) {
    console.error('Error creating roll:', err);
    return c.json({ error: 'Failed to create roll' }, 500);
  }
});

// Get rolls for room
app.get('/make-server-3028a7ac/rooms/:roomCode/rolls', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const room = await kv.get(`room:${roomCode}`);

    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    // Get all rolls
    const rolls = await kv.getByPrefix(`room:${roomCode}:roll:`);
    
    // Sort by timestamp descending
    rolls.sort((a: any, b: any) => b.timestamp - a.timestamp);

    return c.json({ rolls });
  } catch (err) {
    console.error('Error getting rolls:', err);
    return c.json({ error: 'Failed to get rolls' }, 500);
  }
});

// Reveal hidden roll
app.post('/make-server-3028a7ac/rooms/:roomCode/rolls/:rollId/reveal', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const rollId = c.req.param('rollId');
    const { revealedBy } = await c.req.json();

    const roll = await kv.get(`room:${roomCode}:roll:${rollId}`);
    if (!roll) {
      return c.json({ error: 'Roll not found' }, 404);
    }

    roll.revealedBy = revealedBy;
    await kv.set(`room:${roomCode}:roll:${rollId}`, roll);

    return c.json({ success: true });
  } catch (err) {
    console.error('Error revealing roll:', err);
    return c.json({ error: 'Failed to reveal roll' }, 500);
  }
});

// Set DC
app.post('/make-server-3028a7ac/rooms/:roomCode/dc', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const { dc } = await c.req.json();

    const room = await kv.get(`room:${roomCode}`);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    room.dc = dc;
    await kv.set(`room:${roomCode}`, room);

    return c.json({ success: true });
  } catch (err) {
    console.error('Error setting DC:', err);
    return c.json({ error: 'Failed to set DC' }, 500);
  }
});

// Promote to DM-led
app.post('/make-server-3028a7ac/rooms/:roomCode/promote', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const { dmName } = await c.req.json();

    const room = await kv.get(`room:${roomCode}`);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    if (room.mode !== 'open') {
      return c.json({ error: 'Room is already DM-led' }, 400);
    }

    room.mode = 'dm-led';
    room.dm = dmName;
    await kv.set(`room:${roomCode}`, room);

    return c.json({ success: true });
  } catch (err) {
    console.error('Error promoting to DM:', err);
    return c.json({ error: 'Failed to promote' }, 500);
  }
});

// Close room
app.post('/make-server-3028a7ac/rooms/:roomCode/close', async (c) => {
  try {
    const roomCode = c.req.param('roomCode');

    // Delete room and all associated data
    await kv.del(`room:${roomCode}`);

    // Note: In a production system, you'd want to delete all associated keys too
    // This is a simplified version for the prototype

    return c.json({ success: true });
  } catch (err) {
    console.error('Error closing room:', err);
    return c.json({ error: 'Failed to close room' }, 500);
  }
});

// Get single roll by ID (for permalink)
app.get('/make-server-3028a7ac/rolls/:rollId', async (c) => {
  try {
    const rollId = c.req.param('rollId');
    
    // Extract room code from roll ID
    const roomCode = rollId.split('-')[0];
    
    const roll = await kv.get(`room:${roomCode}:roll:${rollId}`);
    if (!roll) {
      return c.json({ error: 'Roll not found' }, 404);
    }

    return c.json(roll);
  } catch (err) {
    console.error('Error getting roll:', err);
    return c.json({ error: 'Failed to get roll' }, 500);
  }
});

Deno.serve(app.fetch);
