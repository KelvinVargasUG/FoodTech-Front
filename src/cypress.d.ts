declare namespace Cypress {
  interface Chainable {
    mockApiCalls(): Chainable<void>
  }
}
