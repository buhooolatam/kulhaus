const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Archivo para almacenar la huella digital registrada
const FINGERPRINT_FILE = 'fingerprint.json';
const STATUS_FILE = 'status.json'; // Archivo para almacenar el estado (bloqueado/libre)

// Ruta para validar la huella digital
app.post('/validate', (req, res) => {
    const { fingerprint } = req.body;

    if (!fingerprint) {
        return res.status(400).json({ error: 'Fingerprint no proporcionada.' });
    }

    // Leer el estado actual
    const status = fs.existsSync(STATUS_FILE)
        ? JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8')).status
        : 'libre'; // Por defecto, estado libre

    if (status === 'libre') {
        // Si está en estado libre, registrar la nueva huella
        fs.writeFileSync(FINGERPRINT_FILE, fingerprint);
        fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'bloqueado' })); // Cambiar a bloqueado
        return res.json({ access: true, message: 'Acceso permitido y huella registrada.' });
    }

    // Si está bloqueado, validar contra la huella registrada
    if (fs.existsSync(FINGERPRINT_FILE)) {
        const storedFingerprint = fs.readFileSync(FINGERPRINT_FILE, 'utf-8');
        if (storedFingerprint === fingerprint) {
            return res.json({ access: true, message: 'Acceso permitido.' });
        } else {
            return res.json({ access: false, message: 'Acceso denegado.' });
        }
    } else {
        return res.json({ access: false, message: 'No hay huella registrada.' });
    }
});

// Ruta para cambiar el estado (bloqueado/libre)
app.post('/set-status', (req, res) => {
    const { status } = req.body;

    if (!status || (status !== 'bloqueado' && status !== 'libre')) {
        return res.status(400).json({ error: 'Estado inválido. Usa "bloqueado" o "libre".' });
    }

    fs.writeFileSync(STATUS_FILE, JSON.stringify({ status }));
    return res.json({ success: true, message: `Estado cambiado a "${status}".` });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
