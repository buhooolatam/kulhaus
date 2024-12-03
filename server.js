const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Archivo para almacenar la huella digital registrada
const FINGERPRINT_FILE = 'fingerprint.json';

// Ruta para validar la huella digital
app.post('/validate', (req, res) => {
    const { fingerprint } = req.body;

    if (!fingerprint) {
        return res.status(400).json({ error: 'Fingerprint no proporcionada.' });
    }

    // Verificar si ya existe una huella registrada
    if (fs.existsSync(FINGERPRINT_FILE)) {
        const storedFingerprint = fs.readFileSync(FINGERPRINT_FILE, 'utf-8');

        if (storedFingerprint === fingerprint) {
            // Huella válida
            return res.json({ access: true });
        } else {
            // Huella no coincide
            return res.json({ access: false });
        }
    } else {
        // Registrar la primera huella
        fs.writeFileSync(FINGERPRINT_FILE, fingerprint);
        return res.json({ access: true });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
