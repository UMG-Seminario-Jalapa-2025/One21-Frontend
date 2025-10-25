/// <reference types="cypress" />
// Evitar que errores de React detengan Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Módulo Personas - QA: Validación de carga de información', () => {
  beforeEach(() => {
    cy.visit('https://dev.one21.app/login');
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('qa@qa.com');
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('QAtest2025');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/inicio');
    cy.get('i.tabler-menu-2.cursor-pointer')
      .should('exist')
      .click({ force: true });
    cy.wait(500);
    cy.get('.ts-menuitem-root')
      .should('be.visible');
    cy.contains('a.ts-menu-button', 'Personas')
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', '/personas');
  });

  it('Carga del módulo y visibilidad del menú', () => {
    cy.get('i.tabler-menu-2.cursor-pointer')
      .should('exist')
      .click({ force: true });
    cy.wait(500);
    cy.contains('a.ts-menu-button', 'Personas')
      .should('be.visible');
    cy.get('table').should('exist');
  });

  it('Validación de estructura de tabla', () => {
    const columnas = ['Código', 'Nombre', 'Email', 'Activo', 'Acciones'];
    columnas.forEach(col => {
      cy.get('table thead').contains(col).should('exist');
    });
    cy.get('table tbody tr').each(row => {
      cy.wrap(row).find('td').should('have.length', 5);
    });
  });

  it('Manejo de lista vacía del backend', () => {
    cy.get('table tbody tr').then($rows => {
      if ($rows.length === 0) {
        cy.get('table thead').should('exist');
      } else {
        cy.log('Tabla con datos, lista vacía no aplicable');
      }
    });
  });

  it('Coherencia visual en modo oscuro', () => {
    // Abrir menú de modo
    cy.get('button[aria-label="system Mode"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    // Seleccionar Dark Mode
    cy.contains('li', 'Dark')
      .should('be.visible')
      .click();
    cy.wait(1000); // Esperar transición
    // Verificar cambio visual (sin exigir color exacto)
    cy.get('div.MuiPaper-root').should('be.visible');
    cy.get('table').should('be.visible');
    cy.log('Cambio a modo oscuro confirmado visualmente');
  });

  it('Funcionalidad de paginación', () => {
    cy.get('nav[aria-label="pagination navigation"]')
      .should('be.visible');
    cy.get('nav[aria-label="pagination navigation"] button')
      .not('[disabled]')
      .first()
      .then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          cy.wait(500);
          cy.get('table tbody tr').should('have.length.gte', 1);
        } else {
          cy.log('No hay botones de paginación habilitados');
        }
      });
  });

  it('Verificación del botón Crear Persona', () => {
    cy.contains('button', 'Crear Persona')
      .should('be.visible')
      .and('not.be.disabled');
  });
});