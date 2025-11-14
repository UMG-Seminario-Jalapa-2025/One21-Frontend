// cypress/e2e/configuracion/puestos.cy.js

// Ignorar errores menores de React/MUI
Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes('Minified React error') ||
      err.message.includes('ResizeObserver')
    ) return false;
  });
  
  describe('Puestos de Trabajo: creación, edición y validaciones', () => {
    // Helpers
    const rows = () => cy.get('table tbody tr');
    const firstCode = () => rows().first().find('td').eq(0).invoke('text').then(t => t.trim());
    const pageBtn = (n) => cy.get('button, a').filter((i, el) => el.innerText.trim() === String(n)).first();
  
    const sel = {
      code: 'input[name="code"], input[placeholder*="Código"], input[id="code"]',
      name: 'input[name="name"], input[placeholder*="Nombre"], input[id="name"]',
      desc: 'input[name="description"], textarea[name="description"], input[placeholder*="Descripción"]'
    };
  
    const checkActivo = () =>
      cy.contains(/Activo/i)
        .closest('div')
        .find('input[type="checkbox"]')
        .check({ force: true });
  
    const uncheckActivo = () =>
      cy.contains(/Activo/i)
        .closest('div')
        .find('input[type="checkbox"]')
        .uncheck({ force: true });
  
    const findRowByCode = (code) => {
      const tryFind = () =>
        cy.get('table tbody tr').then($rows => {
          const hit = [...$rows].find(tr =>
            tr.innerText.toLowerCase().includes(code.toLowerCase())
          );
          if (hit) {
            cy.wrap(hit).as('filaHit');
            return;
          }
          return cy.get('button, a')
            .filter((i, el) => el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page')
            .filter(':visible')
            .then($next => {
              if (!$next.length || $next.is('[disabled]') || $next.attr('aria-disabled') === 'true') {
                throw new Error(`No se encontró el puesto con código ${code}`);
              }
              cy.wrap($next).click({ force: true });
              return tryFind();
            });
        });
      return tryFind();
    };
  
    beforeEach(() => {
      const { baseUrl } = require('../../support/urls');
      cy.visit(baseUrl);
      cy.get('input[placeholder="Ingresa tu correo electronico"]').should('be.visible').type('qa@qa.com');
      cy.get('input[placeholder="············"]').should('be.visible').type('QAtest2025');
      cy.contains('button', 'Login').click();
      cy.url().should('include', '/inicio');
  
      cy.visit('https://dev.one21.app/job_position');
      rows().should('have.length.at.least', 1);
    });
  
    it('Listado: muestra columnas esperadas', () => {
      cy.get('table thead').within(() => {
        cy.contains(/C[oó]DIGO/i).should('be.visible');
        cy.contains(/NOMBRE/i).should('be.visible');
        cy.contains(/DESCRIPCIÓN/i).should('be.visible');
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
  
    it('Crear puesto ACTIVO', () => {
      const suf = Date.now().toString().slice(-4);
      const code = `PT${suf}`;
      const name = `Puesto ${suf}`;
      const desc = `Descripción ${suf}`;    
  
      cy.contains('button', 'Crear Puesto').click();
  
      cy.contains('label', /^Código$/i).parent().find('input').clear().type(code).should('have.value', code);
      cy.contains('label', /^Nombre$/i).parent().find('input').clear().type(name).should('have.value', name);
      cy.contains('label', /^Descripción$/i).parent().find('input, textarea').clear().type(desc).should('have.value', desc);
      checkActivo();
  
      cy.contains('button', /^Guardar$/i).should('be.enabled').click();
      cy.wait(5000);
      cy.reload();
  
      cy.wrap(code).then(c => findRowByCode(c));
      cy.get('@filaHit').within(() => {
        cy.contains('td', code).should('be.visible');
        cy.contains('td', name).should('be.visible');
        cy.contains('td', desc).should('be.visible');
        cy.contains(/Sí|Si|Activo/i).should('be.visible');
      });
    });

    it('Crear puesto INACTIVO', () => {
        const suf = Date.now().toString().slice(-4);
        const code = `PT${suf}`;
        const name = `Puesto ${suf}`;
        const desc = `Descripción ${suf}`;    
    
        cy.contains('button', 'Crear Puesto').click();
    
        cy.contains('label', /^Código$/i).parent().find('input').clear().type(code).should('have.value', code);
        cy.contains('label', /^Nombre$/i).parent().find('input').clear().type(name).should('have.value', name);
        cy.contains('label', /^Descripción$/i).parent().find('input, textarea').clear().type(desc).should('have.value', desc);
        uncheckActivo();
    
        cy.contains('button', /^Guardar$/i).should('be.enabled').click();
        cy.wait(5000);
        cy.reload();
    
        cy.wrap(code).then(c => findRowByCode(c));
        cy.get('@filaHit').within(() => {
          cy.contains('td', code).should('be.visible');
          cy.contains('td', name).should('be.visible');
          cy.contains('td', desc).should('be.visible');
          cy.contains(/NO|No/i).should('be.visible');
        });
      });
  
  
    it('Validación: no debe permitir guardar vacío', () => {
      cy.contains('button', 'Crear Puesto').click();
      cy.contains('button', /^Guardar$/i).click();
      cy.contains(/obligatorio|error|complete/i, { timeout: 6000 }).should('be.visible');
    });
  
    it('Validación: código duplicado', () => {
      firstCode().then(existingCode => {
        cy.contains('button', 'Crear Puesto').click();
        cy.contains('label', /^Código$/i).parent().find('input').clear().type(existingCode);
        cy.contains('label', /^Nombre$/i).parent().find('input').clear().type('Duplicado');
        cy.contains('label', /^Descripción$/i).parent().find('input').clear().type('Duplicado');
        checkActivo();
        cy.contains('button', /^Guardar$/i).click();
        cy.contains(/error al crear puesto|duplicado|error/i, { timeout: 8000 }).should('be.visible');
      });
    });
  });
  