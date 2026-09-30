import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)' }} className="shadow-lg p-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
        {payload[0].value.toLocaleString()} prescriptions
      </p>
    </div>
  )
}

export default function MedicineUsageChart({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--foreground-muted)' }}
          tickLine={false}
          axisLine={false}
          stroke="var(--border-color)"
          width={120}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}