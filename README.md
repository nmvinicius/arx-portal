# ArxPortal

Portal de vendas e demonstração do **Arx** — a plataforma que vende **Infraestrutura**, **Segurança**, **Configuração** e **Suporte** para ferramentas open source/self-hosted.

> Filosofia: **Cloud Agnostic** · **Complice by Design**

## O que é o Arx

O Arx entrega, como serviço, ferramentas open source/self-hosted prontas para uso, operando sobre Kubernetes. Em vez de o cliente se preocupar em instalar, proteger, configurar e manter cada ferramenta, ele contrata o Arx e recebe a ferramenta funcionando — com infraestrutura, segurança, configuração e suporte inclusos.

### Pilares

| Pilar | O que cobre |
| --- | --- |
| **Infra** | Provisionamento e operação da infraestrutura (Kubernetes, banco, storage, rede) |
| **Sec** | Segurança: TLS, segredos, autenticação, atualizações e conformidade |
| **Conf** | Configuração e customização de cada ferramenta para o contexto do cliente |
| **Sup** | Suporte contínuo e evolução das ferramentas |

### Plataforma (rodando sobre Kubernetes)

- **OpenBao** — gestão de segredos
- **CertManager** — emissão e renovação automática de certificados TLS
- **StackGres** — operação de PostgreSQL em Kubernetes
- **PostgreSQL** — banco de dados
- **Keycloak** — identidade e autenticação (SSO)
- *(outros serviços são adicionados conforme a necessidade)*

### Catálogo de ferramentas

Exemplos de ferramentas entregues através do Arx:

- **Odoo** — ERP
- **Documenso** — assinatura digital de documentos
- **n8n** — automação de workflows

E o catálogo cresce com o tempo.

## Sobre o arx-portal

O `arx-portal` é a aplicação front-end que apresenta os produtos do Arx. É a vitrine usada pelo time de vendas: o vendedor acessa a plataforma e demonstra, de forma clara e visual, o que está sendo vendido.

## Stack técnica

- [Angular](https://angular.dev) 22 (standalone, signals, control flow nativo)
- [TypeScript](https://www.typescriptlang.org) 6
- [Tailwind CSS](https://tailwindcss.com) 4
- [Vitest](https://vitest.dev) (testes unitários)
- [pnpm](https://pnpm.io) (gerenciador de pacotes)

## Pré-requisitos

- Node.js 20+
- pnpm

## Desenvolvimento

Instale as dependências:

```bash
pnpm install
```

Inicie o servidor de desenvolvimento:

```bash
ng serve
```

Abra `http://localhost:4200/`. A aplicação recarrega automaticamente ao modificar os arquivos de código-fonte.

## Build

```bash
ng build
```

Os artefatos são gerados no diretório `dist/`.

## Testes

```bash
ng test
```

## Deploy no GitHub Pages

O deploy é feito por um workflow do GitHub Actions (`.github/workflows/deploy-pages.yml`) que:

1. Instala as dependências com `pnpm`.
2. Compila com `ng build --base-href=/arx-portal/` (o `base-href` aponta para o subdiretório do repositório).
3. Copia `index.html` para `404.html` — assim rotas diretas como `/v/ABC12` caem no app mesmo sem suporte a SPA no servidor.
4. Publica o diretório `dist/arx-portal/browser` como site estático.

Para habilitar:

1. No GitHub, acesse **Settings → Pages** e selecione a fonte **GitHub Actions**.
2. Faça push para a branch `main` (ou rode o workflow manualmente pela aba **Actions**).

O site fica disponível em `https://<usuário>.github.io/arx-portal/`.

> Se o repositório tiver outro nome, ajuste o `--base-href` no workflow para `/nome-do-repo/`.

## Tela de vendas por código (parceiros)

Cada parceiro de vendas tem um código curto configurado em `public/config.json`, na seção `sales`:

```json
{
  "sales": {
    "enabled": true,
    "agents": [
      { "code": "AX92K", "name": "Maria Souza", "commission": 0.1 },
      { "code": "BR71P", "name": "João Lima", "commission": 0.15 }
    ]
  }
}
```

- `code` — código de 5 caracteres (letras e números) que vai no link.
- `name` — nome exibido na tela de vendas.
- `commission` — participação somada ao valor final (`0.1` = 10%).

O link compartilhado é:

```
https://<usuário>.github.io/arx-portal/v/AX92K
```

Ao abrir o link, o parceiro cai direto no simulador de preços já com a participação dele somada ao total (o valor exibido no resumo e na proposta já inclui a comissão). Links sem código ou com código inexistente mostram os preços normais, sem comissão.

## Proposta assinada e integridade do config

O `config.json` é a fonte dos preços. Para evitar que alguém altere o JSON no navegador (DevTools) e gere uma proposta com valores falsos, o build:

1. **Mascara** o `config.json` publicado — o arquivo servido é cifrado com AES-256-GCM (`arx2:iv.tag.data`). A chave **não fica no código**: em CI ela é injetada a partir do secret `CONFIG_KEY` (`src/app/shared/config/key.ts` guarda apenas um placeholder). O conteúdo continua editável em `public/config.json`, mas só é reempacotado no build (`pnpm build` já roda o `ng build` + a máscara).
2. **Publica um fingerprint** (`config.meta.json`) com o sha256 da forma canônica do config.

### Configurando a chave (secret)

Gere a chave e registre como secret do repositório:

```bash
gh secret set CONFIG_KEY --body "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
```

No build, o `scripts/inject-key.mjs` substitui o placeholder de `key.ts` pela chave do secret. Em CI a chave é obrigatória (sem ela o build falha); localmente o placeholder é mantido e o `config.json` de dev segue em texto puro.

Ao clicar em **Assinar proposta** no simulador, o app:

- Verifica se o config em memória bate com o fingerprint publicado;
- Se bater, gera um payload codificado com os valores **e** o fingerprint;
- Navega para `/proposta?d=<payload>`, onde a proposta pode ser conferida, copiada (link assinado) ou enviada por e-mail.

Se o JSON tiver sido alterado no navegador, o simulador bloqueia a assinatura (alerta) e a página de proposta não confirma a integridade. Para conferir uma proposta recebida, compare o fingerprint exibido com o hash do seu `config.json` canônico (`pnpm mask-config` imprime o hash no build).

> Limite do modelo estático: o navegador precisa dos dados para calcular os preços, então o mascaramento é obfuscação (não criptografia). A garantia de não-adulteração vem do fingerprint.

## Estrutura do projeto

```
arx-portal/
├── public/            # assets estáticos
├── src/
│   ├── app/           # componentes, rotas e configuração da aplicação
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── docs/
│   └── design-system.md   # identidade visual da plataforma
├── AGENTS.md          # convenções de código (para agentes de IA e devs)
├── angular.json
└── package.json
```

## Convenções de código

As convenções e boas práticas do projeto estão documentadas em [`AGENTS.md`](./AGENTS.md).

## Identidade visual

As decisões de identidade visual (cores, tipografia, ícones, tema e padrões de componentes) estão em [`docs/design-system.md`](./docs/design-system.md).

## Recursos adicionais

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Documentação do Angular](https://angular.dev)
