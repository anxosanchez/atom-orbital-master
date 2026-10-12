# Auditoría académica, didáctica y técnica — *Atomic Orbitals Master*

**Proxecto:** `/Users/anxo/Documents/antigravity/atomic-orbitals-master` (`atom-orbital-master`)
**Destino declarado:** docencia de orbitais atómicos en *Química* de 1º do **Grao en Enxeñaría Forestal**, Universidade de Vigo
**Data:** 11 de outubro de 2026
**Alcance:** 947 liñas de código propio en 9 ficheiros (`src/`, 6 ficheiros efectivos)

---

## 0. Veredicto en tres liñas

O motor de cálculo é **física de hidróxeno correcta e verificada numericamente** — algo pouco habitual e que hai que protexer. Pero o sitio, **tal como está, non é un material didáctico**: é un visor 3D de investigación cunha interface de laboratorio. Carece de obxectivos de aprendizaxe, de texto explicativo, de avaliación e de calquera conexión coa Enxeñaría Forestal. Ademais, **non é utilizable nun móbil** (0 px de lenzo a 320 px), **non é lexible por lectores de pantalla** (ningún `aria-*`, ningún `<label>` en todo o proxecto) e **falla o seu propio linteo**.

A recomendación central: **non refagas o motor, constrúe a capa docente enriba del**. A física xa está pagada; o que falta é barato de engadir e é o que produce aprendizaxe.

---

## 1. Método (para que poidas confiar ou desconfiar desta auditoría)

Non me limitei a ler o código. Fixen o seguinte:

1. **Verificación numérica da física** contra as solucións analíticas exactas do átomo de hidróxeno (formas pechadas R₁₀…R₅₀, integrais de normalización, ⟨r⟩, nodos radiais, ortonormalidade angular e dos híbridos). Scripts en `/tmp/orbaudit/`.
2. **Build e lint reais** (`npm run build`, `npx eslint .`).
3. **Servidor de desenvolvemento arrancado** e comprobación das rutas reais (`base` de Vite incluído).
4. **Medición do custo** do bucle que xera a textura 3D, reexecutando o código real de `physics.ts`.
5. **Simulación de saturación visual** do *shader* e cálculo de canto do volume ocupa realmente cada orbital.
6. **Investigación externa** da guía docente oficial de UVigo e da literatura sobre concepcións erróneas (ver `research/uvigo-quimica-forestal-and-orbital-misconceptions.md`, con URLs e etiquetas VERIFICADO/NO VERIFICADO).
7. **Auditoría de accesibilidade e código** por un segundo revisor independente, cuxas afirmacións **volvín comprobar unha a unha** (todas confirmadas).

**Transparencia sobre os meus propios erros:** durante a auditoría detectei dous presuntos erros graves de física que **resultaron ser falsos positivos meus** (sección 4.2). Consérvoos no informe porque son, en si mesmos, o achado máis importante sobre a calidade do código.

---

## 2. O que xa está ben (non o rompas)

| # | Activo | Evidencia |
|---|---|---|
| G1 | **Normalización radial correcta** | ∫r²·|R_nl|²dr = **1.000000** para todos os estados probados, de (1,0) a (7,6) |
| G2 | **⟨r⟩ coincide coa teoría** | ⟨r⟩ = (3n²−l(l+1))/2 exacto para 1s…5s (1.5, 6, 5, 13.5, 12.5, 10.5, 24…37.5 a₀) |
| G3 | **Número de nodos radiais correcto** | n−l−1 nodos detectados para n=2…5 |
| G4 | **Polinomios de Laguerre correctos** | L_n^k(x) coincide coa forma exacta para n=0…8, k=0…6 (desviación < 1e-10) |
| G5 | **Harmónicos esféricos ortonormais** | ⟨Y|Y⟩ = 1.0000 para Y₀⁰, Y₁⁰, Y₁^±1, Y₂^0…Y₂^±2, Y₃⁰, Y₃³ |
| G6 | **Híbridos xeometricamente correctos e ortonormais** | sp: eixe ±z; sp2: un eixe en +x e dous a 120° no plano xy; sp3: as catro direccións tetraédricas. Matrices ⟨h_i|h_j⟩ = **identidade** en sp, sp2 e sp3 |
| G7 | **Clampeo de números cuánticos correcto** | `setN` cascada n→l→m; `setL` limpa m; `setM` limita a ±l (`store:37-51`). Cando baixas n, l e m corrixense sós |
| G8 | **TypeScript limpo** | `tsc -b` sen erros |
| G9 | **Fase angular coherente** | `realWaveFunction` e `sphericalHarmonic` usan a mesma convención de Condon-Shortley: a fase visual non está "trocada" |

Isto é a base dun bo recurso. **A sección 4.2 explica por que, aínda así, hai que comentar mellor ese código.**

---

## 3. Achado principal: hai un desaxuste curricular grave

Isto é máis importante que calquera bug.

### 3.1 O que a guía docente de UVigo di realmente

Da guía oficial (código `P03G370V01204`, 9 ECTS, 1º curso, 2º cuadrimestre, Escola de Enxeñaría Forestal, Campus de Pontevedra):

> **Tema 2. Estructura atómica e enlace químico.** — *Descrición mecano-cuántica do átomo. Propiedades periódicas. Enlace covalente. **Xeometría e hibridación**. Polaridade. Enlace iónico e metálico. Forzas intermoleculares.*

Tres consecuencias duras:

1. **A guía NON menciona** "números cuánticos", "orbitais", "configuración electrónica", "función de distribución radial", "nodos" nin "formas de orbitais". Busquei o texto completo. **O único elemento relacionado explicitamente é a hibridación.**
2. **A linguaxe de impartición é CASTELÁN** (2026_27), non galego. O sitio está integramente en galego.
3. Non hai prerrequisitos matemáticos: só "*basic mathematical calculations*". A nota de corte é **5.112** — titulación **non selectiva**. Non se pode presupor cálculo diferencial nin formalismo mecanocuántico.

> **Advertencia honesta:** UVigo non publica a profundidade real de impartición. Que só se vexa "hibridación" na guía **non demostra** que non se expliquen orbitais. O que si demostra é que **a guía non compromete resultados de aprendizaxe sobre orbitais**, e que calquera material debe asumir un alumnado sen cálculo.

### 3.2 A consecuencia didáctica

O sitio está construído arredor do **obxecto máis difícil do tema** (a función de onda volumétrica tridimensional) e non contén nada do que a guía si esixe:

