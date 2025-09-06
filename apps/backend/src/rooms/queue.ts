import { Queue, Worker } from "bullmq";
import { Server } from "socket.io";
import { config } from "../config";
import { RoomStore } from "./room.store";

export interface IRoomTimerQueue {
  scheduleRoomEnd(roomId: string, endDate: Date): Promise<void>;
  cancelRoomEnd(roomId: string): Promise<void>;
  getRemainingTime(roomId: string): Promise<number | null>;
  hasActiveTimer(roomId: string): Promise<boolean>;
}

export class RoomTimerQueue implements IRoomTimerQueue {
  readonly queue = new Queue("room-timers", {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
    },
  });

  private readonly worker = new Worker(
    "room-timers",
    async (job) => {
      const { roomId } = job.data;
      this.roomStore.endVotingInRoom(roomId);
      this.io.in(roomId).emit("game:state_change", "FINISHED");
    },
    {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      },
    },
  );

  constructor(
    private readonly io: Server,
    private readonly roomStore: RoomStore,
  ) {
    this.worker.on("completed", (job) => {
      console.log(`Room timer job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`Room timer job ${job?.id} failed:`, err.message);
    });
  }

  private calculateDelay(targetDate: Date) {
    return Number(targetDate) - Date.now();
  }

  /**
   * Schedule a room to end voting at a specific time
   */
  async scheduleRoomEnd(roomId: string, endDate: Date) {
    const delay = this.calculateDelay(endDate);

    if (delay <= 0) {
      console.warn(
        `Cannot schedule timer for room ${roomId} - end date is in the past`,
      );
      return;
    }

    await this.queue.add(
      "end-room-voting",
      { roomId },
      {
        delay,
        jobId: roomId,
      },
    );

    console.log(
      `Timer scheduled for room ${roomId} to expire at ${endDate.toISOString()}`,
    );
  }

  /**
   * Cancel a room timer
   */
  async cancelRoomEnd(roomId: string) {
    const job = await this.queue.getJob(roomId);
    await job?.remove();
    console.log(`Timer cancelled for room ${roomId}`);
  }

  /**
   * Get remaining time for a room timer
   */
  async getRemainingTime(roomId: string): Promise<number | null> {
    const job = await this.queue.getJob(roomId);
    if (!job) return null;

    const delay = await job.delay;
    return delay > 0 ? delay : null;
  }

  /**
   * Check if a room has an active timer
   */
  async hasActiveTimer(roomId: string): Promise<boolean> {
    const job = await this.queue.getJob(roomId);
    return job !== null;
  }
}
