# Testing Strategy - FoodTech

---

# PARTE 1: TEORÍA

## 1.1 TDD (Red - Green - Refactor)

**¿Qué es TDD?**
Desarrollo dirigido por pruebas: escribimos el test primero (RED), luego el código mínimo para pasar (GREEN), luego refactorizamos.

| Fase | Qué hacemos | Resultado |
|------|-------------|-----------|
| **RED** | Escribimos el test antes del código | Test falla |
| **GREEN** | Escribimos código mínimo para pasar | Test pasa |
| **REFACTOR** | Mejoramos código sin romper tests | Tests siguen pasando |

**Ejemplo:**
1. RED: Escribo test "login exitoso debe guardar token" → falla (no existe código)
2. GREEN: Escribo código mínimo para guardar token → test pasa
3. REFACTOR: Mejoro el código manteniendo funcionalidad

---

## 1.2 ¿Qué es Verificar?

- **Fase TDD:** GREEN - nos dice que el código funciona
- **Pregunta:** ¿El código funciona correctamente?
- **Ejemplos:** ¿La función retorna el valor esperado? ¿El endpoint se llama bien?

---

## 1.3 ¿Qué es Validar?

- **Fase RED (al inicio) + GREEN:** Protegemos el negocio
- **Pregunta:** ¿El negocio está protegido?
- **Ejemplos:** ¿Token expirado = sin acceso? ¿Credenciales wrong = no crea sesión?

---

## 1.4 ¿Qué es QA vs Testing?

| Concepto | Descripción |
|----------|-------------|
| **Testing** | Ejecutar scripts para verificar que el código funciona. Pregunta: "¿pasa o falla?" |
| **QA (Quality Assurance)** | Estrategia integral para garantizar calidad. Pregunta: "¿qué protegemos?" |

---

## 1.5 Workflow TDD (Basado en ai.workflow.md)

**¿Cómo trabajamos?**
Cada feature sigue un proceso estructurado:

| Paso | Fase | Acción | Herramienta | Resultado |
|------|------|--------|-------------|-----------|
| 1 | - | Load Context | glob, read files | Estructura del proyecto |
| 2 | - | Analyze Requirements | read tests, models, services | Entender la HU |
| 3 | **RED** | Write Tests First | write test file | Tests fallan ✗ |
| 4 | **RED** | Run Tests Verify | npm test -- --run | Verificar fallan ✗ |
| 5 | **GREEN** | Implement Feature | write implementation | Código mínimo |
| 6 | **GREEN** | Run Tests Verify | npm test -- --run | Tests pasan ✓ |
| 7 | **REFACTOR** | Improve Code | edit code | Código mejor |
| 8 | - | Final Verification | lint, typecheck, test | Todo pasa ✓ |

### Flujo TDD Resumido

```
1. Write Test → FAIL (red) ✗
2. Implement Code → PASS (green) ✓
3. Refactor → PASS (green) ✓
4. Lint + Typecheck → ✓
```

### Relación con Historias de Usuario

Cada HU sigue este workflow:

```
HU → Analyze Requirements → RED (tests) → GREEN (código) → Refactor → Historial.md
```

**Ejemplo (Registro de Usuario):**
1. Leer HU-FRONT-002
2. Escribir tests de registro (RED) → 5 tests
3. Implementar authService.register (GREEN)
4. Escribir tests de useAuth.register (RED)
5. Implementar useAuth.register (GREEN)
6. Actualizar LoginView toggle
7. Actualizar HISTORIAL.md con commits

---

# PARTE 2: AUTH SERVICE (Tests 01-15)

## 2.1 Tests que Verifican (GREEN)

### Test 01: 01-auth-login-exitoso.test.ts

**TDD:** GREEN - Primero escribimos el test, luego el código

**Qué hace:**
Este test verifica que cuando un usuario hace login con credenciales correctas, el sistema retorna true y guarda el token en localStorage.

**Código:**
```typescript
it('debe hacer login exitoso y guardar token en localStorage', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'fake-jwt-token-12345' })
  })
  const { authService } = await import('../../services/authService')
  const result = await authService.login('test@restaurant.com', 'password123')
  expect(result).toBe(true)
  expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token-12345')
})
```

---

### Test 04: 04-auth-login-remember-false.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que cuando el usuario NO marca "recordarme", el token se guarda sin fecha de expiración.

**Mocks:**
- `global.fetch` - Simula respuesta exitosa

**Código:**
```typescript
it('debe guardar token sin expiración cuando rememberMe es false', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'fake-jwt-token-12345' })
  })
  const { authService } = await import('../../services/authService')
  await authService.login('test@restaurant.com', 'password123', false)
  expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token-12345')
  expect(localStorage.getItem('auth_token_expiry')).toBeNull()
})
```

---

### Test 05: 05-auth-login-remember-true.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que cuando el usuario marca "recordarme", el token se guarda CON fecha de expiración.

**Mocks:**
- `global.fetch` - Simula respuesta exitosa

**Código:**
```typescript
it('debe guardar token con expiración cuando rememberMe es true', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'fake-jwt-token-remember' })
  })
  const { authService } = await import('../../services/authService')
  await authService.login('test@restaurant.com', 'password123', true)
  expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token-remember')
  expect(localStorage.getItem('auth_token_expiry')).not.toBeNull()
})
```

---

### Test 06: 06-auth-logout-token.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que la función logout() remueve completamente el token de localStorage.

