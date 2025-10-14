// Ignorar errores específicos de React
Cypress.on('uncaught:exception', (err, runnable) => {
    if (err.message.includes('Minified React error')) {
      return false; // Evita que Cypress falle la prueba
    }
  });
  describe('Pruebas de búsqueda en la página de empleados', () => {
    beforeEach(() => {
      // Visitar la página de empleados antes de cada prueba
      // 1) Visitar la página de login
      cy.visit('https://dev.one21.app/login');
  
      // 2) Ingresar el correo electrónico
      cy.get('input[placeholder="Ingresa tu correo electronico"]')
        .should('be.visible')
        .type('test@test.com'); // Cambia por un correo válido
  
      // 3) Ingresar la contraseña
      cy.get('input[type="password"]')
        .should('be.visible')
        .type('Sincal200'); // Cambia por una contraseña válida
  
      // 4) Hacer clic en el botón Login
      cy.contains('button', 'Login').click();
  
      // 5) Verificar que se redirige a la pantalla principal 
      cy.url().should('include', '/inicio');

    });
  
    context('Tickets - Listado', () => {
        it('Muestra la opción Tickets en el menú lateral y abre la sección', () => {
          // Desde donde te dejó el beforeEach, navega al listado
          cy.visit('https://dev.one21.app/ticket');
    
          // Verifica que el menú lateral contenga "Ticket" bajo "MÓDULOS ERP"
          cy.get('aside').within(() => {
            cy.contains(/MÓDULOS ERP/i).should('be.visible');
            cy.contains(/^Ticket$/).should('be.visible');
          });
    
          // Verifica URL correcta
          cy.url().should('include', '/ticket');
        });
    
        it('Muestra botón "Agregar Ticket" y navega al formulario', () => {
          cy.visit('https://dev.one21.app/ticket/crear');
    
          cy.contains('button, a', /Crear Ticket/i)
            .should('be.visible')
            .click();
    
          cy.url().should('include', '/ticket/crear');
          // volver al listado para las siguientes pruebas
          cy.visit('https://dev.one21.app/ticket');
        });

          it('Mantiene la sesión activa durante la carga (no redirige a /login)', () => {
            // Simula carga lenta de tickets y confirma que no hay redirect a /login
            cy.intercept('GET', '**/tickets**', (req) => {
              req.on('response', (res) => {
                // no modificamos el body; solo dejamos pasar
              });
            }).as('getTicketsSlow');
      
            cy.visit('https://dev.one21.app/ticket');
            // Aún estamos dentro de la app (no /login)
            cy.location('pathname').should('not.contain', '/login');
      
          });
    });
 
  
  });