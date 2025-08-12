import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ 
  data, 
  title, 
  height = 300, 
  showLegend = true,
  horizontal = false,
  colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: colors[0],
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed[horizontal ? 'x' : 'y'];
            if (label.toLowerCase().includes('revenue') || label.toLowerCase().includes('sales')) {
              return `${label}: $${value.toLocaleString()}`;
            }
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: !horizontal,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            if (!horizontal && title && (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('sales'))) {
              return '$' + value.toLocaleString();
            }
            return horizontal ? value.toLocaleString() : this.getLabelForValue(value);
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: horizontal,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            if (horizontal && title && (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('sales'))) {
              return '$' + value.toLocaleString();
            }
            return horizontal ? this.getLabelForValue(value) : value.toLocaleString();
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets ? data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || colors[index % colors.length],
      borderColor: dataset.borderColor || colors[index % colors.length],
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    })) : [
      {
        label: data.label || 'Data',
        data: data.values,
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;