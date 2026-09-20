window.addEventListener('DOMContentLoaded', () => {
  const origEl = document.getElementById('orig')
  const transEl = document.getElementById('trans')
  const langSrcEl = document.getElementById('lang-src')
  const langTargetEl = document.getElementById('lang-target')
  const labelTargetEl = document.getElementById('label-target')
  const containerEl = document.querySelector('.window-container')
  const copyBtn = document.getElementById('copy')
  const transparencyBtn = document.getElementById('toggle-transparency')
  const speakOrigBtn = document.getElementById('speak-orig')
  const speakTransBtn = document.getElementById('speak-trans')
  const minBtn = document.getElementById('minimize')
  const closeBtn = document.getElementById('close')

  if (window.electronAPI && window.electronAPI.onTranslate) {
    window.electronAPI.onTranslate((data) => {
      origEl.classList.remove('update-anim')
      transEl.classList.remove('update-anim')
      void origEl.offsetWidth

      origEl.textContent = data.original
      transEl.textContent = data.translated
      langSrcEl.textContent = data.detectedSource.toUpperCase()

      const targetLang = data.target.toUpperCase()
      langTargetEl.textContent = targetLang
      labelTargetEl.textContent = `Tradução (${targetLang})`

      origEl.classList.add('update-anim')
      transEl.classList.add('update-anim')

      setTimeout(() => {
        const height = Math.min(Math.max(containerEl.scrollHeight, 180), 600)
        if (window.electronAPI.setWindowHeight) {
          window.electronAPI.setWindowHeight(height)
        }
      }, 100)
    })
  }

  copyBtn.addEventListener('click', async () => {
    const text = transEl.textContent
    if (text === '-' || !text) return

    if (window.electronAPI && window.electronAPI.copyToClipboard) {
      await window.electronAPI.copyToClipboard(text)
      copyBtn.textContent = 'Copiado!'
      setTimeout(() => copyBtn.textContent = 'Copiar', 2000)
    }
  })

  transparencyBtn.addEventListener('click', () => {
    const isOpaque = containerEl.classList.toggle('opaque')
    const actionLabel = isOpaque ? 'Ativar transparência' : 'Remover transparência'
    transparencyBtn.title = actionLabel
    transparencyBtn.setAttribute('aria-label', actionLabel)
  })

  const speak = (text, lang) => {
    if (text === '-' || !text) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    window.speechSynthesis.speak(utterance)
  }

  speakOrigBtn.addEventListener('click', () => {
    speak(origEl.textContent, langSrcEl.textContent.toLowerCase())
  })

  speakTransBtn.addEventListener('click', () => {
    const lang = langTargetEl.textContent.toLowerCase() === 'pt' ? 'pt-BR' : 'en-US'
    speak(transEl.textContent, lang)
  })

  minBtn.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.minimizeWindow) {
      window.electronAPI.minimizeWindow()
    }
  })

  closeBtn.addEventListener('click', () => {
    window.close()
  })
})
