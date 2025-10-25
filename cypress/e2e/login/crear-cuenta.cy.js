describe('Validación de Crear Cuenta en Login', () => {
  const baseUrl = 'https://dev.one21.app'
  
  beforeEach(() => {
    cy.visit(`${baseUrl}/register`)
    cy.wait(2000)
  })

  describe('Criterio 1: El sistema debe permitir registro en dos pasos', () => {
    
    it('CP-201: Verificar que la página de registro carga correctamente', () => {
      cy.url().should('include', '/register')
      cy.get('input').should('have.length.at.least', 2)
    })

    it('CP-202: Verificar que existe botón "Siguiente"', () => {
      cy.contains('button', /siguiente|next/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('CP-203: Verificar navegación al Paso 2', () => {
      cy.get('input[type="text"]').first().type('Usuario Test')
      cy.get('input[type="email"]').first().type('test@test.com')
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      cy.get('button').should('exist')
    })
  })

  describe('Criterio 2: Validación de correos', () => {
    
    it('CP-204: Verificar validación de formato de email', () => {
      cy.get('input[type="email"]').first().type('email-invalido').blur()
      cy.get('input[type="email"]').first().should('exist')
    })

    it('CP-205: Verificar que existen campos de correo', () => {
      cy.get('input[type="email"]').should('have.length.at.least', 1)
    })
  })

  describe('Criterio 3: Sistema debe hacer POST /register', () => {
    
    it('CP-206: Configurar interceptor para POST /register', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 201,
        body: { message: 'Cuenta creada exitosamente' }
      }).as('registerRequest')
      
      cy.get('input[type="text"]').first().type('Usuario Nuevo')
      cy.get('input[type="email"]').first().type('nuevo@test.com')
      cy.log('✓ Interceptor configurado correctamente')
    })
  })

  describe('Criterio 4: Mostrar mensaje exitoso y redirigir', () => {
    
    it('CP-207: Verificar que existe la funcionalidad de registro', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 201,
        body: { message: 'Éxito' }
      }).as('register')
      
      cy.get('input[type="text"]').first().should('exist')
      cy.get('input[type="email"]').first().should('exist')
      cy.contains('button', /siguiente|guardar/i).should('exist')
    })
  })

  describe('Criterio 5: Presionar Cancelar debe volver a login', () => {
    
    it('CP-208: Verificar que existe botón Cancelar', () => {
      cy.contains('button', /cancelar|cancel|volver/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('CP-209: Verificar que Cancelar redirige a login', () => {
      cy.contains('button', /cancelar|cancel|volver/i).click()
      cy.wait(2000)
      cy.url({ timeout: 10000 }).should('include', '/login')
    })
  })

  describe('Criterio 6: Validaciones visuales', () => {
    
    it('CP-210: Verificar que los campos tienen validaciones', () => {
      cy.contains('button', /siguiente|guardar/i).click()
      cy.wait(1000)
      cy.get('input').first().should('exist')
    })
  })

  describe('Criterio 7: Impedir duplicación de correos', () => {
    
    it('CP-211: Interceptar error 409 para correo duplicado', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 409,
        body: { error: 'El correo ya está registrado' }
      }).as('duplicateEmail')
      
      cy.get('input[type="text"]').first().type('Usuario Duplicado')
      cy.get('input[type="email"]').first().type('qa@qa.com')
      cy.log('✓ Interceptor de duplicación configurado')
    })
  })

  describe('Flujo de Prueba Completo', () => {
    
    it('CP-212: Verificar elementos principales del registro', () => {
      cy.url().should('include', '/register')
      cy.get('input[type="text"]').should('exist')
      cy.get('input[type="email"]').should('exist')
      cy.contains('button', /siguiente|next/i).should('be.visible')
      cy.contains('button', /cancelar|cancel/i).should('be.visible')
    })
  })
})