// ========================================
// Elementos del DOM
// ========================================
const messageForm = document.getElementById('messageForm');
const phoneInputsContainer = document.getElementById('phoneInputsContainer');
const addPhoneInputBtn = document.getElementById('addPhoneInputBtn');
const messageNameInput = document.getElementById('messageName');
const statusBar = document.getElementById('statusBar');
const statusDot = statusBar.querySelector('.status-dot');
const statusText = statusBar.querySelector('.status-text');
const qrSection = document.getElementById('qrSection');
const qrContainer = document.getElementById('qrContainer');
const messageContentInput = document.getElementById('messageContent');
const addMessageBtn = document.getElementById('addMessageBtn');
const messagesList = document.getElementById('messagesList');
const selectedCountSpan = document.getElementById('selectedCount');
const sendButton = document.getElementById('sendButton');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const logsCard = document.getElementById('logsCard');
const logsContainer = document.getElementById('logsContainer');
const successCountSpan = document.getElementById('successCount');
const failureCountSpan = document.getElementById('failureCount');

// ========================================
// Gestión de Mensajes
// ========================================
let customMessages = [];

// Cargar mensajes desde localStorage
function loadMessages() {
    const saved = localStorage.getItem('whatsappMessages');
    if (saved) {
        customMessages = JSON.parse(saved);
    } else {
        // Mensajes predefinidos iniciales
        customMessages = [
            {
                id: Date.now() + 1,
                name: 'Confirmación de Compra',
                content: 'Hola! 👋 Gracias por tu compra. Tu pedido está siendo procesado y te notificaremos cuando esté listo.'
            },
            {
                id: Date.now() + 2,
                name: 'Pedido Listo',
                content: '¡Tu pedido está listo! 📦 Puedes pasar a recogerlo en nuestro local. ¡Te esperamos!'
            },
            {
                id: Date.now() + 3,
                name: 'Promoción Especial',
                content: 'Hola! 🎉 Tenemos una promoción especial para ti. ¡No te la pierdas!'
            },
            {
                id: Date.now() + 4,
                name: 'Recordatorio de Cita',
                content: 'Recordatorio: Tienes una cita programada mañana. Por favor confirma tu asistencia.'
            },
            {
                id: Date.now() + 5,
                name: 'Agradecimiento',
                content: '¡Gracias por tu preferencia! 💚 Esperamos verte pronto.'
            }
        ];
        saveMessages();
    }
    renderMessages();
}

// Guardar mensajes en localStorage
function saveMessages() {
    localStorage.setItem('whatsappMessages', JSON.stringify(customMessages));
}

