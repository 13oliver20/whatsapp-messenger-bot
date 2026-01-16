# 📱 WhatsApp Messenger - Aplicación de Envío Automatizado

Aplicación web moderna para enviar mensajes automatizados de WhatsApp a múltiples contactos usando la API de Twilio.

![WhatsApp Messenger](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

## ✨ Características

- 🎨 **Interfaz Moderna**: Diseño limpio y minimalista con efectos glassmorphism
- 📤 **Envío Masivo**: Envía mensajes a múltiples números simultáneamente
- 💬 **Mensajes Predefinidos**: Plantillas listas para usar
- ✏️ **Mensajes Personalizados**: Crea tus propios mensajes
- 📊 **Logs en Tiempo Real**: Visualiza el estado de cada envío
- ✅ **Feedback Visual**: Confirmaciones con checkmarks verdes y errores en rojo
- 🔒 **Seguro**: Credenciales protegidas con variables de entorno

## 🚀 Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- Cuenta de Twilio (gratuita o de pago)
- Navegador web moderno

### Paso 1: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `express`: Servidor web
- `twilio`: SDK oficial de Twilio
- `cors`: Manejo de peticiones cross-origin
- `dotenv`: Gestión de variables de entorno
- `body-parser`: Parseo de JSON

### Paso 2: Configurar Credenciales de Twilio

#### 📝 Cómo Obtener las Credenciales de Twilio

1. **Crear Cuenta en Twilio**
   - Ve a [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Regístrate con tu email (obtendrás crédito gratuito de prueba)
   - Verifica tu número de teléfono

2. **Obtener Account SID y Auth Token**
   - Inicia sesión en [https://console.twilio.com](https://console.twilio.com)
   - En el **Dashboard**, encontrarás:
     - **Account SID**: Empieza con `AC...` (ejemplo: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
     - **Auth Token**: Click en "Show" para verlo
   - ⚠️ **IMPORTANTE**: Nunca compartas tu Auth Token públicamente

3. **Configurar WhatsApp Sandbox (Para Pruebas)**
   - En la consola de Twilio, ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Encontrarás un número de WhatsApp de Twilio (ejemplo: `+14155238886`)
   - **Activar tu número de prueba**:
     - Envía un mensaje de WhatsApp al número de Twilio que te muestran
     - El mensaje debe ser: `join <código-único>` (te lo dan en la consola)
     - Recibirás una confirmación de que tu número está conectado
   - ⚠️ **Limitación del Sandbox**: Solo puedes enviar mensajes a números que hayan hecho "join"

4. **Para Producción (Opcional)**
   - Si quieres enviar a cualquier número sin restricciones:
   - Ve a **Messaging** → **WhatsApp** → **Senders**
   - Solicita un número de WhatsApp Business (requiere aprobación de Facebook)
   - Este proceso puede tardar varios días

#### 🔧 Configurar el Archivo `.env`

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores de ejemplo con tus credenciales reales:

```env
# Credenciales de Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_real_aqui
TWILIO_WHATSAPP_NUMBER=+14155238886

# Puerto del servidor
PORT=3000
```

**Ejemplo con valores reales:**
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd
TWILIO_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TWILIO_WHATSAPP_NUMBER=+14155238886
PORT=3000
```

## 🎯 Uso

### Iniciar el Servidor

```bash
npm start
```

Verás en la consola:
```
🚀 Servidor ejecutándose en http://localhost:3000
📡 API disponible en http://localhost:3000/api/send-messages
```

### Usar la Aplicación

1. **Abrir en el Navegador**
   - Ve a: `http://localhost:3000`

2. **Ingresar Números de Teléfono**
   - Formato: `+[código país][número]`
   - Ejemplos:
     - Colombia: `+573001234567`
     - México: `+525512345678`
     - España: `+34612345678`
   - Separa múltiples números con comas:
     ```
     +573001234567, +573009876543, +573005555555
     ```

3. **Seleccionar Mensaje**
   - Elige un mensaje predefinido del menú desplegable, o
   - Selecciona "Mensaje Personalizado" y escribe el tuyo

4. **Enviar Mensajes**
   - Click en "Enviar Mensajes"
   - Observa los logs en tiempo real
   - ✅ Verde = Enviado exitosamente
   - ❌ Rojo = Error en el envío

## 📋 Mensajes Predefinidos

La aplicación incluye estas plantillas:

- **Confirmación de Compra**: "Hola! 👋 Gracias por tu compra..."
- **Pedido Listo**: "¡Tu pedido está listo! 📦..."
- **Promoción Especial**: "Hola! 🎉 Tenemos una promoción especial..."
- **Recordatorio de Cita**: "Recordatorio: Tienes una cita programada..."
- **Agradecimiento**: "¡Gracias por tu preferencia! 💚..."

## 🔍 Solución de Problemas

### Error: "Las credenciales de Twilio no están configuradas"

**Solución**: Verifica que el archivo `.env` tenga las credenciales correctas.

### Error: "Unable to create record"

**Causas comunes**:
- El número de destino no ha hecho "join" al sandbox de WhatsApp
- El formato del número es incorrecto (debe incluir `+` y código de país)
- Crédito de Twilio agotado

**Solución**: 
1. Asegúrate de que el destinatario haya enviado el mensaje "join" al número de Twilio
2. Verifica el formato: `+[código país][número sin espacios]`

### Error: "Authentication failed"

**Solución**: Verifica que tu Account SID y Auth Token sean correctos en el archivo `.env`

### El servidor no inicia

**Solución**: 
1. Verifica que Node.js esté instalado: `node --version`
2. Reinstala dependencias: `npm install`
3. Verifica que el puerto 3000 no esté en uso

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **Twilio SDK**: Integración con WhatsApp
- **dotenv**: Gestión de variables de entorno

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con gradientes y animaciones
- **JavaScript (Vanilla)**: Lógica del cliente
- **Google Fonts (Inter)**: Tipografía moderna

## 📁 Estructura del Proyecto

```
whatsapp-messenger/
├── public/
│   ├── index.html      # Interfaz de usuario
│   ├── style.css       # Estilos modernos
│   └── script.js       # Lógica del frontend
├── server.js           # Servidor Express + Twilio
├── package.json        # Dependencias
├── .env                # Credenciales (NO COMPARTIR)
├── .env.example        # Plantilla de credenciales
├── .gitignore          # Archivos ignorados por Git
└── README.md           # Este archivo
```

## 🔒 Seguridad

- ✅ Las credenciales están en `.env` (no se suben a Git)
- ✅ El archivo `.env` está en `.gitignore`
- ✅ Nunca compartas tu Auth Token públicamente
- ✅ Usa HTTPS en producción

## 📝 Notas Importantes

### Limitaciones del Sandbox de Twilio

- Solo puedes enviar mensajes a números que hayan hecho "join"
- Cada mensaje incluirá un prefijo de Twilio
- Límite de mensajes según tu plan

### Costos

- **Cuenta de Prueba**: Crédito gratuito limitado
- **Producción**: Consulta precios en [Twilio Pricing](https://www.twilio.com/whatsapp/pricing)

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia:

1. Abre un issue
2. Crea un pull request
3. Comparte tus ideas

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto como desees.

## 🆘 Soporte

Si tienes problemas:

1. Revisa la sección de **Solución de Problemas**
2. Consulta la [documentación de Twilio](https://www.twilio.com/docs/whatsapp)
3. Abre un issue en este repositorio

---

**¡Disfruta enviando mensajes de WhatsApp automatizados! 🚀📱**
