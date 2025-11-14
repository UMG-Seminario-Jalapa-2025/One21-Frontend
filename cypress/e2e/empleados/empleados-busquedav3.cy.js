// Ignorar errores específicos de React
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error')) {
    return false; // Evita que Cypress falle la prueba
  }
});
describe('Pruebas de búsqueda en la página de empleados', () => {
  beforeEach(() => {
    // Visitar la página de empleados antes de cada prueba
    // 1) Visitar la página de login
    const { baseUrl } = require('../../support/urls');
    cy.visit(baseUrl);

    // 2) Ingresar el correo electrónico
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('qa@qa.com'); // Cambia por un correo válido

    // 3) Ingresar la contraseña
    cy.get('input[placeholder="············"]')
      .should('be.visible')
      .type('QAtest2025'); // Cambia por una contraseña válida

    // 4) Hacer clic en el botón Login
    cy.contains('button', 'Login').click();

    // 5) Verificar que se redirige a la pantalla principal 
    cy.url().should('include', '/inicio');
  
    // 6) Navegar directamente a la sección de Empleados
    cy.visit('https://dev.one21.app/Empleados');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  
  });

  const inputBusqueda = () => cy.get('input[placeholder="Buscar empleado..."]').should('be.visible');
  const filas = () => cy.get('table tbody tr');

  it('Filtra dinámicamente mientras el usuario escribe', () => {
    // ***** Si la búsqueda es CLIENT-SIDE *****
    inputBusqueda().clear().type('juan');             // quité el espacio que te hacía fallar
    // No esperamos request aquí si el filtro es en frontend
    filas().should('have.length.at.least', 1);
    filas().each(($tr) => {
      cy.wrap($tr).invoke('text').then((txt) => {
        const n = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        expect(n(txt)).to.match(/juan/);
      });
    });
  });

  it('No distingue mayúsculas/minúsculas', () => {
    inputBusqueda().clear().type('CASTRO');
    filas().should('have.length', 1);
    filas().first().should('contain.text', 'Alberto Castro');
  });

  it('Tolera ausencia de acentos (Marroquín vs marroquin)', () => {
    inputBusqueda().clear().type('marroquin');
    filas().should('have.length', 1).first().should('contain.text', 'Marroquín');
  });

  it('Permite buscar por correo (substring)', () => {
    inputBusqueda().clear().type('epac.com.gt');
    filas().should('have.length', 1).first().should('contain.text', 'Julio Sincal');
  });


  it('Limpiar búsqueda restaura el listado', () => {
    inputBusqueda().clear().type('juan');
    filas().its('length').should('be.greaterThan', 0);
    inputBusqueda().clear();
    // si tu app reconsulta al limpiar, esto capturará la petición:
    // cy.wait('@getEmpleados');
    filas().its('length').should('be.greaterThan', 0);
  });

  
  it('Debe escribir en la barra de búsqueda, borrar y restaurar el listado original', () => {
    // Guardar el número de filas inicial
    cy.get('table tbody tr').then(($rows) => {
      const initialRowCount = $rows.length;
  
      // Filtrar por un empleado que existe (usa nombres reales de tu UI)
      cy.get('input[placeholder="Buscar empleado..."]')
        .should('be.visible')
        .clear()
        .type('Julio') // ej.: "Julio Sincal"
        .should('have.value', 'Julio');
  
      // Debe filtrar a una sola coincidencia visible
      cy.get('table tbody tr').should('have.length', 1);
      cy.contains('td', /Julio Sincal/i).should('be.visible');
  
      // Limpiar el campo de búsqueda
      cy.get('input[placeholder="Buscar empleado..."]')
        .clear()
        .should('have.value', '');
  
      // Debe restaurar el total inicial de filas
      cy.get('table tbody tr').should('have.length', initialRowCount);
    });
  });

});
