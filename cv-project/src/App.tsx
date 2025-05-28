import { useState, useEffect } from 'react'
import StatsChart from './components/StatsChart.tsx'
import { jsPDF } from 'jspdf';
import { API_URL } from './config';

// Datos por defecto de index.php
const defaultSkills = 'Python,Javascript,PHP,JAVA,HTML,CSS,MySQL,TailwindCSS,Bootstrap,Postman,Visual Studio Code,Visual Studio,Jira';
const defaultProjects = [
  {
    name: 'Aerith Game',
    description: 'Proyecto hecho en java para trabajar con clases abstractas, interfaces y herencia.',
    github: 'https://github.com/FacuPVe/Aerith-Game',
    tags: ['Java']
  },
  {
    name: 'SoundVibes',
    description: 'Sistema de Gestión de Usuarios y Recomendaciones Musicales hecho con PHP, JavaScript y TailwindCSS.',
    github: 'https://github.com/FacuPVe/SoundVibes-Final',
    tags: ['PHP', 'JavaScript', 'Canvas', 'Howlerjs', 'TailwindCSS', 'CRUD']
  }
];

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

function App() {
  const [cvData, setCvData] = useState<CVData>({
    name: '',
    profession: '',
    email: '',
    github: 'https://github.com/FacuPVe',
    linkedin: 'https://www.linkedin.com/in/facundo-epv/',
    experience: '',
    skills: defaultSkills,
    projects: defaultProjects
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    experience?: string;
    skills?: string;
    projects?: string;
  }>({});
  
  // Cargar tema desde localStorage al inicializar el estado
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      return savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    } else {
      return 'light';
    }
  });

  // Cargar datos del CV al montar el componente
  useEffect(() => {
    fetchCVData();
  }, []);

  // Guardar tema en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchCVData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(API_URL, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error al obtener los datos del CV: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor no devolvió JSON válido');
      }

      const data = await response.json();
      
      setCvData(prevData => ({
        ...prevData,
        name: data.name || '',
        profession: data.profession || prevData.profession,
        email: data.email || prevData.email,
        github: data.github || prevData.github,
        linkedin: data.linkedin || prevData.linkedin,
        experience: data.experience || '',
        skills: (!data.skills || (typeof data.skills === 'string' && data.skills.trim() === '')) ? defaultSkills : data.skills,
        projects: (!data.projects || (Array.isArray(data.projects) && data.projects.length === 0)) ? defaultProjects : (Array.isArray(data.projects) ? data.projects : defaultProjects)
      }));

      setErrors({});

    } catch (err) {
      console.error('Error al obtener datos:', err);
      let errorMessage = 'No se pudieron cargar los datos del CV.';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'La conexión al servidor ha expirado. Por favor, verifica que el servidor esté funcionando.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar al servidor. Por favor, verifica que el servidor esté funcionando y accesible.';
        } else {
          errorMessage = err.message;
        }
      }

      setCvData(prevData => ({
        ...prevData,
        name: '',
        profession: '',
        email: '',
        github: 'https://github.com/FacuPVe',
        linkedin: 'https://www.linkedin.com/in/facundo-epv/',
        experience: '',
        skills: defaultSkills,
        projects: defaultProjects
      }));

      setErrors({
        name: errorMessage,
        experience: 'No se pudieron cargar los datos de experiencia.',
        skills: 'No se pudieron cargar los datos de habilidades.',
        projects: 'No se pudieron cargar los datos de proyectos.'
      });
    } finally {
      setLoading(false);
    }
  };

  // const toggleTheme = () => {
  //   setTheme(prev => prev === 'light' ? 'dark' : 'light');
  // };

  // Función para generar PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const lineHeight = 7; // Altura de línea básica
    const sectionMargin = 15; // Margen entre secciones
    const itemMargin = 10; // Margen entre ítems dentro de una sección (ej. proyectos)

    // Configurar fuente base
    doc.setFont('helvetica', 'normal');

    // Título (Nombre)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const nameText = cvData.name || 'Currículum Vitae';
    const splitName = doc.splitTextToSize(nameText, 170);
    doc.text(splitName, margin, y);
    y += (splitName.length * lineHeight) + 5; // Espacio después del nombre

    // Profesión
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    const professionText = cvData.profession || '';
    const splitProfession = doc.splitTextToSize(professionText, 170);
    doc.text(splitProfession, margin, y);
    y += (splitProfession.length * lineHeight) + sectionMargin; // Espacio después de la profesión

    // Contacto
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Contacto', margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${cvData.email || 'No disponible'}`, margin, y);
    y += lineHeight;
    doc.text(`GitHub: ${cvData.github || 'No disponible'}`, margin, y);
    y += lineHeight;
    doc.text(`LinkedIn: ${cvData.linkedin || 'No disponible'}`, margin, y);
    y += sectionMargin; // Espacio después del contacto

    // Experiencia
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Experiencia', margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const experiences = (cvData.experience || '').split('\n\n');
    experiences.forEach(exp => {
      if (y + (lineHeight * 5) > (doc.internal.pageSize.height - margin)) { // Añadir página si es necesario
          doc.addPage();
          y = margin;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Experiencia (Cont.)', margin, y);
          y += lineHeight;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
      }
      const lines = doc.splitTextToSize(exp, 170);
      lines.forEach((line: string) => {
        if (y + lineHeight > (doc.internal.pageSize.height - margin)) { // Añadir página si la línea actual excede el margen inferior
            doc.addPage();
            y = margin;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      y += 5; // Espacio entre bloques de experiencia
    });
    y += sectionMargin - 5; // Espacio después de experiencia (restamos el último espacio de bloque)

     // Verificar si hay suficiente espacio antes de la siguiente sección
     if (y + sectionMargin > (doc.internal.pageSize.height - margin)) {
        doc.addPage();
        y = margin;
     }

    // Habilidades
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Conocimientos', margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const skillsText = (cvData.skills || defaultSkills);
    const splitSkills = doc.splitTextToSize(skillsText, 170);
    doc.text(splitSkills, margin, y);
    y += (splitSkills.length * lineHeight) + sectionMargin; // Espacio después de habilidades

     // Verificar si hay suficiente espacio antes de la siguiente sección
     if (y + sectionMargin > (doc.internal.pageSize.height - margin)) {
        doc.addPage();
        y = margin;
     }

    // Proyectos
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Proyectos', margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const projectsToPDF = (Array.isArray(cvData.projects) && cvData.projects.length > 0) ? cvData.projects : defaultProjects;

    projectsToPDF.forEach((project, index) => {
      if (y + (lineHeight * 10) > (doc.internal.pageSize.height - margin)) { // Añadir página si el próximo proyecto no cabe
          doc.addPage();
          y = margin;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Proyectos (Cont.)', margin, y);
          y += lineHeight;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const projectName = doc.splitTextToSize(project.name, 170);
      doc.text(projectName, margin, y);
      y += (projectName.length * lineHeight);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(project.description, 170);
      descLines.forEach((line: string) => {
         if (y + lineHeight > (doc.internal.pageSize.height - margin)) { // Añadir página si la línea actual excede el margen inferior
            doc.addPage();
            y = margin;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
         }
         doc.text(line, margin, y);
         y += lineHeight;
      });

      doc.setFont('helvetica', 'bold');
      doc.text(`GitHub: ${project.github || 'No disponible'}`, margin, y);
      y += lineHeight;

      doc.setFont('helvetica', 'bold');
      doc.text(`Tecnologías: ${(project.tags || []).join(', ')}`, margin, y);
      y += lineHeight;

      if (index < projectsToPDF.length - 1) {
        y += itemMargin; // Espacio entre proyectos
      }
    });
     y += sectionMargin - itemMargin; // Espacio después de proyectos (restamos el último espacio de item)

    doc.save('cv.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="theme-switch fixed top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded-full ${theme === 'light' ? 'bg-yellow-400' : 'bg-gray-700 text-gray-300'}`}
        >
          <i className="fas fa-sun"></i>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded-full ${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          <i className="fas fa-moon"></i>
        </button>
        </div>

      <div className="container mx-auto py-8 px-4">
        {/* Encabezado del CV */}
        <div className={`cv-header mb-6 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-purple-900 text-white' : 'bg-purple-200 text-gray-900'}`}>
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/4 text-center md:text-left mb-4 md:mb-0">
              <img
                src="https://avatars.githubusercontent.com/u/153614556?v=4"
                alt="Foto de perfil"
                className="profile-image w-32 h-32 rounded-full mx-auto md:mx-0 border-4 border-white"
              />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left mb-4 md:mb-0">
              {errors.name ? (
                <h1 className="text-3xl font-bold mb-2 text-yellow-700">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {errors.name}
                </h1>
              ) : (
                <h1 className="text-3xl font-bold mb-2">{cvData.name}</h1>
              )}
              <h2 className={`text-xl ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>{cvData.profession}</h2>
            </div>
            <div className="w-full md:w-1/4 text-center md:text-right">
              <div className="flex justify-center md:justify-end space-x-4">
                <a href={`mailto:${cvData.email}`} className={`text-xl ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'}`}>
                  <i className="fas fa-envelope"></i>
                </a>
                <a href={cvData.github} target="_blank" rel="noopener noreferrer" className={`text-xl ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'}`}>
                  <i className="fab fa-github"></i>
                </a>
                <a href={cvData.linkedin} target="_blank" rel="noopener noreferrer" className={`text-xl ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'}`}>
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
              {/* Botón de descarga de PDF colocado aquí */}
              <div className="mt-4 flex justify-center md:justify-end">
                <button
                  onClick={generatePDF}
                  className={`px-4 py-2 rounded ${
                    theme === 'dark' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <i className="fas fa-download mr-2"></i>
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Experiencia */}
          <div className={`${theme === 'dark' ? 'bg-gray-850' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
              <i className="fas fa-briefcase mr-2"></i>
              Experiencia
            </h3>
            {errors.experience ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {errors.experience}
              </div>
            ) : (
              cvData.experience.split('\n\n').map((exp, index) => (
                <div key={index} className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                  {exp.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Habilidades */}
          <div className={`${theme === 'dark' ? 'bg-gray-850' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
              <i className="fas fa-tools mr-2"></i>
              Conocimientos
            </h3>
            {errors.skills ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {errors.skills}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cvData.skills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Proyectos */}
          <div className={`${theme === 'dark' ? 'bg-gray-850' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
              <i className="fas fa-code-branch mr-2"></i>
              Proyectos
            </h3>
            {errors.projects ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {errors.projects}
              </div>
            ) : (
              cvData.projects.map((project, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold">{project.name}</h4>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-200 hover:bg-purple-300 text-purple-800'}`}>
                      <i className="fab fa-github mr-1"></i>
                      Ver código
                    </a>
                  </div>
                  <p className="mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.tags || []).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Gráficos */}
          <div className={`${theme === 'dark' ? 'bg-gray-850' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <StatsChart data={cvData} theme={theme} />
          </div>
            </div>
          </div>
          
      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} mt-8 py-6`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                © {new Date().getFullYear()} {cvData.name}
                <br />
                Todos los derechos reservados
              </p>
            </div>
            <div className="flex space-x-4">
              <a href={`mailto:${cvData.email}`} className={`text-sm hover:underline ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'}`}>
                <i className="fas fa-envelope mr-2"></i>Email
              </a>
              <a href={cvData.github} target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'}`}>
                <i className="fab fa-github mr-2"></i>GitHub
              </a>
              <a href={cvData.linkedin} target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'}`}>
                <i className="fab fa-linkedin mr-2"></i>LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App