**Código:**
```typescript
it('debe remover token de localStorage', async () => {
  localStorage.setItem('auth_token', 'some-token')
  const { authService } = await import('../../services/authService')
  authService.logout()
  expect(localStorage.getItem('auth_token')).toBeNull()
})
```

---

### Test 07: 07-auth-getToken.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que getToken() retorna exactamente el token guardado en localStorage.

**Código:**
```typescript
it('debe retornar el token guardado', async () => {
  localStorage.setItem('auth_token', 'mi-token-guardado')
  const { authService } = await import('../../services/authService')
  expect(authService.getToken()).toBe('mi-token-guardado')
})
```

---

### Test 09: 09-auth-isAuthenticated-true.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que con token válido, isAuthenticated() retorna true.

**Código:**
```typescript
it('debe retornar true cuando hay token válido', async () => {
  localStorage.setItem('auth_token', 'valid-token')
  const { authService } = await import('../../services/authService')
  expect(authService.isAuthenticated()).toBe(true)
})
```

---

### Test 12: 12-auth-register-exitoso.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que el registro retorna true cuando el servidor responde exitosamente.

**Mocks:**
- `global.fetch` - Simula respuesta exitosa

**Código:**
```typescript
it('debe hacer registro exitoso', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ message: 'Usuario registrado' })
  })
  const { authService } = await import('../../services/authService')
  const result = await authService.register('test@email.com', 'newuser', 'password123')
  expect(result).toBe(true)
})
```

---

### Test 15: 15-auth-register-request.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que el registro llama al endpoint correcto '/auth/register' con método POST y datos correctos.

**Mocks:**
- `global.fetch` - Captura la llamada

**Código:**
```typescript
it('debe hacer request con los datos correctos al endpoint register', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ message: 'ok' })
  })
  global.fetch = mockFetch
  const { authService } = await import('../../services/authService')
  await authService.register('test@email.com', 'testuser', 'testpass')
  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining('/auth/register'),
    expect.objectContaining({ method: 'POST' })
  )
})
```

---

### Test 05: 05-auth-login-remember-true.test.ts

**Qué hace:**
Verifica que cuando el usuario marca "recordarme", el token se guarda CON fecha de expiración.


---

### Test 06: 06-auth-logout-token.test.ts

**Qué hace:**
Verifica que la función logout() remueve completamente el token de localStorage.


---

### Test 07: 07-auth-getToken.test.ts

**Qué hace:**
Verifica que getToken() retorna exactamente el token guardado en localStorage.


---

### Test 09: 09-auth-isAuthenticated-true.test.ts

**Qué hace:**
Verifica que con token válido, isAuthenticated() retorna true.


---

### Test 12: 12-auth-register-exitoso.test.ts

**Qué hace:**
Verifica que el registro retorna true cuando el servidor responde exitosamente.

---

### Test 15: 15-auth-register-request.test.ts

**Qué hace:**
Verifica que el registro llama al endpoint correcto '/auth/register' con método POST y datos correctos.


---

## 2.2 Tests que Validan (RED → GREEN)

### Test 02: 02-auth-login-invalidas.test.ts

**TDD:** RED → GREEN - Primero escribimos el test de validación

**Qué hace:**
Valida que credenciales inválidas (email/password wrong) lanzan error "Credenciales inválidas".

**Código:**
```typescript
it('debe lanzar error cuando credenciales son inválidas', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 401
  })
  const { authService } = await import('../../services/authService')
  await expect(
    authService.login('wrong@email.com', 'wrongpass')
  ).rejects.toThrow('Credenciales inválidas')
})
```

**Mocks:**
- `global.fetch` - Simula respuesta 401 (no autorizado)


---

### Test 03: 03-auth-login-error-red.test.ts

**Qué hace:**
Valida que error de red lanza "Error de conexión".


---

### Test 08: 08-auth-getToken-null.test.ts

**Qué hace:**
Valida que sin token, getToken() retorna null.


---

### Test 10: 10-auth-isAuthenticated-false.test.ts

**Qué hace:**
Valida que sin token, isAuthenticated() retorna false.


---

### Test 11: 11-auth-isAuthenticated-expirado.test.ts ⭐

**TDD:** RED → GREEN - Test de validación CRÍTICO

**Qué hace:**
Valida que token expirado (fecha pasada) retorna false. Es como "saldo negativo" en seguridad.

**Código:**
```typescript
it('debe retornar false cuando el token está expirado', async () => {
  const expiredDate = Date.now() - 1000
  localStorage.setItem('auth_token', 'expired-token')
  localStorage.setItem('auth_token_expiry', expiredDate.toString())
  const { authService } = await import('../../services/authService')
  expect(authService.isAuthenticated()).toBe(false)
})
```

**Mocks:**
- Ninguno - usa localStorage real


---

### Test 13: 13-auth-register-error.test.ts

**TDD:** RED → GREEN

**Qué hace:**
Valida que error 400 en registro se maneja.

**Mocks:**
- `global.fetch` - Simula respuesta 400

**Código:**
```typescript
it('debe manejar error cuando el servidor devuelve error 400', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 400
  })
  const { authService } = await import('../../services/authService')
  const result = await authService.register('test@email.com', 'existinguser', 'password123')
  expect(result).toBe(true)
})
```

---

### Test 14: 14-auth-register-error-red.test.ts

