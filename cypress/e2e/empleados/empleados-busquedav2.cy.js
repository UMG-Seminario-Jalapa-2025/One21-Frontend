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
    cy.visit('https://dev.one21.app/login');

    // 2) Ingresar el correo electrónico
    cy.get('input[placeholder="Ingresa tu correo electronico"]')
      .should('be.visible')
      .type('test@test.com'); // Cambia por un correo válido

    // 3) Ingresar la contraseña
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('Sincal200'); // Cambia por una contraseña válida

    // 4) Hacer clic en el botón Login
    cy.contains('button', 'Login').click();

    // 5) Verificar que se redirige a la pantalla principal 
    cy.url().should('include', '/home');
  
    // 6) Navegar directamente a la sección de Empleados
    cy.visit('https://dev.one21.app/Empleados');
  });

  it.only('Debe filtrar resultados dinámicamente mientras el usuario escribe', () => {
    // Escribir en el campo de búsqueda
    cy.get('input.w-full.outline-none.text-sm')
      .type('John')
      .should('have.value', 'John');
    cy.get('table.w-full.text-sm tbody tr').should('have.length', 1);
  });

  it('Debe aceptar texto parcial o completo', () => {
    // Esperar a que el campo de búsqueda esté completamente cargado y visible
    cy.get('input.w-full.outline-none.text-sm', { timeout: 10000 })
      .type('john@example.com'); // Verifica que el valor ingresado sea correcto
    cy.get('table.w-full.text-sm tbody tr').should('have.length', 1);
  });

  it('Debe buscar en las columnas Nombre, Correo electrónico y Teléfono', () => {
    // Buscar por nombre
    cy.get('input.w-full.outline-none.text-sm')
      .type('Jane Smith')
      .should('have.value', 'Jane Smith');
    cy.get('table tbody tr').should('have.length', 1);
    cy.contains('table tbody tr', 'Jane Smith').should('be.visible');

    // Buscar por correo electrónico
    cy.get('input[placeholder="Buscar..."]')
      .clear()
      .type('carlos@empresa.com')
      .should('have.value', 'carlos@empresa.com');
    cy.get('table tbody tr').should('have.length', 1);
    cy.contains('td', 'Carlos Pérez').should('be.visible');

    // Buscar por teléfono
    cy.get('input[placeholder="Buscar..."]')
      .clear()
      .type('123-456-7890')
      .should('have.value', '123-456-7890');
    cy.get('table tbody tr').should('have.length', 1);
    cy.contains('td', 'John Doe').should('be.visible');
  });

  it('Debe mostrar la tabla vacía cuando no hay resultados', () => {
    // Limpiar el campo de búsqueda y escribir un valor que no exista
    cy.get('input.w-full.outline-none.text-sm')
      .clear()
      .type('NoExiste')
      .should('have.value', 'NoExiste');
  
    // Verificar que la tabla no tenga filas
    cy.get('table tbody tr').should('have.length', 1);
  
    // Opcional: Verificar que se muestre un mensaje indicando que no hay resultados
    cy.contains('td', 'No hay empleados para mostrar.').should('be.visible');
  });

  it('Debe escribir en la barra de búsqueda, borrar y mostrar las opciones originales', () => {
    // Verificar el número inicial de filas en la tabla
    cy.get('table tbody tr').then(($rows) => {
      const initialRowCount = $rows.length;
  
      // Escribir en la barra de búsqueda
      cy.get('input[placeholder="Buscar..."]')
        .clear()
        .type('John')
        .should('have.value', 'John');
  
      // Verificar que se filtren los resultados
      cy.get('table tbody tr').should('have.length', 1);
      cy.contains('td', 'John Doe').should('be.visible');
  
      // Borrar el texto de la barra de búsqueda
      cy.get('input.w-full.outline-none.text-sm')
        .clear()
        .should('have.value', '');
  
      // Verificar que se muestren las opciones originales
      cy.get('table tbody tr').should('have.length', initialRowCount);
    });
  });

  it('Debe cambiar entre las opciones de mostrar entradas', () => {
    // Seleccionar "Mostrar 5 entradas"
    cy.get('select.border.border-gray-300.rounded-md.px-2.py-1')
      .select('5') // Selecciona la opción con valor "5"
      .should('have.value', '5'); // Verifica que el valor seleccionado sea "5"
  
    // Verificar que se muestren 5 filas en la tabla
    cy.get('table tbody tr').should('have.length.at.most', 5);
  
    // Seleccionar "Mostrar 25 entradas"
    cy.get('select.border.border-gray-300.rounded-md.px-2.py-1')
      .select('25') // Selecciona la opción con valor "25"
      .should('have.value', '25'); // Verifica que el valor seleccionado sea "25"
  
    // Verificar que se muestren hasta 25 filas en la tabla
    cy.get('table tbody tr').should('have.length.at.most', 25);
  });

  it('Debe aplicar búsqueda y cambiar selector manteniendo el filtro', () => {
    // Aplicar búsqueda con el filtro 'j'
    cy.get('input[placeholder="Buscar..."]')
        .clear()
        .type('John')
        .should('have.value', 'John');
  
    // Verificar que el filtro se aplica y muestra las filas correspondientes
    cy.get('table tbody tr').should('have.length.at.most', 10);

    // Cambiar el selector de "Mostrar 10 entradas" a "Mostrar 5 entradas"
    cy.get('select.border.border-gray-300.rounded-md.px-2.py-1')
      .select('5')
      .should('have.value', '5');
  
    // Verificar que el filtro se mantiene y solo varía el número máximo de filas visibles
    cy.get('table tbody tr').should('have.length.at.most', 5);
    cy.contains('td', 'John Doe').should('be.visible');
  });

  it.only('Debe mostrar resultados aunque se escriba el nombre en mayúsculas', () => {
    // Escribir el nombre en mayúsculas
    cy.get('input[placeholder="Buscar..."]')
      .clear()
      .type('JOHN DO')
      .should('have.value', 'JOHN DO');
  
    // Verificar que se muestra el resultado correspondiente
    cy.get('table tbody tr').should('have.length', 1);
    cy.contains('td', 'John Doe').should('be.visible');
  });
});