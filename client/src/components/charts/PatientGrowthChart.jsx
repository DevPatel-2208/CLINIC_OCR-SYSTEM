import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--foreground)' }} className="shadow-lg p-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
        {payload[0].value.toLocaleString()} patients
      </p>
    </div>
  )
}

export default function PatientGrowthChart({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" />
        <YAxis tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} tickLine={false} axisLine={false} stroke="var(--border-color)" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#patientGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}