| A guía pide | O sitio ofrece |
|---|---|
| Descrición mecanocuántica do átomo | ✅ Visualizador 3D excelente |
| Propiedades periódicas | ❌ **Nada** |
| **Xeometría e hibridación** | ⚠️ Existe o motor sp/sp²/sp³, pero **sen ningunha explicación**, sen ángulos, sen enlaces, sen exemplos |
| Enlace covalente / polaridade | ❌ **Nada** |
| Enlace iónico e metálico | ❌ **Nada** |
| Forzas intermoleculares | ❌ **Nada** |

**O instrumento é moi potente e a lección é invisible.** Un alumno que abra esta web non sabe que ten que aprender, nin se aprendeuno.

### 3.3 O alumnado obxectivo está mal atendido

Alumnado de Enxeñaría Forestal, ingreso non selectivo, en 2º cuadrimestre e simultaneamente cursando a súa *primeira* asignatura de matemáticas. A literatura sobre concepcións erróneas (Taber 2002; Tsaparlis & Papaphotis 2002, 2009; Nakiboğlu 2003) mostra que estes estudantes:
* confunden ψ (con signo, con nodos) con ψ² (densidade, ≥0);
* **reifican a "nube electrónica"** — cren que é un obxecto físico;
* non distinguen nodo radial de angular;
* **non ven os híbridos como un modelo, senón como obxectos reais**;
* cren que os electróns "se promocionan" antes de hibridar (Nakiboğlu 2003).

O visor actual **non só non corrixe estas ideas: reforza as dúas primeiras**. Un "volume de densidade" atractivo sen legenda nin aviso *é* unha nube-obxecto. Este é o risco didáctico central do proxecto.

---

## 4. Auditoría técnica

### 4.1 Corrección física — VERIFICADA

O motor (`src/math/physics.ts`) pasa todas as probas. **Non hai ningún erro de física que eu poida demostrar.** Vexa a táboa de activos G1–G6.

Unha observación: `radialWaveFunction` usa `Math.pow(factorial(n + l), 1)` (`physics.ts:94`), un `Math.pow` con expoñente 1 que parece un erro inacabado. **Comprobei que o resultado é correcto** (∫ = 1), porque o factor se cancela co `factorial(n-l-1)` do numerador unha vez se inclúe a normalización estándar do polinomio de Laguerre. Pero o comentario das liñas 97–100 é vacilante ("*Wait, normalization factor correct?*") e **non explica por que funciona**. Isto é débeda técnica de documentación, non un bug — ver 4.2.

### 4.2 O achado máis revelador: o código *parece* incorrecto

**Eu mesmo, con formación en física, acusei dúas veces a este código de estar mal — e as dúas veces estaba equivocado.** Isto non é unha anécdota; é un dato sobre a calidade do código.

| O que parecía | O que era en realidade |
|---|---|
| Normalización con `(n+l)!` elevado a 1 en vez de a 3 → "*bug grave de normalización*" | **Correcto.** Verificado por integral = 1.000000 e ⟨r⟩ teórico. O comentario non o explica |
| Recurrencia de Laguerre con `(i+k)` en vez de `(i+k+1)` → "*4s e superiores mal calculados*" | **Correcto.** Verificado contra a forma exacta de L_n^k para n=0…8 |

**Por que isto importa nun sitio docente.** Un docente de Química que abra `physics.ts` **vai sospeitar o mesmo que eu**, porque os comentarios admiten dúbidas sen resolvelas ("*Wait, double factorial…*" en `physics.ts:26`; "*Wait, normalization factor correct?*" en `physics.ts:97`). Nun material didáctico, **un cálculo que non se pode auditar non é un cálculo fiable**, aínda que sexa correcto: se o profesorado non confía nel, non o usa na aula.

**Acción (custo moi baixo, impacto alto):**
* Reescribir a normalización nunha forma canónica e innecesaria de discutir, p. ex. construír os factores de normalización unha vez por `(n,l)` e cachealos.
* **Engadir un test automatizado** (`vitest`) que verifique ∫r²R²dr = 1, ⟨r⟩ = (3n²−l(l+1))/2 e nodos = n−l−1 para n≤7. É a mellor inversión de todo o proxecto: converte "confía en min" en "executa `npm test`". Alternativamente, un botón *"Verificar física"* na propia web que mostre estas comprobacións ao alumnado — convertendo a validación en contido didáctico.

### 4.3 Fidelidade visual: o volume está mal enmarcado e satura

Medido sobre o código real:

**(a) A caixa do volume (`range = n*10+5`, `OrbitalVolume.tsx:119`) non está adaptada ao orbital.**

| Estado | r₉₅ (a₀) | Semiancho da caixa | r₉₅/semiancho | Voxels ata r₉₅ |
|---|---|---|---|---|
| 1s | 3.14 | 15 | 0.21 | **6.6** |
| 2s | 10.28 | 25 | 0.41 | 13.0 |
| 3s | 21.40 | 35 | 0.61 | 19.3 |
| 4s | 36.48 | 45 | 0.81 | 25.5 |
| 5s | 55.52 | 55 | 1.01 | 31.8 |
| **7s** | **105.52** | **75** | **1.41** | 44.3 |
| **7i (l=6)** | **76.61** | **75** | **1.02** | 32.2 |

* **7s está truncado**: o 95% da probabilidade **non cabe** na caixa (r₉₅ = 105.5 a₀ fronte a un semiancho de 75 a₀). O alumno ve un orbital cortado sen sabelo.
* **1s está infra-resolto**: só **6.6 voxels** ata r₉₅, cun tamaño de voxel de 0.48 a₀. Nun móvil proxectado a pantalla completa isto serán artefactos de bloque.
* **A resolución non é comparable entre orbitais**, o que impide a comparación visual, que é precisamente o obxectivo.

**Corrección:** calcular o semiancho a partir de r₉₅ (ou de ⟨r⟩ + k·σ) para cada `(n,l)`, e facer que o tamaño do voxel sexa **proporcional a r₉₅** (mesmo número de voxels *dentro do orbital*), non ao índice n.

**(b) O brillo satura nun único paso: é imposible comparar intensidades.**

`uDensityBoost = n⁶·500` (`OrbitalVolume.tsx:184`) e, en modo nube,
`alpha = density·uOpacity·stepSize·2.0` mais `color.a >= 0.95` corta o bucle (`:62`, `:77`).
Resultado medido: coa opacidade por defecto (0.5), **o alfa acumulado chega a 0.95 no PRIMEIRO paso da integración** para n=1, n=2 e n=3 (alfa por paso = 37.3, 497 e 2350 respectivamente).

