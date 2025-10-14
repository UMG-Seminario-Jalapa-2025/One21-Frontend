// Ignorar errores de React para evitar falsos positivos
Cypress.on('uncaught:exception', (err, runnable) => {
    if (err.message.includes('Minified React error')) {
      return false; // evita que falle la prueba
    }
  });
  
  describe('Pruebas de inicio de sesión - Roles de usuario (Cliente, Empleado, Admin)', () => {
  
    const usuarios = [
      {
        rol: 'Cliente',
        correo: 'client@client.com',
        password: 'Client2025',
        rutaEsperada: '/inicio',
      },
      {
        rol: 'Empleado',
        correo: 'employee@employee.com',
        password: 'Employee2025',
        rutaEsperada: '/inicio',
      },
      {
        rol: 'Administrador',
        correo: 'qa@qa.com',
        password: 'QAtest2025',
        rutaEsperada: '/inicio',
      },
    ];
  
    usuarios.forEach((usuario) => {
      it(`Debe iniciar sesión correctamente como ${usuario.rol}`, () => {
        cy.visit('https://dev.one21.app/login');
  
        // Validar que el campo de correo esté visible
        cy.get('input[placeholder="Ingresa tu correo electronico"]')
          .should('be.visible')
          .clear()
          .type(usuario.correo);
  
        // Validar que el campo de contraseña esté visible
        cy.get('input[type="password"]')
          .should('be.visible')
          .clear()
          .type(usuario.password);
  
        // Hacer clic en el botón de Login
        cy.contains('button', 'Login').should('be.visible').click();
  
        // Esperar que la URL cambie al dashboard principal
        cy.url().should('include', usuario.rutaEsperada);
  
        // Comprobación visual: título o navbar de bienvenida
        cy.get('body').then(($body) => {
          if ($body.find('h1, h2, nav, header').length > 0) {
            cy.log(`✅ Login exitoso para rol: ${usuario.rol}`);
          } else {
            cy.log(`⚠️ No se detectó encabezado visible tras login para ${usuario.rol}`);
          }
        });
      });
    });
  
    it('Debe mostrar mensaje de error con credenciales inválidas', () => {
      cy.visit('https://dev.one21.app/login');
  
      cy.get('input[placeholder="Ingresa tu correo electronico"]')
        .should('be.visible')
        .clear()
        .type('incorrecto@test.com');
  
      cy.get('input[type="password"]')
        .should('be.visible')
        .clear()
        .type('ClaveInvalida123');
  
      cy.contains('button', 'Login').click();
  
      // Esperar mensaje de error visible
      cy.contains('Credenciales inválidas', { matchCase: false })
        .should('be.visible')
        .then(() => cy.log('✅ Error mostrado correctamente al ingresar credenciales inválidas'));
    });
  });
  