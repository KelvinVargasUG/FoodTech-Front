describe('Logout E2E', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Toggle a registro desde login', () => {
    cy.contains('Regístrate').click();
    cy.get('h1').should('contain', 'Registro');
  });
});
