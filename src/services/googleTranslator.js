// Real translation service using Google Translate API (gtx) with bidirectional support
module.exports = {
  translate: async function(text) {
    if (!text.trim()) return { original: text, translated: '', detectedSource: 'auto', target: 'en' }
    
    try {
      // Step 1: Detect and try English translation first
      const detectUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
      const response = await fetch(detectUrl)
      const data = await response.json()
      
      let detectedSource = data[2]
      let translated = data[0].map(item => item[0]).join('')
      let target = 'en'

      // Step 2: If detected as English, translate to Portuguese instead
      if (detectedSource === 'en') {
        const ptUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`
        const ptResponse = await fetch(ptUrl)
        const ptData = await ptResponse.json()
        translated = ptData[0].map(item => item[0]).join('')
        target = 'pt'
      }

      return {
        original: text,
        translated,
        detectedSource,
        target
      }
    } catch (e) {
      console.error('Translation API error:', e)
      return {
        original: text,
        translated: text + ' (erro na tradução)',
        detectedSource: 'error',
        target: 'en'
      }
    }
  }
}
