const { redisClient } = require('../config/cache');

console.log('[Abyss Core] System initialized: Ephemeral Mesh controller ready for mounting.');

// [Architecture] We export a function that binds events to the authenticated socket
const registerAbyssHandlers = (io, socket) => {
    // Extract identity injected by our Perimeter Defense (socketAuth.js)
    const guest = socket.guest; 
    
    // Fallback security check
    if (!guest || !guest.guest_id) {
        console.error(`[Abyss Core] CRITICAL Failure Point 0: Unidentified socket [${socket.id}] bypassed perimeter. Terminating.`);
        return socket.disconnect(true);
    }

    const { guest_id, event_id } = guest;
    const meshRoom = `node:${event_id}:abyss`; // Socket.io room for the specific event
    const presenceKey = `abyss:node:${event_id}:online`; // Valkey Set tracking active users

    // --- EVENT 1: INGRESS (Joining the Mesh) ---
    socket.on('join_abyss', async () => {
        console.log(`[Abyss Core] Step 1: Guest [${guest_id}] initiating descent into Node [${event_id}] Abyss...`);
        
        try {
            // 1. Join the Socket.io room for broadcast targeting
            socket.join(meshRoom);
            
            // 2. Register presence in Valkey (add guest_id to the online Set)
            if (redisClient) {
                await redisClient.sadd(presenceKey, guest_id);
                // Reset expiration to ensure the key dies if the server crashes after the event
                await redisClient.expire(presenceKey, 86400 * 3); // 3-day TTL fallback
            }

            console.log(`[Abyss Core] Step 2: Guest [${guest_id}] successfully materialized. Broadcasting presence...`);
            
            // 3. Broadcast to everyone else in the Node that a new guest has entered
            socket.to(meshRoom).emit('presence_update', {
                action: 'entered',
                guest_id: guest_id,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error(`[Abyss Core] Failure Point A: Failed to process ingress for Guest [${guest_id}]:`, error.message);
        }
    });

    // --- EVENT 2: EMITTING AN ECHO (Connection Request) ---
    socket.on('send_echo', async (payload) => {
        const { target_guest_id } = payload;
        console.log(`[Abyss Core] Step 3: Guest [${guest_id}] emitting an echo towards [${target_guest_id}]...`);

        if (!target_guest_id) {
            return console.error(`[Abyss Core] Failure Point B: Echo emission failed. Missing target_guest_id.`);
        }

        try {
            const pendingKey = `abyss:node:${event_id}:echos_pending`;
            // Create a unique hash key for this specific echo direction
            const echoField = `${guest_id}->${target_guest_id}`;
            const echoData = JSON.stringify({ timestamp: new Date().toISOString(), status: 'pending' });

            // Store the pending echo in Valkey
            if (redisClient) {
                await redisClient.hset(pendingKey, echoField, echoData);
            }

            console.log(`[Abyss Core] Step 4: Echo state secured in cache. Routing payload to target...`);
            
            // Broadcast the echo strictly to the target guest. 
            // [Architecture Note] In a multi-tenant MSaaS, guests should join a private room matching their ID upon connection
            io.to(`guest:${target_guest_id}`).emit('inbound_echo', {
                sender_id: guest_id,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error(`[Abyss Core] Failure Point C: Valkey mutation failed during echo emission:`, error.message);
        }
    });

    // --- EVENT 3: ACCEPTING AN ECHO ---
    socket.on('accept_echo', async (payload) => {
        const { sender_guest_id } = payload;
        console.log(`[Abyss Core] Step 5: Guest [${guest_id}] resolving inbound echo from [${sender_guest_id}]...`);

        try {
            const pendingKey = `abyss:node:${event_id}:echos_pending`;
            const acceptedKey = `abyss:node:${event_id}:echos_accepted`;
            const echoField = `${sender_guest_id}->${guest_id}`;

            if (redisClient) {
                // Remove from pending
                await redisClient.hdel(pendingKey, echoField);
                // Add to accepted (bidirectional representation)
                await redisClient.sadd(acceptedKey, JSON.stringify([sender_guest_id, guest_id]));
            }

            console.log(`[Abyss Core] Step 6: Echo accepted. Connection solidified in ephemeral state. Notifying initiator...`);

            // Notify the original sender that their echo was caught
            io.to(`guest:${sender_guest_id}`).emit('echo_resolved', {
                target_id: guest_id,
                status: 'accepted',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error(`[Abyss Core] Failure Point D: Failed to resolve echo state:`, error.message);
        }
    });

    // --- EVENT 4: EGRESS (Disconnecting) ---
    socket.on('disconnect', async (reason) => {
        console.log(`[Abyss Core] Step 7: Socket [${socket.id}] severed. Reason: ${reason}. Initiating ghost protocol for Guest [${guest_id}]...`);

        try {
            if (redisClient) {
                await redisClient.srem(presenceKey, guest_id);
            }

            // Broadcast departure to the specific event Node
            socket.to(meshRoom).emit('presence_update', {
                action: 'departed',
                guest_id: guest_id,
                timestamp: new Date().toISOString()
            });
            console.log(`[Abyss Core] Step 8: Guest [${guest_id}] successfully wiped from active presence pool.`);
        } catch (error) {
            console.error(`[Abyss Core] Failure Point E: Egress cleanup failed for Guest [${guest_id}]:`, error.message);
        }
    });
};

module.exports = { registerAbyssHandlers };