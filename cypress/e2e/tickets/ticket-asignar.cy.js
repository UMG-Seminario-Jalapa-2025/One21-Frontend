/// <reference types="cypress" />
// Evitar que errores de React detengan Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Módulo Tickets - QA: Validación de asignación de tickets', () => {
  beforeEach(() => {
    const {baseUrl} = require('../../support/urls');
    const base = baseUrl;
    cy.visit(base);
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
    cy.contains('a.ts-menu-button', 'Ticket')
      .should('be.visible')
      .click({ force: true });
    cy.wait(500);
    cy.contains('a.ts-menu-button', 'Asignar Tickets')
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', '/ticket/asignar');
  });

  it('Debe mostrar la tabla de tickets con columnas correctas', () => {
    cy.get('table.table_table__cB3AL thead tr')
      .should('contain', 'Ticket')
      .and('contain', 'Cliente')
      .and('contain', 'Asunto')
      .and('contain', 'Descripción')
      .and('contain', 'Prioridad')
      .and('contain', 'Estado')
      .and('contain', 'Asignar');
  });



  it('Sin tickets pendientes', () => {
    cy.get('table.table_table__cB3AL tbody tr').then($rows => {
      if ($rows.length === 0) {
        cy.contains('Sin tickets pendientes de asignación').should('be.visible');
      } else {
        cy.log('Tabla con tickets, mensaje no mostrado');
        cy.get('table').should('exist');
      }
    });
  });

  it('Validación de permisos', () => {
    // Rol cliente (sin permisos para asignar)
    const {baseUrl} = require('../../support/urls');
    const base = baseUrl;
    cy.visit(base);
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('client@client.com');
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('Client2025');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/inicio');
    cy.get('i.tabler-menu-2.cursor-pointer')
      .should('exist')
      .click({ force: true });
    cy.wait(500);
    cy.contains('a.ts-menu-button', 'Ticket')
      .click({ force: true });
    cy.wait(500);
    cy.contains('a.ts-menu-button', 'Asignar Tickets').should('not.exist');

    // Rol empleado (posiblemente limitado)
    cy.visit(base);
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('employee@employee.com');
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('Employee2025');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/inicio');
    cy.get('i.tabler-menu-2.cursor-pointer')
      .should('exist')
      .click({ force: true });
    cy.wait(500);
    cy.contains('a.ts-menu-button', 'Ticket')
      .click({ force: true });
    cy.wait(500);
    cy.contains('a.ts-menu-button', 'Asignar Tickets').should('not.exist');
  });
});
