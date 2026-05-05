import { IncomingMessage } from "http";
import { getUnreadNotificationCount } from "./notificationDb";

interface ClientConnection {
  ws: any; // WebSocket from ws package
  userId: number;
  isAlive: boolean;
}

/**
 * WebSocket server for real-time notification updates
 * Manages client connections and broadcasts notification events
 */
class NotificationWebSocketServer {
  private clients: Map<number, Set<ClientConnection>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server with heartbeat
   */
  public initialize() {
    console.log("[NotificationWebSocket] Initializing WebSocket server");

    // Start heartbeat to detect dead connections
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeat();
    }, 30000); // Every 30 seconds
  }

  /**
   * Handle new WebSocket connection
   */
  public handleConnection(ws: any, req: IncomingMessage, userId: number) {
    console.log(`[NotificationWebSocket] New connection from user ${userId}`);

    const connection: ClientConnection = {
      ws,
      userId,
      isAlive: true,
    };

    // Add to clients map
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(connection);

    // Send initial unread count
    this.sendUnreadCount(connection);

    // Handle incoming messages
    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(connection, message);
      } catch (error) {
        console.error("[NotificationWebSocket] Error parsing message:", error);
      }
    });

    // Handle pong response (heartbeat)
    ws.on("pong", () => {
      connection.isAlive = true;
    });

    // Handle connection close
    ws.on("close", () => {
      console.log(`[NotificationWebSocket] Connection closed for user ${userId}`);
      this.clients.get(userId)?.delete(connection);
      if (this.clients.get(userId)?.size === 0) {
        this.clients.delete(userId);
      }
    });

    // Handle errors
    ws.on("error", (error: Error) => {
      console.error(
        `[NotificationWebSocket] Connection error for user ${userId}:`,
        error
      );
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(
    connection: ClientConnection,
    message: Record<string, unknown>
  ) {
    const { type } = message;

    switch (type) {
      case "ping":
        connection.ws.send(JSON.stringify({ type: "pong" }));
        break;

      case "get_unread_count":
        this.sendUnreadCount(connection);
        break;

      default:
        console.log(`[NotificationWebSocket] Unknown message type: ${type}`);
    }
  }

  /**
   * Send unread count to client
   */
  private async sendUnreadCount(connection: ClientConnection) {
    try {
      const count = await getUnreadNotificationCount(connection.userId);
      connection.ws.send(
        JSON.stringify({
          type: "unread_count_update",
          count,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error(
        `[NotificationWebSocket] Error getting unread count for user ${connection.userId}:`,
        error
      );
    }
  }

  /**
   * Broadcast notification to user
   */
  public broadcastNotification(
    userId: number,
    notification: Record<string, unknown>
  ) {
    const connections = this.clients.get(userId);
    if (!connections || connections.size === 0) {
      return;
    }

    const message = JSON.stringify({
      type: "notification",
      data: notification,
      timestamp: Date.now(),
    });

    connections.forEach((connection) => {
      if (connection.ws.readyState === 1) {
        // WebSocket.OPEN
        connection.ws.send(message);
      }
    });
  }

  /**
   * Broadcast notification read event to user
   */
  public broadcastNotificationRead(userId: number, notificationId: number) {
    const connections = this.clients.get(userId);
    if (!connections || connections.size === 0) {
      return;
    }

    const message = JSON.stringify({
      type: "notification_read",
      notificationId,
      timestamp: Date.now(),
    });

    connections.forEach((connection) => {
      if (connection.ws.readyState === 1) {
        // WebSocket.OPEN
        connection.ws.send(message);
      }
    });
  }

  /**
   * Broadcast unread count update to user
   */
  public broadcastUnreadCountUpdate(userId: number, count: number) {
    const connections = this.clients.get(userId);
    if (!connections || connections.size === 0) {
      return;
    }

    const message = JSON.stringify({
      type: "unread_count_update",
      count,
      timestamp: Date.now(),
    });

    connections.forEach((connection) => {
      if (connection.ws.readyState === 1) {
        // WebSocket.OPEN
        connection.ws.send(message);
      }
    });
  }

  /**
   * Check heartbeat and remove dead connections
   */
  private checkHeartbeat() {
    this.clients.forEach((connections, userId) => {
      connections.forEach((connection) => {
        if (!connection.isAlive) {
          console.log(
            `[NotificationWebSocket] Terminating dead connection for user ${userId}`
          );
          connection.ws.terminate();
          connections.delete(connection);
        } else {
          connection.isAlive = false;
          connection.ws.ping();
        }
      });

      if (connections.size === 0) {
        this.clients.delete(userId);
      }
    });
  }

  /**
   * Get number of active connections for a user
   */
  public getConnectionCount(userId: number): number {
    return this.clients.get(userId)?.size || 0;
  }

  /**
   * Get total active connections
   */
  public getTotalConnections(): number {
    let total = 0;
    this.clients.forEach((connections) => {
      total += connections.size;
    });
    return total;
  }

  /**
   * Shutdown WebSocket server
   */
  public shutdown() {
    console.log("[NotificationWebSocket] Shutting down WebSocket server");

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((connections) => {
      connections.forEach((connection) => {
        connection.ws.close(1000, "Server shutting down");
      });
    });

    this.clients.clear();
  }
}

// Export singleton instance
export const notificationWebSocketServer = new NotificationWebSocketServer();
