import React from 'react';
import Card from './Card';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export const LineChartCard = ({ title, labels = [], data = [], color = 'rgba(26,35,126,1)' }) => (
  <Card>
    <div style={{marginBottom:8, fontWeight:600}}>{title}</div>
    <Line height={120} data={{
      labels,
      datasets: [{ label: title, data, borderColor: color, backgroundColor: color.replace('1)', '0.12)'), tension: .35, fill: true, pointRadius: 2 }]
    }} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }}, scales:{ x:{ grid:{ display:false }}, y:{ grid:{ color:'rgba(0,0,0,.06)'}, ticks:{ precision:0 }}} }} />
  </Card>
);

export const DonutChartCard = ({ title, labels = [], data = [], colors = ['#1A237E','#3949AB','#FF6B35','#16a34a','#f59e0b','#dc2626'] }) => (
  <Card>
    <div style={{marginBottom:8, fontWeight:600}}>{title}</div>
    <Doughnut height={160} data={{
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
    }} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' }}}} />
  </Card>
);
