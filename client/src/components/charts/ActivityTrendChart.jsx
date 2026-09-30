import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)' }} className="shadow-lg p-3">
      <p className="text-sm font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function ActivityTrendChart({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" />
        <YAxis tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: 'var(--foreground-muted)' }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="patients"
          name="Patients"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="prescriptions"
          name="Prescriptions"
          stroke="var(--success)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="followups"
          name="Follow-ups"
          stroke="var(--secondary)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}