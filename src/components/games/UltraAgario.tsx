import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const UltraAgario: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [size, setSize] = useState(1);
  const [balance, setBalance] = useState(0);

  const joinGame = async (bet: number) => {
    const { data } = await axios.post('/api/agario/join', { bet });
    setPlayerId(data.playerId);
    setSize(data.state.size);
    setBalance(data.state.balance);
  };

  const updateState = async (delta: number) => {
    if (!playerId) return;
    const { data } = await axios.post('/api/agario/update', {
      playerId,
      sizeDelta: delta,
    });
    setSize(data.state.size);
    setBalance(data.state.balance);
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
    ctx.fillStyle = 'purple';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, size * 10, 0, Math.PI * 2);
    ctx.fill();
  }, [size]);

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
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => updateState(1)}
            >
              Eat Pellet
            </button>
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
