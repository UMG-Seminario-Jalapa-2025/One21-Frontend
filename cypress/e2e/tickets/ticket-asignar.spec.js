describe('Módulo Tickets - Asignación de Tickets', () => {
  
  beforeEach(() => {
    // LOGIN
    cy.visit('https://dev.one21.app/login');
    cy.get('input[placeholder="Ingresa tu correo electronico"]').type('test@test.com');
    cy.get('input[type="password"]').type('Sincal200');
    cy.contains('button', 'Login').click();

    // Validar URL después del login
    cy.url().should('include', '/inicio');

    // NAVEGAR A ASIGNAR TICKETS
    cy.contains('span.ts-menu-label', 'Ticket').click({ force: true });
    cy.contains('span.ts-menu-label', 'Asignar Tickets').click({ force: true });

    // Validar URL de asignación de tickets
    cy.url().should('include', '/ticket/asignar');
  });

  it('Debe mostrar la tabla de tickets con columnas correctas', () => {
    cy.get('table').should('exist');
    cy.get('table thead').within(() => {
      cy.contains('th', 'Ticket').should('exist');
      cy.contains('th', 'Cliente').should('exist');
      cy.contains('th', 'Asunto').should('exist');
      cy.contains('th', 'Descripción').should('exist');
      cy.contains('th', 'Prioridad').should('exist');
      cy.contains('th', 'Estado').should('exist');
      cy.contains('th', 'Asignar').should('exist');
    });
  });

  it('Cada ticket debe tener un número único', () => {
    const tickets = [];
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).find('td').first().invoke('text').then((ticketId) => {
        expect(tickets).to.not.include(ticketId);
        tickets.push(ticketId);
      });
    });
  });

  it('Cada ticket debe mostrar cliente, asunto, descripción y prioridad', () => {
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(1).should('not.be.empty'); // Cliente
      cy.wrap($row).find('td').eq(2).should('not.be.empty'); // Asunto
      cy.wrap($row).find('td').eq(3).should('not.be.empty'); // Descripción
      cy.wrap($row).find('td').eq(4).should('not.be.empty'); // Prioridad
    });
  });

  it('Debe permitir asignar un ticket pendiente a un técnico', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('div[role="combobox"]').click();
    });

    // Seleccionar una opción real del menú
    cy.get('li[role="option"]').contains('Carlos López').click();

    // Verificar que ahora aparezca como asignado
    cy.get('table tbody tr').first().contains('td', 'Asignado').should('exist');
  });

  it('Debe mostrar el estado "Asignado" si el ticket ya tiene técnico', () => {
    cy.get('table tbody tr').contains('td', 'Asignado').should('exist');
  });

  it('No debe permitir volver al valor "Seleccionar técnico"', () => {
    cy.get('table tbody tr').contains('td', 'Asignado').first().parent().within(() => {
      cy.get('div[role="combobox"]').should('not.exist');
    });
  });

});
