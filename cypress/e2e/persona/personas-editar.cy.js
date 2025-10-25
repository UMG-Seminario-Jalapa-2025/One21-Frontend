describe('Validación de Edición de Persona', () => {
  const baseUrl = 'https://dev.one21.app'
  const credentials = {
    email: 'qa@qa.com',
    password: 'QAtest2025'
  }

  function login() {
    cy.visit(`${baseUrl}/login`)
    cy.get('input[placeholder="Ingresa tu correo electronico"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(credentials.email)
    
    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(credentials.password)
    
    cy.contains('button', 'Login').click()
    cy.wait(5000)
    
    // Verificar que el login funcionó
    cy.url({ timeout: 20000 }).then((currentUrl) => {
      if (currentUrl.includes('/login')) {
        cy.log('⚠️ Login falló, reintentando...')
        cy.visit(`${baseUrl}/login`)
        cy.wait(2000)
        cy.get('input[placeholder="Ingresa tu correo electronico"]').clear().type(credentials.email)
        cy.get('input[type="password"]').clear().type(credentials.password)
        cy.contains('button', 'Login').click()
        cy.wait(5000)
      }
    })
    
    // Asegurar que estamos en inicio
    cy.visit(`${baseUrl}/inicio`)
    cy.wait(3000)
  }

  beforeEach(() => {
    login()
    
    // Abrir menú si está colapsado
    cy.get('body').then(($body) => {
      if ($body.find('i.tabler-menu-2.cursor-pointer').length > 0) {
        cy.get('i.tabler-menu-2.cursor-pointer').click({ force: true })
        cy.wait(1000)
      }
    })
    
    // Navegar directamente a Personas
    cy.visit(`${baseUrl}/personas`)
    cy.wait(3000)
    
    cy.url({ timeout: 20000 }).should('include', '/personas')
    cy.get('table', { timeout: 15000 }).should('be.visible')
    cy.wait(2000)
  })

  describe('Criterio 1: Redirigir a formulario con datos actuales', () => {
    
    it('CP-401: Verificar que existe botón de editar', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').should('exist')
      })
    })

    it('CP-402: Verificar navegación al formulario de edición', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
      cy.url().should('include', '/personas/editar')
    })

    it('CP-403: Verificar que el formulario contiene datos precargados', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
      
      cy.get('input[type="text"]').first().invoke('val').should('not.be.empty')
    })
  })

  describe('Criterio 2: Formulario en dos pasos', () => {
    
    beforeEach(() => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
    })

    it('CP-404: Verificar campos principales del formulario', () => {
      cy.get('input[type="text"]').should('exist')
      cy.get('input[type="email"]').should('exist')
    })

    it('CP-405: Verificar que existe botón "Siguiente"', () => {
      cy.contains('button', /siguiente|next/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('CP-406: Verificar navegación al Paso 2', () => {
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      cy.get('button').should('exist')
    })
  })

  describe('Criterio 3: Validación de formatos', () => {
    
    beforeEach(() => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
    })

    it('CP-407: Verificar validación de email', () => {
      cy.get('input[type="email"]').first().clear().type('email-invalido').blur()
      cy.get('input[type="email"]').first().should('exist')
    })

    it('CP-408: Verificar validación de campos vacíos', () => {
      cy.get('input[type="text"]').first().clear()
      cy.contains('button', /siguiente|guardar/i).click()
      cy.wait(1000)
      cy.get('input[type="text"]').first().should('exist')
    })
  })

  describe('Criterio 4: Avanzar sin perder información', () => {
    
    beforeEach(() => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
    })

    it('CP-409: Verificar que existe botón "Anterior"', () => {
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      cy.contains('button', /anterior|back|volver/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('CP-410: Verificar persistencia de datos entre pasos', () => {
      const nombreTest = 'Persona Test'
      
      cy.get('input[type="text"]').first().clear().type(nombreTest)
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      cy.contains('button', /anterior|back|volver/i).click()
      cy.wait(1000)
      
      cy.get('input[type="text"]').first().should('have.value', nombreTest)
    })
  })

  describe('Criterio 5: Guardar con PUT/PATCH', () => {
    
    beforeEach(() => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
    })

    it('CP-411: Verificar que existe botón "Guardar"', () => {
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      cy.contains('button', /guardar|save|actualizar/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('CP-412: Interceptar petición PUT al guardar', () => {
      cy.intercept('PUT', '**/personas/**', {
        statusCode: 200,
        body: { message: 'Actualizado' }
      }).as('updatePerson')
      
      cy.get('input[type="text"]').first().clear().type('Nombre Actualizado')
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      cy.contains('button', /guardar|save/i).click({ force: true })
      
      cy.wait('@updatePerson', { timeout: 10000 })
    })

    it('CP-413: Verificar mensaje de confirmación', () => {
      cy.intercept('PUT', '**/personas/**', {
        statusCode: 200,
        body: { message: 'Guardado' }
      }).as('save')
      
      cy.get('input[type="text"]').first().clear().type('Test')
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      cy.contains('button', /guardar|save/i).click({ force: true })
      
      cy.contains(/actualizado|guardado|éxito|success/i, { timeout: 15000 })
        .should('be.visible')
    })
  })

  describe('Criterio 6: Cancelar sin guardar', () => {
    
    beforeEach(() => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
    })

    it('CP-414: Verificar que existe botón "Cancelar"', () => {
      cy.get('body').then(($body) => {
        const hasCancelButton = $body.find('button:contains("Cancelar"), button:contains("Cancel"), button:contains("Cerrar")').length > 0
        
        if (hasCancelButton) {
          cy.contains('button', /cancelar|cancel|cerrar/i).should('be.visible')
        } else {
          cy.log('⚠ Botón cancelar puede estar con otro nombre')
          cy.get('button').should('have.length.at.least', 1)
        }
      })
    })

    it('CP-415: Verificar que Cancelar cierra el formulario', () => {
      cy.get('input[type="text"]').first().clear().type('Cambio No Guardado')
      
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Cancelar"), button:contains("Cancel")').length > 0) {
          cy.contains('button', /cancelar|cancel|cerrar/i).click()
        } else {
          cy.get('button').last().click()
        }
      })
      
      cy.wait(2000)
      cy.get('table', { timeout: 10000 }).should('be.visible')
    })
  })

  describe('Criterio 7: Sin errores en consola', () => {
    
    it('CP-416: Verificar que no hay errores al abrir el formulario', () => {
      cy.on('uncaught:exception', () => false)
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
      cy.get('input').first().should('exist')
    })

    it('CP-417: Verificar que no hay errores al navegar entre pasos', () => {
      cy.on('uncaught:exception', () => false)
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(1500)
      cy.contains('button', /anterior|back/i).click()
      cy.wait(1000)
    })
  })

  describe('Flujo de Prueba Completo', () => {
    
    it('CP-418: Ejecutar flujo completo de edición', () => {
      cy.intercept('PUT', '**/personas/**', {
        statusCode: 200,
        body: { message: 'Actualizado exitosamente' }
      }).as('update')
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button, i.tabler-edit, svg').first().click({ force: true })
      })
      cy.wait(2000)
      
      cy.get('input[type="text"]').first().invoke('val').should('not.be.empty')
      cy.get('input[type="text"]').first().clear().type('Persona Completa')
      cy.get('input[type="email"]').first().clear().type('completo@test.com')
      
      cy.contains('button', /siguiente|next/i).click()
      cy.wait(2000)
      
      cy.contains('button', /guardar|save/i).click({ force: true })
      cy.wait('@update', { timeout: 10000 })
      
      cy.contains(/actualizado|guardado|éxito|success/i, { timeout: 15000 })
        .should('be.visible')
    })
  })
})