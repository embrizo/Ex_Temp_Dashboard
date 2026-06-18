import { useData } from '../context/DataContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Brush, ReferenceArea,
  ScatterChart, Scatter, ZAxis, BarChart, Bar, Cell
} from 'recharts';
import { useMemo, useState } from 'react';
import { Thermometer, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', minWidth: 180 }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 4 }}>
        {d?.timestamp?.toLocaleString('en-GB')}
      </div>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-cyan)' }}>{d?.temp?.toFixed(2)} °C</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 'var(--text-xs)' }}>
        <span style={{ color: 'var(--color-red)' }}>High: {d?.high}°</span>
        <span style={{ color: 'var(--color-blue-light)' }}>Low: {d?.low}°</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: d?.status === 'HIGH' ? 'var(--color-red)' : d?.status === 'LOW' ? 'var(--color-blue-light)' : 'var(--color-green)', fontWeight: 700 }}>
        {d?.status}
      </div>
    </div>
  );
};

export default function AnalysisPage() {
  const { parsedRows, stats } = useData();
  const [dayFilter, setDayFilter] = useState('all');
  const [zoomMode, setZoomMode] = useState(false);

  const days = useMemo(() => [...new Set(parsedRows.map(r => r.dayKey))].sort(), [parsedRows]);

  const filtered = useMemo(() =>
    dayFilter === 'all' ? parsedRows : parsedRows.filter(r => r.dayKey === dayFilter),
  [parsedRows, dayFilter]);

  // Downsample
  const chartData = useMemo(() => {
    if (filtered.length <= 2000) return filtered;
    const step = Math.ceil(filtered.length / 2000);
    return filtered.filter((_, i) => i % step === 0);
  }, [filtered]);

  // Temperature bands distribution
  const bandData = useMemo(() => {
    const bins = [];
    const temps = filtered.map(r => r.temp);
    const min = Math.floor(Math.min(...temps));
    const max = Math.ceil(Math.max(...temps));
    const range = max - min;
    const binCount = Math.min(30, Math.max(10, Math.round(range)));
    const binSize = range / binCount;

    for (let i = 0; i < binCount; i++) {
      const lo = min + i * binSize;
      const hi = lo + binSize;
      bins.push({
        range: `${lo.toFixed(0)}`,
        count: temps.filter(t => t >= lo && t < hi).length,
        lo, hi,
      });
    }
    return bins;
  }, [filtered]);

  const currentHigh = parsedRows[parsedRows.length - 1]?.high ?? 80;
  const currentLow  = parsedRows[parsedRows.length - 1]?.low  ?? 15;

  // Hourly avg
  const hourlyData = useMemo(() => {
    const byHour = Array(24).fill(null).map((_, h) => {
      const hrs = filtered.filter(r => r.hour === h);
      if (!hrs.length) return { hour: h, avg: null, count: 0 };
      const avg = hrs.reduce((a, b) => a + b.temp, 0) / hrs.length;
      return { hour: h, avg: +avg.toFixed(2), count: hrs.length };
    });
    return byHour;
  }, [filtered]);

  if (!stats) return null;

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
              <Thermometer size={12} /> Deep-Dive Analysis
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Temperature Analysis
            </h1>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 4 }}>
              {filtered.length.toLocaleString()} records selected
            </div>
          </div>
          <div className="filter-bar" style={{ margin: 0 }}>
            <select id="analysis-day-filter" className="select-input" value={dayFilter} onChange={e => setDayFilter(e.target.value)}>
              <option value="all">All Days</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Detail Line Chart */}
        <div className="glass-card chart-panel card-glow-cyan" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">Detailed Temperature Trend</div>
              <div className="chart-subtitle">With threshold bands · Use the brush below to zoom</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                stroke="var(--color-text-3)"
                tick={{ fontSize: 10, fill: 'var(--color-text-3)' }}
                tickCount={6}
              />
              <YAxis
                domain={[Math.max(0, currentLow - 10), currentHigh + 10]}
                stroke="var(--color-text-3)"
                tick={{ fontSize: 11, fill: 'var(--color-text-3)' }}
                tickFormatter={(v) => `${v}°`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Alert bands */}
              <ReferenceArea y1={currentHigh} y2={currentHigh + 10} fill="rgba(239,68,68,0.08)" />
              <ReferenceArea y1={currentLow - 10} y2={currentLow} fill="rgba(59,130,246,0.08)" />
              <ReferenceLine y={currentHigh} stroke="var(--color-red)" strokeDasharray="5 5" strokeOpacity={0.8} label={{ value: `HIGH ${currentHigh}°`, fill: 'var(--color-red)', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={currentLow} stroke="var(--color-blue-light)" strokeDasharray="5 5" strokeOpacity={0.8} label={{ value: `LOW ${currentLow}°`, fill: 'var(--color-blue-light)', fontSize: 10, position: 'insideBottomRight' }} />
              <Line type="monotone" dataKey="temp" stroke="var(--color-cyan)" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: 'var(--color-cyan)' }} />
              <Brush dataKey="ts" height={24} stroke="var(--color-border)" fill="var(--color-bg-2)" travellerWidth={6} tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-GB')} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2-column: Histogram + Hourly Avg */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          {/* Histogram */}
          <div className="glass-card chart-panel card-glow-blue">
            <div className="chart-header">
              <div>
                <div className="chart-title">Temperature Distribution</div>
                <div className="chart-subtitle">Frequency histogram across all readings</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bandData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--color-text-3)' }} stroke="var(--color-text-3)" tickFormatter={(v) => `${v}°`} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-3)' }} stroke="var(--color-text-3)" width={36} />
                <Tooltip
                  formatter={(val, name, props) => [`${val} readings`, `${props.payload.lo.toFixed(1)}° – ${props.payload.hi.toFixed(1)}°`]}
                  contentStyle={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--color-text)' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {bandData.map((entry, i) => {
                    let fill = 'var(--color-cyan)';
                    if (entry.lo >= currentHigh) fill = 'var(--color-red)';
                    else if (entry.hi <= currentLow) fill = 'var(--color-blue-light)';
                    return <Cell key={i} fill={fill} fillOpacity={0.85} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Average */}
          <div className="glass-card chart-panel card-glow-purple" style={{ '--color-purple-glow': 'rgba(139,92,246,0.12)' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">Average by Hour of Day</div>
                <div className="chart-subtitle">Identify peak load periods</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-3)' }} stroke="var(--color-text-3)" tickFormatter={(h) => `${String(h).padStart(2,'0')}:00`} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-3)' }} stroke="var(--color-text-3)" width={36} tickFormatter={(v) => `${v}°`} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(val) => [`${val} °C avg`, 'Temperature']}
                  contentStyle={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--color-text)' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                  labelStyle={{ color: 'var(--color-text)' }}
                />
                <ReferenceLine y={currentHigh} stroke="var(--color-red)" strokeDasharray="4 4" strokeOpacity={0.7} />
                <ReferenceLine y={currentLow}  stroke="var(--color-blue-light)" strokeDasharray="4 4" strokeOpacity={0.7} />
                <Bar dataKey="avg" radius={[3, 3, 0, 0]} fill="var(--color-purple)" fillOpacity={0.85}>
                  {hourlyData.map((entry, i) => {
                    let fill = 'var(--color-purple)';
                    if (entry.avg >= currentHigh) fill = 'var(--color-red)';
                    else if (entry.avg <= currentLow) fill = 'var(--color-blue-light)';
                    return <Cell key={i} fill={fill} fillOpacity={0.85} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats summary */}
        <div className="glass-card chart-panel">
          <div className="chart-title" style={{ marginBottom: 'var(--space-4)' }}>Statistical Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {[
              { label: 'Sample Count', value: filtered.length.toLocaleString(), color: 'var(--color-cyan)' },
              { label: 'Mean (μ)', value: `${(filtered.reduce((a,b)=>a+b.temp,0)/filtered.length).toFixed(3)} °C`, color: 'var(--color-cyan)' },
              { label: 'Minimum', value: `${Math.min(...filtered.map(r=>r.temp)).toFixed(2)} °C`, color: 'var(--color-blue-light)' },
              { label: 'Maximum', value: `${Math.max(...filtered.map(r=>r.temp)).toFixed(2)} °C`, color: 'var(--color-red)' },
              { label: 'Std Dev (σ)', value: (() => { const m=filtered.reduce((a,b)=>a+b.temp,0)/filtered.length; return `${Math.sqrt(filtered.reduce((a,b)=>a+(b.temp-m)**2,0)/filtered.length).toFixed(3)} °C`; })(), color: 'var(--color-purple-light)' },
              { label: 'High Threshold', value: `${currentHigh} °C`, color: 'var(--color-red)' },
              { label: 'Low Threshold', value: `${currentLow} °C`, color: 'var(--color-blue-light)' },
              { label: 'Normal Rate', value: `${((filtered.filter(r=>r.status==='NORMAL').length/filtered.length)*100).toFixed(2)}%`, color: 'var(--color-green)' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
