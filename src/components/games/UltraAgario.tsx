import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const UltraAgario: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [size, setSize] = useState(1);
  const [balance, setBalance] = useState(0);
  const [position, setPosition] = useState({ x: 200, y: 200 });
  const [players, setPlayers] = useState<any[]>([]);
  const [pellets, setPellets] = useState<any[]>([]);

  const joinGame = async (bet: number) => {
    const { data } = await axios.post('/api/agario/join', { bet });
    setPlayerId(data.playerId);
    setSize(data.state.size);
    setBalance(data.state.balance);
    setPosition({ x: data.state.x, y: data.state.y });
    setPlayers(data.players || []);
    setPellets(data.pellets || []);
  };

  const updateState = async (x: number, y: number) => {
    if (!playerId) return;
    const { data } = await axios.post('/api/agario/update', {
      playerId,
      x,
      y,
    });
    setSize(data.state.size);
    setBalance(data.state.balance);
    setPosition({ x: data.state.x, y: data.state.y });
  };

  const cashOut = async () => {
    if (!playerId) return;
    const { data } = await axios.post('/api/agario/cashout', { playerId });
    setPlayerId(null);
    alert(`You withdrew $${data.payout.toFixed(2)}`);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pellets
    ctx.fillStyle = 'orange';
    pellets.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw other players
    ctx.fillStyle = 'gray';
    players.forEach((pl) => {
      if (pl.id === playerId) return;
      ctx.beginPath();
      ctx.arc(pl.x, pl.y, pl.size * 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw current player
    ctx.fillStyle = 'purple';
    ctx.beginPath();
    ctx.arc(position.x, position.y, size * 5, 0, Math.PI * 2);
    ctx.fill();
  }, [pellets, players, size, position, playerId]);

  useEffect(() => {
    if (!playerId) return;
    const interval = setInterval(async () => {
      const { data } = await axios.get('/api/agario/state');
      setPlayers(data.players);
      setPellets(data.pellets);
    }, 1000);
    return () => clearInterval(interval);
  }, [playerId]);

  const handleKey = (e: KeyboardEvent) => {
    if (!playerId) return;
    let { x, y } = position;
    const step = 10;
    if (e.key === 'ArrowUp') y -= step;
    if (e.key === 'ArrowDown') y += step;
    if (e.key === 'ArrowLeft') x -= step;
    if (e.key === 'ArrowRight') x += step;
    setPosition({ x, y });
    updateState(x, y);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div className="p-4 space-y-4">
      {!playerId ? (
        <div className="space-x-2">
          {[1, 5, 20].map((bet) => (
            <button
              key={bet}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => joinGame(bet)}
            >
              {`Join for $${bet}`}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <canvas ref={canvasRef} width={400} height={400} className="border" />
          <div>{`Size: ${size} | Balance: $${balance}`}</div>
          <div className="space-x-2">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={cashOut}
            >
              Cash Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraAgario;
