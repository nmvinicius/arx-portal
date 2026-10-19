# Design System — Arx

Este documento define a identidade visual da plataforma **Arx**. Toda nova interface deve seguir estas regras. Os tokens aqui descritos já estão implementados em `src/styles.css` (Tailwind CSS v4) e nos componentes.

## 1. Princípios

A identidade segue a direção **Steel & Signal**:

- **Steel** — neutros frios (zinc/grafite) como base. Sóbrio, técnico, sem ruído visual.
- **Signal** — um único acento saturado (laranja-sinal) para guiar o olhar e marcar a marca.
- **Simple by Design** — sem gradientes, sem glassmorphism, sem enfeite. Hierarquia clara e espaço em branco.

Regras de ouro:

1. Um acento só: o `signal`. Nada de roxo, azul-violeta ou gradientes.
2. Dark/light sempre funcionando — nunca desenhe pensando só em um tema.
3. Tipografia com personalidade: display técnico + mono para dados/labels.

## 2. Paleta de cores

### Marca — Signal

Escala completa (definida como `--color-signal-*` no `@theme`):

| Token | Hex | Uso típico |
| --- | --- | --- |
| `signal-50` | `#fff5ed` | fundo de destaque (light) |
| `signal-100` | `#ffe8d4` | fundo de destaque |
| `signal-200` | `#ffcda8` | bordas de destaque |
| `signal-300` | `#ffab70` | — |
| `signal-400` | `#ff7d37` | acento em fundo escuro |
| **`signal-500`** | **`#ff520e`** | **cor primária da marca** |
| `signal-600` | `#f03904` | acento/texto em fundo claro |
| `signal-700` | `#c72a06` | hover |
| `signal-800` | `#9e230d` | — |
| `signal-900` | `#7f200e` | — |
| `signal-950` | `#450d05` | — |

- Em **fundo claro**, use `signal-600` para texto/ícones (contraste AA).
- Em **fundo escuro**, use `signal-400` para texto/ícones (contraste AA).

### Neutros — Zinc

Usamos a escala `zinc` padrão do Tailwind como neutro frio.

| Papel | Light | Dark |
| --- | --- | --- |
| Fundo da página | `bg-zinc-50` | `bg-zinc-950` |
| Fundo de superfície (cards) | `bg-zinc-50` / `bg-white` | `bg-zinc-950` / `bg-zinc-900` |
| Texto principal | `text-zinc-900` | `text-zinc-100` |
| Texto secundário | `text-zinc-600` | `text-zinc-300` |
| Texto terciário / muted | `text-zinc-500` | `text-zinc-400` |
| Borda | `border-zinc-200` | `border-zinc-800` |
| Divisor / grid sutil | `bg-zinc-200` | `bg-zinc-800` |

### Semânticas

Cores de estado usam as escalas padrão do Tailwind (sem customização ainda):

- **Sucesso**: `emerald` (`emerald-600` light / `emerald-400` dark)
- **Atenção**: `amber` (`amber-600` light / `amber-400` dark)
- **Erro**: `rose` (`rose-600` light / `rose-400` dark)

## 3. Tipografia

Duas famílias, papéis bem definidos:

| Token Tailwind | Fonte | Papel |
| --- | --- | --- |
| `font-display` | **Space Grotesk Variable** | Títulos, wordmark, números de destaque |
| `font-sans` | **Space Grotesk Variable** | Corpo e UI em geral |
| `font-mono` | **IBM Plex Mono** | Eyebrows, labels, dados técnicos, footer |

Fontes instaladas via Fontsource (arquivos registrados em `angular.json`).

### Hierarquia

| Elemento | Classes |
| --- | --- |
| Título principal (h1) | `font-display text-4xl font-semibold tracking-tight sm:text-6xl` |
| Título de card (h3) | `font-display text-lg font-semibold` |
| Eyebrow / label de seção | `font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400` |
| Corpo | `text-base` / `text-lg` com `text-zinc-600 dark:text-zinc-300` |

### Regras

- Títulos: sempre `font-display`, `tracking-tight`, peso `semibold` (500–600).
- Labels técnicos/eyebrows: `font-mono`, maiúsculas, letter-spacing largo.
- Nunca misture famílias no mesmo elemento.

## 4. Iconografia — Lucide