**TDD:** RED → GREEN

**Qué hace:**
Valida que error de red en registro lanza "Error de conexión".

**Mocks:**
- `global.fetch` - Simula error de red

**Código:**
```typescript
it('debe lanzar error cuando hay error de red en register', async () => {
  global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  const { authService } = await import('../../services/authService')
  await expect(authService.register('test@email.com', 'testuser', 'password')).rejects.toThrow('Error de conexión')
})
```

---

### Test 16: 16-useAuth-inicial.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que el hook useAuth inicia con isAuthenticated=false, token=null, isLoading=false.

**Mocks:**
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe iniciar con isAuthenticated false cuando no hay token', () => {
  const { result } = renderHook(() => useAuth())
  expect(result.current.isAuthenticated).toBe(false)
  expect(result.current.token).toBeNull()
  expect(result.current.isLoading).toBe(false)
})
```

---

### Test 17: 17-useAuth-inicial-token.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que el hook detecta token existente al iniciar y restaura sesión.

**Mocks:**
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe iniciar con isAuthenticated true cuando hay token', () => {
  localStorage.setItem('auth_token', 'existing-token')
  const { result } = renderHook(() => useAuth())
  expect(result.current.isAuthenticated).toBe(true)
  expect(result.current.token).toBe('existing-token')
})
```

---

### Test 20: 20-useAuth-login-loading.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que el estado isLoading cambia durante login.

**Mocks:**
- `global.fetch` - Simula respuesta
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe manejar estado de loading durante login', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'token' })
  })
  const { result } = renderHook(() => useAuth())
  expect(result.current.isLoading).toBe(false)
  await act(async () => {
    await result.current.login('test@email.com', 'password')
  })
  expect(result.current.isLoading).toBe(false)
  expect(result.current.isAuthenticated).toBe(true)
})
```

### Test 21: 21-useAuth-logout.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que logout limpia estado interno y localStorage.

**Mocks:**
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe hacer logout correctamente Y limpiar sesión', () => {
  localStorage.setItem('auth_token', 'token-to-remove')
  
  const { result } = renderHook(() => useAuth())
  
  act(() => {
    result.current.logout()
  })

  expect(result.current.isAuthenticated).toBe(false)
  expect(result.current.token).toBeNull()
  expect(localStorage.getItem('auth_token')).toBeNull()
})
```

---

### Test 22: 22-useAuth-register.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica que el hook puede hacer registro.

**Mocks:**
- `global.fetch` - Simula respuesta exitosa
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe hacer registro exitosamente', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ message: 'Usuario registrado' })
  })

  const { result } = renderHook(() => useAuth())

  await act(async () => {
    await result.current.register('test@email.com', 'newuser', 'password123')
  })

  expect(result.current.error).toBeNull()
})
```

---

### Test 24: 24-useAuth-register-loading.test.ts

**TDD:** GREEN

**Qué hace:**
Verifica estado loading durante registro.

**Mocks:**
- `global.fetch` - Simula respuesta
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe manejar estado de loading durante registro', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ message: 'ok' })
  })

  const { result } = renderHook(() => useAuth())

  expect(result.current.isLoading).toBe(false)

  await act(async () => {
    await result.current.register('test@email.com', 'testuser', 'password')
  })

  expect(result.current.isLoading).toBe(false)
})
```

---

## 3.2 Tests que Validan (RED → GREEN)

### Test 19: 19-useAuth-login-error.test.ts ⭐

**TDD:** RED → GREEN - Test de validación CRÍTICO

**Qué hace:**
Valida que error de login NO crea sesión: isAuthenticated=false, error="Credenciales inválidas", token=null, NO guarda en localStorage.

**Mocks:**
- `global.fetch` - Simula 401
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe manejar error de login SIN crear sesión', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 401
  })
  const { result } = renderHook(() => useAuth())
  await act(async () => {
    await result.current.login('wrong@email.com', 'wrongpass')
  })
  expect(result.current.isAuthenticated).toBe(false)
  expect(result.current.error).toBe('Credenciales inválidas')
  expect(result.current.token).toBeNull()
  expect(localStorage.getItem('auth_token')).toBeNull()
})
```

---

### Test 23: 23-useAuth-register-error.test.ts

**TDD:** RED → GREEN

**Qué hace:**
Valida que error de red en registro se maneja correctamente.

**Mocks:**
- `global.fetch` - Simula error de red
- `react-router-dom` - Mock de useNavigate

**Código:**
```typescript
it('debe manejar error de red durante registro', async () => {
  global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  const { result } = renderHook(() => useAuth())
  await act(async () => {
    await result.current.register('test@email.com', 'existinguser', 'password123')
  })
  expect(result.current.isAuthenticated).toBe(false)
  expect(result.current.error).not.toBeNull()
  expect(result.current.token).toBeNull()
})
```

# PARTE 4: LOGIN VIEW (Tests 25-41)

## 4.1 Tests que Verifican (GREEN) - UI/Formulario

### Test 25: 25-LoginView-formulario.test.tsx

**Qué hace:**
Verifica que el formulario renderiza y existe el botón "Iniciar sesión".

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe renderizar el formulario de login', () => {
  renderWithRouter(<LoginView />)
  expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument()
})
```

---

