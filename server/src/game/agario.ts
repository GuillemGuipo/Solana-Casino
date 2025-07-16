import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  size: number;
  balance: number;
}

export interface Pellet {
  id: string;
  x: number;
  y: number;
}

const GAME_WIDTH = 500;
const GAME_HEIGHT = 500;
const INITIAL_PELLETS = 20;

export class AgarioGame {
  private players: Record<string, PlayerState> = {};
  private pellets: Record<string, Pellet> = {};
  private io: SocketIOServer | null = null;

  init(io: SocketIOServer) {
    this.io = io;
    this.reset();
  }

  reset() {
    this.players = {};
    this.pellets = {};
    for (let i = 0; i < INITIAL_PELLETS; i++) this.spawnPellet();
  }

  private randPos() {
    return {
      x: Math.floor(Math.random() * GAME_WIDTH),
      y: Math.floor(Math.random() * GAME_HEIGHT),
    };
  }

  private spawnPellet() {
    const id = uuidv4();
    const pos = this.randPos();
    this.pellets[id] = { id, ...pos };
  }

  joinGame(bet: number): PlayerState {
    const id = uuidv4();
    const pos = this.randPos();
    const state: PlayerState = { id, ...pos, size: 1, balance: bet };
    this.players[id] = state;
    this.emitState();
    return state;
  }

  updatePlayer(id: string, x: number, y: number): PlayerState | null {
    const player = this.players[id];
    if (!player) return null;
    player.x = x;
    player.y = y;

    for (const pid of Object.keys(this.pellets)) {
      const pel = this.pellets[pid];
      const dist = Math.hypot(player.x - pel.x, player.y - pel.y);
      if (dist < player.size * 5) {
        delete this.pellets[pid];
        player.size += 1;
        player.balance += 1;
        this.spawnPellet();
      }
    }

    for (const oid of Object.keys(this.players)) {
      if (oid === id) continue;
      const other = this.players[oid];
      const dist = Math.hypot(player.x - other.x, player.y - other.y);
      if (dist < (player.size + other.size) * 2) {
        if (player.size > other.size + 1) {
          player.size += other.size;
          player.balance += other.balance;
          delete this.players[oid];
        } else if (other.size > player.size + 1) {
          other.size += player.size;
          other.balance += player.balance;
          delete this.players[id];
          break;
        }
      }
    }

    this.emitState();
    return this.players[id] || null;
  }

  cashOut(id: string): number | null {
    const player = this.players[id];
    if (!player) return null;
    const payout = player.balance * 0.9;
    delete this.players[id];
    this.emitState();
    return payout;
  }

  getState() {
    return {
      players: Object.values(this.players),
      pellets: Object.values(this.pellets),
    };
  }

  private emitState() {
    if (this.io) this.io.emit('agarioState', this.getState());
  }
}

export const agarioGame = new AgarioGame();
