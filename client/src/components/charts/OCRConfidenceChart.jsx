import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)' }} className="shadow-lg p-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
        {payload[0].value.toFixed(1)}% confidence
      </p>
    </div>
  )
}

export default function OCRConfidenceChart({ data, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" tickFormatter={(v) => `${v}%`} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="confidence"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#confidenceGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}