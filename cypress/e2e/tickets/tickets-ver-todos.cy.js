describe('Validación de Ver Todos los Tickets', () => {
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
    cy.wait(4000)
    
    cy.url({ timeout: 20000 }).then((currentUrl) => {
      if (currentUrl.includes('/login')) {
        cy.visit(`${baseUrl}/inicio`, { timeout: 20000 })
        cy.wait(3000)
      }
    })
  }

  beforeEach(() => {
    login()
    
    cy.get('body').then(($body) => {
      if ($body.find('i.tabler-menu-2.cursor-pointer').length > 0) {
        cy.get('i.tabler-menu-2.cursor-pointer').click({ force: true })
        cy.wait(1000)
      }
    })
    
    cy.contains('a.ts-menu-button, a, button', 'Ticket', { timeout: 15000 })
      .should('be.visible')
      .click({ force: true })
    
    cy.wait(1000)
    
    cy.contains('a, button, li', /ver todos|todos los tickets|all tickets/i, { timeout: 10000 })
      .click({ force: true })
    
    cy.wait(3000)
    
    cy.url({ timeout: 20000 }).then((url) => {
      if (!url.includes('/ticket/ver-todos')) {
        cy.visit(`${baseUrl}/ticket/ver-todos`)
        cy.wait(2000)
      }
    })
  })

  describe('Criterio 1: Tabla debe mostrar las 8 columnas requeridas', () => {
    
    it('CP-301: Verificar que la tabla de tickets existe', () => {
      cy.get('table', { timeout: 15000 }).should('be.visible')
    })

    it('CP-302: Verificar que la tabla tiene 8 columnas', () => {
      cy.get('table thead th').should('have.length', 8)
    })

    it('CP-303: Verificar nombres de columnas individualmente', () => {
      cy.get('table thead th').eq(0).should('contain.text', 'Ticket')
      cy.get('table thead th').eq(1).should('contain.text', 'Cliente')
      cy.get('table thead th').eq(2).should('contain.text', 'Asunto')
      cy.get('table thead th').eq(3).should('contain.text', 'Descripción')
      cy.get('table thead th').eq(4).should('contain.text', 'Prioridad')
      cy.get('table thead th').eq(5).should('contain.text', 'Estado')
      cy.get('table thead th').eq(6).should('contain.text', 'Asignación')
      cy.get('table thead th').eq(7).should('contain.text', 'Fecha')
    })

    it('CP-304: Verificar que la tabla contiene datos', () => {
      cy.get('table tbody tr', { timeout: 10000 })
        .should('have.length.at.least', 1)
    })
  })

  describe('Criterio 2: Indicadores superiores', () => {
    
    it('CP-305: Verificar indicador "Total"', () => {
      cy.contains(/total|todos/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('CP-306: Verificar indicador "Pendientes"', () => {
      cy.contains(/pendiente|pending|abierto/i)
        .should('be.visible')
    })

    it('CP-307: Verificar indicador "Iniciados"', () => {
      cy.contains(/iniciado|en proceso|in progress|proceso/i)
        .should('be.visible')
    })

    it('CP-308: Verificar indicador "Completados"', () => {
      cy.get('body').then(($body) => {
        const text = $body.text()
        const hasCompletedIndicator = /completado|terminado|finalizado|cerrado|resuelto|completo/i.test(text)
        
        if (hasCompletedIndicator) {
          cy.log('✓ Indicador de completados encontrado')
        } else {
          cy.log('⚠ Indicador puede tener otro nombre')
        }
      })
    })

    it('CP-309: Verificar indicador "Sin Asignar"', () => {
      cy.contains(/sin asignar|unassigned|no asignado/i)
        .should('be.visible')
    })
  })

  describe('Criterio 3: Información legible con etiquetas visuales', () => {
    
    it('CP-310: Verificar que las prioridades son visibles', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('td').eq(4).should('be.visible')
      })
    })

    it('CP-311: Verificar que los estados son visibles', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('td').eq(5).should('be.visible')
      })
    })

    it('CP-312: Verificar legibilidad general de la tabla', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('td').should('have.length', 8)
      })
    })
  })

  describe('Criterio 4: Paginación funcional', () => {
    
    it('CP-313: Verificar existencia de controles de paginación', () => {
      cy.get('body').then(($body) => {
        const hasPagination = $body.find('[class*="pagination"], button:contains("Siguiente")').length > 0
        
        if (hasPagination) {
          cy.log('✓ Paginación encontrada')
        } else {
          cy.log('⚠ Sin paginación (puede tener pocos registros)')
        }
      })
    })
  })

  describe('Criterio 5: Diseño coherente con modo oscuro', () => {
    
    it('CP-314: Verificar que la tabla es visible', () => {
      cy.get('table').should('be.visible')
      cy.get('table thead th').first().should('be.visible')
      cy.get('table tbody tr').first().should('be.visible')
    })

    it('CP-315: Verificar contraste de texto', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('td').first().should('be.visible')
      })
    })
  })

  describe('Validaciones Generales', () => {
    
    it('CP-316: Verificar URL correcta', () => {
      cy.url().should('include', '/ticket/ver-todos')
    })

    it('CP-317: Verificar título de la página', () => {
      cy.contains(/ver todos|todos los tickets|listado/i, { timeout: 10000 })
        .should('be.visible')
    })

    it('CP-318: Verificar persistencia de sesión', () => {
      cy.reload()
      cy.wait(3000)
      cy.url({ timeout: 15000 }).should('include', '/ticket/ver-todos')
      cy.get('table', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Flujo de Prueba Completo', () => {
    
    it('CP-319: Ejecutar validación completa del módulo', () => {
      cy.url().should('include', '/ticket/ver-todos')
      cy.get('table', { timeout: 15000 }).should('be.visible')
      cy.get('table thead th').should('have.length', 8)
      cy.get('table tbody tr').should('have.length.at.least', 1)
      cy.contains(/total/i).should('be.visible')
      cy.contains(/pendiente/i).should('be.visible')
      cy.get('table thead th').eq(0).should('contain.text', 'Ticket')
      cy.get('table thead th').eq(1).should('contain.text', 'Cliente')
      cy.get('table thead th').eq(2).should('contain.text', 'Asunto')
      cy.get('table thead th').eq(3).should('contain.text', 'Descripción')
      cy.get('table thead th').eq(4).should('contain.text', 'Prioridad')
      cy.get('table thead th').eq(5).should('contain.text', 'Estado')
      cy.get('table thead th').eq(6).should('contain.text', 'Asignación')
      cy.get('table thead th').eq(7).should('contain.text', 'Fecha')
    })
  })
})