### Test 26: 26-LoginView-titulo.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que el título "FoodTech Login" aparece.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe mostrar el título de FoodTech Login', () => {
  renderWithRouter(<LoginView />)
  expect(screen.getByText('FoodTech Login')).toBeInTheDocument()
})
```

---

### Test 27: 27-LoginView-enlace.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que existe el botón para cambiar a modo registro.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe mostrar el enlace para registrarse', () => {
  renderWithRouter(<LoginView />)
  expect(screen.getByRole('button', { name: /Regístrate/i })).toBeInTheDocument()
})
```

---

### Test 28: 28-LoginView-modo-registro.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que al hacer click en "Regístrate", cambia a modo registro con título "FoodTech Registro".

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe cambiar a modo registro al hacer click en el toggle', () => {
  renderWithRouter(<LoginView />)
  const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
  fireEvent.click(toggleButton)
  expect(screen.getByText('FoodTech Registro')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument()
})
```

---

### Test 29: 29-LoginView-volver-login.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que desde modo registro se puede volver a modo login.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe volver a modo login al hacer click en toggle desde registro', () => {
  renderWithRouter(<LoginView />)
  const toggleToRegister = screen.getByRole('button', { name: /Regístrate/i })
  fireEvent.click(toggleToRegister)
  const toggleToLogin = screen.getByRole('button', { name: /Iniciar sesión/i })
  fireEvent.click(toggleToLogin)
  expect(screen.getByText('FoodTech Login')).toBeInTheDocument()
})
```

---

### Test 30: 30-LoginView-limpiar-campos.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que al cambiar de modo, los campos se limpian.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe limpiar campos al cambiar de modo', () => {
  renderWithRouter(<LoginView />)
  const emailInput = document.querySelector('input[id="email"]') as HTMLInputElement
  fireEvent.change(emailInput, { target: { value: 'test@email.com' } })
  const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
  fireEvent.click(toggleButton)
  expect(emailInput.value).toBe('')
})
```

---

### Test 31: 31-LoginView-email.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que el campo email acepta texto.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe actualizar el email al escribir', () => {
  renderWithRouter(<LoginView />)
  const emailInput = document.querySelector('input[id="email"]') as HTMLInputElement
  fireEvent.change(emailInput, { target: { value: 'test@email.com' } })
  expect(emailInput.value).toBe('test@email.com')
})
```

---

### Test 32: 32-LoginView-password.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que el campo password acepta texto.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe actualizar la contraseña al escribir', () => {
  renderWithRouter(<LoginView />)
  const passwordInput = document.querySelector('input[id="password"]') as HTMLInputElement
  fireEvent.change(passwordInput, { target: { value: 'password123' } })
  expect(passwordInput.value).toBe('password123')
})
```

---

### Test 33: 33-LoginView-username.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que en modo registro aparece el campo username.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe mostrar username en modo registro', () => {
  renderWithRouter(<LoginView />)
  const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
  fireEvent.click(toggleButton)
  expect(document.querySelector('input[id="username"]')).toBeInTheDocument()
})
```

---

### Test 34: 34-LoginView-submit-login.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que al hacer submit en login, se llama a login del hook con email, password, rememberMe.

**Mocks:**
- `useAuth` - Mock con login controlable

**Código:**
```typescript
it('debe llamar login al hacer submit en modo login', async () => {
  mockLogin.mockResolvedValue(undefined)
  renderWithRouter(<LoginView />)
  const emailInput = document.querySelector('input[id="email"]') as HTMLInputElement
  fireEvent.change(emailInput, { target: { value: 'test@email.com' } })
  const passwordInput = document.querySelector('input[id="password"]') as HTMLInputElement
  fireEvent.change(passwordInput, { target: { value: 'password123' } })
  const form = document.querySelector('form') as HTMLFormElement
  fireEvent.submit(form)
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('test@email.com', 'password123', false)
  })
})
```

### Test 35: 35-LoginView-rememberme.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que cuando el checkbox rememberMe está marcado, se pasa true al hook.

**Mocks:**
- `useAuth` - Mock con login controlable

**Código:**
```typescript
it('debe llamar login con rememberMe al hacer submit con checkbox marcado', async () => {
  mockLogin.mockResolvedValue(undefined)
  renderWithRouter(<LoginView />)
  const rememberMeCheckbox = document.querySelector('input[id="rememberMe"]') as HTMLInputElement
  fireEvent.click(rememberMeCheckbox)
  const passwordInput = document.querySelector('input[id="password"]') as HTMLInputElement
  fireEvent.change(passwordInput, { target: { value: 'password123' } })
  const form = document.querySelector('form') as HTMLFormElement
  fireEvent.submit(form)
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('', 'password123', true)
  })
})
```

---

### Test 36: 36-LoginView-submit-register.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que en modo registro, el submit llama a register con email, username, password.

**Mocks:**
- `useAuth` - Mock con register controlable

**Código:**
```typescript
it('debe llamar register al hacer submit en modo registro', async () => {
  mockRegister.mockResolvedValue(undefined)
  renderWithRouter(<LoginView />)
  const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
  fireEvent.click(toggleButton)
  const emailInput = document.querySelector('input[id="email"]') as HTMLInputElement
  fireEvent.change(emailInput, { target: { value: 'test@email.com' } })
  const usernameInput = document.querySelector('input[id="username"]') as HTMLInputElement
  fireEvent.change(usernameInput, { target: { value: 'testuser' } })
  const passwordInput = document.querySelector('input[id="password"]') as HTMLInputElement
  fireEvent.change(passwordInput, { target: { value: 'password123' } })
  const form = document.querySelector('form') as HTMLFormElement
  fireEvent.submit(form)
  await waitFor(() => {
    expect(mockRegister).toHaveBeenCalledWith('test@email.com', 'testuser', 'password123')
  })
})
```

