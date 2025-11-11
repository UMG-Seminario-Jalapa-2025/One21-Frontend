// cypress/e2e/tickets/estados_crear.cy.js
describe('Tickets / Estados - Crear Estado y verificar en listado', () => {
  const base   = 'https://dev.one21.app';
  const email  = 'qa@qa.com';
  const pass   = 'QAtest2025';
  const path   = '/status';         // <— Ruta correcta del módulo
  const pathNew= '/status/crear';   // <— Ruta de creación

  const now = Date.now();
  const st = {
    code: `ST${now}`,
    name: `PRUEBA ESTADO ${now}`,
    finalFlag: true,
    activeFlag: true,
  };

  // ===== Navegar a Estados =====
  const gotoEstados = () => {
    // Menú lateral: Ticket → Estados
    cy.contains(/^Ticket$/i, { timeout: 15000 }).scrollIntoView().click({ force: true });
    cy.contains(/^Estados$/i, { timeout: 15000 }).scrollIntoView().click({ force: true })
      .then(
        () => cy.url({ timeout: 15000 }).should('include', path),
        () => {
          // fallback directo por URL
          cy.visit(`${base}${path}`, { failOnStatusCode: false });
          cy.url({ timeout: 15000 }).should('include', path);
        }
      );

    cy.contains('Listado de Estados', { timeout: 15000 }).should('exist');
  };

  // ===== Abrir "Crear Estado" =====
  const openCrearEstado = () => {
    cy.get('button.MuiButton-root', { timeout: 10000 })
      .filter((i, el) => /crear estado/i.test((el.textContent || '').trim()))
      .first()
      .scrollIntoView()
      .click({ force: true })
      .then(
        () => cy.url({ timeout: 10000 }).should('include', pathNew),
        () => {
          // fallback: intento nativo y, si no, navego directo
          cy.window().then(win => {
            const btn = [...win.document.querySelectorAll('button.MuiButton-root')]
              .find(b => /crear estado/i.test((b.textContent || '').trim()));
            if (btn) btn.click();
          });
          cy.url({ timeout: 8000 }).then(url => {
            if (!url.includes(pathNew)) {
              cy.visit(`${base}${pathNew}`, { failOnStatusCode: false });
            }
          });
          cy.url({ timeout: 10000 }).should('include', pathNew);
        }
      );

    cy.contains(/^Crear Estado$/i, { timeout: 15000 }).should('exist');
  };

  // ===== Llenar formulario =====
  const fillForm = (code, name, { finalFlag, activeFlag }) => {
    cy.get('input[placeholder*="OPEN"]',    { timeout: 15000 }).clear().type(code);   // Código
    cy.get('input[placeholder*="Abierto"]', { timeout: 15000 }).clear().type(name);   // Nombre

    const toggle = (label, shouldBeOn) => {
      cy.contains('label', label, { timeout: 12000 })
        .parent()
        .find('input[type="checkbox"],input[type="radio"]')
        .then($inp => {
          const isChecked = $inp.is(':checked');
          if (isChecked !== shouldBeOn) cy.wrap($inp).click({ force: true });
        });
    };
    toggle('¿Es estado final?', finalFlag);
    toggle('Estado activo',     activeFlag);
  };

  // ===== Buscar registro por código =====
  const rowByCode = (code) =>
    cy.get('table tbody tr', { timeout: 10000 }).contains('td', code).parents('tr');

  // ===== Login antes de cada caso =====
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.visit(`${base}/login`, { failOnStatusCode: false });
    cy.get('input[placeholder*="correo"]', { timeout: 20000 }).should('exist').type(email);
    cy.get('input[type="password"]',       { timeout: 20000 }).should('exist').type(pass, { log: false });
    cy.contains('button', /^Login$/i,      { timeout: 20000 }).click();
    cy.url({ timeout: 20000 }).should('not.include', '/login'); // /inicio
  });

  it('Crear Estado y verificar en listado', () => {
    // 1) Ir a Estados
    gotoEstados();

    // 2) Abrir formulario de creación
    openCrearEstado();

    // 3) (opcional) probar requeridos (no debe salir de /status/crear)
    cy.contains('button', /^Guardar$/i).click();
    cy.url().should('include', pathNew);

    // 4) Crear
    fillForm(st.code, st.name, st);
    cy.contains('button', /^Guardar$/i).click();

    // 5) Validar listado
    cy.url({ timeout: 15000 }).should('include', path);
    rowByCode(st.code).should('exist').within(() => {
      cy.contains('td', st.name).should('be.visible');
      cy.contains(/Activo/i).should('exist');
    });
  });
});