// Renderizar lista de mensajes
function renderMessages() {
    if (customMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="messages-list-empty">
                <div class="messages-list-empty-icon">📝</div>
                <div class="messages-list-empty-text">No hay mensajes. Crea tu primer mensaje arriba.</div>
            </div>
        `;
        return;
    }

    messagesList.innerHTML = customMessages.map(msg => `
        <div class="message-item" data-id="${msg.id}">
            <div class="message-item-header">
                <input 
                    type="checkbox" 
                    class="message-checkbox" 
                    data-id="${msg.id}"
                    id="msg-${msg.id}"
                >
                <label for="msg-${msg.id}" class="message-item-title">${msg.name}</label>
                <div class="message-item-actions">
                    <button type="button" class="message-item-edit" data-id="${msg.id}">✏️ Editar</button>
                    <button type="button" class="message-item-delete" data-id="${msg.id}">🗑️ Eliminar</button>
                </div>
            </div>
            <div class="message-item-content">${msg.content}</div>
        </div>
    `).join('');

    // Agregar event listeners
    document.querySelectorAll('.message-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });

    document.querySelectorAll('.message-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            deleteMessage(id);
        });
    });

    document.querySelectorAll('.message-item-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            editMessage(id);
        });
    });

    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('message-item-delete')) return;
            const checkbox = item.querySelector('.message-checkbox');
            checkbox.checked = !checkbox.checked;
            updateSelectedCount();
        });
    });

    updateSelectedCount();
}

// Agregar o actualizar mensaje
function addMessage() {
    const name = messageNameInput.value.trim();
    const content = messageContentInput.value.trim();

    if (!name || !content) {
        showAlert('Por favor completa el nombre y contenido del mensaje', 'error');
        return;
    }

    // Verificar si estamos editando
    const editingId = addMessageBtn.dataset.editingId;

    if (editingId) {
        // Actualizar mensaje existente
        const index = customMessages.findIndex(msg => msg.id === parseInt(editingId));
        if (index !== -1) {
            customMessages[index].name = name;
            customMessages[index].content = content;
            showAlert('✅ Mensaje actualizado correctamente', 'success');
        }

        // Restaurar botón a "Agregar"
        addMessageBtn.innerHTML = `
            <span class="btn-icon">➕</span>
            <span>Agregar Mensaje</span>
        `;
        delete addMessageBtn.dataset.editingId;
    } else {
        // Crear nuevo mensaje
        const newMessage = {
            id: Date.now(),
            name: name,
            content: content
        };
        customMessages.push(newMessage);
        showAlert('✅ Mensaje agregado correctamente', 'success');
    }

    saveMessages();
    renderMessages();

    // Limpiar campos
    messageNameInput.value = '';
    messageContentInput.value = '';
}

// Eliminar mensaje
function deleteMessage(id) {
    if (confirm('¿Estás seguro de eliminar este mensaje?')) {
        customMessages = customMessages.filter(msg => msg.id !== id);
        saveMessages();
        renderMessages();
        showAlert('Mensaje eliminado', 'success');
    }
}

// Editar mensaje
function editMessage(id) {
    const message = customMessages.find(msg => msg.id === id);
    if (!message) return;

    // Llenar los campos con los datos del mensaje
    messageNameInput.value = message.name;
    messageContentInput.value = message.content;

    // Cambiar el botón de "Agregar" a "Actualizar"
    addMessageBtn.innerHTML = `
        <span class="btn-icon">💾</span>
        <span>Actualizar Mensaje</span>
    `;
    addMessageBtn.dataset.editingId = id;

    // Scroll al formulario
    messageNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    messageNameInput.focus();

    showAlert('Editando mensaje. Haz los cambios y presiona "Actualizar"', 'info');
}

// Actualizar contador de seleccionados
function updateSelectedCount() {
    const selected = document.querySelectorAll('.message-checkbox:checked');
    const count = selected.length;

    if (count === 0) {
        selectedCountSpan.textContent = '💡 Selecciona uno o más mensajes para enviar';
    } else if (count === 1) {
        selectedCountSpan.textContent = `✅ ${count} mensaje seleccionado`;
    } else {
        selectedCountSpan.textContent = `✅ ${count} mensajes seleccionados`;
    }

    // Actualizar clases de selección
    document.querySelectorAll('.message-item').forEach(item => {
        const checkbox = item.querySelector('.message-checkbox');
        if (checkbox.checked) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Obtener mensajes seleccionados
function getSelectedMessages() {
    const selected = [];
    document.querySelectorAll('.message-checkbox:checked').forEach(checkbox => {
        const id = parseInt(checkbox.dataset.id);
        const message = customMessages.find(msg => msg.id === id);
        if (message) {
            selected.push(message);
        }
    });
    return selected;
}

// ========================================
// Gestión de Números de Teléfono
// ========================================

// Añadir un nuevo campo de entrada de teléfono
function addPhoneInput() {
    const row = document.createElement('div');
    row.className = 'phone-input-row';
    row.innerHTML = `
        <span class="country-prefix">+51</span>
        <input type="tel" class="phone-input" placeholder="987 654 321" required>
        <button type="button" class="btn-remove-phone" title="Eliminar número">🗑️</button>
    `;

    // Botón para eliminar esta fila
    const removeBtn = row.querySelector('.btn-remove-phone');
    removeBtn.addEventListener('click', () => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 300);
    });

    phoneInputsContainer.appendChild(row);

    // Auto-focus en el nuevo input
    row.querySelector('input').focus();
}

// Obtener y formatear todos los números de teléfono
function getFormattedPhoneNumbers() {
    const inputs = document.querySelectorAll('.phone-input');
    const numbers = [];

    inputs.forEach(input => {
        let val = input.value.trim().replace(/\s+/g, ''); // Quitar espacios

        if (val) {
            // Lógica de prefijo Perú (+51)
            // Si tiene 9 dígitos (ej: 987654321), añadir +51
            if (val.length === 9 && /^\d+$/.test(val)) {
                val = '+51' + val;
            }
            // Si empieza con 51 y tiene 11 dígitos, añadir +
            else if (val.length === 11 && val.startsWith('51')) {
                val = '+' + val;
            }
            // Si ya tiene el +, dejarlo así
            else if (!val.startsWith('+')) {
                val = '+' + val; // Fallback: siempre con +
            }

            numbers.push(val);
        }
    });

    return numbers;
}

// ========================================
// Event Listeners
// ========================================

// Añadir nuevo input de teléfono
addPhoneInputBtn.addEventListener('click', addPhoneInput);

// Agregar mensaje
addMessageBtn.addEventListener('click', addMessage);

// Permitir Enter en el nombre para agregar
messageNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        messageContentInput.focus();
    }
});

// Manejar envío del formulario
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const numbers = getFormattedPhoneNumbers();
    const selectedMessages = getSelectedMessages();

    // Validaciones
    if (numbers.length === 0) {
        showAlert('Por favor ingresa al menos un número de teléfono', 'error');
        return;
    }

    if (selectedMessages.length === 0) {
        showAlert('Por favor selecciona al menos un mensaje para enviar', 'error');
        return;
    }

    // Deshabilitar botón y mostrar loader
    setLoadingState(true);

    // Limpiar logs anteriores
    clearLogs();

    // Mostrar card de logs
    logsCard.style.display = 'block';
    logsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
        let totalSuccessful = 0;
        let totalFailed = 0;

        // Enviar cada mensaje seleccionado
        for (const message of selectedMessages) {
            addLogItem({
                success: true,
                phoneNumber: `📤 Enviando: "${message.name}"`,
                status: 'processing'
            });

            // Enviar petición al backend
            const response = await fetch('http://localhost:3000/api/send-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumbers: numbers.join(','),
                    message: message.content
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar mensajes');
            }

            // Mostrar resultados de este mensaje
            data.results.forEach(result => {
                addLogItem({
                    ...result,
                    messageName: message.name
                });
            });

            totalSuccessful += data.summary.successful;
            totalFailed += data.summary.failed;
        }

        // Actualizar contadores totales
        successCountSpan.textContent = totalSuccessful;
        failureCountSpan.textContent = totalFailed;

        // Mostrar mensaje de éxito
        if (totalSuccessful > 0) {
            showAlert(
                `✅ ${totalSuccessful} mensaje(s) enviado(s) exitosamente`,
                'success'
            );
        }

        if (totalFailed > 0) {
            showAlert(
                `⚠️ ${totalFailed} mensaje(s) fallaron`,
                'warning'
            );
        }

    } catch (error) {
        console.error('Error:', error);
        showAlert('❌ Error: ' + error.message, 'error');
        addLogItem({
            success: false,
            phoneNumber: 'Sistema',
            error: error.message
        });
    } finally {
        setLoadingState(false);
    }
});

// ========================================
// Funciones de UI
// ========================================

/**
 * Establece el estado de carga del botón
 */
function setLoadingState(isLoading) {
    sendButton.disabled = isLoading;

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

/**
 * Limpia los logs anteriores
 */
function clearLogs() {
    logsContainer.innerHTML = '';
    successCountSpan.textContent = '0';
    failureCountSpan.textContent = '0';
}

/**
 * Agrega un item al log
 */
function addLogItem(result) {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${result.success ? 'success' : 'error'}`;

    const icon = result.success ? '✅' : '❌';
    let statusText = '';

    if (result.status === 'processing') {
        statusText = result.phoneNumber;
    } else if (result.success) {
        const msgName = result.messageName ? ` - ${result.messageName}` : '';
        statusText = `Enviado correctamente${msgName} (${result.status})`;
    } else {
        statusText = result.error;
    }

    logItem.innerHTML = `
        <div class="log-icon">${icon}</div>
        <div class="log-content">
            <div class="log-phone">${result.phoneNumber}</div>
            <div class="${result.success ? 'log-message' : 'log-error-message'}">
                ${statusText}
            </div>
        </div>
    `;

    logsContainer.appendChild(logItem);
}

/**
 * Muestra una alerta temporal
 */
function showAlert(message, type = 'info') {
    // Crear elemento de alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    alert.textContent = message;

    document.body.appendChild(alert);

    // Remover después de 5 segundos
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Agregar estilos de animación para las alertas
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Gestión de Conexión y QR
// ========================================

async function checkStatus() {
    try {
        const response = await fetch('http://localhost:3000/api/status');
        const data = await response.json();

        updateConnectionUI(data.status, data.qr);
    } catch (error) {
        console.error('Error al verificar estado:', error);
        updateConnectionUI('disconnected', null);
    }
}

function updateConnectionUI(status, qr) {
    // Actualizar barra de estado
    statusDot.className = `status-dot ${status}`;

    switch (status) {
        case 'ready':
            statusText.textContent = 'Conectado';
            qrSection.style.display = 'none';
            sendButton.disabled = false;
            break;
        case 'qr_ready':
            statusText.textContent = 'Esperando QR';
            qrSection.style.display = 'block';
            if (qr) {
                qrContainer.innerHTML = `<img src="${qr}" alt="WhatsApp QR Code">`;
            }
            sendButton.disabled = true;
            break;
        case 'loading':
            statusText.textContent = 'Iniciando...';
            qrSection.style.display = 'none';
            sendButton.disabled = true;
            break;
        default:
            statusText.textContent = 'Desconectado';
            qrSection.style.display = 'none';
            sendButton.disabled = true;
    }
}

// Iniciar polling
setInterval(checkStatus, 3000);
checkStatus();

// Cargar mensajes al iniciar
loadMessages();
console.log('✅ WhatsApp Messenger cargado correctamente');
console.log('📡 Backend esperado en: http://localhost:3000');