---

### Test 37: 37-LoginView-demo.test.tsx

**TDD:** RED → GREEN

**Qué hace:**
Valida que el modo demo (entrar sin cuenta) funciona correctamente guardando un token especial.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe usar demo token al hacer submit en modo demo', async () => {
  renderWithRouter(<LoginView />)
  const demoCheckbox = document.querySelector('input[id="demoMode"]') as HTMLInputElement
  fireEvent.click(demoCheckbox)
  const form = document.querySelector('form') as HTMLFormElement
  fireEvent.submit(form)
  await waitFor(() => {
    expect(localStorage.getItem('auth_token')).toBe('demo-token-12345')
  })
})
```

---

### Test 38: 38-LoginView-boton.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que el botón muestra "Iniciar sesión" cuando no está cargando.

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe mostrar Iniciar sesión cuando no está cargando', () => {
  renderWithRouter(<LoginView />)
  expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
})
```

---

### Test 39: 39-LoginView-registrarse.test.tsx

**TDD:** GREEN

**Qué hace:**
Verifica que en modo registro el botón dice "Registrarse".

**Mocks:**
- `useAuth` - Mock con valores por defecto

**Código:**
```typescript
it('debe mostrar Registrarse en modo registro', () => {
  renderWithRouter(<LoginView />)
  const toggleButton = screen.getByRole('button', { name: /Regístrate/i })
  fireEvent.click(toggleButton)
  expect(screen.getByText('Registrarse')).toBeInTheDocument()
})
```

---

### Test 40: 40-LoginView-error.test.tsx

**TDD:** RED → GREEN

**Qué hace:**
Valida que cuando hay error del hook, se muestra en pantalla.

**Mocks:**
- `useAuth` - Mock con error

**Código:**
```typescript
it('debe mostrar mensaje de error cuando hay error', () => {
  vi.mocked(useAuth).mockImplementation(() => ({
    login: vi.fn(),
    register: vi.fn(),
    isLoading: false,
    error: 'Credenciales inválidas',
    isAuthenticated: false,
  }))
  renderWithRouter(<LoginView />)
  expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
})
```

---

### Test 41: 41-LoginView-loading.test.tsx

**TDD:** RED → GREEN

**Qué hace:**
Valida que cuando está cargando, muestra "Iniciando sesión..." en lugar del botón.

**Mocks:**
- `useAuth` - Mock con isLoading=true

**Código:**
```typescript
it('debe mostrar Iniciando sesión... cuando está cargando', () => {
  vi.mocked(useAuth).mockImplementation(() => ({
    login: vi.fn(),
    register: vi.fn(),
    isLoading: true,
    error: null,
    isAuthenticated: false,
  }))
  renderWithRouter(<LoginView />)
  expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
})
```

**Mocks:**
- `useAuth` - Mock con error


---

### Test 41: 41-LoginView-loading.test.tsx

**TDD:** RED → GREEN

**Qué hace:**
Valida que cuando está cargando, muestra "Iniciando sesión..." en lugar del botón.

**Mocks:**
- `useAuth` - Mock con isLoading=true


---

# PARTE 5: TESTS ESPECIALES (43-48)

## Test 43: 43-authService-coverage.test.ts

**TDD:** GREEN

**Qué hace:**
Tests adicionales para aumentar cobertura: error 500, errores desconocidos.

**Mocks:**
- `global.fetch` - Simula diferentes tipos de errores

**Código:**
```typescript
it('debe manejar error con status diferente a 401', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
  const { authService } = await import('../../services/authService')
  await expect(authService.login('test@email.com', 'password')).rejects.toThrow('Error: 500')
})

it('debe manejar error desconocido en login', async () => {
  global.fetch = vi.fn().mockRejectedValue('string error')
  const { authService } = await import('../../services/authService')
  await expect(authService.login('test@email.com', 'password')).rejects.toThrow('Error desconocido')
})
```

---

## Test 44: 44-validacion-negocio.test.ts

**TDD:** RED → GREEN

**Qué hace:**
Agrupación de validaciones de negocio: token expirado, logout limpia, error no guarda token, etc.

**Mocks:**
- Varios: global.fetch para algunos, localStorage para otros

**Código:**
```typescript
it('VALIDAR: Token expirado no permite acceso', async () => {
  const expiredDate = Date.now() - 1000
  localStorage.setItem('auth_token', 'expired-token')
  localStorage.setItem('auth_token_expiry', expiredDate.toString())
  const { authService } = await import('../../services/authService')
  expect(authService.isAuthenticated()).toBe(false)
})

it('VALIDAR: Login con error NO guarda token', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 })
  const { authService } = await import('../../services/authService')
  await expect(authService.login('wrong@email.com', 'wrongpass')).rejects.toThrow()
  expect(localStorage.getItem('auth_token')).toBeNull()
})
```

---

## Test 45: 45-verificar-arquitectura.test.ts ⭐

**TDD:** GREEN

**Qué hace:**
Verifica que login llama al endpoint '/api/auth/login' con método POST.

**Mocks:**
- `global.fetch` - Captura la llamada

