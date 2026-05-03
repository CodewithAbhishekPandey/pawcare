/**
 * consultQueue.js — Socket.io handler for on-demand vet matching
 *
 * In-memory state:
 *   onlineVets: Map<vetId, { socketId, vetInfo }>
 *   waitingOwners: Map<sessionId, { socketId, ownerInfo, sessionId }>
 */

const onlineVets = new Map();      // vetId → { socket, vetInfo }
const waitingOwners = new Map();   // sessionId → { socket, ownerInfo }

function tryMatch(io) {
  if (onlineVets.size === 0 || waitingOwners.size === 0) return;

  // Pick the first available vet and first waiting owner
  const [vetId, vetEntry] = onlineVets.entries().next().value;
  const [sessionId, ownerEntry] = waitingOwners.entries().next().value;

  // Remove both from queues immediately to prevent double-matching
  onlineVets.delete(vetId);
  waitingOwners.delete(sessionId);

  const meetRoomId = 'pawcare_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  console.log(`🎯 Matching vet ${vetEntry.vetInfo.name} ↔ owner session ${sessionId} | room: ${meetRoomId}`);

  // Notify both parties
  vetEntry.socket.emit('match_found', {
    sessionId,
    meetRoomId,
    ownerInfo: ownerEntry.ownerInfo,
  });

  ownerEntry.socket.emit('match_found', {
    sessionId,
    meetRoomId,
    vetInfo: vetEntry.vetInfo,
  });

  // Update DB asynchronously (import inside to avoid circular deps)
  const ConsultSession = require('../models/ConsultSession');
  ConsultSession.findByIdAndUpdate(sessionId, {
    status: 'matched',
    meetRoomId,
    vetRef: vetId,
  }).catch(console.error);
}

module.exports = function initConsultQueue(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Vet Events ───────────────────────────────────────────────────────────
    socket.on('vet_go_online', ({ vetId, vetInfo }) => {
      socket.join('consult_lobby');
      onlineVets.set(vetId, { socket, vetInfo: { ...vetInfo, vetId } });
      console.log(`🟢 Vet online: ${vetInfo.name} (${vetId})`);

      // Broadcast to all connected clients in lobby
      io.to('consult_lobby').emit('vet_came_online', { vetId, ...vetInfo });

      // Try to match immediately if owners are waiting
      tryMatch(io);
    });

    socket.on('vet_go_offline', ({ vetId }) => {
      onlineVets.delete(vetId);
      console.log(`⚫ Vet offline: ${vetId}`);
      io.to('consult_lobby').emit('vet_went_offline', { vetId });
    });

    socket.on('call_ended', ({ vetId, sessionId }) => {
      // Vet available again after call
      const ConsultSession = require('../models/ConsultSession');
      const User = require('../models/User');

      ConsultSession.findById(sessionId).then(async (session) => {
        if (!session) return;
        const duration = Math.ceil((Date.now() - new Date(session.updatedAt).getTime()) / 60000);
        await ConsultSession.findByIdAndUpdate(sessionId, {
          status: 'completed',
          duration,
        });
        // Update vet earnings
        if (session.fee) {
          await User.findByIdAndUpdate(session.vetRef, {
            $inc: { totalEarnings: session.fee },
          });
        }
      }).catch(console.error);
    });

    // ─── Owner Events ─────────────────────────────────────────────────────────
    socket.on('join_lobby', () => {
      socket.join('consult_lobby');
    });

    socket.on('join_waiting_room', ({ sessionId, ownerInfo }) => {
      waitingOwners.set(sessionId, { socket, ownerInfo: { ...ownerInfo, sessionId } });
      console.log(`⏳ Owner waiting: session ${sessionId}`);

      const ConsultSession = require('../models/ConsultSession');
      ConsultSession.findByIdAndUpdate(sessionId, { status: 'waiting' }).catch(console.error);

      // Try to match immediately
      tryMatch(io);
    });

    socket.on('cancel_waiting', ({ sessionId }) => {
      waitingOwners.delete(sessionId);
      const ConsultSession = require('../models/ConsultSession');
      ConsultSession.findByIdAndUpdate(sessionId, { status: 'cancelled' }).catch(console.error);
      console.log(`❌ Owner cancelled: session ${sessionId}`);
    });

    // ─── Disconnect Cleanup ───────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);

      // Remove vet from pool if they disconnect
      for (const [vetId, entry] of onlineVets.entries()) {
        if (entry.socket.id === socket.id) {
          onlineVets.delete(vetId);
          io.to('consult_lobby').emit('vet_went_offline', { vetId });
          console.log(`⚫ Vet disconnected and removed: ${vetId}`);
          break;
        }
      }

      // Remove owner from waiting if they disconnect
      for (const [sessionId, entry] of waitingOwners.entries()) {
        if (entry.socket.id === socket.id) {
          waitingOwners.delete(sessionId);
          console.log(`❌ Waiting owner disconnected: session ${sessionId}`);
          break;
        }
      }
    });
  });
};
