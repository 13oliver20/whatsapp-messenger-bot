require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = null;
let clientStatus = 'disconnected';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

console.log('📦 Iniciando configuración del cliente WhatsApp...');

// Versión ultra-estable reconocida por la comunidad
const WAP_VERSION = '2.2412.54';
const REMOTE_PATH = `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${WAP_VERSION}.html`;

const client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    type: 'remote',
    remotePath: REMOTE_PATH
  },
  puppeteer: {
    executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-software-rasterizer'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('📱 [EVENT] QR Generado. Esperando escaneo...');
  qrcode.toDataURL(qr, (err, url) => {
    qrCodeData = url;
    clientStatus = 'qr_ready';
  });
});

client.on('ready', () => {
  console.log('✅ [EVENT] WhatsApp Web está LISTO.');
  clientStatus = 'ready';
  qrCodeData = null;
});

client.on('authenticated', () => {
  console.log('🔐 [EVENT] Autenticado correctamente.');
  clientStatus = 'loading';
});

client.on('auth_failure', (msg) => {
  console.error('❌ [EVENT] Error de autenticación:', msg);
  clientStatus = 'disconnected';
  qrCodeData = null;

  // Limpiar sesión corrupta y reintentar
  console.log('🧹 Limpiando sesión corrupta...');
  setTimeout(() => {
    const fs = require('fs');
    const path = require('path');
    const authPath = path.join(__dirname, '.wwebjs_auth');

    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('✅ Sesión corrupta eliminada');
    }

    console.log('🔄 Re-inicializando cliente con sesión limpia...');
    client.initialize();
  }, 3000);
});

client.on('disconnected', (reason) => {
  console.log('🔌 [EVENT] Cliente desconectado:', reason);
  clientStatus = 'disconnected';
  qrCodeData = null;

  setTimeout(() => {
    console.log('🔄 Re-inicializando cliente...');
    client.initialize();
  }, 5000);
});

console.log('🚀 Inicializando cliente...');
client.initialize().catch(err => console.error('Error inicial:', err));

app.get('/api/status', (req, res) => {
  res.json({ status: clientStatus, qr: qrCodeData });
});

// Endpoint para forzar reconexión (útil cuando la sesión está corrupta)
app.post('/api/reconnect', async (req, res) => {
  try {
    console.log('🔄 [API] Solicitud de reconexión manual...');

    // Limpiar sesión PRIMERO
    const fs = require('fs');
    const path = require('path');
    const authPath = path.join(__dirname, '.wwebjs_auth');

    if (fs.existsSync(authPath)) {
      try {
        fs.rmSync(authPath, { recursive: true, force: true });
        console.log('✅ Sesión eliminada');
      } catch (err) {
        console.log('⚠️ Error al eliminar sesión:', err.message);
      }
    }

    // Destruir cliente actual si existe
    if (client) {
      try {
        await client.destroy();
        console.log('✅ Cliente destruido');
      } catch (err) {
        console.log('⚠️ Error al destruir cliente (continuando):', err.message);
      }
    }



    // Resetear estado
    clientStatus = 'loading';
    qrCodeData = null;

    // Reinicializar con manejo de errores
    setTimeout(() => {
      console.log('🚀 Re-inicializando cliente...');
      client.initialize().catch(err => {
        console.error('❌ Error al inicializar:', err);
        clientStatus = 'disconnected';
      });
    }, 3000);

    res.json({ success: true, message: 'Reconexión iniciada. El QR aparecerá en 10-15 segundos.' });
  } catch (error) {
    console.error('❌ Error en reconexión:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-messages', async (req, res) => {
  if (clientStatus !== 'ready') {
    return res.status(400).json({ success: false, error: 'Conexión no lista' });
  }

  const { phoneNumbers, message } = req.body;
  const numbers = phoneNumbers.split(',').map(n => n.trim()).filter(n => n.length > 0);
  const results = [];

  console.log(`📨 Iniciando campaña de envío para ${numbers.length} números.`);

  for (const phoneNumber of numbers) {
    try {
      let cleanNumber = phoneNumber.replace(/\D/g, '');
      if (cleanNumber.length === 9) cleanNumber = '51' + cleanNumber;
      const targetId = `${cleanNumber}@c.us`;

      console.log(`📤 Enviando mensaje a: ${targetId}...`);

      // MÉTODO CRÍTICO: Envío directo a nivel de cliente para evitar errores de UI interna
      await client.sendMessage(targetId, message, {
        linkPreview: false,
        sendSeen: false // Deshabilitar confirmación de lectura pre-envío (evita crash markedUnread)
      });

      results.push({
        phoneNumber,
        success: true,
        status: 'sent'
      });
      console.log(`✅ Éxito al enviar a ${phoneNumber}`);

      // Pausa de seguridad humana de 4 segundos
      await new Promise(r => setTimeout(r, 4000));

    } catch (error) {
      console.error(`❌ Fallo en ${phoneNumber}:`, error.message);

      // Si el error es el crash de la librería, lo reportamos de forma amigable
      if (error.message.includes('markedUnread')) {
        results.push({
          phoneNumber,
          success: false,
          error: 'Falla técnica temporal de la sesión (Browser Crash). Recarga la página.'
        });
      } else {
        results.push({ phoneNumber, success: false, error: error.message });
      }
    }
  }

  res.json({
    success: true,
    summary: {
      total: numbers.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    },
    results
  });
});

app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
