# Visión del producto

**Estado:** Validada para continuar la Fase 0  
**Tarea responsable:** FR-PH00-TASK-002 - COMPLETED  
**Fecha de validación:** 2026-07-24

## Visión

FollowRead será una plataforma de lectura acompañada que permite a personas de distintas edades
seguir visualmente un texto mientras lo escuchan, controlar su ritmo, conservar su progreso y
continuar con contenido descargado cuando no tienen conexión.

El sistema también permitirá que un equipo editorial prepare y publique contenido bilingüe
sincronizado sin exigir una nueva versión de la aplicación Reader.

## Problema

El audio tradicional y el texto digital suelen vivir separados. Para lectores principiantes, estudiantes
de inglés y personas que necesitan apoyo visual, esa separación dificulta identificar qué palabra se
pronuncia, repetir una unidad exacta y retomar después el mismo punto. Cuando una aplicación ofrece
sincronización, con frecuencia depende de conexión, no conserva contenido local o no permite que un
equipo editorial publique y corrija material propio.

FollowRead aborda dos problemas relacionados:

1. **Problema del lector:** seguir, controlar y retomar una narración requiere demasiado esfuerzo.
2. **Problema editorial:** producir y actualizar contenido sincronizado suele estar acoplado al cliente
   o a procesos manuales difíciles de revisar.

## Propuesta de valor

FollowRead une texto, narración, temporización y contenido versionado en una experiencia accesible:

- resalta la palabra activa y puede señalarla con una mano animada;
- permite pausar, repetir, retroceder y cambiar velocidad;
- ofrece contenido en español, inglés o ambos;
- conserva progreso confirmado y contenido descargado;
- permite que un equipo editorial publique cambios sin actualizar la app;
- separa una administración segura de la experiencia del lector.

## Jerarquía de audiencias

La prioridad se define por la relación con el valor del producto, no por excluir grupos de edad.

### Beneficiarios primarios

- lectores infantiles que necesitan una interfaz simple y apoyo visual;
- estudiantes de inglés que necesitan repetición, traducción y vocabulario;
- lectores adultos que prefieren narración sincronizada y controles configurables.

Los tres segmentos comparten el problema central de relacionar audio y texto. Sus diferencias se
resolverán mediante modos y preferencias, no mediante aplicaciones separadas.

### Usuarios habilitadores

- editores y revisores que crean y publican contenido;
- administradores técnicos que operan el sistema.

### Partes interesadas de apoyo

- tutores, familias o docentes que acompañan a lectores;
- responsables de seguridad, contenido, derechos y operación.

La existencia de modo infantil no presupone una cuenta infantil. La relación entre lector, perfil y
adulto responsable se decidirá en FR-PH00-TASK-003 y FR-PH00-TASK-006.

## Resultados medibles

Estas métricas son metas de aceptación para el producto inicial. Los umbrales técnicos más precisos se
refinarán en FR-PH00-TASK-006 y los estudios con usuarios en FR-PH00-TASK-010.

| ID | Resultado | Indicador y meta inicial | Método |
|---|---|---|---|
| FR-OV-001 | Seguimiento comprensible | Al menos 90% de participantes de una prueba moderada completa reproducir, pausar y reanudar sin ayuda | Prueba de usabilidad por segmento |
| FR-OV-002 | Sincronización verificable | 100% de checkpoints de fixtures canónicos resuelve la palabra esperada; no se muestra una palabra incorrecta fuera de las marcas | Pruebas unitarias y de integración |
| FR-OV-003 | Continuidad de progreso | 100% de escenarios automatizados recupera el último punto confirmado o comunica una recuperación segura | Pruebas de cierre, reinicio y fallo |
| FR-OV-004 | Lectura offline útil | 100% de los flujos críticos definidos abre, reproduce y guarda progreso con la red desactivada | Prueba E2E offline |
| FR-OV-005 | Agilidad editorial | Una versión compatible publicada aparece en Reader sin rebuild ni reinstalación en todos los escenarios de aceptación | Prueba de publicación y actualización |
| FR-OV-006 | Acceso a controles | 100% de controles críticos funciona con teclado y tiene nombre/estado accesible; cero violaciones críticas automatizadas | Componentes, E2E y revisión manual |
| FR-OV-007 | Aprendizaje sin interrupción | Al menos 90% de participantes objetivo repite una unidad, cambia velocidad y guarda una palabra sin abandonar el lector | Prueba de usabilidad |
| FR-OV-008 | Actualización resiliente | 100% de descargas corruptas o interrumpidas conserva una versión local previamente válida | Prueba E2E de fallos |

Las metas porcentuales de usabilidad son hipótesis de piloto, no afirmaciones de producción. La Fase 1
definirá muestra, protocolo y ajustes necesarios.

## Señales de que la visión no se está cumpliendo

- El usuario debe buscar manualmente dónde quedó.
- El resaltado parece seguir una palabra distinta al audio.
- Una actualización de contenido obliga a publicar otra aplicación.
- La pérdida de red impide abrir una descarga válida.
- La mano o el auto-scroll dificultan la lectura.
- Un error oculta si el progreso, borrador o paquete se conservó.
- Una función esencial de aprendizaje deja de funcionar sin IA o conexión.

## Principios del producto

1. La lectura tiene prioridad sobre elementos decorativos.
2. El usuario controla audio, movimiento, mano, tamaño y traducción.
3. El progreso no se pierde silenciosamente.
4. El contenido descargado sigue siendo útil sin conexión.
5. Un error explica qué ocurrió, qué se conservó y qué puede hacerse.
6. Los menores no pueden llegar accidentalmente a administración.
7. Publicar contenido exige revisión y una transición válida.
8. Una función educativa esencial no depende inicialmente de inteligencia artificial.

## No objetivos

- reemplazar un sistema escolar o clínico;
- producir traducciones automáticas esenciales;
- ofrecer una red social;
- crear un editor de audio profesional;
- soportar todos los idiomas desde el primer lanzamiento;
- medir a menores o recopilar sus datos sin una decisión de privacidad aprobada.

## Supuestos y decisiones diferidas

- La prioridad exacta de segmentos y perfiles se definirá en FR-PH00-TASK-003.
- El corte de MVP y la relación entre progreso local y cuenta se definirán en FR-PH00-TASK-004.
- El desfase máximo perceptible se cuantificará en FR-PH00-TASK-006.
- El contenido demostrativo deberá tener derechos de uso documentados antes de distribuirse.
- FR-DEC-OPEN-002 y FR-DEC-OPEN-003 permanecen abiertas y no se resuelven por implicación.

## Validación de coherencia

| Criterio | Resultado |
|---|---|
| Problema y propuesta de valor describen el mismo núcleo | PASS |
| Audiencias lectoras comparten una necesidad y se distinguen de usuarios habilitadores | PASS |
| Resultados tienen indicador y método de medición | PASS |
| Contenido dinámico sin rebuild está incluido | PASS |
| Uso offline y conservación de progreso están incluidos | PASS |
| La visión no presupone decisiones abiertas de cuentas infantiles o traducción | PASS |
| Alcance, requisitos e historias iniciales contienen capacidades que soportan los resultados | PASS |
