describe('Login E2E', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Demo mode funciona', () => {
    cy.get('#demoMode').check();
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/mesero');
  });

  it('Login con password demasiado corto muestra error', () => {
    cy.get('#email').clear().type('user@example.com');
    cy.get('#password').clear().type('123');
    cy.get('button[type="submit"]').click();
    cy.contains(/contraseña|mínimo|caracteres/i).should('exist');
  });

  it('Toggle a registro funciona', () => {
    cy.contains('Regístrate').click();
    cy.get('h1').should('contain', 'Registro');
  });
  
});