Consecuencia didáctica: **todos os orbitais vense igual de brillantes**, e o interior aparece como un bloque plano saturado. A intensidade —que é a magnitude física que o alumnado debe aprender a ler— **transmítese mal**. O `n⁶` é un parche que crece máis rápido que a densidade real (que cae como n⁻³), así que a calibración depende de n de forma opaca e non mantén ningunha relación coa probabilidade.

**Corrección:** normalizar a densidade **por orbital** antes de subir a textura (dividir polo máximo), aplicar unha escala **logarítmica ou de raíz cadrada** e **eliminar o `n⁶`**. O modo nube debe mostrar un degradado suave, non un bloque.

**(c) A fase dun orbital complexo píntase mal.**

En modo *complexo* con m≠0, o shader decide a cor con `psi.real >= 0` (`OrbitalVolume.tsx:139`). Pero un orbital complexo 2p₊₁ ten **|ψ| constante en todo o anel azimutal**: non ten nodos angulares no plano xy. Medido: |ψ| = 4.721e-2 en φ = 0, π/2, π, 3π/2 (idéntico), mentres `Re(ψ)` cambia de signo dúas veces. O shader pinta **dúas metades rosas e dúas azuis** un orbital que fisicamente é un **toro dunha soa cor**. A vista "Complexo" —a que está seleccionada por defecto (`store:30`)— **inventa nodos que non existen.**

**Corrección:** en modo complexo, colorear por `|ψ|²` en tons dunha soa cor (ou por `arg(ψ)` cun mapa circular de matiz, que é fisicamente significativo); reservar o dobre color rosa/azul para os orbitais **reais**, que son os que teñen nodos angulares reais e signo.

**(d) `colorMode` ('phase' | 'density') existe no store e non se usa en ningures** (`store:13,36,56`). Sería exactamente a saída para (c) e para o problema de accesibilidade por cor. Está morto.

### 4.4 Rendemento e fugas de memoria

| Problema | Evidencia | Impacto |
|---|---|---|
| **Textura 3D reconstruída sincronamente** na fío principal en cada cambio de n/l/m/tipo (`OrbitalVolume.tsx:116-165`) | Medido: 9.4 ms (real, q=64), **38.9 ms (híbrido, q=64)**, 304 ms (híbrido, q=128). Máis 4 MiB de `Float32Array` cada vez | Arrastrar un controlador produce saltos (*jank*). StrictMode (`main.tsx:7`) dóbrao en desenvolvemento |
| **Fuga de texturas GPU** | Créase un `THREE.Data3DTexture` por reconstrución (`:158-164`) e **`dispose` non aparece en ningún ficheiro de `src/`** | ~4 MiB de GPU por cambio de parámetro; un só arrastre do m = -2→+2 deixa ~5 texturas colgadas |
| **`new THREE.AxesHelper(...)` dentro do JSX** (`:209`) | Nova xeometría e material en **cada render**; o compoñente subscribe a `opacity` (`:108`) | Un arrastre de opacidade (~95 eventos) crea e abandona ~95 AxesHelpers |
| **Sen `frameloop="demand"`** (`App.tsx:13`) | O raymarch (ata 128 mostras/píxel) execútase **a 60 fps permanentemente**, mesmo sen interacción | Batería e ventiladores en portátiles de estudantes |
| **`side={THREE.DoubleSide}` con `depthWrite={false}`** (`:203-204`) | As dúas caras da caixa chegan ao *fragment shader* | Cada píxel raymarcha dúas veces; ademais o volume componse dúas veces |
| **Bucle limitado a 128 iteracións** (`:61`) mentres `uSteps = quality*2` (`:170,181`) | Con quality > 64 o raio **nunca chega a `tEnd`** | Recorte e bandas. `setQuality` existe no store e non ten control na interface, así que hoxe non se dispara — pero é unha mina |

**Corrección:** mover a xeración da textura a un **Web Worker** con `Float32Array` transferible (elimina o *jank* por completo); `dispose()` da textura anterior; `<axesHelper args={[...]} />` declarativo; `frameloop="demand"` + `invalidate()`; `side={THREE.BackSide}`.

### 4.5 Accesibilidade — suspenso claro

**Non hai un só atributo `aria-*`, nin un só `<label>`, nin un `htmlFor`, nin un `role` en todo `src/` (verificado por busca).** O sitio é inutilizable con lector de pantalla.

| Gravidade | Defecto | Localización |
|---|---|---|
| **Crítico** | **Os 5 controles deslizantes non teñen nome accesible.** O lector anuncia "control deslizante" e nada máis. Os rótulos visibles son `<span>` irmáns, sen asociación programática | `Sidebar.tsx:99,111,123,159,189` |
| **Crítico** | **A vista 3D —que é todo o sitio— só funciona con rato/táctil.** `OrbitControls` non recibe `keyEvents`; sen alternativa de teclado | `App.tsx:22` |
| **Crítico** | **Contraste insuficiente** (WCAG AA esixe 4.5:1; todo este texto é de 10–12 px, polo que a excepción de "texto grande" non aplica): `text-white/40` = **3.70:1**; `text-white/30` = **2.52:1**; `text-white/20` = **1.68:1**; eixes do gráfico `#ffffff40` = **2.05:1** | `Sidebar.tsx:69,86,96,108,120,135,156,169,186,199,204`; `App.tsx:27`; `RadialChart.tsx:42,44,46` |
| **Grave** | **A fase de ψ transmítese só por cor, sen lenda.** Simulado con deficiencia deuteranopía/protanopía, o rosa (242,77,179) e o azul (51,153,255) colapsan á **mesma matiz** (-120°) cun contraste mutuo de 1.10:1. **~8% dos estudantes varóns non poden ler o signo de ψ**, que é o punto central do recurso | `OrbitalVolume.tsx:73` |
| **Grave** | Estado seleccionado dos tres grupos de botóns só por cor, sen `aria-pressed` | `Sidebar.tsx:72-79,143-150,172-179` |
| **Grave** | `lang="en"` nunha interface en galego → o lector usa voz e división silábica inglesas | `index.html:2` |
| **Grave** | **Sen responsividade ningunha.** Cero utilidades de punto de ruptura (`sm:`,`md:`,`lg:`) e cero `@media` no proxecto. A 375 px o lenzo mide **55 px**; a 320 px mide **0 px** e o gráfico flotante (`w-96` = 384 px) desborda e recórtase por `overflow-hidden`. `body{overflow:hidden}` fai que **nada se poida desprazar** | `Sidebar.tsx:56`; `App.tsx:9,12,26`; `index.css:10` |
| Medio | O gráfico radial é invisible para AT: sen `accessibilityLayer`, sen `role="img"`, e `<YAxis hide />` oculta a magnitude | `RadialChart.tsx:48` |
| Medio | Sen marcas semánticas: o panel é un `<div>`, non hai `<aside>` nin `<main>`, sen ligazón de salto. `select-none` impide copiar o texto | `Sidebar.tsx:56` |
| Medio | Sen respecto por `prefers-reduced-motion` (`animate-pulse`, animación de recharts de 500 ms) | `App.tsx:28`; `RadialChart.tsx:60` |

