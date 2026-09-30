import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)' }} className="shadow-lg p-3">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
        {value.toLocaleString()} ({((value / payload[0].payload.total) * 100).toFixed(1)}%)
      </p>
    </div>
  )
}

export default function ProcessingStatsChart({ data, height = 250 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const enriched = data.map((d) => ({ ...d, total }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {enriched.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}