import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueChart({ data }) {
  return (
    <div className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Grafik</p>
          <h3>Arus transaksi 6 hari terakhir</h3>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f6feb" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#1f6feb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e4ff" />
            <XAxis dataKey="name" stroke="#6b7a99" />
            <YAxis stroke="#6b7a99" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="pemasukan"
              stroke="#1f6feb"
              fill="url(#incomeFill)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="pengeluaran"
              stroke="#f97316"
              fill="url(#expenseFill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
