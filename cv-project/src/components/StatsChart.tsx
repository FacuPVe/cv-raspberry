import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface CVData {
  name: string;
  profession: string;
  email: string;
  github: string;
  linkedin: string;
  experience: string;
  skills: string;
  projects: Array<{
    name: string;
    description: string;
    github: string;
    tags: string[];
  }>;
}

interface StatsChartProps {
  data: CVData;
  theme: 'light' | 'dark';
}

const StatsChart = ({ data, theme }: StatsChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current;
    if (!ctx) return;

    // Calcular estadísticas (eliminar conteo de palabras en experiencia)
    // const experienceWordCount = data.experience ? data.experience.split(/\s+/).filter(word => word.length > 0).length : 0;
    // Asegurarse de que skills sea una cadena antes de usar split
    const skillsCount = (typeof data.skills === 'string' && data.skills.trim() !== '') ? data.skills.split(',').length : 0;
    // Asegurarse de que projects sea un array antes de usar length
    const projectsCount = Array.isArray(data.projects) ? data.projects.length : 0;
    // Asegurarse de que projects sea un array y los tags también antes de contar
    const totalTags = Array.isArray(data.projects) ? data.projects.reduce((sum, project) => sum + (Array.isArray(project.tags) ? project.tags.length : 0), 0) : 0;

    const chartData = {
      // Eliminar 'Palabras en Experiencia' de las etiquetas
      labels: ['Habilidades', 'Proyectos', 'Tecnologías en Proyectos'],
      datasets: [
        {
          label: 'Estadísticas del CV',
          // Eliminar el dato correspondiente a Palabras en Experiencia
          data: [skillsCount, projectsCount, totalTags],
          backgroundColor: [
            // Eliminar el color de fondo para Palabras en Experiencia
            'rgba(54, 162, 235, 0.6)',  // Azul para Habilidades
            'rgba(255, 206, 86, 0.6)',  // Amarillo para Proyectos
            'rgba(75, 192, 192, 0.6)'   // Verde azulado para Tecnologías
          ],
          borderColor: [
            // Eliminar el color del borde para Palabras en Experiencia
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };

    const textColor = theme === 'dark' ? '#d1d5db' : '#4b5563'; // Tailwind gray-300 or gray-600

    chartInstance.current = new Chart(ctx, {
      type: 'bar', // O podrías usar 'pie', 'doughnut', etc.
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor, // Color del texto en el eje Y
            },
            grid: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', // Color de las líneas de la cuadrícula en Y
            },
          },
          x: {
            ticks: {
              color: textColor, // Color del texto en el eje X
            },
            grid: {
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', // Color de las líneas de la cuadrícula en X
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: textColor, // Color del texto de la leyenda
            },
          },
          title: {
            display: true,
            text: 'Estadísticas del Currículum',
            color: textColor, // Color del texto del título
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, theme]); // Volver a renderizar el gráfico si cambian los datos o el tema

  return (
    <div>
      <canvas ref={chartRef} className="w-full h-64"></canvas> {/* Ajusta la altura según necesites */}
    </div>
  );
};

export default StatsChart; 