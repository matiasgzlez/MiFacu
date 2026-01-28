# Diseño: Selección de Carrera (Onboarding & Perfil) 🏛️

**Fecha:** 2026-01-28  
**Estado:** Brainstorming 🧠

## Contexto
El usuario desea que al iniciar sesión por primera vez (o al entrar como invitado), se le presente un modal "iOS Premium" para seleccionar su carrera. Esto establece el contexto de la aplicación (materias, horarios, repositorio).

## Objetivos
1. Implementar un flujo de "Selección de Carrera" obligatorio al primer inicio.
2. Diseño Premium (Navy & Gold, estética iOS).
3. Permitir el cambio de carrera desde la pantalla de Perfil.
4. Soporte para múltiples universidades y carreras en el futuro.

## Estructura de Datos
- **Universidades (Mock):** UTN (FRRE - Chaco), + futuras.
- **Carreras (Mock):** Ingeniería en Sistemas de Información, + futuras.

## Flujos
###- [x] Corrección de Logout y Redirección instantánea
- [x] Eliminación total del Modo Invitado (`isGuest`)
- [x] Implementación de Onboarding de Carrera (`CarreraModal`)
- [x] Configuración de Identidad Plaid Labs en `app.json`
- [x] Habilitación de Apple Sign-In y Plugins Nativos
- [/] Despliegue a TestFlight (iOS)
    - [x] Configuración de `eas.json` y `bundleIdentifier`
    - [x] Limpieza de conflictos en la raíz del repositorio
    - [x] Resolución de error `EPERM` mediante `.easignore`
    - [/] Resolución de error Xcode `folly/coro/Coroutine.h` (Fijando Arquitectura Estable)
    - [ ] Envío exitoso a App Store Connect
- [ ] Verificación en dispositivo real vía TestFlight

---

*Iteración 1: Comprendiendo los requisitos técnicos...*