**Código:**
```typescript
it('VERIFICAR: Login hace fetch al endpoint correcto', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'mock-token' })
  })
  global.fetch = mockFetch
  const { authService } = await import('../../services/authService')
  await authService.login('test@restaurant.com', 'password123')
  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/auth/login'),
    expect.objectContaining({ method: 'POST' })
  )
})
```

---

## Test 46: 46-validar-negocio.test.ts ⭐⭐

**TDD:** RED → GREEN - TEST PRINCIPAL PARA EVALUACIÓN

**Qué hace:**
Valida tres reglas de negocio críticas:
1. Token expirado NO permite acceso (como "saldo negativo")
2. Credenciales inválidas NO crean sesión
3. Sin token = sesión inválida

**Mocks:**
- Algunos usan fetch (para login), otros no

**Código:**
```typescript
it('VALIDAR: Token expirado NO permite acceso - como "saldo negativo" en seguridad', async () => {
  const expiredDate = Date.now() - 1000
  localStorage.setItem('auth_token', 'expired-token')
  localStorage.setItem('auth_token_expiry', expiredDate.toString())
  const { authService } = await import('../../services/authService')
  expect(authService.isAuthenticated()).toBe(false)
})
```

---

## Test 47: 47-edge-cases.test.ts

**TDD:** RED → GREEN

**Qué hace:**
Casos extremos: email vacío, password vacío, múltiples logout, login dos veces.

**Mocks:**
- Algunos usan fetch, otros no

**Código:**
```typescript
it('EDGE: Login con email vacío debe fallar', async () => {
  const { authService } = await import('../../services/authService')
  await expect(authService.login('', 'password123')).rejects.toThrow()
})

it('EDGE: Múltiples logout no rompen nada', async () => {
  const { authService } = await import('../../services/authService')
  authService.logout()
  authService.logout()
  authService.logout()
  expect(localStorage.getItem('auth_token')).toBeNull()
})
```

---

## Test 48: 48-integracion.test.ts

**TDD:** GREEN

**Qué hace:**
Tests de integración: login+logout completos, error de red, registro, loading state.

**Mocks:**
- `global.fetch` - Simula servidor
- `react-router-dom` - Mock de navegación

**Código:**
```typescript
it('INTEGRACIÓN: Login y logout completos funcionan', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'integration-token' })
  })
  const { result } = renderHook(() => useAuth())
  await act(async () => {
    await result.current.login('test@restaurant.com', 'password123')
  })
  expect(result.current.isAuthenticated).toBe(true)
  act(() => {
    result.current.logout()
  })
  expect(result.current.isAuthenticated).toBe(false)
})
```**
```typescript
it('VERIFICAR: Login hace fetch al endpoint correcto', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'mock-token' })
  })
  global.fetch = mockFetch
  const { authService } = await import('../../services/authService')
  await authService.login('test@restaurant.com', 'password123')
  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/auth/login'),
    expect.objectContaining({ method: 'POST' })
  )
})
```


---

## Test 46: 46-validar-negocio.test.ts ⭐⭐

**TDD:** RED → GREEN - TEST PRINCIPAL PARA EVALUACIÓN

**Qué hace:**
Valida tres reglas de negocio críticas:
1. Token expirado NO permite acceso (como "saldo negativo")
2. Credenciales inválidas NO crean sesión
3. Sin token = sesión inválida (como cuenta bloqueada)

**Código:**
```typescript
it('VALIDAR: Token expirado NO permite acceso - como "saldo negativo" en seguridad', async () => {
  const expiredDate = Date.now() - 1000
  localStorage.setItem('auth_token', 'expired-token')
  localStorage.setItem('auth_token_expiry', expiredDate.toString())
  const { authService } = await import('../../services/authService')
  expect(authService.isAuthenticated()).toBe(false)
})
```


---

## Test 47: 47-edge-cases.test.ts

**TDD:** RED → GREEN

**Qué hace:**
Casos extremos: email vacío, password vacío, múltiples logout, login dos veces.

---

## Test 48: 48-integracion.test.ts

**TDD:** GREEN

**Qué hace:**
Tests de integración: login+logout completos, error de red, registro, loading state.

---

# PARTE 6: HUMAN CHECK

## 6.1 Ejemplo 1: Test 18 (useAuth login)

**Pregunta:** "¿Qué mockeas?"

```typescript
// Mock 1: global.fetch
global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ token: 'jwt-token-abc123' }) })
// ¿Por qué? Simula respuestas del servidor HTTP sin llamar API real

// Mock 2: react-router-dom
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
// ¿Por qué? Evita navegación real, aísla solo la lógica del hook
```

---

## 6.2 Ejemplo 2: Test 11 (Token Expirado)

**Pregunta:** "¿Por qué sin mocks?"

```typescript
// SIN MOCKS EXTERNOS
// Usa localStorage real del navegador
localStorage.setItem('auth_token', 'expired-token')
localStorage.setItem('auth_token_expiry', expiredDate.toString())
// ¿Por qué? El expiry es lógica de negocio pura, no depende de servicios externos
```

---

## 6.3 Ejemplo 3: Test 46 (Validar Negocio)

**Pregunta:** "¿Qué valida este test?"


---

# PARTE 7: RESUMEN

## Tests por Tipo

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| **Verifica (GREEN)** | 140+ | El código funciona correctamente |
| **Valida (RED→GREEN)** | 33+ | Las reglas de negocio se protegen |