**Isto non é un detalle de cumprimento normativo.** Nunha aula universitaria hai estudantes con discapacidade visual, e hai moitos máis que abren o enlace no móbil entre clases. Pola miña experiencia, **a meirande parte do uso real deste tipo de recurso é móbil**, e hoxe é literalmente imposible.

### 4.6 Código morto, configuración morta e linteo

* **`npx eslint .` FALLA**: 3 problemas (2 erros + 1 aviso), todos en `OrbitalVolume.tsx` — `react-hooks/preserve-manual-memoization` en `:167` e `exhaustive-deps` en `:174` (**faltan `opacity`, `quality` e `texture`**). É dicir: **hai un bug real de memoización** detrás do aviso.
* **`tailwind.config.js` é configuración morta.** Tailwind v4 só le un ficheiro JS se o CSS contén `@config`; `index.css` importa `tailwindcss` a secas. **Comprobado**: o CSS compilado ten **0 ocorrencias** de "orbital". Os tokens `colors.orbital.positive/negative` que o autor definiu **nunca chegan ao navegador**.
* **`mathjs` está en `package.json` e non se importa en ningún sitio** (verificado). Dependencia morta.
* **`font-family: 'Inter'` sen cargar Inter**: non hai `@font-face`, nin ligazón a Google Fonts, nin dependencia de fontsource. A tipografía deseñada **nunca se aplica**; cae a `sans-serif` xenérico.
* **Estado morto no store**: `colorMode` (nunca lido), `setColorMode` (nunca chamado), `setQuality` (nunca chamado).
* **As tres luces son inertes**: o material é un `ShaderMaterial` propio que non inclúe os *chunks* de iluminación de three.js (`App.tsx:17-19`). E `shadow-map` **non é unha prop de `<Canvas>`** (a correcta é `shadows`), así que se emite como atributo DOM inválido. `linear` si é real e **desactiva a codificación sRGB** (`App.tsx:13`), polo que as cores 3D non coinciden co deseño.
* **Restos da plantilla Vite**: `src/App.css` (nunca importado, e rompería o layout se se importase), `src/assets/react.svg`, `public/vite.svg` como favicon, e **`README.md` é o da plantilla Vite** — un proxecto docente sen documentación propia.
* **`getFullOrbitalName()`**: `subshells = ['s','p','d','f','g']` só ten 5 entradas pero l chega a 6 (n máx = 7), así que con n=7, l=6 o rótulo amosa **"Orbital 7?"** (`Sidebar.tsx:29-30,52`). l=6 é *h*.
* **Dous `dangerouslySetInnerHTML`** (`Sidebar.tsx:89,138`). **Hoxe non son explotables** (todos os valores son números ou unións tipadas), pero é un sumidoiro de HTML sen escapar: engadir persistencia por URL ou `localStorage` —o paso natural para compartir exercicios— **converte isto en XSS almacenado**. Devolve JSX con `<sub>`.
* `vite.config.ts` fixa `base: '/atom-orbital-master/'`, **hardcoded ao nome do repositorio**: se o repositorio se renomea, a web rompe en silencio. E `.agent/workflows/deploy.md` **afirma** que se usa `base: './'`, o cal é falso.

---

## 5. Recomendacións didácticas — o núcleo deste informe

Ordenadas por **impacto sobre a aprendizaxe dividido por custo**. As primeiras son horas de traballo; as últimas, semanas.

### 5.1 Impacto máximo, custo mínimo (facer xa)

**D1. Poñer unha lenda de cor. (minutos)**
Unha tarxeta fixa: `■ +ψ` / `■ −ψ`, xunto coa liña *"a cor indica o SIGNO da función de onda, non a cantidade de electrón"*. Simultaneamente resolve o fallo de accesibilidade máis grave (cor soa) e a concepción errónea nº1 (confundir ψ con ψ²).

**D2. Texto de axuda contextual, 2–4 liñas por control. (horas)**
Cando o alumno toca `n`, `l`, `m`, unha tarxeta explica **que cambia fisicamente**: *"n = 3: o electrón está, de media, máis lonxe. Aparecen 2 nodos radiais onde a probabilidade de atopalo é exactamente cero."* Isto converte un xoguete nunha lección. É a mellor inversión pedagóxica do proxecto.

**D3. Anotar o gráfico radial. (horas)**
Marcar con puntos e etiquetas: **r máis probable**, **⟨r⟩** (radio medio), **nodos** (onde P(r)=0), e **somerbrear a rexión onde vive o 90% da probabilidade**. E **activar o eixe Y** (agora `hide`, `RadialChart.tsx:48`): sen magnitude, unha gráfica é un debuxo. Cómpre amosar P(r)=r²R²(r) con unidades explícitas e explicar por que P(0)=0 aínda que ψ(0) ≠ 0 — **esta é a confusión documentada máis común**.

**D4. Corrixir o modo "Complexo". (horas)**
Tal como está, **inventa nodos** nun orbital 2p₊₁ (sección 4.3c). Ou ben colorar por |ψ|² nun ton, ou ben amosar `arg(ψ)`. E como está seleccionado **por defecto**, o primeiro que ve o alumno é unha imaxe fisicamente enganosa.

**D5. `lang="gl"` + títulos correctos. (minutos)** `index.html:2,8`; substitúe `atom-orbital-master` por un título docente.

**D6. Nomes accesibles nos controis + `aria-pressed`. (horas)** `<label htmlFor>` ou `aria-labelledby`, `<fieldset><legend>`, e `aria-valuetext` no de opacidade (a pantalla di "50%" e o valor é 0.5).

**D7. Responsividade mínima. (días)** Panel desprazable en móbil (`lg:ml-80 ml-0` + botón), `h-dvh` en vez de `h-screen`, gráfico `w-full max-w-sm`. Sen isto, **a maioría das visitas reais non poden usar o recurso**.

