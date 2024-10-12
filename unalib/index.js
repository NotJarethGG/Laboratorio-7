const urlRegex = /^(https?:\/\/[^\s]+)$/;
const imageExtensions = /\.(png|jpe?g|gif)$/i;
const videoSources = /(youtube\.com|youtu\.be)/;
const phoneRegex = /^\+?(\d{1,4})?[-.\s]?(\(?\d{2,4}\)?)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{0,9}$/;

const MessageValidator = {
  verifyUrl(text) {
    return urlRegex.test(text);
  },

  isImageFileUrl(url) {
    return imageExtensions.test(url);
  },

  isVideoLink(url) {
    return videoSources.test(url);
  },

  cleanInput(input) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return input.replace(/[&<>"']/g, (s) => entityMap[s]);
  },

  isValidPhoneNumber(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 7;
  },

  createEmbedCode(url) {
    if (this.isImageFileUrl(url)) {
      return `<img src="${this.cleanInput(url)}" alt="Imagen adjunta" class="embedded-image" />`;
    } 
    if (this.isVideoLink(url)) {
      const videoId = this.extractVideoId(url);
      if (videoId) {
        return `<iframe src="https://www.youtube.com/embed/${this.cleanInput(videoId)}" 
                 class="embedded-video" frameborder="0" allowfullscreen></iframe>`;
      }
    }
    return `<a href="${this.cleanInput(url)}" target="_blank" rel="noopener noreferrer">${this.cleanInput(url)}</a>`;
  },

  extractVideoId(url) {
    let videoId = '';
    if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com')) {
      videoId = url.split('v=')[1];
    }
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    return videoId;
  },

  validateMessage(messageData) {
    try {
      const msgObject = JSON.parse(messageData);
      msgObject.mensaje = this.cleanInput(msgObject.mensaje);

      if (this.isValidPhoneNumber(msgObject.mensaje)) {
        msgObject.tipo = 'telefono';
        msgObject.mensaje = `Número de teléfono aceptado: ${msgObject.mensaje}`;
      } else if (this.verifyUrl(msgObject.mensaje)) {
        msgObject.tipo = 'url';
        msgObject.mensaje = this.createEmbedCode(msgObject.mensaje);
      } else {
        msgObject.tipo = 'texto';
      }

      return JSON.stringify(msgObject);
    } catch (error) {
      console.error('Error al validar el mensaje:', error);
      return JSON.stringify({ error: 'Mensaje inválido', mensaje: 'Error en el procesamiento del mensaje' });
    }
  }
};

module.exports = MessageValidator;