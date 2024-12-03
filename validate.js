const fs = require('fs');

const FINGERPRINT_FILE = '/tmp/fingerprint.json'; // Almacenamiento temporal para Vercel
const STATUS_FILE = '/tmp/status.json'; // Almacenamiento temporal para Vercel

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { fingerprint } = req.body;

        if (!fingerprint) {
            return res.status(400).json({ error: 'Fingerprint no proporcionada.' });
        }

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
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Método ${req.method} no permitido` });
    }
}