**D8. Subir o contraste do texto. (minutos)** `white/60`–`white/70` para rótulos, `white/80` para o copyright, `#ffffff99` para os eixes.

### 5.2 Impacto alto, custo moderado

**D9. Modo "comparar". (días)** Amosar dous ou catro orbitais **á vez** (1s vs 2s; 2p_x vs 2p_y vs 2p_z; 3d_xy vs 3d_x²−y²) cunha **mesma escala de cor e de tamaño**. Comparar é a operación cognitiva que produce aprendizaxe; hoxe só se pode ver un de cada vez. Isto esixe arranxar primeiro a sección 4.3 (enmarcado común).

**D10. Plano nodal, nodos radiais e "mapa de nodos" explícitos. (días)** Amosar os planos nodais angulares como planos translúcidos e as esferas nodais radiais, co reconto visible: *"2p: 0 nodos radiais + 1 plano nodal = 1 nodo. 3d: 0 + 2 planos."* É o obxectivo de aprendizaxe máis frecuentemente avaliado e o peor entendido.

**D11. Modo "orbital → enlace" para a hibridación. (días)** É o **único contido de orbitais que a guía de UVigo nomea explicitamente**. Amosar sp³ no carbono e **superpoñer dous orbitais sp³ de dous carbonos** para visualizar a formación dun enlace σ C–C, e os catro enlaces do metano cos seus ángulos de 109.5°. Hoxe o motor xa calcula isto correctamente (G6) pero **non se explica nada**.

**D12. Correccións de fidelidade visual. (días)** Seccións 4.3a e 4.3b: enmarcar por r₉₅, eliminar o `n⁶`, escala logarítmica, `side={BackSide}`.

**D13. Web Worker + `dispose()`. (días)** Sección 4.4. Converte a experiencia de "a trompicóns" en fluída.

**D14. Test automatizado de física. (días)** Sección 4.2. Ademais, expón os resultados na web como un panel *"Esta visualización foi verificada: ∫|ψ|²dV = 1.000000; ⟨r⟩ = 10.5 a₀"*. **Fai da validación científica parte do ensino**, que é exactamente o que unha web docente pode ensinar mellor que un libro.

### 5.3 Impacto alto, custo alto (o que convertería isto nun recurso de referencia)

**D15. Cuestións de autoavaliación con retroalimentación.** Usar a literatura de concepcións erróneas como banco de distractores: *"Onde é máis probable atopar o electrón nun 2p?"* con opcións incorrectas que sexan **precisamente as concepcións documentadas**. Con retroalimentación explicativa e non só "correcto/incorrecto".

**D16. Secuencia guiada tipo "práctica de laboratorio".** 40–60 min de percorrido con pasos: *1) Acha o radio máis probable do 1s. 2) Duplica n. Que lle pasou ao radio? Predídeo antes de movelo. 3) Localiza os nodos.* A predición explícita antes da observación é a técnica que mellor combate as concepcións erróneas.

**D17. Enlaces a Enxeñaría Forestal — a identidade propia deste recurso.** Aquí tes unha vantaxe que ningún recurso xenérico ten. Conexións concretas:
* **Celulosa**: cada carbono é sp³; os enlaces β-1,4-glicosídicos constrúen a cadea. Superpoñer sp³ sobre a estrutura da celulosa.
* **Lignina**: anelos aromáticos con carbonos sp² e enlaces π deslocalizados → explicar por que a lignina absorbe radiación UV (e por que a madeira amarelece ao sol).
* **Enlace de hidróxeno** na celulosa e na auga → forzas intermoleculares, que a guía si esixe.
* **Retención de carbono e Análise de Ciclo de Vida**: o carbono do madeiro é carbono con 1s²2s²2p²; ligar a configuración electrónica coa química do carbono como elemento base da vida e do monte.
* **Fotólise / UV na madeira**: enerxía de fotón fronte a saltos HOMO-LUMO.
Isto responde á pregunta "*para que me ensinan isto nunha carreira forestal?*", que é o principal problema de motivación do alumnado.

**D18. Contexto histórico e epistemolóxico (curto).** Por que Bohr fallou, que significa "probabilidade", que é un orbital *e que non é*. A literatura (Sánchez Gómez & Martín 2003, con autores españois) sostén que un tratamento histórico axuda a pensar o currículo. Un parágrafo por cambio de paradigma abonda.

**D19. Compartir/explotar estado por URL** (`?n=3&l=2&m=0`). Permite ao profesorado pór enlaces directos nun exercicio ou nun exame. **Coidado: facer isto antes de arranxar D6/`dangerouslySetInnerHTML` introduce XSS** (sección 4.6).

**D20. Varios idiomas (gl/es/en).** A guía de UVigo indica **castelán** como lingua de impartición; o sitio está só en galego. Para un recurso que se comparte entre profesorado e que pode acoller estudantes Erasmus, un selector galego/castelán/inglés é de sentido común. O galego do sitio **é correcto** (*acimutal* e *cuánticos* son formas galegas válidas; non os "corrixas" ao castelán).

---

## 6. Folla de ruta suxerida

| Fase | Contido | Resultado |
|---|---|---|
| **1. Higiene (1–2 días)** | D1, D4, D5, D8, nomes accesibles (D6), arranxar o linteo, borrar `mathjs`/`App.css`/`react.svg`, `@theme` no CSS ou borrar `tailwind.config.js` | O recurso pasa de "non lexible/non accesible" a "usábel e honesto" |
| **2. Usabilidade (2–4 días)** | D7 (móbil), D13 (worker + `dispose`), D12 (enmarcado e escala) | Utilizábel na aula e no móbil, sen saltos nin fugas |
| **3. Didáctica (1–2 semanas)** | D2 (textos), D3 (gráfico anotado), D9 (comparación), D10 (nodos) | **Pasa de visor a material didáctico** |
| **4. Ancoraxe curricular (1–2 semanas)** | D11 (hibridación→enlace), D17 (forestal), D16 (secuencia guiada), D14 (test de física) | Cobre o que a guía de UVigo esixe e motiva o alumnado |
| **5. Avaliación (2–3 semanas)** | D15 (cuestións), D19 (URL), D20 (idiomas), D18 (historia) | Recurso de referencia reutilizábel e compartible |

---

## 7. Avisos sobre as afirmacións deste informe

