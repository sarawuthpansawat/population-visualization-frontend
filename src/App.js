import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Function to generate a single color
const generateColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
    borderColor: `rgb(${r}, ${g}, ${b})`
  };
};

const App = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(1950);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [colorMap, setColorMap] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5000/api/population')
      .then(response => {
        setData(response.data);
        // Initialize color map for each country on data load
        const initialColorMap = {};
        response.data.forEach(record => {
          if (!initialColorMap[record.country_name]) {
            const color = generateColor();
            initialColorMap[record.country_name] = color;
          }
        });
        setColorMap(initialColorMap);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setYear(prevYear => {
        if (prevYear >= 2021) {
          clearInterval(interval);
          return prevYear;
        }
        return prevYear + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = data.filter(record => record.year === year);
    setFilteredData(filtered);

    // Calculate the total population for the selected year
    const total = filtered.reduce((acc, record) => acc + record.population, 0);
    setTotalPopulation(total);
  }, [data, year]);

  const chartData = useMemo(() => {
    return {
      labels: filteredData.map(record => record.country_name),
      datasets: [{
        label: 'Population',
        data: filteredData.map(record => record.population),
        backgroundColor: filteredData.map(record => colorMap[record.country_name]?.backgroundColor || 'rgba(75, 192, 192, 0.2)'),
        borderColor: filteredData.map(record => colorMap[record.country_name]?.borderColor || 'rgb(75, 192, 192)'),
        borderWidth: 1
      }]
    };
  }, [filteredData, colorMap]);

  const options = {
    indexAxis: 'y', // This makes the chart horizontal
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true
      }
    },
    animation: {
      duration: 1000
    }
  };

  return (
    <div>
      <h1>Population Growth per Country</h1>
      <p>Year: {year}</p>
      <p>Total Population: {totalPopulation.toLocaleString()}</p>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default App;
