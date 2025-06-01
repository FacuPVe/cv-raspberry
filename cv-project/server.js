import https from 'https';
import http from 'http';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas de la API
app.get('/api/cv', async (req, res) => {
    try {
        console.log('Recibida petición GET a /api/cv');
        const response = await fetch(process.env.VITE_API_URL);
        if (!response.ok) {
            throw new Error(`Error en la API PHP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Datos recibidos de la API PHP:', data);
        res.json(data);
    } catch (error) {
        console.error('Error en /api/cv GET:', error);
        res.status(500).json({ error: 'Error al obtener datos del CV: ' + error.message });
    }
});

app.post('/api/cv', async (req, res) => {
    try {
        console.log('Recibida petición POST a /api/cv');
        const response = await fetch(process.env.VITE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        if (!response.ok) {
            throw new Error(`Error en la API PHP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Respuesta de la API PHP:', data);
        res.json(data);
    } catch (error) {
        console.error('Error en /api/cv POST:', error);
        res.status(500).json({ error: 'Error al actualizar datos del CV: ' + error.message });
    }
});

// Manejar todas las demás rutas sirviendo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Configuración de SSL
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/facundoepv-cv.duckdns.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/facundoepv-cv.duckdns.org/fullchain.pem')
};

// Crear servidor HTTPS
const httpsServer = https.createServer(options, app);

// Crear servidor HTTP para redirección
const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
});
const httpServer = http.createServer(httpApp);

// Iniciar servidores
httpsServer.listen(443, () => {
    console.log('Servidor HTTPS en el puerto 443');
});

httpServer.listen(80, () => {
    console.log('Servidor HTTP en el puerto 80 (redireccionando a HTTPS)');
}); 