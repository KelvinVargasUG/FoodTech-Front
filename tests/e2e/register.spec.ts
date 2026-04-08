describe('Registro E2E', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Toggle a registro funciona', () => {
    cy.contains('Regístrate').click();
    cy.get('h1').should('contain', 'Registro');
  });

  it('Toggle a login desde registro', () => {
    cy.contains('Regístrate').click();
    cy.contains('Iniciar sesión').click();
    cy.get('h1').should('contain', 'Login');
  });

  it('Registro con password débil muestra error', () => {
    cy.contains('Regístrate').click();
    cy.get('#email').clear().type('test@example.com');
    cy.get('#username').clear().type('testuser');
    cy.get('#password').clear().type('123');
    cy.get('button[type="submit"]').click();
    cy.contains(/contraseña|mínimo|caracteres/i).should('exist');
  });
});
