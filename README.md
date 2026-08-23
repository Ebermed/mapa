# Mapa

Mapa traduce una carta BaZi a lenguaje cotidiano, concreto y auditable.

## MVP

- Cálculo local de cuatro pilares con `lunar-javascript`.
- Motor determinista: cálculo → señales → candidatos → filtros → `Mi mapa en breve`.
- Fixtures de regresión de Eber y Anju contra cartas de referencia suministradas al proyecto.
- Vista de trazabilidad para saber qué regla produjo cada frase.
- Tu centro, Tu mezcla, Tus formas de actuar, Tus territorios, Tus cuatro puntos y relaciones relevantes.
- Guardado local en el dispositivo. Sin backend, sin API de IA y sin costo por usuario.
- Despliegue estático gratuito con GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run build
```

La app está preparada para GitHub Pages bajo `/mapa/`.