Usamos **Lucide** via [`ng-icons`](https://ng-icons.github.io/ng-icons/) (`@ng-icons/core` + `@ng-icons/lucide`).

- Registro global em `app.config.ts` via `provideIcons({ ... })`.
- Uso: `<ng-icon name="lucideShieldCheck" size="20" />`.

### Tamanhos

| Contexto | `size` |
| --- | --- |
| Ícone do wordmark | `20` |
| Ícone de card/pilar | `24` |
| Chip de serviço | `16` |

### Cor

Ícones herdam `currentColor` — controle com classes de texto, nunca com `fill`/`stroke` direto:

```html
<ng-icon name="lucideServer" size="24" class="text-signal-600 dark:text-signal-400" />
```

### Mapeamento do domínio

| Conceito | Ícone |
| --- | --- |
| Infra | `lucideServer`, `lucideBoxes`, `lucideNetwork` |
| Sec | `lucideShieldCheck`, `lucideLock`, `lucideKeyRound`, `lucideFingerprint` |
| Conf | `lucideSlidersHorizontal`, `lucideSettings2`, `lucideWorkflow` |
| Sup | `lucideHeadset`, `lucideLifeBuoy`, `lucideBadgeCheck` |
| OpenBao | `lucideKeyRound` |
| CertManager | `lucideShieldCheck` |
| PostgreSQL / StackGres | `lucideDatabase` |
| Keycloak | `lucideFingerprint` |
| Nginx API Gateway | `lucideNetwork` |
| Redis | `lucideZap` |
| MinIO | `lucideHardDrive` |
| RabbitMQ | `lucideMessagesSquare` |
| Prometheus | `lucideActivity` |
| Grafana | `lucideGauge` |
| Loki | `lucideScrollText` |
| Odoo | `lucideBoxes` |
| Documenso | `lucideFileCheck` |
| n8n | `lucideWorkflow` |
| Nextcloud | `lucideCloud` |
| Paperless-ngx | `lucideScanText` |
| Metabase | `lucideBarChart3` |
| Cal.com | `lucideCalendarClock` |
| Outline | `lucideBookOpen` |

> Regra: **um único set de ícones** em toda a interface. Não misture Lucide com outros sets.

## 5. Tema — Light e Dark

O tema é automático via `prefers-color-scheme` (a variant `dark:` do Tailwind v4 usa isso por padrão).

- `styles.css` define `html { color-scheme: light dark; }` — controles nativos e scrollbars seguem o tema.
- Base do `body`: `bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`.
- Toda a interface é desenhada **uma vez** com variantes `dark:*`.

Exemplo:

```html
<article class="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
  ...
</article>
```

> Para um toggle manual futuro: trocar a variant `dark` por `@custom-variant dark (&:where(.dark, .dark *))` e controlar a classe `.dark` no `<html>`.

## 6. Espaçamento, raio e sombras

- **Espaçamento**: escala padrão do Tailwind (base 4px). Seções usam `py-20 sm:py-28` (hero) e `py-10` (blocos).
- **Raio**:
  - Botões/inputs: `rounded-md`
  - Cards: `rounded-lg`
  - Chips/badges/pills: `rounded-full`
- **Sombras**: evitar sombras pesadas. Preferir **borda + fundo** para separar superfícies. Quando necessário, `shadow-sm`.

## 7. Padrões de componentes

### Botão primário

```html
<a class="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50
          hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
  Ação
</a>
```

### Botão secundário

```html
<a class="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium
          hover:border-zinc-400 hover:bg-zinc-100
          dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900">
  Ação
</a>
```

### Card (grade com divisores de 1px)

```html
<div class="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200
            dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
  <article class="bg-zinc-50 p-6 dark:bg-zinc-950">
    <!-- ícone + título + descrição -->
  </article>
</div>
```

### Chip / badge de serviço

```html
<li class="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-1.5 text-sm
           dark:border-zinc-800">
  <ng-icon name="lucideDatabase" size="16" class="text-zinc-500 dark:text-zinc-400" />
  PostgreSQL
</li>
```

## 8. Motion

Animações com [anime.js](https://animejs.com/) v4, sempre sutis e a serviço da hierarquia — nunca gratuitas.

- **Reveal no scroll** — diretiva `appReveal` (`src/app/shared/animations/reveal.directive.ts`):
  - Elemento único: `<div appReveal>`
  - Filhos com stagger: `<div appReveal appRevealStagger="article">`
  - Inputs: `[appRevealY]`, `[appRevealDelay]`, `[appRevealStaggerDelay]`
- **Loop decorativo** — `app-signal-bars` (equalizador no hero).
- **Duração/easing padrão**: `720ms` / `outExpo` (reveal) e `850ms` / `inOutSine` (loop).
- **Reduced motion**: toda animação é desativada quando `prefers-reduced-motion: reduce` — o conteúdo fica visível, sem movimento.

Regras:

1. Use animações apenas para **revelar** conteúdo ou dar **feedback** sutil.
2. Sempre respeite `prefers-reduced-motion`.
3. Prefira `opacity` + `translateY` (composição barata na GPU).

## 9. Acessibilidade

Requisitos obrigatórios (WCAG AA + AXE):

- **Contraste**: texto `signal-600` sobre `zinc-50` e `signal-400` sobre `zinc-950` atendem AA. Nunca usar `signal-500` como texto sobre fundo claro.
- **Foco visível**: todo elemento interativo precisa de anel de foco. Usar `focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:ring-offset-2`.
- **HTML semântico**: `header`, `nav`, `main`, `section`, `footer`, `h1–h3` em ordem.
- **Ícones decorativos**: `aria-hidden="true"`; quando significativos, fornecer label via `aria-label`.
- **Imagens**: sempre `NgOptimizedImage` (com `alt`), exceto base64 inline.

## 10. Referência rápida

| Decisão | Valor |
| --- | --- |
| Direção | Steel & Signal |
| Cor primária | `#ff520e` (`signal-500`) |
| Neutro | `zinc` |
| Display/UI | Space Grotesk Variable |
| Mono | IBM Plex Mono |
| Ícones | Lucide (`@ng-icons/lucide`) |
| Tema | Light/dark automático (`prefers-color-scheme`) |
| Raio | `rounded-md` / `rounded-lg` / `rounded-full` |
