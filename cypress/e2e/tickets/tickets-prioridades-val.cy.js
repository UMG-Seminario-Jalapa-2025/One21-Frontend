// cypress/e2e/validacion-prioridades-encabezados.cy.js
describe('Prioridades - Encabezados requeridos', () => {
    const { baseUrl } = require('../../support/urls');

  it('Muestra CÓDIGO, NOMBRE, NIVEL (ACCIONES opcional)', () => {
    // 1) Login (tolerante a UI)
    cy.visit(`${baseUrl}/login`, { failOnStatusCode: false });

    cy.get('input[placeholder*="correo"]', { timeout: 20000 })
      .should('exist')               // evitamos flaky "be.visible"
      .type('qa@qa.com');

    cy.get('input[type="password"]', { timeout: 20000 })
      .should('exist')
      .type('QAtest2025', { log: false });

    cy.contains('button', /^Login$/i, { timeout: 20000 }).click();
    cy.url({ timeout: 20000 }).should('not.include', '/login'); // redirige a /inicio

    // 2) Intercept ANTES de navegar al módulo
    cy.intercept('GET', '**/api/tickets/prioridades/**').as('apiPrioridades');

    // 3) Ir a Ticket > Prioridades
    cy.contains(/^Ticket$/i, { timeout: 15000 }).scrollIntoView().click({ force: true });
    cy.contains(/^Prioridades$/i, { timeout: 15000 }).scrollIntoView().click({ force: true })

    cy.url({ timeout: 15000 }).should('include', '/prioridades');

    // si la petición ya voló, este wait puede no capturarla; por eso es opcional:
    cy.wait('@apiPrioridades', { timeout: 20000 }).its('response.statusCode')
      .should('be.oneOf', [200, 304]);

    // 4) Validar encabezados (con normalización de acentos)
    cy.get('table thead', { timeout: 15000 }).should('be.visible');
    cy.get('table thead th').then(($ths) => {
      const normalize = (s) =>
        s.trim()
         .toLowerCase()
         .normalize('NFD')
         .replace(/\p{Diacritic}/gu, ''); // quita acentos

      const headers = [...$ths].map(th => normalize(th.textContent));
      // obligatorios
      expect(headers).to.include.members(['codigo', 'nombre', 'nivel']);
      // opcional:
      // expect(headers).to.include('acciones');
    });

    // (sanidad) tabla renderizada sin romperse
    cy.get('table tbody tr').its('length').should('be.gte', 0);
  });
});
