/// <reference types="cypress" />

// Evitar que errores de React detengan Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Módulo Empleados - QA: Validación de carga de información', () => {

  // Ejecutar login antes de cada prueba y navegar al módulo Empleados
  beforeEach(() => {
    // 1) Ir a login
    cy.visit('https://dev.one21.app/login');

    // 2) Ingresar correo electrónico
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('test@test.com');

    // 3) Ingresar contraseña
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('Sincal200');

    // 4) Hacer login
    cy.contains('button', 'Login').click();

    // 5) Verificar redirección a home
    cy.url().should('include', '/home');

    // 6) Abrir menú lateral si está colapsado
    cy.get('i.tabler-menu-2')
      .should('exist')
      .click({ force: true });

    // Esperar a que el menú aparezca y entrar a Empleados
    cy.wait(300); // animación del menú
    cy.contains('a.ts-menu-button', 'Empleados')
      .should('be.visible')
      .click({ force: true });

    // Verificar que estamos en módulo Empleados
    cy.url().should('include', '/Empleados');
  });

  // 1️⃣ Menú lateral
  it('Menú lateral muestra opción Empleados', () => {
    cy.contains('a.ts-menu-button', 'Empleados')
      .should('be.visible');
  });

  // 2️⃣ Vista y botones
  it('Vista de Empleados se carga correctamente', () => {
    cy.contains('button', 'Agregar empleado').should('exist');
    cy.get('table').should('exist');
  });

  // 3️⃣ Columnas de la tabla
  it('Tabla muestra todas las columnas esperadas', () => {
    const columnas = ['Nombre', 'Correo Electrónico', 'Teléfono', 'Fecha', 'Estado', 'Acciones'];
    columnas.forEach(col => {
      cy.get('table thead').contains(col).should('exist');
    });
  });

  // 4️⃣ Acciones Editar y Eliminar en cada fila
  it('Cada fila tiene botones Editar y Eliminar', () => {
    cy.get('table tbody tr').each(row => {
      cy.wrap(row).find('button').contains(/Editar/i).should('exist');
      cy.wrap(row).find('button').contains(/Eliminar/i).should('exist');
    });
  });

  // 5️⃣ Persistencia de sesión
  it('Mantiene sesión activa al interactuar y recargar', () => {
    cy.contains('button', 'Agregar empleado').should('exist');
    cy.reload();
    cy.url().should('include', '/Empleados');
    cy.contains('button', 'Agregar empleado').should('exist');
  });

  // 6️⃣ Soporte para múltiples registros y paginación
  it('Tabla soporta múltiples registros y paginación', () => {
    cy.get('table tbody tr').should('have.length.at.least', 1);
    // Si hay paginación visible
    cy.get('select').then(select => {
      if (select.length > 0) {
        cy.wrap(select).select('10');
        cy.get('table tbody tr').should('have.length.lte', 10);
      }
    });
  });

  // 7️⃣ Búsqueda por Nombre, Correo y Teléfono
  it('Búsqueda por Nombre, Correo y Teléfono funciona', () => {
    const filtros = [
      { columna: 1, valor: 'John' },               // Nombre
      { columna: 2, valor: 'john@example.com' },  // Correo
      { columna: 3, valor: '555' }                // Teléfono (ejemplo)
    ];

    filtros.forEach(filtro => {
      cy.get('input[placeholder="Buscar..."]').clear().type(filtro.valor);
      cy.get('table tbody tr').each(row => {
        cy.wrap(row)
          .find('td')
          .eq(filtro.columna - 1) // columna correcta
          .invoke('text')
          .then(text => {
            expect(text.toLowerCase()).to.include(filtro.valor.toLowerCase());
          });
      });
    });
  });

});
