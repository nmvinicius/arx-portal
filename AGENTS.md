Você é um especialista em TypeScript, Angular e desenvolvimento web escalável. Escreva código funcional, de fácil manutenção, performático e acessível, seguindo as boas práticas de Angular e TypeScript.

## Boas práticas de TypeScript

- Use checagem de tipos estrita (`strict`)
- Prefira inferência de tipos quando o tipo for óbvio
- Evite o tipo `any`; use `unknown` quando o tipo for incerto

## Boas práticas de Angular

- Sempre use componentes standalone em vez de NgModules
- NÃO defina `standalone: true` dentro dos decorators do Angular. É o padrão no Angular v20+
- NÃO defina `changeDetection: ChangeDetectionStrategy.OnPush` explicitamente. `OnPush` é o padrão no Angular v22+
- Use signals para gerenciamento de estado
- Implemente lazy loading para rotas de funcionalidades
- NÃO use os decorators `@HostBinding` e `@HostListener`. Coloque os host bindings dentro do objeto `host` do decorator `@Component` ou `@Directive`
- Use `NgOptimizedImage` para todas as imagens estáticas
  - `NgOptimizedImage` não funciona com imagens base64 inline

## Requisitos de acessibilidade

- DEVE passar em todas as verificações do AXE
- DEVE seguir os mínimos de WCAG AA, incluindo gerenciamento de foco, contraste de cores e atributos ARIA

### Componentes

- Mantenha componentes pequenos e focados em uma única responsabilidade
- Use as funções `input()` e `output()` em vez de decorators
- Use `model()` para propriedades two-way bound com a sintaxe `[(prop)]`, em vez de combinar `input()` com `output()`
- Use `computed()` para estado derivado
- Use `linkedSignal()` para estado derivado de múltiplas fontes reativas que devem permanecer sincronizadas
- Prefira templates inline para componentes pequenos
- Prefira Signal Forms (`@angular/forms/signals`) para novos formulários. São estáveis no Angular v22+ e oferecem estado baseado em signals, acesso a campos com tipagem segura e validação por schema
- Quando não usar Signal Forms, prefira Reactive Forms em vez de Template-driven
- NÃO use `ngClass`; use class bindings
- NÃO use `ngStyle`; use style bindings
- NÃO importe `CommonModule`; importe apenas as diretivas e pipes que o template usa, como `AsyncPipe` ou `DatePipe`
- Ao usar templates/styles externos, use caminhos relativos ao arquivo TS do componente

## Gerenciamento de estado

- Use signals para estado local do componente
- Use `computed()` para estado derivado
- Mantenha transformações de estado puras e previsíveis
- NÃO use `mutate` em signals; use `update` ou `set`

## Templates

- Mantenha templates simples e evite lógica complexa
- Use control flow nativo (`@if`, `@for`, `@switch`) em vez de `*ngIf`, `*ngFor`, `*ngSwitch`
- Use o async pipe para lidar com observables
- Não assuma que globals (como `new Date()`) estão disponíveis

## Services

- Projete services com uma única responsabilidade
- Use a opção `providedIn: 'root'` para services singleton
- Prefira o decorator `@Service` em vez de `@Injectable({providedIn: 'root'})` para novos services singleton (Angular v22+)
- Use a função `inject()` em vez de injeção via construtor
