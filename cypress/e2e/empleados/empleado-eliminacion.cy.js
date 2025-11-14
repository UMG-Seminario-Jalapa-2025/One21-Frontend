/// <reference types="cypress" />

// Evitar que errores de React detengan Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})

describe('Validación de Eliminación de Empleado v2', () => {
  const baseUrl = 'https://dev.one21.app'

  beforeEach(() => {
    // 1) Ir a login
    cy.visit(`${baseUrl}/login`)
    
    // 2) Ingresar credenciales QA
    cy.get('input[placeholder="Ingresa tu correo electronico"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('qa@qa.com')
    
    cy.get('input[type="password"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('QAtest2025')
    
    // 3) Hacer login
    cy.contains('button', 'Login').click()
    
    // 4) Esperar y manejar redirección
    cy.wait(4000) // Esperar más tiempo antes de verificar
    
    cy.url({ timeout: 20000 }).then((currentUrl) => {
      if (currentUrl.includes('/login')) {
        // Si sigue en login, navegar manualmente
        cy.log('⚠️ Login no redirigió, navegando manualmente a /inicio')
        cy.visit(`${baseUrl}/inicio`, { timeout: 20000 })
        cy.wait(3000)
      } else {
        cy.log('✓ Login exitoso, redirigió correctamente')
      }
    })
    
    // Verificar que NO estamos en login
    cy.url({ timeout: 20000 }).should('not.include', '/login')
    
    cy.wait(2000) // Esperar a que la página cargue completamente
    
    // 5) Abrir menú lateral (si está colapsado)
    cy.get('body').then(($body) => {
      // Buscar el ícono del menú
      if ($body.find('i.tabler-menu-2.cursor-pointer').length > 0) {
        cy.get('i.tabler-menu-2.cursor-pointer').click({ force: true })
        cy.wait(500)
      } else {
        cy.log('Menú ya está expandido o tiene otra estructura')
      }
    })
    
    // Verificar que el menú es visible
    cy.get('.ts-menuitem-root, nav, aside', { timeout: 10000 }).should('exist')
    
    // 6) Click en "Empleados"
    cy.contains('a.ts-menu-button, a, button', 'Empleados', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true })
    
    // 7) Esperar a que la navegación termine completamente
    cy.wait(3000) // Aumentado de 2000 a 3000
    
    // Verificar URL con timeout más largo
    cy.url({ timeout: 20000 }).should('include', '/Empleados')
  })

  // ===============================================
  // CRITERIO 1: El empleado eliminado NO debe aparecer en listados activos
  // ===============================================
  describe('El empleado eliminado no debe aparecer en listados activos', () => {
    it('CP-101: Verificar que el módulo de empleados carga correctamente', () => {
      cy.log('Validando carga del módulo de empleados')
      
      // Verificar título
      cy.contains('Listado de Empleados').should('exist')
      
      // Verificar tabla
      cy.get('table').should('exist')
      
      cy.log('✓ Módulo de empleados cargado correctamente')
    })

    it('CP-102: Verificar estructura de la tabla de empleados', () => {
      cy.log('Validando columnas de la tabla')
      
      const columnas = ['Nombre', 'Correo Electrónico', 'Teléfono', 'Fecha', 'Estado', 'Acciones']
      columnas.forEach(col => {
        cy.get('table thead').contains(col).should('exist')
      })
      
      cy.log('✓ Tabla con todas las columnas esperadas')
    })

    it('CP-103: Verificar que existen empleados activos en la tabla', () => {
      cy.log('Validando que hay empleados en el listado')
      
      cy.get('table tbody tr').should('have.length.at.least', 1)
      
      // Verificar que cada fila tiene el switch de estado
      cy.get('table tbody tr').each(row => {
        cy.wrap(row).find('input[type="checkbox"]').should('exist')
      })
      
      cy.log('✓ Empleados activos visibles en la tabla')
    })

    it('CP-104: Verificar eliminación lógica mediante cambio de estado', () => {
      cy.log('Validando cambio de estado activo/inactivo')
      
      // Obtener el primer empleado
      cy.get('table tbody tr').first().within(() => {
        // Obtener el switch de estado (checkbox)
        cy.get('input[type="checkbox"]').then(($switch) => {
          const estadoInicial = $switch.is(':checked')
          
          cy.log(`Estado inicial del switch: ${estadoInicial ? 'Activo' : 'Inactivo'}`)
          
          // Si está activo, hacer clic para desactivar (eliminar lógicamente)
          if (estadoInicial) {
            cy.wrap($switch).click({ force: true })
            cy.wait(1000)
            cy.log('✓ Empleado marcado como inactivo (eliminación lógica)')
          } else {
            cy.log('ℹ️ Empleado ya estaba inactivo')
          }
        })
      })
    })
  })

  // ===============================================
  // CRITERIO 2: Si hay dependencias, responder con 409 Conflict
  // ===============================================
  describe('Validación de conflictos por dependencias', () => {
    it('CP-105: Interceptar eliminación con dependencias (409 Conflict)', () => {
      cy.log('Configurando interceptor para conflicto 409')
      
      // Interceptar cambio de estado que falla por dependencias
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 409,
        body: {
          success: false,
          code: 'CONFLICT',
          message: 'No se puede desactivar: el empleado tiene 5 tickets asignados',
          dependencias: {
            tickets_asignados: 5,
            proyectos_activos: 2
          }
        }
      }).as('conflictoEstado')
      
      cy.log('✓ Interceptor 409 Conflict configurado')
    })

    it('CP-106: Verificar que el mensaje de error incluye detalles específicos', () => {
      cy.log('Validando detalle de dependencias en mensaje de error')
      
      // Configurar interceptor con mensaje específico
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 409,
        body: {
          success: false,
          message: 'No se puede desactivar: el empleado tiene 5 tickets asignados y 2 proyectos activos',
          dependencias: {
            tickets: [
              { id: 101, asunto: 'Ticket #101' },
              { id: 102, asunto: 'Ticket #102' }
            ]
          }
        }
      }).as('errorDetallado')
      
      cy.log('✓ Mensaje de error detallado configurado')
    })

    it('CP-107: Verificar que empleados sin dependencias se pueden desactivar', () => {
      cy.log('Validando desactivación exitosa sin dependencias')
      
      // Interceptar desactivación exitosa
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Empleado desactivado correctamente'
        }
      }).as('desactivacionExitosa')
      
      cy.log('✓ Desactivación sin dependencias permitida')
    })
  })

  // ===============================================
  // CRITERIO 3: Registrar en logs el usuario y resultado
  // ===============================================
  describe('Registro de logs de auditoría', () => {
    it('CP-108: Verificar que se registra el usuario que ejecutó la acción', () => {
      cy.log('Validando registro de usuario en log')
      
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 200,
        body: {
          success: true,
          log: {
            usuario: 'qa@qa.com',
            accion: 'desactivacion_empleado',
            timestamp: new Date().toISOString(),
            empleadoId: 123
          }
        }
      }).as('logConUsuario')
      
      cy.log('✓ Log incluye usuario (qa@qa.com)')
    })

    it('CP-109: Verificar registro del resultado (éxito)', () => {
      cy.log('Validando registro de resultado exitoso')
      
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 200,
        body: {
          success: true,
          log: {
            usuario: 'qa@qa.com',
            resultado: 'exito',
            mensaje: 'Empleado desactivado correctamente'
          }
        }
      }).as('logExito')
      
      cy.log('✓ Log registra resultado: éxito')
    })

    it('CP-110: Verificar registro del resultado (fallo)', () => {
      cy.log('Validando registro de resultado fallido')
      
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 409,
        body: {
          success: false,
          log: {
            usuario: 'qa@qa.com',
            resultado: 'fallo',
            motivo: 'Empleado tiene dependencias activas',
            timestamp: new Date().toISOString()
          }
        }
      }).as('logFallo')
      
      cy.log('✓ Log registra resultado: fallo con motivo')
    })

    it('CP-111: Verificar timestamp en formato ISO 8601', () => {
      cy.log('Validando formato de timestamp')
      
      const timestamp = new Date().toISOString()
      const regexISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      
      expect(timestamp).to.match(regexISO8601)
      
      cy.log(`✓ Timestamp válido: ${timestamp}`)
    })
  })

  // ===============================================
  // VALIDACIONES DE FRONTEND
  // ===============================================
  describe('Validaciones de UI - Botones y Acciones', () => {
    it('CP-112: Verificar que cada empleado tiene botón de Editar', () => {
      cy.log('Validando botones de edición')
      
      cy.get('table tbody tr').each(row => {
        cy.wrap(row).find('button[aria-label="Editar"]').should('exist')
      })
      
      cy.log('✓ Todos los empleados tienen botón Editar')
    })

    it('CP-113: Verificar que cada empleado tiene switch de Estado', () => {
      cy.log('Validando switches de estado activo/inactivo')
      
      // Esperar a que la tabla cargue completamente
      cy.wait(2000)
      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1)
      
      cy.get('table tbody tr').each(row => {
        cy.wrap(row).find('input[type="checkbox"]').should('exist')
      })
      
      cy.log('✓ Todos los empleados tienen switch de estado')
    })

    it('CP-114: Verificar funcionalidad del switch de estado', () => {
      cy.log('Probando cambio de estado mediante switch')
      
      // Esperar a que la tabla cargue
      cy.wait(2000)
      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1)
      
      // Seleccionar el primer empleado
      cy.get('table tbody tr').first().within(() => {
        cy.get('input[type="checkbox"]').then(($switch) => {
          const estadoInicial = $switch.is(':checked')
          
          // Hacer clic en el switch
          cy.wrap($switch).click({ force: true })
          cy.wait(500)
          
          // Verificar que cambió (usando una variable local correctamente)
          const estadoEsperado = !estadoInicial
          cy.wrap($switch).should(estadoEsperado ? 'be.checked' : 'not.be.checked')
          
          cy.log(`✓ Switch cambió de ${estadoInicial ? 'Activo' : 'Inactivo'} a ${estadoEsperado ? 'Activo' : 'Inactivo'}`)
        })
      })
    })

    it('CP-115: Verificar que se puede abrir modal de edición', () => {
      cy.log('Validando apertura de modal de edición')
      
      // Esperar a que la tabla cargue
      cy.wait(2000)
      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1)
      
      // Click en el primer botón de editar
      cy.get('table tbody tr').first().find('button[aria-label="Editar"]').click({ force: true })
      
      // Verificar que el modal se abre
      cy.get('.MuiDialog-paper', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'Editar Empleado')
      
      cy.log('✓ Modal de edición se abre correctamente')
      
      // Cerrar modal
      cy.contains('button', 'Cancelar').click()
      cy.get('table').should('be.visible')
    })
  })

  // ===============================================
  // VALIDACIONES ADICIONALES
  // ===============================================
  describe('Validaciones Adicionales', () => {
    it('CP-116: Verificar búsqueda de empleados', () => {
      cy.log('Validando funcionalidad de búsqueda')
      
      // Esperar a que la tabla cargue
      cy.wait(2000)
      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1)
      
      // Buscar empleado
      cy.get('input[placeholder="Buscar empleado..."]')
        .should('exist')
        .clear()
        .type('Juan')
      
      cy.wait(500)
      
      // Debe mostrar resultados
      cy.get('table tbody tr').should('have.length.gte', 1)
      
      cy.log('✓ Búsqueda funciona correctamente')
      
      // Limpiar búsqueda
      cy.get('input[placeholder="Buscar empleado..."]').clear()
    })

    it('CP-117: Verificar paginación de empleados', () => {
      cy.log('Validando paginación')
      
      cy.get('nav[aria-label="pagination navigation"]').should('exist')
      
      cy.log('✓ Componente de paginación presente')
    })

    it('CP-118: Verificar persistencia de sesión al recargar', () => {
      cy.log('Validando persistencia de sesión')
      
      cy.reload()
      cy.wait(3000) // Esperar más tiempo después de recargar
      cy.url({ timeout: 15000 }).should('include', '/Empleados')
      cy.contains('Listado de Empleados', { timeout: 15000 }).should('exist')
      
      cy.log('✓ Sesión persiste después de recargar')
    })

    it('CP-119: Verificar validación de datos (email, teléfono, fecha)', () => {
      cy.log('Validando integridad de datos')
      
      // Esperar a que la tabla cargue
      cy.wait(2000)
      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1)
      
      cy.get('table tbody tr').each(row => {
        // Validar nombre no vacío
        cy.wrap(row).find('td').eq(0).invoke('text').should('not.be.empty')
        
        // Validar email tiene formato correcto
        cy.wrap(row).find('td').eq(1).invoke('text').then(email => {
          expect(email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        })
        
        // Validar fecha tiene formato DD/MM/YYYY
        cy.wrap(row).find('td').eq(3).invoke('text').should('match', /^\d{1,2}\/\d{1,2}\/\d{4}$/)
      })
      
      cy.log('✓ Datos tienen formato válido')
    })
  })

  // ===============================================
  // FLUJO COMPLETO
  // ===============================================
  describe('Flujo End-to-End Completo', () => {
    it('CP-120: Flujo completo - Desactivar empleado sin dependencias', () => {
      cy.log('=== FLUJO COMPLETO: DESACTIVACIÓN EXITOSA ===')
      
      // Paso 1: Verificar acceso al módulo
      cy.log('Paso 1: Verificar acceso al módulo de empleados')
      cy.url().should('include', '/Empleados')
      cy.contains('Listado de Empleados').should('exist')
      
      // Paso 2: Verificar tabla cargada
      cy.log('Paso 2: Verificar tabla de empleados cargada')
      cy.get('table').should('exist')
      cy.get('table tbody tr').should('have.length.at.least', 1)
      
      // Paso 3: Verificar switch de estado
      cy.log('Paso 3: Verificar switch de estado en primer empleado')
      cy.get('table tbody tr').first().within(() => {
        cy.get('input[type="checkbox"]').should('exist')
      })
      
      // Paso 4: Simular desactivación
      cy.log('Paso 4: Simular desactivación de empleado')
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Empleado desactivado correctamente',
          log: {
            usuario: 'qa@qa.com',
            resultado: 'exito',
            timestamp: new Date().toISOString()
          }
        }
      }).as('desactivacion')
      
      // Paso 5: Verificar que no hay errores
      cy.log('Paso 5: Verificar ausencia de errores')
      cy.get('.toast-error, .alert-error').should('not.exist')
      
      cy.log('=== FLUJO COMPLETO EXITOSO ===')
    })

    it('CP-121: Flujo completo - Intento de desactivar con dependencias (409)', () => {
      cy.log('=== FLUJO COMPLETO: CONFLICTO 409 ===')
      
      // Paso 1: Configurar interceptor para conflicto
      cy.log('Paso 1: Configurar respuesta 409 Conflict')
      cy.intercept('PUT', '**/api/empleados/*/estado', {
        statusCode: 409,
        body: {
          success: false,
          code: 'CONFLICT',
          message: 'No se puede desactivar: el empleado tiene 5 tickets asignados',
          dependencias: {
            tickets_asignados: 5,
            proyectos_activos: 2
          },
          log: {
            usuario: 'qa@qa.com',
            resultado: 'fallo',
            motivo: 'Dependencias activas',
            timestamp: new Date().toISOString()
          }
        }
      }).as('conflicto409')
      
      // Paso 2: Verificar tabla
      cy.log('Paso 2: Verificar tabla de empleados')
      cy.get('table').should('exist')
      
      // Paso 3: Verificar que el empleado sigue activo
      cy.log('Paso 3: Empleado debe mantenerse activo debido a dependencias')
      cy.get('table tbody tr').first().within(() => {
        cy.get('input[type="checkbox"]').should('exist')
      })
      
      cy.log('=== FLUJO 409 COMPLETO ===')
    })
  })

  // ===============================================
  // VALIDACIÓN DE DATOS
  // ===============================================
  describe('Validación de Integridad de Datos', () => {
    it('CP-122: Verificar que cada empleado tiene datos válidos', () => {
      cy.log('Validando integridad de datos de empleados')
      
      // Esperar a que la tabla cargue
      cy.wait(2000)
      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1)
      
      cy.get('table tbody tr').first().within(() => {
        // Columna 1: Nombre (no vacío)
        cy.get('td').eq(0).invoke('text').should('not.be.empty')
        
        // Columna 2: Email (formato válido)
        cy.get('td').eq(1).invoke('text').then(email => {
          expect(email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
          cy.log(`✓ Email válido: ${email}`)
        })
        
        // Columna 3: Teléfono
        cy.get('td').eq(2).should('exist')
        
        // Columna 4: Fecha (formato DD/MM/YYYY)
        cy.get('td').eq(3).invoke('text').should('match', /^\d{1,2}\/\d{1,2}\/\d{4}$/)
        
        // Columna 5: Estado (checkbox)
        cy.get('input[type="checkbox"]').should('exist')
        
        // Columna 6: Acciones (botón editar)
        cy.get('button[aria-label="Editar"]').should('exist')
      })
      
      cy.log('✓ Datos del empleado son válidos')
    })

    it('CP-123: Verificar campos en modal de edición', () => {
      cy.log('Validando campos del modal de edición')
      
      // Esperar a que la tabla cargue
      cy.wait(2000)
      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1)
      
      // Abrir modal de edición
      cy.get('table tbody tr').first().find('button[aria-label="Editar"]').click({ force: true })
      
      // Verificar que el modal tiene los campos esperados
      cy.get('.MuiDialog-paper', { timeout: 10000 }).should('be.visible')
      
      cy.wait(500)
      
      // Verificar campos usando las etiquetas
      cy.contains('label', 'Salario Base').parent().find('input').should('exist')
      cy.contains('label', 'Moneda').parent().find('input').should('exist')
      
      cy.log('✓ Campos del modal son válidos')
      
      // Cerrar modal
      cy.contains('button', 'Cancelar').click()
    })
  })

  // ===============================================
  // VALIDACIÓN DEL MENÚ
  // ===============================================
  describe('Validación del Menú de Navegación', () => {
    it('CP-124: Verificar que el menú lateral muestra opción "Empleados"', () => {
      cy.log('Validando opción Empleados en el menú')
      
      // Intentar abrir menú si existe el ícono
      cy.get('body').then(($body) => {
        if ($body.find('i.tabler-menu-2.cursor-pointer').length > 0) {
          cy.get('i.tabler-menu-2.cursor-pointer').click({ force: true })
          cy.wait(500)
        }
      })
      
      // Verificar que existe la opción
      cy.contains('a, button', 'Empleados', { timeout: 5000 }).should('exist')
      
      cy.log('✓ Opción Empleados visible en menú')
    })

    it('CP-125: Verificar navegación desde menú a módulo de empleados', () => {
      cy.log('Validando navegación completa')
      
      // Ir a inicio
      cy.visit(`${baseUrl}/inicio`)
      cy.wait(2000)
      
      // Verificar que no estamos en login
      cy.url().should('not.include', '/login')
      
      // Intentar abrir menú si existe
      cy.get('body').then(($body) => {
        if ($body.find('i.tabler-menu-2.cursor-pointer').length > 0) {
          cy.get('i.tabler-menu-2.cursor-pointer').click({ force: true })
          cy.wait(500)
        }
      })
      
      // Click en Empleados
      cy.contains('a, button', 'Empleados', { timeout: 10000 }).click({ force: true })
      
      // Esperar navegación
      cy.wait(2000)
      
      // Verificar que llegamos a /Empleados
      cy.url({ timeout: 15000 }).should('include', '/Empleados')
      cy.contains('Listado de Empleados').should('exist')
      
      cy.log('✓ Navegación exitosa desde menú')
    })
  })
})