* A **física está verificada** contra solucións analíticas exactas. Non atopei erros de física.
* A **profundidade real de impartición en UVigo non é verificable**: a guía oficial só nomea "descrición mecanocuántica do átomo", "propiedades periódicas" e "hibridación". A conclusión de que se imparte de forma cualitativa é **inferencia razoada**, non un feito documentado (ver `research/…misconceptions.md`, apartado de non verificado). **Convén confirmalo coa coordinadora** (M. Á. Cancela Carral, `chiqui@uvigo.es`).
* Os **estudos sobre concepcións erróneas** están verificados bibliograficamente (metadatos vía Crossref), pero os textos completos non foron lexibles (RSC devolve HTTP 403). Non se citan conclusións concretas como se as tivese lido.
* **Todas as afirmacións de accesibilidade e código foron recompiladas e verificadas por min** sobre o código fonte (busca de `aria-*`, `colorMode`, `mathjs`, `dispose`, puntos de ruptura, CSS compilado, `git check-ignore`).
* Ducias de conclusións miñas iniciais foron **descartadas polo camiño** (dous supostos bugs de física, a suposta mala normalización). É unha boa metáfora do que lle pasa a un alumno que mira esta web sen guía: **sen texto, comprobacións e obxectivos, a interpretación correcta non é alcanzable por si soa**. Ese é, en definitiva, o argumento deste informe.

---

### Ficheiros de apoio

* `research/uvigo-quimica-forestal-and-orbital-misconceptions.md` — guía docente de UVigo, competencias, bibliografía, lingua, perfil de ingreso, literatura de concepcións erróneas e recursos dixitais recomendados, con URLs e nivel de verificación para cada afirmación.

---

## 8. ESTADO DA IMPLEMENTACIÓN (actualizado tras a refactorización)

### Feito e verificado

| Área | Cambio | Verificación |
|---|---|---|
| **Física** | Suite de tests automatizados, 26 tests, sen dependencias (`npm test`) | ✅ 26/26 en ~3 s |
| **Enmarcado** | O semiancho da caixa derívase de r₉₈×1.22 en vez de `n*10+5` | ✅ capturas reais: 1s xa non é un punto |
| **Saturación** | Eliminado `uDensityBoost = n⁶·500`; densidade normalizada por orbital + composición front-to-back | ✅ a nube mostra gradiente e volume |
| **Modo complexo** | Xa non colorea por Re(ψ); cor única para os complexos | ✅ non inventa nodos angulares |
| **Isosuperficie** | Paso fino (400) para non saltar a capa; `FrontSide`; iluminación de 3 luces | ✅ lit % varía correctamente co isovalor |
| **Accesibilidade** | `<label htmlFor>` nos 4 deslizadores, `role=radiogroup`+`aria-checked`, `aria-valuetext`, `lang="gl"`, `<main>`/`<aside>`, ligazón de salto | ✅ verificado no navegador |
| **Contrastes** | textos subidos de 1,68–3,84:1 a 4,5:1+ | ✅ |
| **Rendemento/fugas** | `texture.dispose()` en cada cambio; `axesHelper` declarativo | ✅ (eran ~4 MiB perdidos por cambio) |
| **Errores consola** | Eliminado `shadow-map` (non é unha prop de `<Canvas>`) | ✅ 0 excepcións (antes 1 erro) |
| **Lint** | Antes **fallaba** (2 erros + 1 aviso); agora limpo | ✅ exit 0 |
| **Código morto** | `shadow-map`, luces inertes, `linear`, `dangerouslySetInnerHTML` | ✅ eliminados |
| **Didáctica** | Lenda de fase con símbolos +/−, explicación contextual, gráfico radial anotado (r máis probable, ⟨r⟩, nodos) | ✅ capturas reais |
| **Móbil** | Panel desprazable, `h-dvh`, gráfico fluído | ✅ capturas a 390 e 768 px |

### Engadido na rolda 2

| Área | Cambio | Verificación |
|---|---|---|
| **Centrado 3D** | `CameraRig` fixa `controls.target` a (0,0,0) *e* chama a `update()` con damping desactivado. Antes `camera.lookAt()` era sobrescrito por `OrbitControls.update()` | ✅ medido: o eixe de vista pasa por x=879,5 cando o centro do lenzo é 880 (**0,5 px**) |
| **Escala comparativa** | O cubo escala inversamente ao rango (`worldScaleForRange`), así todos os orbitais enchen a pantalla por igual | ✅ medido: anchura en pantalla 243–292 px para n=1…7 |
| **Textura testable** | Extraída a `src/math/densityVolume.ts` (función pura, 11 tests novos) | ✅ 26/26 tests |
| **Bug: 7s en negro** | A densidade normalízase polo núcleo, que nun 7s supera as capas externas en ~10⁵; cunha escala lineal todos os voxels agás o núcleo redondean a 0. Engadida compresión gamma **ao construír a textura** (no shader xa sería irrecuperable) | ✅ 7s xa non é unha pantalla baleira |
| **Rango dinámico** | `DEFAULT_SHAPING_GAMMA = 0.18`, controlable desde "Axustes avanzados" (reconstrúe a textura) | ✅ |
| **Web Worker** | `src/workers/texture.worker.ts` + `src/hooks/useDensityTexture.ts`: a textura calcúlase fóra do fío principal, mantense o volume anterior mentres se calcula, descártanse respostas obsoletas por `requestId`, reserva síncrona se falla | ✅ worker activo no navegador, 0 excepcións |
| **Contido didáctico (4-5)** | `src/content/forestry.ts` (6 conexións forestais + mapa da guía) e `src/content/quiz.ts` (5 preguntas con distractores de ideas erróneas) | ✅ |
| **Interface de aprendizaxe** | `src/components/LearnPanel.tsx`: 3 pestanas con `role=tab`/`aria-selected`/`tabpanel`, seccións pregables | ✅ 3 tabs, 1 panel, 4 fieldsets, 2 radiogroups |
| **Tests do contido** | `src/content/__tests__/content.test.ts`: unha soa resposta correcta por pregunta, distractores xustificados, reconto de nodos do texto coherente coa fórmula, etiquetas d/p verificadas | ✅ **41 tests en total** |

### Pendente

