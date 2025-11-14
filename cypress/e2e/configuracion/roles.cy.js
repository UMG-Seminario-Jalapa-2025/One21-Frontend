// cypress/e2e/configuracion/roles.cy.js

// Ignorar errores de React/MUI que no afectan la prueba
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('Minified React error') ||
    err.message.includes('ResizeObserver')
  ) return false;
});

describe('Roles: listado, paginación, creación, edición y cancelar', () => {
  // -------- Helpers de tabla / paginación --------
  const rows = () => cy.get('table tbody tr');
  const firstRoleName = () =>
    rows().first().find('td').eq(0).invoke('text').then((t) => t.trim()); // Columna "NOMBRE DEL ROL"

  const pageBtn = (n) =>
    cy.get('button, a').filter((i, el) => el.innerText.trim() === String(n)).first();

  const nextBtn = () =>
    cy
      .get('button, a')
      .filter(
        (i, el) =>
          el.innerText.trim() === '>' || el.getAttribute('aria-label') === 'Go to next page'
      )
      .first();

  const prevBtn = () =>
    cy
      .get('button, a')
      .filter(
        (i, el) =>
          el.innerText.trim() === '<' || el.getAttribute('aria-label') === 'Go to previous page'
      )
      .first();

  // -------- Selectores tolerantes --------
  const getInputByLabel = (labelRe) => {
    return cy
      .contains('label, p, span, div', labelRe)
      .closest('.MuiFormControl-root, .MuiGrid-root, form, div') // contenedor MUI común
      .find('input, textarea')
      .first();


  };
  
  // -------- Buscar fila por nombre (recorriendo páginas si hace falta) --------
  const findRowByName = (name) => {
    const tryFind = () =>
      cy.get('table tbody tr').then(($rows) => {
        const hit = [...$rows].find((tr) =>
          tr.innerText.toLowerCase().includes(name.toLowerCase())
        );
        if (hit) {
          cy.wrap(hit).as('filaHit');
          return;
        }
        return nextBtn()
          .filter(':visible')
          .then(($next) => {
            if (
              !$next.length ||
              $next.is('[disabled]') ||
              $next.attr('aria-disabled') === 'true'
            ) {
              throw new Error(`No se encontró el rol "${name}"`);
            }
            cy.wrap($next).click({ force: true });
            return tryFind();
          });
      });
    return tryFind();
  };

  // -------- Validación botón Cancelar (reutilizable) --------
  // En "Crear Rol" es una página; en "Editar Rol" suele ser modal.
  // Esta función hace clic en Cancelar y verifica que volvemos/listamos.
  const cancelarYVolverALista = () => {
    cy.contains('button', /^Cancelar$/i).click({ force: true });
    // Si era modal, debe desaparecer:
    cy.get('body').then(($b) => {
      // si el modal ya no está, perfecto
      // si es una página, debería redirigir a /roles
      cy.url().then((u) => {
        if (!/\/roles$/.test(u)) {
          cy.url().should('include', '/roles');
        }
      });
    });
    // La tabla debe estar visible
    rows().should('have.length.at.least', 1);
  };

  // -------- Login + navegación --------
  beforeEach(() => {
    cy.visit('https://dev.one21.app/login');
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('qa@qa.com');
    cy.get('input[placeholder="············"]').should('be.visible').type('QAtest2025');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/inicio');

    cy.visit('https://dev.one21.app/roles');
    rows().should('have.length.at.least', 1);
  });

  // -------- Pruebas --------
  it('Listado: muestra columnas esperadas', () => {
    cy.get('table thead').within(() => {
      cy.contains(/NOMBRE DEL ROL/i).should('be.visible');
      cy.contains(/DESCRIPCI[oó]N/i).should('be.visible');
      cy.contains(/COMPUESTO/i).should('be.visible');
      cy.contains(/ROL DE CLIENTE/i).should('be.visible');
      cy.contains(/ACCIONES/i).should('be.visible');
    });
  });

  it('Paginación: cambia a página 2 y vuelve a 1', () => {
    firstRoleName().then((pg1) => {
      pageBtn(2).scrollIntoView().click({ force: true });

      pageBtn(2).should(($b) => {
        const active =
          $b.attr('aria-current') === 'true' || $b.hasClass('Mui-selected');
        expect(active, 'page 2 selected').to.be.true;
      });

      firstRoleName().should((pg2) => expect(pg2).to.not.eq(pg1));

      pageBtn(1).click({ force: true });
      firstRoleName().should((back) => expect(back).to.eq(pg1));
    });
  });

  it('Paginación: botones siguiente y anterior', () => {
    firstRoleName().then((pg1) => {
      nextBtn().click({ force: true });
      firstRoleName().should((pg2) => expect(pg2).to.not.eq(pg1));

      prevBtn().click({ force: true });
      firstRoleName().should((back) => expect(back).to.eq(pg1));
    });
  });

  it('Crear Rol (éxito)', () => {
    const suf = Date.now().toString().slice(-4);
    const name = `role_${suf}`;
    const desc = `desc_${suf}`;

    cy.contains('button', 'Crear Rol').click();

    getInputByLabel(/^Nombre del Rol/i)
      .should('be.visible')
      .clear()
      .type(name)
      .should('have.value', name);

    getInputByLabel(/^Descripci[oó]n$/i)
      .should('be.visible')
      .clear()
      .type(desc)
      .should('have.value', desc);

    cy.contains('button', /^Guardar$/i).should('be.enabled').click();

    cy.wait(2000);
    cy.reload();

    cy.wrap(name).then((n) => findRowByName(n));
    cy.get('@filaHit').within(() => {
      cy.contains('td', name).should('be.visible');
      cy.contains('td', desc).should('be.visible');
    });
  });

  it('Crear Rol: botón Cancelar no guarda cambios', () => {
    const suf = Date.now().toString().slice(-4);
    const name = `cancel_role_${suf}`;
    const desc = `cancel_desc_${suf}`;

    cy.contains('button', 'Crear Rol').click();

    getInputByLabel(/^Nombre del Rol/i).clear().type(name);
    getInputByLabel(/^Descripci[oó]n$/i).clear().type(desc);

    // Validar botón Cancelar
    cancelarYVolverALista();

    // Verificar que NO se creó
    const tryFind = () =>
      cy.get('table tbody tr').then(($rows) => {
        const hit = [...$rows].some((tr) =>
          tr.innerText.toLowerCase().includes(name.toLowerCase())
        );
        if (hit) {
          throw new Error('El rol se creó a pesar de cancelar.');
        }
        return nextBtn()
          .filter(':visible')
          .then(($next) => {
            if (
              !$next.length ||
              $next.is('[disabled]') ||
              $next.attr('aria-disabled') === 'true'
            ) {
              // no se encontró, que es lo esperado
              return;
            }
            cy.wrap($next).click({ force: true });
            return tryFind();
          });
      });
    tryFind();
  });

  it('Editar Rol: cambia nombre y descripción y valida Cancelar', () => {
    // Abrimos edición del primer rol visible (para el caso del modal)
    rows().last().within(() => {
      cy.get('[aria-label="Editar"], button:has(svg), a:has(svg)')
        .first()
        .click({ force: true });
    });

    // Guardamos valores actuales para compararlos
    let originalName, originalDesc;

  cy.get('input[placeholder*=" "]')
    .invoke('val')
    .then((val) => {
      originalName = val; // Guardar el nombre original
    });

  cy.get('textarea[placeholder*=" "]')
    .invoke('val')
    .then((val) => {
      originalDesc = val; // Guardar la descripción original
    });


    const suf = Date.now().toString().slice(-3);
    const newName = `tmp_${suf}`;
    const newDesc = `tmp_desc_${suf}`;

    // Escribimos pero CANCELAMOS
    cy.get('input[placeholder*=" "]')
  .clear({ force: true })
  .type(newName, { force: true });

cy.get('input[placeholder="Ej: Doctor role"], textarea[placeholder*=" "]')
  .clear({ force: true })
  .type(newDesc, { force: true });

    // Validar botón Cancelar (modal)
    cancelarYVolverALista();

    rows().last().within(() => {
      cy.contains('td', originalName).should('be.visible'); // Validar que el nombre no cambió
      cy.contains('td', originalDesc).should('be.visible'); // Validar que la descripción no cambió
    });
    // Comprobar que el primer registro se mantiene con su nombre original
    
  });

  it('Editar Rol: guarda cambios con éxito', () => {
    // Abrimos edición del primer rol visible (para el caso del modal)
    rows().last().within(() => {
      cy.get('[aria-label="Editar"], button:has(svg), a:has(svg)')
        .first()
        .click({ force: true });
    });

    // Guardamos valores actuales para compararlos
    let originalName, originalDesc;

  cy.get('input[placeholder*=" "]')
    .invoke('val')
    .then((val) => {
      originalName = val; // Guardar el nombre original
    });

  cy.get('textarea[placeholder*=" "]')
    .invoke('val')
    .then((val) => {
      originalDesc = val; // Guardar la descripción original
    });


    const suf = Date.now().toString().slice(-3);
    const newName = `tmp_${suf}`;
    const newDesc = `tmp_desc_${suf}`;

    // Escribimos pero CANCELAMOS
    cy.get('input[placeholder*=" "]')
  .clear({ force: true })
  .type(newName, { force: true });

cy.get('input[placeholder="Ej: Doctor role"], textarea[placeholder*=" "]')
  .clear({ force: true })
  .type(newDesc, { force: true });

    // Validar botón Cancelar (modal)
    cy.contains('button', /^Guardar Cambios$/i).should('be.enabled').click();

    // Validar que los cambios se reflejan en la tabla
  rows().last().within(() => {
    cy.contains('td', newName).should('be.visible'); // Validar que el nombre cambió
    cy.contains('td', newDesc).should('be.visible'); // Validar que la descripción cambió
  });

  // Validar que los valores originales ya no están presentes
  rows().last().within(() => {
    cy.contains('td', originalName).should('not.exist'); // Validar que el nombre original ya no está
    cy.contains('td', originalDesc).should('not.exist'); // Validar que la descripción original ya no está
  });
  });

  it('Validación: obligatorios vacíos (no debe guardar)', () => {
    cy.contains('button', 'Crear Rol').click();
    // Sin llenar nada
    cy.contains('button', /^Guardar$/i).click();

    // Mensaje genérico de validación: ajusta al mensaje real si fuera necesario
    cy.contains(/El nombre del rol es requerido|Completa este campo|error/i, { timeout: 8000 }).should(
      'be.visible'
    );
  });

  it('Validación: nombre duplicado (no debe crear)', () => {
    firstRoleName().then((existingName) => {
      cy.contains('button', 'Crear Rol').click();

      getInputByLabel(/^Nombre del Rol/i).clear().type(existingName);
      getInputByLabel(/^Descripci[oó]n$/i).clear().type('duplicado');

      cy.contains('button', /^Guardar$/i).click();

      cy.contains(/Role with name d already exists|duplicado|error|no se pudo/i, { timeout: 8000 }).should(
        'be.visible'
      );
    });
  });

  it.skip('Debe eliminar un rol existente correctamente', () => {
    // Paso 1: asegurarse de que haya roles en la tabla
    cy.get('table tbody tr').should('have.length.at.least', 1);
  
    // Paso 2: capturar el nombre del primer rol antes de eliminarlo
    cy.get('table tbody tr').first().find('td').eq(0).invoke('text').then((rolNombre) => {
      const nombreRol = rolNombre.trim();
      cy.log('Rol a eliminar:', nombreRol);
  
      // Paso 3: hacer clic en el botón de eliminar (ícono rojo con aria-label="Eliminar")
      cy.get('table tbody tr').last().within(() => {
        cy.get('button[aria-label="Eliminar"]').click({ force: true });
      });
  
      // Paso 4: validar que aparezca el modal de confirmación
      cy.contains('Confirmar eliminación').should('be.visible');
      cy.contains(`¿Seguro que deseas eliminar el rol`).should('contain.text', nombreRol);
  
      // Paso 5: confirmar la eliminación
      cy.contains('button', /^Eliminar$/i).should('be.visible').click({ force: true });
  
      // Paso 6: esperar que se procese y recargar (si el backend tarda)
      cy.wait(1500);
      cy.reload();
  
      // Paso 7: verificar que el rol ya no esté en la lista
      cy.get('table tbody tr').each(($tr) => {
        cy.wrap($tr).should('not.contain.text', nombreRol);
      });
    });
  });
  
});
