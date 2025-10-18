// cypress/e2e/tickets/prioridades_crear_y_verificar.cy.js
describe('Tickets / Prioridades - Crear y verificar (página 1 ó 2)', () => {
  const base = 'https://dev.one21.app';
  const email = 'qa@qa.com';
  const pass  = 'QAtest2025';

  const now = Date.now();
  const pr = {
    code: `QA${now}`,
    name: `PRUEBA QA ${now}`,
    level: '2'
  };

  // ---- helpers mínimos ----
  const gotoPrioridades = () => {
    cy.contains(/^Ticket$/i, { timeout: 15000 }).scrollIntoView().click({ force: true });
    cy.contains(/^Prioridades$/i, { timeout: 15000 }).scrollIntoView().click({ force: true })
    cy.url({ timeout: 15000 }).should('include', '/prioridades');
    cy.contains('Listado de Prioridades', { timeout: 15000 }).should('exist');
  };

  const openCrear = () => {
    cy.contains('button, a', 'Crear Prioridad', { timeout: 15000 }).click();
    cy.url().should('include', '/prioridades/crear');
    cy.contains('Crear Prioridad').should('exist');
  };

  const fillForm = (code, name, level) => {
    cy.get('input[placeholder*="HIGH"]', { timeout: 15000 }).clear().type(code); // Código
    cy.get('input[placeholder*="Alta"]').clear().type(name);                      // Nombre
    cy.get('input[placeholder*="1"]').clear().type(level);                        // Nivel
  };

  const clickGuardar = () => {
    cy.contains('button', /^Guardar$/i, { timeout: 15000 }).click();
  };

  // Busca en la tabla actual si hay una celda con el código
  const existsInCurrentPage = (code) =>
    cy.get('table tbody', { timeout: 10000 }).then($tb => {
      const found = [...$tb.find('td')].some(td => (td.textContent || '').includes(code));
      return found;
    });

  // Si no está en la página actual y existe el número "2", navega a la página 2 y vuelve a buscar
  const findRowPage1or2 = (code) => {
    return existsInCurrentPage(code).then(found => {
      if (found) return cy.get('table tbody tr').contains('td', code).parents('tr');

      // Ir a la página 2 si existe un control con texto "2"
      return cy.get('body').then($b => {
        const page2 = [...$b.find('button, a, span')].find(el => (el.textContent || '').trim() === '2');
        if (!page2) throw new Error(`No se encontró el registro y no existe paginación a "2".`);
        cy.wrap(page2).click({ force: true });
        cy.wait(700); // deja que recargue la tabla

        // Reintenta búsqueda en página 2
        return cy.get('table tbody tr', { timeout: 10000 })
          .contains('td', code)
          .parents('tr');
      });
    });
  };

  beforeEach(() => {
    // Login simple y tolerante
    cy.visit(`${base}/login`, { failOnStatusCode: false });
    cy.get('input[placeholder*="correo"]', { timeout: 20000 }).should('exist').type(email);
    cy.get('input[type="password"]', { timeout: 20000 }).should('exist').type(pass, { log: false });
    cy.contains('button', /^Login$/i, { timeout: 20000 }).click();
    cy.url({ timeout: 20000 }).should('not.include', '/login');
  });

  it('Crea una prioridad y la verifica en el listado (página 1 o 2)', () => {
    // 1) Ir al módulo y abrir el formulario
    gotoPrioridades();
    openCrear();

    // 2) (opcional) probar requeridos rápidos (que no cambie de ruta)
    cy.contains('button', /^Guardar$/i).click();
    cy.url().should('include', '/prioridades/crear');

    // 3) Crear
    fillForm(pr.code, pr.name, pr.level);
    clickGuardar();

    // 4) Asegurar que estamos en el listado (algunas veces tarda en redirigir)
    cy.url({ timeout: 15000 }).should('include', '/prioridades');
    cy.contains('Listado de Prioridades', { timeout: 15000 }).should('exist');

    // 5) Buscar registro (primero página actual, si no, ir a página 2)
    findRowPage1or2(pr.code).should('exist').within(() => {
      cy.contains('td', pr.name).should('be.visible');
      cy.contains('td', pr.level).should('be.visible');
    });
  });
});
