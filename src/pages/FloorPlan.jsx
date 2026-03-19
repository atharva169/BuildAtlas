import { useRef, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';

const ROOM_COLORS = {
  'Living Room': '#3b82f6',
  'Master Bedroom': '#8b5cf6',
  'Bedroom': '#a78bfa',
  'Bedroom 2': '#a78bfa',
  'Bedroom 3': '#7c3aed',
  'Bedroom 4': '#6d28d9',
  'Kitchen': '#f59e0b',
  'Bathroom': '#06b6d4',
  'Bathroom 1': '#06b6d4',
  'Bathroom 2': '#0891b2',
  'Bathroom 3': '#0e7490',
  'Dining': '#10b981',
  'Balcony': '#34d399',
  'Passage': '#64748b',
  'Open Office': '#3b82f6',
  'Meeting Room': '#8b5cf6',
  'Manager Cabin': '#f59e0b',
  'Server Room': '#ef4444',
  'Pantry': '#10b981',
  'Washroom': '#06b6d4',
  'Lobby': '#64748b',
};

function getColor(name) {
  return ROOM_COLORS[name] || '#6366f1';
}

export default function FloorPlan() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const floorPlan = useProjectStore(s => s.floorPlan);

  useEffect(() => {
    if (!floorPlan || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const PADDING = 60;
    const cw = canvas.parentElement.clientWidth - 48;
    const ch = 500;

    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.scale(dpr, dpr);

    const scaleX = (cw - 2 * PADDING) / floorPlan.plot_width;
    const scaleY = (ch - 2 * PADDING) / floorPlan.plot_depth;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (cw - floorPlan.plot_width * scale) / 2;
    const offsetY = (ch - floorPlan.plot_depth * scale) / 2;

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, cw, ch);

    // Plot outline
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(offsetX, offsetY, floorPlan.plot_width * scale, floorPlan.plot_depth * scale);
    ctx.setLineDash([]);

    // Plot dimensions
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${floorPlan.plot_width} ft`, offsetX + (floorPlan.plot_width * scale) / 2, offsetY - 10);
    ctx.save();
    ctx.translate(offsetX - 14, offsetY + (floorPlan.plot_depth * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${floorPlan.plot_depth} ft`, 0, 0);
    ctx.restore();

    // Draw rooms
    for (const room of floorPlan.rooms) {
      const rx = offsetX + room.x * scale;
      const ry = offsetY + room.y * scale;
      const rw = room.width * scale;
      const rh = room.height * scale;
      const color = getColor(room.name);

      // Fill
      ctx.fillStyle = color + '30';
      ctx.fillRect(rx, ry, rw, rh);

      // Border
      ctx.strokeStyle = color + 'aa';
      ctx.lineWidth = 2;
      ctx.strokeRect(rx, ry, rw, rh);

      // Room name
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textLines = room.name.length > 12 ? room.name.split(' ') : [room.name];
      textLines.forEach((line, i) => {
        ctx.fillText(line, rx + rw / 2, ry + rh / 2 - 8 + i * 14);
      });

      // Area
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${Math.round(room.area_sqft)} sqft`, rx + rw / 2, ry + rh / 2 + 10 + (textLines.length - 1) * 7);

      // Vastu direction
      if (room.vastu_direction) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(room.vastu_direction, rx + rw - 14, ry + 12);
      }
    }

    // North arrow
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↑ N', cw - 30, 20);
  }, [floorPlan]);

  if (!floorPlan) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No floor plan generated</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Floor Plan</h1>
        <p>{floorPlan.rooms.length} rooms · {Math.round(floorPlan.carpet_area)} sqft carpet · {Math.round(floorPlan.total_built_area)} sqft built-up</p>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <canvas ref={canvasRef} className="floorplan-canvas" />
      </div>

      {/* Room legend */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Room Schedule</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Dimensions</th>
              <th>Area</th>
              {floorPlan.vastu_compliance && <th>Vastu</th>}
            </tr>
          </thead>
          <tbody>
            {floorPlan.rooms.map(r => (
              <tr key={r.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: getColor(r.name), display: 'inline-block' }} />
                  {r.name}
                </td>
                <td>{r.width} × {r.height} ft</td>
                <td>{Math.round(r.area_sqft)} sqft</td>
                {floorPlan.vastu_compliance && <td style={{ color: 'var(--accent-amber)' }}>{r.vastu_direction || '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
