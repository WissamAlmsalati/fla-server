// Simple in-memory store for active chat connections
// In production, you'd want to use Redis or similar

type UserPresence = {
    userId: number;
    orderId: number;
    lastSeen: Date;
};

const activeConnections = new Map<string, UserPresence>();

// Clean up stale connections every minute
setInterval(() => {
    const now = new Date();
    for (const [key, presence] of activeConnections.entries()) {
        // Remove if not seen in last 10 seconds
        if (now.getTime() - presence.lastSeen.getTime() > 10000) {
            activeConnections.delete(key);
        }
    }
}, 60000);

export function setUserPresence(userId: number, orderId: number) {
    const key = `${userId}-${orderId}`;
    activeConnections.set(key, {
        userId,
        orderId,
        lastSeen: new Date(),
    });
}

export function getUsersInChat(orderId: number): number[] {
    const users: number[] = [];
    const now = new Date();

    for (const presence of activeConnections.values()) {
        if (presence.orderId === orderId) {
            // Only include if seen in last 10 seconds
            if (now.getTime() - presence.lastSeen.getTime() <= 10000) {
                users.push(presence.userId);
            }
        }
    }

    return users;
}

export function isUserOnline(userId: number, orderId: number): boolean {
    const key = `${userId}-${orderId}`;
    const presence = activeConnections.get(key);

    if (!presence) return false;

    const now = new Date();
    return now.getTime() - presence.lastSeen.getTime() <= 10000;
}
