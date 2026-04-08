Feature: HU-011 Logout
  Como usuario autenticado
  Quiero cerrar sesión
  Para salir del sistema y proteger mi cuenta

  Scenario: Logout exitoso
    Given que el usuario está autenticado
    When el usuario hace click en "Cerrar Sesión"
    Then el sistema elimina el token de autenticación
    And redirige a la página de login

  Scenario: Token expirado obliga logout
    Given que el usuario tiene una sesión activa
    When el token de autenticación expira
    Then el sistema cierra sesión automáticamente
    And redirige a la página de login

  Scenario: Logout desde múltiples pestañas
    Given que el usuario está autenticado
    When el usuario cierra la pestaña activa y mantiene otra
    Then se debe reflectar en todas las pestañas que la sesión está cerrada

  Scenario: Logout cuando la sesión ya expiró
    Given que el usuario tenía una sesión expirada
    When intenta hacer logout
    Then se debe redirigir a login y no fallar
