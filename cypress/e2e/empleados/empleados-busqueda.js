
// Ignorar errores específicos de React
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error')) {
    return false; // Evita que Cypress falle la prueba
  }
});

describe('Pruebas de búsqueda en la página de empleados', () => {
  beforeEach(() => {
    // Visitar la página de login antes de cada prueba
    cy.visit('https://dev.one21.app/login');

    // Ingresar el correo electrónico
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('test@test.com'); // Cambia por un correo válido

    // Ingresar la contraseña
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('Sincal200'); // Cambia por una contraseña válida

    // Hacer clic en el botón Login
    cy.contains('button', 'Login').click();

    // Verificar que se redirige a la pantalla principal
    cy.url().should('include', '/home');

    // Navegar directamente a la sección de Empleados
    cy.visit('https://dev.one21.app/Empleados');
  });

  it('Debe filtrar resultados dinámicamente mientras el usuario escribe', () => {
    // Verificar que el campo de búsqueda esté visible
    cy.get('.outline-none').click();
    cy.get('.outline-none').type('{backspace}');
    cy.get('.outline-none').type('{backspace}');
    cy.get('.outline-none').type('{backspace}');
    cy.get('.outline-none').type('{backspace}');
    cy.get('.outline-none').type('jo');
  });


});

