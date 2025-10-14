describe('Módulo Empleados - QA Completo', () => {
  beforeEach(() => {
    // LOGIN
    cy.visit('https://dev.one21.app/login');
    cy.get('input[placeholder="Ingresa tu correo electronico"]').type('test@test.com');
    cy.get('input[type="password"]').type('Sincal200');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/home');

    // NAVEGAR A EMPLEADOS
    cy.contains('span', 'Empleados').click({ force: true });
    cy.url().should('include', '/Empleados');
  });

  // 1️⃣ Carga del módulo
  it('Debe mostrar correctamente la lista de empleados y acciones', () => {
    cy.contains(/Agregar empleado|Nuevo empleado/).should('be.visible');
    cy.get('table').should('exist');
    cy.get('table thead').within(() => {
      cy.contains('th', 'Nombre').should('exist');
      cy.contains('th', 'Correo Electrónico').should('exist');
      cy.contains('th', 'Teléfono').should('exist');
      cy.contains('th', 'Fecha').should('exist');
      cy.contains('th', 'Estado').should('exist');
      cy.contains('th', 'Acciones').should('exist');
    });
    cy.get('table tbody tr').first().within(() => {
      cy.contains(/Editar|Edit/).should('exist');
      cy.contains(/Eliminar|Delete/).should('exist');
    });
  });

  // 2️⃣ Creación correcta
  it('Debe crear un nuevo empleado correctamente', () => {
    const ts = Date.now();
    const employee = {
      nombre: `QA Test ${ts}`,
      puesto: 'Analista QA',
      correo: `qa+${ts}@example.com`,
      telefono: '12345678'
    };
    cy.contains(/Agregar empleado|Nuevo empleado/).click();
    cy.get('input[placeholder="John Doe"]').type(employee.nombre);
    cy.get('input[placeholder="john@example.com"]').type(employee.correo);
    cy.get('input[placeholder="123-456-7890"]').type(employee.telefono);
    cy.get('input[type="date"]').type('2025-09-13');
    cy.contains(/Guardar|Crear/).click();
    cy.get('table').contains('td', employee.correo, { timeout: 10000 }).should('exist');
  });

  // 3️⃣ Campos obligatorios vacíos
  const camposVacios = [
    { placeholder: 'John Doe', nombre: 'Nombre', mensaje: 'Requerido' },
    { placeholder: 'john@example.com', nombre: 'Correo', mensaje: 'Correo inválido' },
    { placeholder: '123-456-7890', nombre: 'Teléfono', mensaje: 'Requerido' }
  ];

  camposVacios.forEach((campo) => {
    it(`Debe mostrar error si ${campo.nombre} está vacío`, () => {
      cy.contains(/Agregar empleado|Nuevo empleado/).click();
      camposVacios.forEach((c) => {
        if (c.placeholder !== campo.placeholder) {
          if (c.placeholder === 'John Doe') cy.get(`input[placeholder="${c.placeholder}"]`).type('QA Test');
          if (c.placeholder === 'john@example.com') cy.get(`input[placeholder="${c.placeholder}"]`).type('qa@test.com');
          if (c.placeholder === '123-456-7890') cy.get(`input[placeholder="${c.placeholder}"]`).type('12345678');
        }
      });
      cy.contains(/Guardar|Crear/).click();
      cy.get('p.text-red-600').should('contain.text', campo.mensaje);
      cy.get('table').should('not.contain', 'QA Test');
    });
  });

  // 4️⃣ Formato incorrecto - SOLO CORREO
  it('Debe mostrar error si el correo tiene formato incorrecto', () => {
    cy.contains(/Agregar empleado|Nuevo empleado/).click();
    cy.get('input[placeholder="John Doe"]').type('QA Test');
    cy.get('input[placeholder="john@example.com"]').type('asñlkjf');
    cy.get('input[placeholder="123-456-7890"]').type('12345678');
    cy.get('input[type="date"]').type('2025-09-13');
    cy.contains(/Guardar|Crear/).click();
    cy.get('p.text-red-600').should('contain.text', 'Correo inválido');
    cy.get('table').should('not.contain', 'QA Test');
  });
});
