// cypress/e2e/configuracion/departamentos-trabajo.cy.js

// Ignorar errores genéricos de React/MUI que no afectan el flujo
Cypress.on('uncaught:exception', (err) => {
    if (
      err.message.includes('Minified React error') ||
      err.message.includes('ResizeObserver')
    ) return false;
  });
  
  describe('Departamento de trabajo: creación, edición y paginación', () => {
    // ------- Helpers de tabla/paginación -------
    const rows = () => cy.get('table tbody tr');
    const firstCode = () =>
      rows().first().find('td').eq(0).invoke('text').then(t => t.trim());
    const pageBtn = (n) =>
      cy.get('button, a').filter((i, el) => el.innerText.trim() === String(n)).first();
  
    // ------- Selectores tolerantes (por si MUI/atributos cambian) -------
    const sel = {
      code:  () => cy.contains('label', /^Código$/i).parent().find('input'),
      name:  () => cy.contains('label', /^Nombre$/i).parent().find('input'),
    };
  
    // ------- Toggle "Activo" -------
    const checkActivo   = () => cy.contains(/Activo/i).closest('div').find('input[type="checkbox"]').check({  force: true });
    const uncheckActivo = () => cy.contains(/Activo/i).closest('div').find('input[type="checkbox"]').uncheck({ force: true });
  
    // ------- Buscar una fila por CÓDIGO recorriendo páginas si hace falta -------
    const findRowByCode = (code) => {
      const tryFind = () =>
        cy.get('table tbody tr').then($rows => {
          const hit = [...$rows].find(tr =>
            tr.innerText.toLowerCase().includes(code.toLowerCase())
          );
          if (hit) { cy.wrap(hit).as('filaHit'); return; }
          return cy.get('button, a')
            .filter((i, el) => el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page')
            .filter(':visible')
            .then($next => {
              if (!$next.length || $next.is('[disabled]') || $next.attr('aria-disabled') === 'true') {
                throw new Error(`No se encontró el departamento con código ${code}`);
              }
              cy.wrap($next).click({ force: true });
              return tryFind();
            });
        });
      return tryFind();
    };
  
    // ------- Login & navegación -------
    beforeEach(() => {
      cy.visit('https://dev.one21.app/login');
      cy.get('input[placeholder="Ingresa tu correo electronico"]').should('be.visible').type('qa@qa.com');
      cy.get('input[placeholder="············"]').should('be.visible').type('QAtest2025');
      cy.contains('button', 'Login').click();
      cy.url().should('include', '/inicio');
  
      // Ir a Departamento de trabajo
      cy.visit('https://dev.one21.app/employee_departaments'); // si tu ruta fuese otra, cámbiala aquí
      rows().should('have.length.at.least', 1);
    });
  
    // ------- Columnas visibles -------
    it('Listado: muestra columnas esperadas', () => {
      cy.get('table thead').within(() => {
        cy.contains(/C[oó]DIGO/i).should('be.visible');
        cy.contains(/NOMBRE/i).should('be.visible');
        cy.contains(/ACTIVO/i).should('be.visible');
        cy.contains(/ACCIONES/i).should('be.visible');
      });
    });
  
    // ------- Paginación 1 <-> 2 -------
    it('Paginación: cambia a página 2 y vuelve a 1', () => {
      firstCode().then((codePg1) => {
        pageBtn(2).scrollIntoView().click({ force: true });
  
        pageBtn(2).should(($b) => {
          const active = $b.attr('aria-current') === 'true' || $b.hasClass('Mui-selected');
          expect(active, 'page 2 selected').to.be.true;
        });
  
        firstCode().should((codePg2) => expect(codePg2).to.not.eq(codePg1));
  
        pageBtn(1).click({ force: true });
        firstCode().should((codeBack) => expect(codeBack).to.eq(codePg1));
      });
    });
  
    // ------- Botones siguiente y anterior -------
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
  
    // ------- Crear ACTIVO -------
    it('Crear departamento ACTIVO', () => {
      const suf   = Date.now().toString().slice(-4);
      const letras = Array(2).fill().map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      const code  = `D${letras}`;       // ej.: DAB
      const name  = `Depto ${letras}`;  // ej.: Depto AB
  
      cy.contains('button', /Crear Departamento|Crear Departamento de trabajo/i).click();
  
      sel.code().clear().type(code).should('have.value', code);
      sel.name().clear().type(name).should('have.value', name);
      checkActivo();
  
      cy.contains('button', /^Guardar$/i).should('be.enabled').click();
  
      cy.wait(4000);
      cy.reload();
  
      cy.wrap(code).then(c => findRowByCode(c));
      cy.get('@filaHit').within(() => {
        cy.contains('td', code).should('be.visible');
        cy.contains('td', name).should('be.visible');
        cy.contains(/Sí|Si|Activo/i).should('be.visible');
      });
    });
  
    // ------- Crear INACTIVO -------
    it('Crear departamento INACTIVO', () => {
      const suf   = Date.now().toString().slice(-4);
      const letras = Array(2).fill().map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      const code  = `D${letras}`;
      const name  = `Depto ${letras}`;
  
      cy.contains('button', /Crear Departamento|Crear Departamento de trabajo/i).click();
  
      sel.code().clear().type(code).should('have.value', code);
      sel.name().clear().type(name).should('have.value', name);
      uncheckActivo();
  
      cy.contains('button', /^Guardar$/i).click();
  
      cy.wait(4000);
      cy.reload();
  
      cy.wrap(code).then(c => findRowByCode(c));
      cy.get('@filaHit').within(() => {
        cy.contains('td', code).should('be.visible');
        cy.contains('td', name).should('be.visible');
        cy.contains(/No/i).should('be.visible');
      });
    });
  
    // ------- Editar (cambia code+name y lo deja inactivo) -------
    it('Editar último departamento: cambia código y nombre, y lo deja inactivo', () => {
      // Abrir edición de la última fila para evitar tocar el seed
      cy.get('table tbody tr').last().within(() => {
        cy.get('[aria-label="Editar"], button:has(svg), a:has(svg)').first().click({ force: true });
      });
  
      const letras = Array(2).fill().map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      const newCode = `D${letras}`;
      const newName = `Depto ${letras}`;
  
      sel.code().clear().type(newCode).should('have.value', newCode);
      sel.name().clear().type(newName).should('have.value', newName);
      uncheckActivo();
  
      cy.contains('button', /Actualizar|Guardar/i).click();
  
      cy.wait(4000);
      cy.reload();
  
      cy.wrap(newCode).then(c => findRowByCode(c));
      cy.get('@filaHit').within(() => {
        cy.contains('td', newCode).should('be.visible');
        cy.contains('td', newName).should('be.visible');
        cy.contains(/No/i).should('be.visible');
      });
    });
  
    // ------- Validación: duplicado -------
    it('Validación: código duplicado (no debe crear)', () => {
      firstCode().then((existingCode) => {
        cy.contains('button', /Crear Departamento|Crear Departamento de trabajo/i).click();
  
        sel.code().clear().type(existingCode).should('have.value', existingCode);
        sel.name().clear().type('Duplicado').should('have.value', 'Duplicado');
        checkActivo();
  
        cy.contains('button', /^Guardar$/i).click();
  
        cy.contains(/ya existe|duplicado|Error al crear/i, { timeout: 8000 }).should('be.visible');
      });
    });
  
    // ------- Validación: obligatorios vacíos -------
    it('Validación: campos obligatorios vacíos (no guarda)', () => {
      cy.contains('button', /Crear Departamento|Crear Departamento de trabajo/i).click();
      cy.contains('button', /^Guardar$/i).click();
  
      cy.contains(/obligatorio|requerido|Error/i, { timeout: 8000 }).should('be.visible');
    });
  
    // ------- Validación: solo uno lleno -------
    it('Validación: solo código lleno (no guarda)', () => {
      cy.contains('button', /Crear Departamento|Crear Departamento de trabajo/i).click();
  
      sel.code().type('D1');
      cy.contains('button', /^Guardar$/i).click();
  
      cy.contains(/obligatorio|requerido|Error/i, { timeout: 8000 }).should('be.visible');
    });
  });
  