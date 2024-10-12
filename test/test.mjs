import { expect } from 'chai';
import MessageValidator from '../unalib/index.js'; // Asegúrate de que esta ruta sea correcta y que el archivo tenga extensión .js o .mjs

describe('MessageValidator', () => {
  describe('isValidPhoneNumber', () => {
    const validNumbers = [
      '8576-3191',
      '+1 (123) 456-7890',
      '123-456-7890',
      '1234567890',
      '+44 20 7123 4567',
    ];

    const invalidNumbers = [
      '123',
      'abc',
      '12345',
      '+1',
      '1234-5678-9012-3456',
    ];

    validNumbers.forEach(number => {
      it(`debe devolver true para ${number}`, () => {
        expect(MessageValidator.isValidPhoneNumber(number)).to.be.true;
      });
    });

    invalidNumbers.forEach(number => {
      it(`debe devolver false para ${number}`, () => {
        expect(MessageValidator.isValidPhoneNumber(number)).to.be.false;
      });
    });
  });

  describe('isImageFileUrl', () => {
    const validUrls = [
      'https://example.com/image.jpg',
      'http://test.org/photo.png',
      'https://site.com/picture.jpeg',
      'http://mysite.net/animated.gif',
    ];

    const invalidUrls = [
      'https://example.com/file.txt',
      'http://test.org/document.pdf',
      'https://site.com/video.mp4',
      'not-a-url',
    ];

    validUrls.forEach(url => {
      it(`debe devolver true para ${url}`, () => {
        expect(MessageValidator.isImageFileUrl(url)).to.be.true;
      });
    });

    invalidUrls.forEach(url => {
      it(`debe devolver false para ${url}`, () => {
        expect(MessageValidator.isImageFileUrl(url)).to.be.false;
      });
    });
  });

  describe('isVideoLink', () => {
    const validUrls = [
      'https://www.youtube.com/watch?v=boOEg604wf8',
      'https://youtu.be/boOEg604wf8',
      'https://www.youtube.com/embed/boOEg604wf8',
    ];

    const invalidUrls = [
      'https://vimeo.com/123456',
      'https://dailymotion.com/video/x7tgcev',
      'https://example.com/file.jpg',
      'not-a-url',
    ];

    validUrls.forEach(url => {
      it(`debe devolver true para ${url}`, () => {
        expect(MessageValidator.isVideoLink(url)).to.be.true;
      });
    });

    invalidUrls.forEach(url => {
      it(`debe devolver false para ${url}`, () => {
        expect(MessageValidator.isVideoLink(url)).to.be.false;
      });
    });
  });

  describe('cleanInput', () => {
    const testCases = [
      {
        input: '<script>alert("Prueba")</script>',
        expected: '&lt;script&gt;alert(&quot;Prueba&quot;)&lt;/script&gt;',
        description: 'debe prevenir inyección de scripts'
      },
      {
        input: 'Texto normal',
        expected: 'Texto normal',
        description: 'debe permitir texto normal sin cambios'
      },
      {
        input: '<img src="x" onerror="alert(\'XSS\')">',
        expected: '&lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;',
        description: 'debe sanitizar caracteres peligrosos'
      },
      {
        input: '5 < 10 && 10 > 5',
        expected: '5 &lt; 10 &amp;&amp; 10 &gt; 5',
        description: 'debe manejar correctamente los símbolos matemáticos'
      }
    ];

    testCases.forEach(({ input, expected, description }) => {
      it(description, () => {
        expect(MessageValidator.cleanInput(input)).to.equal(expected);
      });
    });
  });

  describe('validateMessage', () => {
    it('debe manejar correctamente un mensaje de texto normal', () => {
      const input = JSON.stringify({ mensaje: 'Hola mundo' });
      const result = JSON.parse(MessageValidator.validateMessage(input));
      expect(result.tipo).to.equal('texto');
      expect(result.mensaje).to.equal('Hola mundo');
    });

    it('debe identificar y validar un número de teléfono', () => {
      const input = JSON.stringify({ mensaje: '8576-3191' });
      const result = JSON.parse(MessageValidator.validateMessage(input));
      expect(result.tipo).to.equal('telefono');
      expect(result.mensaje).to.equal('Número de teléfono aceptado: 8576-3191');
    });

    it('debe manejar correctamente una URL de imagen', () => {
      const input = JSON.stringify({ mensaje: 'https://example.com/image.jpg' });
      const result = JSON.parse(MessageValidator.validateMessage(input));
      expect(result.tipo).to.equal('url');
      expect(result.mensaje).to.include('<img src="https://example.com/image.jpg"');
    });

    it('debe manejar correctamente una URL de YouTube', () => {
      const input = JSON.stringify({ mensaje: 'https://www.youtube.com/watch?v=boOEg604wf8' });
      const result = JSON.parse(MessageValidator.validateMessage(input));
      expect(result.tipo).to.equal('url');
      expect(result.mensaje).to.include('<iframe src="https://www.youtube.com/embed/boOEg604wf8"');
    });

    it('debe manejar correctamente una entrada inválida', () => {
      const input = 'no es un JSON válido';
      const result = JSON.parse(MessageValidator.validateMessage(input));
      expect(result.error).to.equal('Mensaje inválido');
    });
  });
});