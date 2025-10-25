// cypress/e2e/configuracion/municipios.cy.js

// Ignorar errores de React/MUI que no afectan la prueba
Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes('Minified React error') ||
      err.message.includes('ResizeObserver')
    ) return false;
  });
  
  describe('Municipios: listado, paginación, creación y edición', () => {
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
      return cy
        .contains('label, p, span, div', labelRe)
        .closest('.MuiFormControl-root, .MuiGrid-root, form, div') // contenedor MUI común
        .find('input')
        .first();
    };
  
    // Toggle "Activo"
    const checkActivo   = () => cy.contains(/^Activo/i).closest('div').find('input[type="checkbox"]').check({  force: true });
    const uncheckActivo = () => cy.contains(/^Activo/i).closest('div').find('input[type="checkbox"]').uncheck({ force: true });
  
    // Selector Departamento (MUI select/autocomplete)
    const seleccionarDepartamento = (depto) => {
      // Abre el desplegable del Departamento
      cy.contains('label', /^Departamento\b/i)
        .parent()
        .find('div[role="combobox"], div[role="button"], input')
        .first()
        .click({ force: true });
  
      // Selecciona la opción en el listado
      cy.get('[role="listbox"], ul[role="listbox"]')
        .contains(new RegExp(`^${depto}$`, 'i'))
        .click({ force: true });
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
                throw new Error(`No se encontró el municipio con nombre "${name}"`);
              }
              cy.wrap($next).click({ force: true });
              return tryFind();
            });
        });
      return tryFind();
    };
  
    // -------- Login + navegación --------
    beforeEach(() => {
      cy.visit('https://dev.one21.app/login');
      cy.get('input[placeholder="Ingresa tu correo electronico"]').should('be.visible').type('qa@qa.com');
      cy.get('input[placeholder="············"]').should('be.visible').type('QAtest2025');
      cy.contains('button', 'Login').click();
      cy.url().should('include', '/inicio');
  
      cy.visit('https://dev.one21.app/municipalities');
      rows().should('have.length.at.least', 1);
    });
  
    // -------- Pruebas --------
    it('Listado: muestra columnas esperadas', () => {
      cy.get('table thead').within(() => {
        cy.contains(/NOMBRE/i).should('be.visible');
        cy.contains(/DEPARTAMENTO/i).should('be.visible');
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
  
    it('Crear municipio ACTIVO', () => {
      const suf = Date.now().toString().slice(-5);
      const depto = 'JALAPA'; // ajusta si lo necesitas
      const nombre = `Mpio QA ${suf}`;
  
      cy.contains('button', 'Crear Municipio').click();
  
      seleccionarDepartamento(depto);
  
      // Nombre del municipio
      getInputByLabel(/^(Nombre( del municipio)?)\b/i)
        .should('be.visible')
        .clear()
        .type(nombre)
        .should('have.value', nombre);
  
      checkActivo();
  
      cy.contains('button', /^Guardar$/i).should('be.enabled').click();
  
      cy.wait(3000);
      cy.reload();
  
      cy.wrap(nombre).then(n => findRowByName(n));
      cy.get('@filaHit').within(() => {
        cy.contains('td', nombre).should('be.visible');
        cy.contains('td', new RegExp(depto, 'i')).should('be.visible');
        cy.contains(/Sí|Si|Activo/i).should('be.visible');
      });
    });
  
    it('Crear municipio INACTIVO', () => {
      const suf = Date.now().toString().slice(-5);
      const depto = 'EL PROGRESO';
      const nombre = `Mpio INAC ${suf}`;
  
      cy.contains('button', 'Crear Municipio').click();
  
      seleccionarDepartamento(depto);
  
      getInputByLabel(/^(Nombre( del municipio)?)\b/i)
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
  
    it('Editar un municipio: cambiar nombre y dejar INACTIVO', () => {
      // Editar la última fila visible
      cy.get('table tbody tr').last().within(() => {
        cy.get('[aria-label="Editar"], button:has(svg), a:has(svg)').first().click({ force: true });
      });
  
      const suf = Date.now().toString().slice(-4);
      const nuevoNombre = `Mpio Edit ${suf}`;
      const depto = 'JALAPA'; // o el que quieras establecer
  
      seleccionarDepartamento(depto);
  
      getInputByLabel(/^(Nombre( del municipio)?)\b/i)
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
  
    it('Validación: nombre duplicado (no debe crear)', () => {
      // Toma un nombre existente
      firstName().then((existingName) => {
        cy.contains('button', 'Crear Municipio').click();
  
        seleccionarDepartamento('JALAPA'); // mismo depto para simular duplicado típico
        getInputByLabel(/^(Nombre( del municipio)?)\b/i)
          .should('be.visible')
          .clear()
          .type(existingName)
          .should('have.value', existingName);
  
        checkActivo();
        cy.contains('button', /^Guardar$/i).click();
  
        cy.contains(/ya existe|duplicado|Error/i, { timeout: 8000 }).should('be.visible');
      });
    });
  
    it('Validación: obligatorios vacíos (no debe guardar)', () => {
      cy.contains('button', 'Crear Municipio').click();
      // No seleccionar departamento, no escribir nombre
      cy.contains('button', /^Guardar$/i).click();
  
      // Mensajes típicos de MUI/HTML5
      cy.contains(/Completa este campo|El nombre es requerido|Error/i, { timeout: 8000 }).should('be.visible');
    });
  });
  