describe('Inicio de sesión exitoso', () => {
  it('Debe acceder al dashboard con credenciales válidas', () => {
    cy.visit('https://dev.one21.app/login');

    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('test@test.com');

    cy.get('input[type="password"]')
      .should('be.visible')
      .type('Sincal200');

    cy.contains('button', 'Login').click();

    
    cy.url().should('include', '/inicio');
  });
});
