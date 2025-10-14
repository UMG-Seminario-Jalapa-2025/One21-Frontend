
describe('Login fallido', () => {
  it('Debe mostrar mensaje de error y no permitir acceso', () => {
    cy.visit('https://dev.one21.app/login');

    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('usuario@falso.com');

    cy.get('input[type="password"]')
      .should('be.visible')
      .type('ClaveIncorrecta');

    cy.contains('button', 'Login').click();

    cy.contains('Correo o contraseña incorrectos', { timeout: 8000 })
      .should('be.visible');
      
    cy.url().should('eq', 'https://dev.one21.app/login');
  });
});
