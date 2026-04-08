beforeEach(() => {
  
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: { success: true, token: 'mock-token', user: { id: 1, email: 'user@example.com', role: 'mesero' } }
  }).as('login')

  
  cy.intercept('POST', '/api/auth/register', {
    statusCode: 201,
    body: { success: true, user: { id: 1 } }
  })

  
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: { id: 1, email: 'user@example.com', role: 'mesero' }
  })

  
  cy.intercept('POST', '/api/auth/logout', { statusCode: 200, body: { success: true } })

  
  cy.intercept('GET', '/api/menu', { statusCode: 200, body: [] })

  
  cy.intercept('GET', '/api/orders*', { statusCode: 200, body: [] })
  cy.intercept('POST', '/api/orders', { statusCode: 201, body: { success: true, orderId: 1 } })
})
