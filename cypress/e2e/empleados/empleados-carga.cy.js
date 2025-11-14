/// <reference types="cypress" />
// Evitar que errores de React detengan Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Módulo Empleados - QA: Validación de carga de información v2', () => {
  // Ejecutar login antes de cada prueba y navegar al módulo Empleados
  beforeEach(() => {
    // 1) Ir a login
      const { baseUrl } = require('../../support/urls');
      cy.visit(baseUrl);

    // 2) Ingresar correo electrónico
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('qa@qa.com');

    // 3) Ingresar contraseña
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('QAtest2025');

    // 4) Hacer login
    cy.contains('button', 'Login').click();

    // 5) Verificar redirección a home (ajustado a /inicio)
    cy.url().should('include', '/inicio');

    // 6) Abrir menú lateral si está colapsado
    cy.get('i.tabler-menu-2.cursor-pointer')
      .should('exist')
      .click({ force: true });

    // Esperar a que el menú aparezca
    cy.wait(500); // Aumentar tiempo de espera para asegurar que el menú se expanda
    cy.get('.ts-menuitem-root')
      .should('be.visible');

    // Entrar a Empleados
    cy.contains('a.ts-menu-button', 'Empleados')
      .should('be.visible')
      .click({ force: true });

    // Verificar que estamos en módulo Empleados
    cy.url().should('include', '/Empleados');
  });

  // 1️⃣ Menú lateral
  it('Menú lateral muestra opción Empleados', () => {
    cy.get('i.tabler-menu-2.cursor-pointer')
      .should('exist')
      .click({ force: true });
    cy.wait(500); // Esperar a que el menú se expanda
    cy.contains('a.ts-menu-button', 'Empleados')
      .scrollIntoView()
      .should('be.visible');
  });

  // 2️⃣ Vista y elementos
  it('Vista de Empleados se carga correctamente', () => {
    cy.contains('Listado de Empleados').should('exist');
    cy.get('table').should('exist');
  });

  // 3️⃣ Columnas de la tabla
  it('Tabla muestra todas las columnas esperadas', () => {
    const columnas = ['Nombre', 'Correo Electrónico', 'Teléfono', 'Fecha', 'Estado', 'Acciones'];
    columnas.forEach(col => {
      cy.get('table thead').contains(col).should('exist');
    });
  });

  // 4️⃣ Acciones Editar en cada fila
  it('Cada fila tiene botón Editar', () => {
    cy.get('table tbody tr').each(row => {
      cy.wrap(row).find('button[aria-label="Editar"]').should('exist');
    });
  });

  // 5️⃣ Persistencia de sesión
  it('Mantiene sesión activa al interactuar y recargar', () => {
    cy.contains('Listado de Empleados').should('exist');
    cy.reload();
    cy.url().should('include', '/Empleados');
    cy.contains('Listado de Empleados').should('exist');
  });

  // 6️⃣ Soporte para múltiples registros y paginación
  it('Tabla soporta múltiples registros y paginación', () => {
    cy.get('table tbody tr').should('have.length.at.least', 1);
    cy.get('nav[aria-label="pagination navigation"]').should('exist');
  });

  // 7️⃣ Búsqueda por Nombre y Correo
  it('Búsqueda por Nombre y Correo funciona', () => {
    const filtros = [
      { columna: 1, valor: 'Juan' }, // Nombre
      { columna: 2, valor: 'gmail' }, // Correo (ajustado a datos actuales)
    ];
    filtros.forEach(filtro => {
      cy.get('input[placeholder="Buscar empleado..."]').clear().type(filtro.valor);
      cy.wait(500); // Esperar a que se aplique el filtro
      cy.get('table tbody tr').should('have.length.gte', 1); // Al menos un resultado
      // Limpiar búsqueda para el siguiente filtro
      cy.get('input[placeholder="Buscar empleado..."]').clear();
    });
  });

  // 8️⃣ Validación de integridad de datos (formatos y consistencia)
  it('Valida formatos y consistencia de datos en la tabla', () => {
    cy.get('table tbody tr').each(row => {
      // Validar nombre no vacío
      cy.wrap(row).find('td').eq(0).invoke('text').should('not.be.empty');
      
      // Validar correo electrónico (básico: contiene @ y .)
      cy.wrap(row).find('td').eq(1).invoke('text').then(email => {
        expect(email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
      
      // Validar teléfono (puede ser vacío o numérico)
      cy.wrap(row).find('td').eq(2).invoke('text').then(tel => {
        if (tel.trim() !== '—') {
          expect(tel).to.match(/^\+?\d{1,3}?[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/);
        }
      });
      
      // Validar fecha (formato DD/MM/YYYY)
      cy.wrap(row).find('td').eq(3).invoke('text').should('match', /^\d{1,2}\/\d{1,2}\/\d{4}$/);
      
      // Validar estado (switch existe y está checked o no)
      cy.wrap(row).find('input[type="checkbox"]').should('exist');
    });
  });

  // 9️⃣ Validación singular de empleado (usando editar para ver detalles)
  it('Valida carga singular de datos de un empleado', () => {
    // Click en el primer botón de editar
    cy.get('table tbody tr:first').find('button[aria-label="Editar"]').click({ force: true });
    
    // Verificar que el modal se abra
    cy.get('.MuiDialog-paper')
      .should('be.visible')
      .and('contain', 'Editar Empleado');
    
    // Esperar a que los campos sean interactivos
    cy.wait(500);
    
    // Verificar campos usando etiquetas asociadas en lugar de IDs dinámicos
    cy.contains('label', 'Salario Base')
      .parent()
      .find('input')
      .should('have.value', '1500');
    
    cy.contains('label', 'Moneda')
      .parent()
      .find('input')
      .should('have.value', 'GTQ');
    
    // Cerrar modal
    cy.contains('button', 'Cancelar').click();
    
    // Verificar que regrese a la tabla
    cy.get('table').should('be.visible');
  });

  // 🔟 Verificación de logs o estados de proceso (simulado vía elementos de UI)
  it('Valida registro de logs o estados de proceso', () => {
    // Simular recarga para verificar estados post-proceso
    cy.reload();
    
    // Verificar que no hay errores visibles
    cy.get('.toast-error, .alert-error').should('not.exist');
    
    // Verificar conteo de registros
    cy.get('table tbody tr').its('length').should('be.gte', 5);
  });
});