## Coverage

- **authService:** 97.36% statements, 88.88% branches
- **productService:** cubierto (12 tests)
- **useBulkUpload:** cubierto (5 tests)
- **useCatalog:** cubierto (7 tests)
- **useOrder:** cubierto (12 tests)

## Estado Actual

| Métrica | Valor |
|---------|-------|
| Total test files | 61 |
| Tests totales | 173 |
| Tests pasando | 171 |
| **Tests fallando** | **2** |

### Tests Fallando (pendiente de fix)

| Archivo | Test | Causa |
|---------|------|-------|
| `src/services/authService.test.ts` | `debe retornar true aunque el servidor devuelva error 400` | El servicio lanza error en 400, el test espera `true` |
| `src/tests/auth/13-auth-register-error.test.ts` | `debe manejar error cuando el servidor devuelve error 400` | Mismo desajuste: comportamiento de `register()` cambió |

---

# PARTE 9: HISTORIAS DE USUARIO

## 9.1 HU Completadas

| HU | Feature | Estado | Componente | Service | Hook | Tests |
|----|---------|--------|------------|---------|------|-------|
| HU-FRONT-001 | Login | ✅ Completado | `LoginView.tsx` | `authService.ts` | `useAuth.ts` | 48 tests |
| HU-FRONT-002 | Registro de Usuario | ✅ Completado | `LoginView.tsx` | `authService.ts` | `useAuth.ts` | 15 tests |
| HU-FRONT-004 | Catálogo de productos | ✅ Completado | `ProductGrid.tsx` | `productService.ts` | `useCatalog.ts` | 22 tests |
| HU-FRONT-005 | Carga masiva CSV | ✅ Completado | `CSVUploader.tsx`, `UploadSummaryPanel.tsx` | `bulkUploadService.ts` | `useBulkUpload.ts` | 14 tests |
| HU-FRONT-006 | Pedidos completados | ✅ Completado | `CompletedOrdersButton.tsx`, `CompletedOrdersToast.tsx` | — | `useOrder.ts` | 17 tests |

## 9.2 Detalle: Login (HU-FRONT-001)

**Estado:** ✅ Completado

**Componentes:**
- `src/views/LoginView.tsx` - Interfaz de login
- `src/services/authService.ts` - Lógica de autenticación
- `src/hooks/useAuth.ts` - Hook de React para autenticación

**Funcionalidades implementadas:**
- ✅ Login con email/password
- ✅ Login con remember me
- ✅ Logout
- ✅ Protección de rutas
- ✅ Manejo de errores
- ✅ Estado de carga (loading)
- ✅ Modo demo

## 9.3 Detalle: Registro de Usuario (HU-FRONT-002)

**Estado:** ✅ Completado

**Commits TDD Realizados:**

| # | Commit | Tipo TDD | Descripción |
|---|--------|----------|-------------|
| 1 | `test: add register tests` | RED | Tests de authService.register |
| 2 | `feat: implement register` | GREEN | Implementación de authService.register |
| 3 | `test: add register tests to useAuth` | RED | Tests de useAuth.register |
| 4 | `feat: add register to useAuth` | GREEN | Implementación de useAuth.register |
| 5 | `feat: add register toggle to UI` | GREEN | Toggle login/register en UI |

**Funcionalidades implementadas:**
- ✅ Registro con email, username, password
- ✅ Cambio entre modo login/registro
- ✅ Validación de campos
- ✅ Manejo de errores (username duplicado, error de red)

## 9.4 Detalle: Catálogo de Productos (HU-FRONT-004)

**Estado:** ✅ Completado

**Componentes:**
- `src/components/waiter/ProductGrid.tsx` - Grid de productos con filtros
- `src/services/productService.ts` - CRUD de productos contra la API
- `src/hooks/useCatalog.ts` - Hook que gestiona estado del catálogo

**Funcionalidades implementadas:**
- ✅ Listar productos activos
- ✅ Filtrar por tipo (BAR, HOT_KITCHEN, COLD_KITCHEN)
- ✅ Búsqueda por nombre
- ✅ Crear/actualizar producto
- ✅ Activar/desactivar producto

---

## 9.5 Detalle: Carga Masiva CSV (HU-FRONT-005)

**Estado:** ✅ Completado

**Componentes:**
- `src/components/admin/CSVUploader.tsx` - Drag-and-drop para subir CSV
- `src/components/admin/UploadSummaryPanel.tsx` - Panel de resultados
- `src/services/bulkUploadService.ts` - Comunicación chunked con el backend
- `src/hooks/useBulkUpload.ts` - Orquesta el flujo init → chunks → complete

**Funcionalidades implementadas:**
- ✅ Validación de headers CSV antes de subir
- ✅ Upload en chunks (512 KB)
- ✅ Panel de resumen (total, procesados, errores)
- ✅ Descarga de errores en CSV
- ✅ Descarga de plantilla de ejemplo

---

## 9.6 HU Pendientes (Sin iniciar)

| HU | Feature | Estado | Tests |
|----|---------|--------|-------|
| HU-FRONT-003 | Login con remember me | ⏳ Pendiente | 0 |
| HU-FRONT-007 | Reset password | ⏳ Pendiente | 0 |
| HU-FRONT-008 | Logout automático por inactividad | ⏳ Pendiente | 0 |

---

# PARTE 11: NUEVAS SUITES DE TESTS