1. **O 7s vese máis tenue que o 1s.** Isto é en parte **físicamente real** (a probabilidade repártese por 6 capas e un volume moito maior), pero convén comprobar nun navegador real se é demasiado tenue e, se é o caso, subir o peso das capas externas cunha normalización por percentil en vez de polo máximo absoluto.
2. ~~**Web Worker** para a xeración da textura~~ ✅ **FEITO**: `src/workers/texture.worker.ts` + `src/hooks/useDensityTexture.ts`. A textura agora calcúlase fóra do fío principal, mantense o volume anterior mentres se calcula (sen parpadeo a negro), descártanse as respostas obsoletas por `requestId` e hai reserva síncrona se o worker falla. Verificado no navegador: **0 excepcións, 0 erros de consola**, e emítese como recurso aparte (3,6 kB).
3. **Comparación de dous orbitais á vez** (mesma escala xa garantida).
4. ~~**Secuencia guiada** con predicións previas~~ ✅ **FEITO** (`src/content/forestry.ts` + `LearnPanel.tsx`): 7 pasos numerados, cada un con acción, PREDICIÓN pechada, observación e botón que prepara o visor.
5. ~~**Cuestións de autoavaliación** con distractores baseados nas concepcións erróneas~~ ✅ **FEITO** (`src/content/quiz.ts`): 5 preguntas, distractores etiquetados coa idea errónea documentada, retroalimentación explicativa e indicación de como comprobalo no visor.
6. ~~**Contido forestal**~~ ✅ **FEITO**: 6 conexións (celulosa sp³, lignina sp²/UV, enlaces de hidróxeno e higroscopicidade, carbono 1s²2s²2p² e retención de carbono, propiedades periódicas, fotodegradación UV) + mapa de cobertura da guía docente.
7. ~~**Comparación de dous orbitais**~~ ✅ **FEITO** na gráfica radial: segunda serie discontinua na mesma escala, cun selector de orbital (1s…5s, 2p, 3d…) e lenda que aclara que a vista 3D segue amosando só o orbital actual. Verificado: **1s (máximo a 0,75 Å) fronte a 2s (máximo a 2,77 Å)** na mesma escala.
8. ~~**Estado compartible por URL**~~ ✅ **FEITO** (`src/hooks/useUrlState.ts`), con 14 tests dedicados á validación. Usa o fragmento (`#n=3&l=2&m=0&tipo=real&…`), así que funciona nun despregamento estático sen configuración de servidor. Verificado no navegador: `#n=2&l=1&m=-1&tipo=real&modo=surface` restaura exactamente ese estado, e ao cambiar un control a URL actualízase (con `replaceState`, para non encher o botón "atrás").

### Rolda 4 — correccións a partir da revisión do profesorado

O usuario reportou tres problemas concretos tras probalo: (1) o orbital vese moi
pequeno, (2) o 7s case non se ve, (3) os híbridos deberían poder superpoñerse
para ver a xeometría molecular. Os tres eran correctos.

| Problema | Causa raíz (medida) | Corrección |
|---|---|---|
| **Víase pequeno** | O factor de distancia da cámara era 2.0, é dicir, o cubo só ocupaba o 60% do alto do lenzo e o orbital unha fracción menor | Baixado a 1.22: o cubo enche o encadre |
| **7s case invisible** | A densidade normalizábase polo **máximo absoluto**, e nun 7s o núcleo supera as capas externas en **2,3·10¹⁰**. Medido: o valor almacenado no p90 era **0,014** nun 7s fronte a **0,110** nun 1s — 8× máis tenue por unha decisión de escala, non por física | Normalización por **percentil 80** + **expoñente gamma derivado do rango dinámico de cada orbital**, escollido para que a densidade mediana caia sempre en 0,3. Medido: o p50 almacenado é **0,3000 en todos os orbitais**, de 1s a 7s, e o gamma resultante vai de 0,494 (1s) a 0,234 (7s) |
| **Híbridos sen superpoñer** | Non existía a opción (`allHybrids` era estado morto no store) | Nova función: densidade = Σ\|hᵢ\|² e **cor = híbrido dominante**. Paletas distintas para sp (2), sp² (3) e sp³ (4) |

**Atopado ao implementar os híbridos (feito físico importante):** a densidade
total Σ\|hᵢ\|² é **isótropa** nos tres casos. A razón é teórica: un conxunto
ortonormal completo cumpre Σ\|hᵢ\|² = Σ\|baseᵢ\|², e a suma dos cadrados dun
subnivel completo é independente da dirección (verificado: Σ\|2p\|² = 4,4572·10⁻³
constante). Consecuencia de deseño: **o tetraedro non pode verse na
envolvente, só na cor**. Por iso se colorea polo híbrido dominante, e un test
verifica que esa asignación ten a xeometría correcta.

**Tests novos** (`hybridGeometry.test.ts`, 9 tests) que verifican a xeometría
como afirmación física independente: ángulos de **180° (sp)**, **120° (sp²)** e
**109,47° (sp³)** entre as direccións de máxima densidade de cada híbrido.

### Rolda 5 — transferencia de densidade e robustez da textura

**Causa raíz identificada e corrixida (rango dinámico).** A densidade |ψ|² dun
orbital con moitas capas abrangue **máis de 12 ordes de magnitude dentro da
caixa visible**: medido nun 7s, a densidade vai de 1,17·10⁻² no núcleo a
4,4·10⁻⁹ no bordo. Cunha potencia `v^γ` os valores pequenos quedan esmagados:
para levantar a media caixa a 0,3 faría falta γ ≈ 0,05, que satura case todo o
resto. A solución é unha **transferencia logarítmica**,
`stored = log(1+d/d_min)/log(1+d_max/d_min)`, co `d_min` tomado dun percentil
baixo da mostraxe real. Comprobación numérica da curva resultante nun 7s:

| r (a₀) | 0 | 10 | 40 | 82 | 120 | 137 |
|---|---|---|---|---|---|---|
| densidade | 1,2·10⁻² | 4,2·10⁻⁵ | 9,3·10⁻⁸ | 3,9·10⁻⁶ | 7,2·10⁻⁸ | 4,4·10⁻⁹ |
| valor almacenado | 1,000 | 0,803 | 0,588 | 0,719 | 0,580 | 0,482 |

É dicir: **todo o volume queda entre 0,48 e 1,00**, sen esmagar a cola.

**Robustez da textura (mellora real, independente do anterior).** A textura 3D
usaba `THREE.FloatType` con filtrado linear, que esixe a extensión
`OES_texture_float_linear`. Cando non está dispoñible —**moitas GPU móbiles e
Safari/iOS**— as mostras devolven 0 e o orbital vese negro **sen ningún erro en
consola**. Como a densidade xa está normalizada a [0,1], pasouse a
`UnsignedByteType`, soportado en todas partes; ademais a textura ocupa catro
veces menos memoria de GPU (1 MiB en vez de 4).

**Control de brillo na interface.** Engadiuse «Brillo da nube» nos axustes
avanzados, porque en orbitais con moitas capas cada mostra individual é débil e
convén poder subir a ganancia de acumulación sen tocar o código.

