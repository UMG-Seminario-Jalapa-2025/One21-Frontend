// cypress/e2e/configuracion/departamentos.cy.js

// Ignorar errores de React/MUI que no afectan la prueba
Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes('Minified React error') ||
      err.message.includes('ResizeObserver')
    ) return false;
  });
  
  describe('Departamentos: listado, paginación, creación y edición', () => {
    // -------- Helpers de tabla / paginación --------
    const rows = () => cy.get('table tbody tr');
    const firstName = () =>
      rows().first().find('td').eq(0).invoke('text').then(t => t.trim()); // Columna "NOMBRE"
  
    const pageBtn = (n) =>
      cy.get('button, a')
        .filter((i, el) => el.innerText.trim() === String(n))
        .first();
  
    const nextBtn = () =>
      cy.get('button, a')
        .filter((i, el) => el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page')
        .first();
  
    const prevBtn = () =>
      cy.get('button, a')
        .filter((i, el) => el.innerText.trim() === '<' || el.getAttribute('aria-label') === 'Go to previous page')
        .first();
  
    // -------- Selectores tolerantes (inputs y toggle) --------
    const getInputByLabel = (labelRe) => {
        return cy.contains('label, p, span, div', labelRe)
          .closest('.MuiFormControl-root, .MuiGrid-root, form, div')  // contenedor MUI común
          .find('input')
          .first();
      };
  
    // Toggle "Activo"
    const checkActivo   = () => cy.contains(/^Activo/i).closest('div').find('input[type="checkbox"]').check({  force: true });
    const uncheckActivo = () => cy.contains(/^Activo/i).closest('div').find('input[type="checkbox"]').uncheck({ force: true });
  
    // Selector País (MUI select/autocomplete)
    const seleccionarPais = (pais) => {
      // Abre el desplegable del País
      cy.contains('label', /^Pa[ií]s\b/i)
        .parent()
        .find('div[role="combobox"], div[role="button"], input')
        .first()
        .click({ force: true });
  
      // Selecciona la opción en el listado (ul[role=listbox] / [role=listbox])
      cy.get('[role="listbox"], ul[role="listbox"]').contains(new RegExp(`^${pais}$`, 'i')).click({ force: true });
    };
  
    // Busca una fila por NOMBRE recorriendo páginas si es necesario
    const findRowByName = (name) => {
      const tryFind = () =>
        cy.get('table tbody tr').then($rows => {
          const hit = [...$rows].find(tr => tr.innerText.toLowerCase().includes(name.toLowerCase()));
          if (hit) { cy.wrap(hit).as('filaHit'); return; }
  
          return nextBtn()
            .filter(':visible')
            .then($next => {
              if (!$next.length || $next.is('[disabled]') || $next.attr('aria-disabled') === 'true') {
                throw new Error(`No se encontró el departamento con nombre "${name}"`);
              }
              cy.wrap($next).click({ force: true });
              return tryFind();
            });
        });
      return tryFind();
    };
  
    // -------- Login + navegación --------
    beforeEach(() => {
      const { baseUrl } = require('../../support/urls');
      cy.visit(baseUrl);
      cy.get('input[placeholder="Ingresa tu correo electronico"]').should('be.visible').type('qa@qa.com');
      cy.get('input[placeholder="············"]').should('be.visible').type('QAtest2025');
      cy.contains('button', 'Login').click();
      cy.url().should('include', '/inicio');
  
      cy.visit('https://dev.one21.app/departments');
      rows().should('have.length.at.least', 1);
    });
  
    // -------- Pruebas --------
    it('Listado: muestra columnas esperadas', () => {
      cy.get('table thead').within(() => {
        cy.contains(/NOMBRE/i).should('be.visible');
        cy.contains(/PA[IÍ]S/i).should('be.visible');
        cy.contains(/ACTIVO/i).should('be.visible');
        cy.contains(/ACCIONES/i).should('be.visible');
      });
    });
  
    it('Paginación: cambia a página 2 y vuelve a 1', () => {
      firstName().then((namePg1) => {
        pageBtn(2).scrollIntoView().click({ force: true });
  
        pageBtn(2).should(($b) => {
          const active = $b.attr('aria-current') === 'true' || $b.hasClass('Mui-selected');
          expect(active, 'page 2 selected').to.be.true;
        });
  
        firstName().should((namePg2) => expect(namePg2).to.not.eq(namePg1));
  
        pageBtn(1).click({ force: true });
        firstName().should((nameBack) => expect(nameBack).to.eq(namePg1));
      });
    });
  
    it('Paginación: botones siguiente y anterior', () => {
      firstName().then((namePg1) => {
        nextBtn().click({ force: true });
        firstName().should(namePg2 => expect(namePg2).to.not.eq(namePg1));
  
        prevBtn().click({ force: true });
        firstName().should(nameBack => expect(nameBack).to.eq(namePg1));
      });
    });
  
    it('Crear departamento ACTIVO', () => {
      const suf = Date.now().toString().slice(-5);
      const pais = 'Guatemala'; // Ajusta si necesitas variarlo
      const nombre = `Depto QA ${suf}`;
  
      cy.contains('button', 'Crear Departamento').click();
    
      const getInputByLabel = (labelRe) => {
        return cy.contains('label, p, span, div', labelRe)
          .closest('.MuiFormControl-root, .MuiGrid-root, form, div')  // contenedor MUI común
          .find('input')
          .first();
      };
      
      // Uso
      getInputByLabel(/^Nombre del departamento/i)
        .should('be.visible')
        .clear()
        .type(nombre)
        .should('have.value', nombre);

      seleccionarPais(pais);
  
      
  
      checkActivo();
  
      cy.contains('button', /^Guardar$/i).should('be.enabled').click();
  
      cy.wait(3000);
      cy.reload();
  
      cy.wrap(nombre).then(n => findRowByName(n));
      cy.get('@filaHit').within(() => {
        cy.contains('td', nombre).should('be.visible');
        cy.contains('td', /Guatemala/i).should('be.visible');
        cy.contains(/Sí|Si|Activo/i).should('be.visible');
      });
    });
  
    it('Crear departamento INACTIVO', () => {
      const suf = Date.now().toString().slice(-5);
      const pais = 'Guatemala';
      const nombre = `Depto INAC ${suf}`;
  
      cy.contains('button', 'Crear Departamento').click();
  
      seleccionarPais(pais);
  
      getInputByLabel(/^Nombre del departamento/i)
        .should('be.visible')
        .clear()
        .type(nombre)
        .should('have.value', nombre);
  
      uncheckActivo();
  
      cy.contains('button', /^Guardar$/i).should('be.enabled').click();
  
      cy.wait(3000);
      cy.reload();
  
      cy.wrap(nombre).then(n => findRowByName(n));
      cy.get('@filaHit').within(() => {
        cy.contains('td', nombre).should('be.visible');
        cy.contains(/No/i).should('be.visible'); // inactivo
      });
    });
  
    it('Editar un departamento: cambiar nombre y dejar INACTIVO', () => {
      // Abre el editor de la última fila visible para no chocar con fijos
      cy.get('table tbody tr').last().within(() => {
        cy.get('[aria-label="Editar"], button:has(svg), a:has(svg)').first().click({ force: true });
      });
  
      const suf = Date.now().toString().slice(-4);
      const nuevoNombre = `Depto Edit ${suf}`;
      const pais = 'Pais';
  
      // País suele venir ya cargado; si deseas cambiarlo usa: seleccionarPais('Guatemala');
      seleccionarPais(pais);

      getInputByLabel(/^Nombre del departamento/i)
        .should('be.visible')
        .clear()
        .type(nuevoNombre)
        .should('have.value', nuevoNombre);
  
      uncheckActivo();
  
      cy.contains('button', /Actualizar|Guardar/i).click();
  
      cy.wait(3000);
      cy.reload();
  
      cy.wrap(nuevoNombre).then(n => findRowByName(n));
      cy.get('@filaHit').within(() => {
        cy.contains('td', nuevoNombre).should('be.visible');
        cy.contains(/No/i).should('be.visible');
      });
    });

  });
  