## 11.1 productService (12 tests)

**Archivo:** `src/services/productService.test.ts`

**Qué cubre:** CRUD de productos via `apiClient` (GET, POST, PATCH, PUT). Mockea `apiClient` directamente.

**Tests incluidos:**
- `getActiveProducts` — lista productos activos
- `createProduct` — crea con datos válidos, maneja error 400
- `updateProduct` — actualiza campos parcialmente
- `toggleProductStatus` — activa/desactiva producto

---

## 11.2 useCatalog (7 tests)

**Archivo:** `src/hooks/useCatalog.test.ts`

**Qué cubre:** Hook que gestiona el catálogo de productos para el frontend. Mockea `productService`.

**Tests incluidos:**
- Estado inicial: lista vacía, `isLoading=false`
- `loadProducts` — carga y almacena productos
- `filterByType` — filtra por HOT_DISH, DRINK, COLD_DISH
- `searchByName` — búsqueda por texto
- Manejo de error en carga

---

## 11.3 useOrder (12 tests)

**Archivo:** `src/hooks/useOrder.test.ts`

**Qué cubre:** Hook que gestiona el estado del pedido activo. Mockea `orderService`.

**Tests incluidos:**
- `addProduct` — agrega producto nuevo y acumula cantidad
- `removeProduct` — elimina del pedido
- `updateQuantity` — cambia cantidad
- `clearOrder` — vacía el pedido
- `submitOrder` — envía pedido y limpia estado
- `calculateTotal` — cálculo de total del pedido

---

## 11.4 CSVUploader (4 tests)

**Archivo:** `src/components/admin/CSVUploader.test.tsx`

**Qué cubre:** Componente de drag-and-drop para subir archivos CSV.

**Tests incluidos:**
- Renderiza zona de carga y botón de plantilla
- `onDownloadTemplate` se llama al click
- `onFileSelect` se llama al seleccionar archivo
- Estado visual de carga

---

## 11.5 UploadSummaryPanel (5 tests)

**Archivo:** `src/components/admin/UploadSummaryPanel.test.tsx`

**Qué cubre:** Panel de resumen tras carga masiva. Muestra total, procesados, errores.

**Tests incluidos:**
- Renderiza correctamente los conteos
- Muestra botón de descarga de errores cuando `failedRecords > 0`
- Oculta botón de errores cuando no hay fallas
- `onDownloadErrors` se llama al click
- Estado COMPLETED vs IN_PROGRESS

---

## 11.6 useBulkUpload (5 tests)

**Archivo:** `src/hooks/useBulkUpload.test.ts`

**Qué cubre:** Hook que orquesta el flujo completo de carga masiva (init → chunks → complete). Mockea `bulkUploadService` y `validateCsvHeaders`.

**Tests incluidos:**
- Estado inicial correcto
- `uploadFile` — flujo completo feliz
- `uploadFile` — falla si headers CSV inválidos
- `downloadErrors` — descarga errores
- `downloadTemplate` — descarga plantilla

---

## 11.7 CompletedOrders (5 tests)

**Archivos:**
- `src/components/completed-orders/CompletedOrdersButton.test.tsx` (3 tests)
- `src/components/completed-orders/CompletedOrdersToast.test.tsx` (2 tests)

**Tests incluidos:**
- `CompletedOrdersButton` — llama `onToggle`, muestra badge con count, spinner de loading
- `CompletedOrdersToast` — renderiza lista de pedidos completados, mensaje vacío

---

## 11.8 Helpers y App (8 tests)

| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `src/helpers/orderCalculator.test.ts` | 6 | Cálculo de totales, subtotales, propina |
| `src/App.test.tsx` | 2 | Rutas principales renderizan sin crash |

---

## 11.9 LoginView (17 tests) — Suite nueva

**Archivo:** `src/views/LoginView.test.tsx`

Suite consolidada del componente LoginView con 17 tests que cubren formulario login, registro, toggle de modo, submit, errores y estado de carga.

---

# PARTE 10: COMANDOS

```bash
npm test -- --run        # Ejecutar todos los tests
npm test -- --coverage   # Tests con coverage
npm run lint             # Verificar código
npm run build            # Compilar

# Filtrar por suite específica
npm test -- --run src/tests/auth/          # Solo auth
npm test -- --run src/hooks/               # Solo hooks
npm test -- --run src/components/admin/    # Solo carga masiva
```

---

# PARTE 9: ORDEN PARA PRESENTACIÓN

1. **TESTING_STRATEGY.md** - "Tenemos una estrategia clara: 173 tests, 5 HUs"
2. **Test 45** - "Verificar arquitectura: endpoint correcto"
3. **Test 46** - "Validar negocio: token expirado = sin acceso"
4. **Test 18** - "Ejemplo de mocks: fetch + router"
5. **Test 19** - "Validación: error no crea sesión"
6. **useCatalog.test.ts** - "Nueva HU-04: catálogo con filtros"
7. **useBulkUpload.test.ts** - "Nueva HU-05: carga masiva CSV"
8. **Correr tests:** `npm test -- --run`
9. **Mostrar coverage:** `npm test -- --coverage`
10. **Pipeline CI:** GitHub Actions configurado

> **Nota:** 2 tests fallan actualmente (`13-auth-register-error.test.ts` y `authService.test.ts`) por desajuste en el comportamiento de `register()` con error 400. Pendiente de corrección.
