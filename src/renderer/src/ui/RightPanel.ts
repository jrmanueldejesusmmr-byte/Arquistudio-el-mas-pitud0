import { AIChatService } from '../services/AIChatService'

/**
 * Panel derecho: instrucciones dinámicas del proyecto + widget "Chat IA
 * estilo Siri". Equivalente a Views/Controls/RightPanelView.xaml.
 */
export function mountRightPanel(
  container: HTMLElement,
  instructions: string[],
  aiChat: AIChatService
): void {
  container.innerHTML = `
    <div class="right-panel-header">
      <h2 class="panel-title">Instrucciones del Proyecto</h2>
    </div>
    <div class="instructions-scroll">
      <ul class="instructions-list">
        ${instructions.map((text) => `<li>${text}</li>`).join('')}
      </ul>
    </div>
    <div class="chat-widget">
      <div class="chat-widget-header">
        <span class="chat-status-dot"></span>
        <h3>Chat IA</h3>
      </div>
      <div id="chat-messages" class="chat-messages">
        <p class="chat-welcome">Asistente IA listo. Puedes escribir instrucciones de diseño o comandos en lenguaje natural.</p>
      </div>
      <div class="chat-input-row">
        <input id="chat-input" type="text"
               placeholder="Escribe una instrucción..." />
        <button id="chat-send" title="Enviar mensaje">➤</button>
      </div>
    </div>
  `

  const messagesEl = container.querySelector<HTMLDivElement>('#chat-messages')!
  const inputEl = container.querySelector<HTMLInputElement>('#chat-input')!
  const sendBtn = container.querySelector<HTMLButtonElement>('#chat-send')!

  function appendMessage(text: string, sender: 'user' | 'ia' = 'ia'): void {
    const p = document.createElement('p')
    p.className = `chat-msg chat-msg-${sender}`
    p.textContent = text
    messagesEl.appendChild(p)
    messagesEl.scrollTop = messagesEl.scrollHeight
  }

  function send(): void {
    const text = inputEl.value.trim()
    if (!text) return
    appendMessage(`Tú: ${text}`, 'user')

    // En producción, "text" se envía al backend de IA y la respuesta (JSON)
    // llega de forma asíncrona a aiChat.applyJsonCommand. Aquí se deja el
    // punto de integración explícito, igual que en MainViewModel.cs.
    const result = aiChat.applyJsonCommand(text)
    appendMessage(`IA: ${result.message}`, 'ia')

    inputEl.value = ''
  }

  sendBtn.addEventListener('click', send)
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send()
  })
}
