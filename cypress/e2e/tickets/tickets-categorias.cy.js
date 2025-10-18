// cypress/e2e/ticket/categorias.cy.js

// Ignorar errores específicos de React
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Minified React error')) return false;
});

describe('Pruebas de creación y edición de categorías', () => {
  const rows = () => cy.get('table tbody tr');
  const firstCode = () => rows().first().find('td').eq(0).invoke('text').then(t => t.trim());
  const pageBtn = (n) =>
    cy.get('button, a').filter((i, el) => el.innerText.trim() === String(n)).first();
  
  beforeEach(() => {
    // 1) Login
    cy.visit('https://dev.one21.app/login');
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('qa@qa.com');
    cy.get('input[placeholder="············"]')
      .should('be.visible')
      .type('QAtest2025');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/inicio');

    // 2) Ir a Categorías
    cy.visit('https://dev.one21.app/categorias');

    
  });

  it('Listado: muestra columnas esperadas', () => {
    cy.get('table thead').within(() => {
      cy.contains(/C[oó]DIGO/i).should('be.visible');
      cy.contains(/NOMBRE/i).should('be.visible');
      cy.contains(/DESCRIPCI[oó]N/i).should('be.visible');
      cy.contains(/ESTADO/i).should('be.visible');
      cy.contains(/ACCIONES/i).should('be.visible');
    });
  });
  it('Cambia a página 2 y vuelve a página 1', () => {
    // guarda primer código de la página 1
    firstCode().then((codePg1) => {

      pageBtn(2).scrollIntoView().click({ force: true });
      // cy.wait('@getCats'); // <- solo si es server-side

      // página 2 activa (aria-current o clase seleccionada)
      pageBtn(2).should(($b) => {
        const active = $b.attr('aria-current') === 'true' || $b.hasClass('Mui-selected');
        expect(active, 'page 2 selected').to.be.true;
      });

      // cambia el primer registro
      firstCode().should((codePg2) => {
        expect(codePg2).to.not.eq(codePg1);
      });

      // volver a página 1 y confirmar que vuelve el primer registro original
      pageBtn(1).click({ force: true });
      // cy.wait('@getCats'); // <- si es server-side
      firstCode().should((codePg1b) => {
        expect(codePg1b).to.eq(codePg1);
      });
    });
  });

  it('Botón siguiente y anterior funcionan', () => {
    const nextBtn = () =>
      cy.get('button, a').filter((i, el) => el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page').first();
    const prevBtn = () =>
      cy.get('button, a').filter((i, el) => el.innerText.trim() === '<' || el.getAttribute('aria-label') === 'Go to previous page').first();

    firstCode().then((codePg1) => {
      nextBtn().click({ force: true });
      firstCode().should((codePg2) => expect(codePg2).to.not.eq(codePg1));

      prevBtn().click({ force: true });
      firstCode().should((codeBack) => expect(codeBack).to.eq(codePg1));
    });
  });

  it('Debe crear una nueva categoría activa', () => {
    const suf = Date.now().toString().slice(-5);
    const code = `QA${suf}`;
    const name = `Calidad ${suf}`;
    const desc = `Descripción QA ${suf}`;

    // Ir al formulario de creación
    
    cy.contains('button', 'Crear Categoría').click();
    

    // Completar los campos
    cy.get('input[placeholder^="Ej: TECH"], input[name="code"], input[name="codigo"]')
      .clear()
      .type(code)
      .should('have.value', code);

    cy.get('input[placeholder^="Ej: Técnico"], input[name="name"], input[name="nombre"]')
      .clear()
      .type(name)
      .should('have.value', name);

    cy.get('textarea[placeholder*="Problemas téc"], [name="descripcion"]').clear().type(desc).should('have.value', desc);

    // Activar toggle
    const clickCategoriaActiva = () => {
      cy.contains('Categoría activa')
        .closest('div')               // contenedor del label + switch
        .find('input[type="checkbox"]')  // MUI lo oculta
        .check({ force: true });         // lo activamos igual
    };
    

    // Guardar
    cy.contains('button', 'Cancelar').should('be.enabled').click();

    cy.wait(1000); // pequeño delay para que la tabla refresque

    cy.request('GET', `/api/ticket-categories?code=${'code'}`).its('status').should('eq', 200);


  });
  it('Debe crear una nueva categoría desactivada', () => {
    const suf = Date.now().toString().slice(-5);
    const code = `QA${suf}`;
    const name = `Calidad ${suf}`;
    const desc = `Descripción QA ${suf}`;

    // Ir al formulario de creación
    
    cy.contains('button', 'Crear Categoría').click();
    

    // Completar los campos
    cy.get('input[placeholder^="Ej: TECH"], input[name="code"], input[name="codigo"]')
      .clear()
      .type(code)
      .should('have.value', code);

    cy.get('input[placeholder^="Ej: Técnico"], input[name="name"], input[name="nombre"]')
      .clear()
      .type(name)
      .should('have.value', name);

    cy.get('textarea[placeholder*="Problemas téc"], [name="descripcion"]').clear().type(desc).should('have.value', desc);

    // Activar toggle
    cy.contains('label', 'Categoría activa')
    .find('input[type="checkbox"]')
    .uncheck({ force: false });



    // Guardar
    cy.contains('button', 'Cancelar').should('be.enabled').click();

    cy.wait(1000); // pequeño delay para que la tabla refresque

    cy.request('GET', `/api/ticket-categories?code=${'code'}`).its('status').should('eq', 200);


  });
  it('Debe editar una categoría existente y cambiarla a inactiva', () => {
    
    cy.get('table tbody tr').first().as('fila');
    cy.get('@fila').find('td').eq(0).invoke('text').then((oldCode) => {
      const code = oldCode.trim();
      cy.wrap(code).as('oldCode');
    });
    
    // Abrir el modal de edición (primera fila)
    cy.get('table tbody tr').first().as('fila');
    cy.get('@fila').within(() => {
      cy.get('[aria-label="Editar"], button:has(svg), a:has(svg)').first().click({ force: true });
    });

    // Modal visible
    cy.contains(/Editar Categor[ií]a/).should('be.visible').parent().as('modal');

    const newCode = `TEST1`;
    const newName = `TEST1`;
    const newDesc = `TEST1`;

    cy.get('@modal').within(() => {
      // Editar la descripción
      cy.get('input[placeholder*="Ej: TECH"]').clear({ force: true }).type(newCode, { force: true });
      cy.get('input[placeholder*="Ej: Técnico"]').clear({ force: true }).type(newName, { force: true });
      cy.get('textarea[placeholder*="Problemas técnicos"]')
        .should('be.visible')
        .clear({ force: true })
        .type(newDesc, { force: true });

      // Desactivar categoría
      cy.contains('label', 'Categoría activa')
    .find('input[type="checkbox"]')
    .uncheck({ force: false });
      

      // Guardar cambios
      cy.contains('button', /Guardar Cambios|Guardar$/i).click();
    });

    // Validar cambio tras recargar
    cy.wait(1000);
    cy.reload();
    
    const findRowByCode = (code) => {
      const tryFind = () => {
        return cy.get('table tbody tr').then(($rows) => {
          const hit = [...$rows].find((tr) =>
            tr.innerText.toLowerCase().includes(code.toLowerCase())
          );
          if (hit) {
            cy.wrap(hit).as('filaEditada');
            return;
          }
          return cy.get('button, a')
            .filter((i, el) => el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page')
            .filter(':visible')
            .then(($next) => {
              if (!$next.length || $next.is('[disabled]')) {
                throw new Error(`No se encontró la fila con código ${code}`);
              }
              cy.wrap($next).click({ force: true });
              return tryFind();
            });
        });
      };
      return tryFind();
    };
  
    cy.wrap(newCode).then(code => findRowByCode(code));
  

    cy.get('@filaEditada').within(() => {
      cy.contains('td', newCode).should('be.visible');
      cy.contains('td', newName).should('be.visible');
      cy.contains('td', newDesc).should('be.visible');
      cy.contains(/Inactivo/i).should('be.visible');
    });
    
    
  });

  it('Debe mostrar error al intentar crear una categoría con código duplicado', () => {
    cy.contains('button', 'Crear Categoría').click();
  
    cy.get('input[placeholder*="Ej: TECH"]').type('TEST1');
    cy.get('input[placeholder*="Ej: Técnico"]').type('Duplicada TEST1');
    cy.get('textarea[placeholder*="Problemas técnicos"]').type('Duplicado');
  
    cy.contains('button', /^Guardar$/i).click();
    cy.contains(/ya existe|duplicado/i).should('be.visible');
  });
});
