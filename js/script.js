function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateButtons(theme);
}

function updateButtons(theme) {
    const lightBtn = document.getElementById('lightBtn');
    const darkBtn = document.getElementById('darkBtn');

    lightBtn.classList.toggle('active', theme === 'light');
    darkBtn.classList.toggle('active', theme === 'dark');
}

// Se utiliza localStorage para cargar el tema guardado o usar el predeterminado
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// Para mejorar la experiencia de usuario se detecta el color de preferencia
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
prefersDark.addListener((e) => {
    const theme = e.matches ? 'dark' : 'light';
    setTheme(theme);
});
