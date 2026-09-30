import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)' }} className="shadow-lg p-3">
      <p className="text-sm font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export default function AIAccuracyChart({ data, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" tickFormatter={(v) => `${v}%`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: 'var(--foreground-muted)' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="aiConfidence" name="AI Confidence" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={30} />
        <Bar dataKey="correctionRate" name="Correction Rate" fill="var(--secondary)" radius={[4, 4, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}