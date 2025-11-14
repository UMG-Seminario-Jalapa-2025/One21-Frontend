// cypress/e2e/configuracion/paises.cy.js

// Ignorar errores específicos de React/MUI que no afectan la prueba
Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes('Minified React error') ||
      err.message.includes('ResizeObserver')
    ) return false;
  });
  
  describe('Países: creación, edición y paginación', () => {
    // Helpers de tabla/paginación
    const rows = () => cy.get('table tbody tr');
    const firstCode = () => rows().first().find('td').eq(0).invoke('text').then(t => t.trim());
    const pageBtn = (n) =>
      cy.get('button, a').filter((i, el) => el.innerText.trim() === String(n)).first();
  
    // Selectores tolerantes (MUI suele cambiar atributos)
    const sel = {
      code:  'input[placeholder*=""], input[name="code"], input[name="codigo"]',
      
      name:  'input[name="name"], input#name, input[placeholder*="Nombre"]',
      phone: 'input[name="phone"], input[name="phoneCode"], input#phone, input[placeholder*="telef"]'
    };
    
  
    // Toggle "Activo"
    const checkActivo    = () => cy.contains(/Activo/i).closest('div').find('input[type="checkbox"]').check({  force: true });
    const uncheckActivo  = () => cy.contains(/Activo/i).closest('div').find('input[type="checkbox"]').uncheck({force: true });
  
    // Busca una fila por CÓDIGO recorriendo páginas si es necesario
    const findRowByCode = (code) => {
      const tryFind = () =>
        cy.get('table tbody tr').then($rows => {
          const hit = [...$rows].find(tr => tr.innerText.toLowerCase().includes(code.toLowerCase()));
          if (hit) { cy.wrap(hit).as('filaHit'); return; }
          return cy.get('button, a')
            .filter((i, el) => el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page')
            .filter(':visible')
            .then($next => {
              if (!$next.length || $next.is('[disabled]') || $next.attr('aria-disabled') === 'true') {
                throw new Error(`No se encontró el país con código ${code}`);
              }
              cy.wrap($next).click({ force: true });
              return tryFind();
            });
        });
      return tryFind();
    };
  
    beforeEach(() => {
      // 1) Login
      const { baseUrl } = require('../../support/urls');
      cy.visit(baseUrl);
      cy.get('input[placeholder="Ingresa tu correo electronico"]').should('be.visible').type('qa@qa.com');
      cy.get('input[placeholder="············"]').should('be.visible').type('QAtest2025');
      cy.contains('button', 'Login').click();
      cy.url().should('include', '/inicio');
  
      // 2) Ir a Países
      cy.visit('https://dev.one21.app/countries');
      rows().should('have.length.at.least', 1);
    });
  
    it('Listado: muestra columnas esperadas', () => {
      cy.get('table thead').within(() => {
        cy.contains(/C[oó]DIGO/i).should('be.visible');
        cy.contains(/NOMBRE/i).should('be.visible');
        cy.contains(/TEL[EÉ]FONO/i).should('be.visible');
        cy.contains(/ACTIVO/i).should('be.visible');
        cy.contains(/ACCIONES/i).should('be.visible');
      });
    });
  
    it('Paginación: cambia a página 2 y vuelve a 1', () => {
      firstCode().then((codePg1) => {
        pageBtn(2).scrollIntoView().click({ force: true });
  
        // Página 2 activa (aria-current o clase MUI)
        pageBtn(2).should(($b) => {
          const active = $b.attr('aria-current') === 'true' || $b.hasClass('Mui-selected');
          expect(active, 'page 2 selected').to.be.true;
        });
  
        firstCode().should((codePg2) => expect(codePg2).to.not.eq(codePg1));
  
        pageBtn(1).click({ force: true });
        firstCode().should((codeBack) => expect(codeBack).to.eq(codePg1));
      });
    });
  
    it('Paginación: botones siguiente y anterior', () => {
      const nextBtn = () =>
        cy.get('button, a').filter((i, el) => el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page').first();
      const prevBtn = () =>
        cy.get('button, a').filter((i, el) => el.innerText.trim() === '<' || el.getAttribute('aria-label') === 'Go to previous page').first();
  
      firstCode().then((codePg1) => {
        nextBtn().click({ force: true });
        firstCode().should(codePg2 => expect(codePg2).to.not.eq(codePg1));
  
        prevBtn().click({ force: true });
        firstCode().should(codeBack => expect(codeBack).to.eq(codePg1));
      });
    });
  
    it('Crear país ACTIVO', () => {
      const suf   = Date.now().toString().slice(-4);
      const sufe = Array(2) // Genera un array de 5 letras
        .fill()
        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))) // Letras A-Z
        .join('');
      const code  = `Q${sufe}`;          // ej.: "Q1234"
      const name  = `Pais ${sufe}`;      // ej.: "Pais 1234"
      const phone = `${suf}`;         // ej.: "+51234"
  
      cy.contains('button', 'Crear País').click();
  
      cy.contains('label', /^Código$/i)
      .parent()
      .find('input')
      .clear()
      .type(code)
      .should('have.value', code);
  
    cy.contains('label', /^Nombre$/i)
      .parent()
      .find('input')
      .clear()
      .type(name)
      .should('have.value', name);
  
    cy.contains('label', /Código telefónico/i)
      .parent()
      .find('input')
      .clear()
      .type(phone)
      .should('have.value', phone);
      checkActivo(); // Activo
  
      cy.contains('button', /^Guardar$/i).should('be.enabled').click();
  
      cy.wait(8000);
      cy.reload();
  
      cy.wrap(code).then(c => findRowByCode(c));
      cy.get('@filaHit').within(() => {
        cy.contains('td', code).should('be.visible');
        cy.contains('td', name).should('be.visible');
        cy.contains('td', phone).should('be.visible');
        cy.contains(/Sí|Si|Activo/i).should('be.visible');
      });
    });

  
    it('Editar primer país: cambia nombre y teléfono y lo deja inactivo', () => {
      // tomar el primer código para identificar la fila
      firstCode().then((originalCode) => {
        // abrir edición desde esa fila
        cy.get('table tbody tr').last().within(() => {
          cy.get('[aria-label="Editar"], button:has(svg), a:has(svg)').first().click({ force: true });
        });
        const suf   = Date.now().toString().slice(-4);
        const sufe = Array(2) // Genera un array de 5 letras
          .fill()
          .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))) // Letras A-Z
          .join('');
        const newCode  = `Q${sufe}`;          // ej.: "Q1234"
        const newName  = `Pais ${sufe}`;      // ej.: "Pais 1234"
        const newPhone = `${suf}`;         // ej.: "+51234"
        cy.contains('label', /^Código$/i)
        .parent()
        .find('input')
        .clear()
        .type(newCode)
        .should('have.value', newCode);
    
        cy.contains('label', /^Nombre$/i)
        .parent()
        .find('input')
        .clear()
        .type(newName)
        .should('have.value', newName);
    
        cy.contains('label', /Código telefónico/i)
        .parent()
        .find('input')
        .clear()
        .type(newPhone)
        .should('have.value', newPhone);
        uncheckActivo(); // Activo
        
  
        cy.contains('button', /Actualizar|Guardar/i).click();
  
        cy.wait(5000);
        cy.reload();
  
        cy.wrap(newCode).then(c => findRowByCode(c));
        cy.get('@filaHit').within(() => {
          cy.contains('td', newCode).should('be.visible');
          cy.contains('td', newName).should('be.visible');
          cy.contains('td', newPhone).should('be.visible');
          cy.contains(/NO|No/i).should('be.visible');
        });
      });
    });
  
  
    it('Validación de obligatorios (no debe guardar)', () => {
      cy.contains('button', 'Crear País').click();
  
      // dejar todo vacío y guardar
      cy.contains('button', /^Guardar$/i).click();
  
      // revisa mensajes de error cercanos a cada campo
      cy.contains(/ya existe|Todos los campos son obligatorios|Error al crear país/i, { timeout: 8000 }).should('be.visible');
    });
    it('Validación de relleno de algunos campos (no debe guardar)', () => {
        cy.contains('button', 'Crear País').click();
    
        cy.contains('button', 'Crear País').click();
        cy.contains('label', /^Código$/i)
        .parent()
        .find('input')
        .clear()
        .type('si')
        .should('have.value', 'si');
        // dejar todo vacío y guardar
        cy.contains('button', /^Guardar$/i).click();
    
        // revisa mensajes de error cercanos a cada campo
        cy.contains(/ya existe|Todos los campos son obligatorios|Error al crear país/i, { timeout: 8000 }).should('be.visible');
      });

  });
  