**Limitación de verificación (importante e honesta).** Nun 7s os datos de CPU
son correctos e a curva de transferencia está comprobada por cálculo, pero nas
capturas de Chrome headless con renderizado software (SwiftShader) o orbital
segue aparecendo como un punto duns 10 px, mentres o 1s ocupa 213×213 px. **Non
puiden determinar se isto é unha limitación do contorno de proba sen GPU ou un
defecto real**: xa ocorreu antes nesta auditoría que SwiftShader informase mal
dun shader correcto (o probe cunha cor constante devolvía 0 píxeles). A
validación final require un navegador con aceleración hardware.

### Rolda 6 — o erro de zoom (a causa real de «vésese minúsculo»)

**O usuario tiña razón e a causa era un erro de álgebra miño na rolda anterior.**
Ao facer a escala independente de `n` introducín:

```
worldScaleForRange(range) = (TARGET_WORLD_HALF_EXTENT * 2) / range
```

Pero a malla é un cubo **unitario** (`boxGeometry args={[1,1,1]}`), así que a súa
semiextensión en mundo é `escala × 0.5`, non `escala`. A semiextensión quedaba
en `TARGET / range` en vez de constante, e o resultado medido era:

| Orbital | Semiextensión en mundo | Fracción do alto da pantalla |
|---|---|---|
| 1s | 1,307 | 17,9% |
| 2s | 0,420 | 5,7% |
| 4s | 0,123 | 1,7% |
| **7s** | **0,044** | **0,6%** |

É dicir, **xusto o «nin o 1% da área visible»** que reportou o usuario. A
corrección é que a escala do cubo unitario sexa unha **constante** (`2 ×
TARGET = 12`), porque o rango físico xa está codificado na textura, non na
xeometría. Resultado medido: **95% do alto da pantalla para todos os orbitais**,
de 1s a 7s.

**Ademais, dúas correccións que fixeron falta só cando o orbital encheu a
pantalla** (antes eran invisibles porque o orbital era un punto):

- **Contraste.** A compresión logarítmica soa deixaba todo entre 0,48 e 1,00, e
  o 7s víase como unha masa azul plana. Engadiuse unha etapa de contraste
  (potencia 2,4 despois do log) que separa o medio sen volver esmagar a cola.
- **Acumulación de alfa.** O raio atravesa ~250 pasos dentro da caixa: cun alfa
  por paso de ~0,1 a acumulación satura en 10 pasos e todo se ve plano.
  Reducida a ~0,004 por paso, a integral varía suavemente coa densidade e as
  capas concéntricas do 7s vense.

**Lenda específica para a superposición de híbridos.** A lenda xeral amosaba os
símbolos +/− de fase, que non corresponden ás cores dos híbridos. Agora amosa
unha entrada numerada por híbrido coa súa cor e o nome da xeometría, e un test
comproba que as cores da lenda coinciden **exactamente** coas do shader — se
alguén cambia unha e esquece a outra, o test falla.

**Lección de método.** Este erro estivo presente durante tres roldas e non o
detectei porque **as miñas medicións estaban contaminadas**: medía píxeles de
toda a imaxe (incluíndo o texto do panel lateral e a gráfica) en vez de só o
lenzo 3D, e o selector CSS que usei para agochar a interface fallaba en
silencio. As cifras parecían plausibles e por iso non as cuestionei. A
medición correcta (recorte do rectángulo do lenzo vía `clip` do CDP) amosou o
erro de inmediato.

### Rolda 7 — convenio químico: z VERTICAL

**Petición do profesorado:** «o eixe z debe ser o que se amosa en vertical para
que os orbitais se vexan de pé». Correcto: é o convenio dos libros de texto.

Three.js usa por defecto `up = (0,1,0)`, que é o convenio dos gráficos 3D pero
**non** o da química. Cando o eixe vertical da pantalla é y, un 2p_z aparece
deitado e un d_z² perde a súa lectura característica. Corrección en
`CameraRig.tsx`:

- `camera.up.set(0, 0, 1)` — a vertical da cámara pasa a ser z.
- Dirección de vista inicial `(0.78, −0.56, 0.28)`: os tres eixes visibles, x
  cara á dereita, e a cámara **nunca sobre o eixe z** (iso faría ambigua a
  rotación da vista).
- O `up` fíxase **antes** de `lookAt`, e ambas as cousas antes de
  `controls.update()`, porque `OrbitControls` re-deriva a orientación.

**Defecto adicional atopado ao revisar isto:** as etiquetas dos eixes non
correspondían coas liñas do `AxesHelper`. Three.js pinta as liñas na orde x, y,
z con **vermello, verde e azul** (`node_modules/three/src/helpers/AxesHelper.js:26-30`),
pero eu etiquetara x en azul, y en vermello e z en verde — é dicir, **cada
etiqueta contradicía a súa propia liña**, o que é peor que non poñer ningunha.
Agora as etiquetas usan as mesmas cores ca as liñas.

**Encadre axustado a 2.4** (o cubo ocupa ~45% do alto): os orbitais con lóbulos
longos (p, d) estendíanse fóra do encadre co factor anterior.

**Verificación visual** (capturas do lenzo recortado): o 2p_z amosa os dous
lóbulos **empillados verticalmente** con nodo horizontal no medio; o 3d_z²
amosa os lóbulos sobre a vertical máis o **anel (toro) no plano xy** e os dous
nodos cónicos; o 1s é esférico e centrado.

### Melloras opcionais que quedan (fóra do alcance comprometido)

- **Validación visual nun navegador real** por parte do profesorado (o renderizado software do contorno de proba non pode xulgar aparencia estética).
- **Comparación 3D lado a lado** (a comparación actual é na gráfica, que é onde ten sentido sen dúas volumes solapados ilexibles).
- **Mapa de nodos en 3D** (planos nodais como xeometría translúcida): hoxe os nodos móstranse na gráfica e nos reconto de texto.
- **Contexto histórico-epistemolóxico** desenvolvido como sección propia (hoxe está dentro das ideas erróneas e das explicacións).

### Nota metodolóxica

Durante o traballo **catro sospeitas miñas de errores graves resultaron falsas** (normalización `(n+l)!`, recurrencia de Laguerre, etiquetas dos orbitais d, e un suposto bug de mostraxe do shader). As catro veces o código era correcto e o erro era da miña análise. Isto non é unha anécdota: é a razón pola que a suite de tests automatizados é o primeiro entregable e non o último. Un cálculo que non se pode comprobar non é fiable, aínda que sexa correcto.
