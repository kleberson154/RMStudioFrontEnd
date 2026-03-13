# Relatório do Projeto — RM Studio (Frontend)

## Visão Geral

O **RM Studio** é uma aplicação web para agendamento de serviços de salão de beleza. O sistema permite que clientes visualizem os serviços oferecidos, selecionem data e horário disponíveis, preencham seus dados e confirmem um agendamento online. O frontend consome uma API REST rodando em `http://localhost:3001`.

---

## Tecnologias Utilizadas

### Linguagem e Ambiente

| Tecnologia        | Versão | Finalidade                                                                |
| ----------------- | ------ | ------------------------------------------------------------------------- |
| **TypeScript**    | ~5.9.3 | Linguagem principal — tipagem estática e segurança em tempo de compilação |
| **Node.js / npm** | —      | Gerenciamento de pacotes e execução do ambiente de desenvolvimento        |

### Build e Bundler

| Tecnologia               | Versão | Finalidade                                            |
| ------------------------ | ------ | ----------------------------------------------------- |
| **Vite**                 | ^7.3.1 | Bundler e servidor de desenvolvimento com hot-reload  |
| **@vitejs/plugin-react** | ^5.1.1 | Integração do React com o Vite (Babel + Fast Refresh) |

### Interface e Roteamento

| Tecnologia           | Versão  | Finalidade                                                                       |
| -------------------- | ------- | -------------------------------------------------------------------------------- |
| **React**            | ^19.2.0 | Biblioteca principal de UI baseada em componentes                                |
| **React DOM**        | ^19.2.0 | Renderização do React no DOM do navegador                                        |
| **React Router DOM** | ^7.13.0 | Roteamento client-side com 3 rotas (`/`, `/agendamento`, `/agendamento/sucesso`) |

### Estilização

| Tecnologia            | Versão   | Finalidade                                                   |
| --------------------- | -------- | ------------------------------------------------------------ |
| **Tailwind CSS**      | ^4.1.18  | Framework CSS utilitário — responsividade e design system    |
| **@tailwindcss/vite** | ^4.1.18  | Plugin oficial do Tailwind para integração com o Vite        |
| **PostCSS**           | ^8.5.6   | Pipeline de transformações CSS                               |
| **Autoprefixer**      | ^10.4.24 | Adiciona prefixos CSS para compatibilidade entre navegadores |

### Componentes e Bibliotecas de UI

| Tecnologia           | Versão   | Finalidade                                                 |
| -------------------- | -------- | ---------------------------------------------------------- |
| **Lucide React**     | ^0.563.0 | Ícones SVG (Clock, Mail, Phone, Instagram, Facebook, etc.) |
| **React Day Picker** | ^9.14.0  | Calendário interativo para seleção de datas de agendamento |

### Comunicação com API e Serviços

| Tecnologia           | Versão  | Finalidade                                                        |
| -------------------- | ------- | ----------------------------------------------------------------- |
| **Axios**            | ^1.13.5 | Cliente HTTP para comunicação com a API REST do backend           |
| **@emailjs/browser** | ^4.4.1  | Envio de e-mails diretamente do navegador (formulário de contato) |
| **date-fns**         | ^4.1.0  | Formatação e manipulação de datas (locale pt-BR)                  |

### Testes e Qualidade de Código

| Tecnologia                      | Versão  | Finalidade                                      |
| ------------------------------- | ------- | ----------------------------------------------- |
| **Vitest**                      | ^3.2.4  | Framework de testes unitários integrado ao Vite |
| **ESLint**                      | ^9.39.1 | Linting e padronização de código                |
| **typescript-eslint**           | ^8.48.0 | Regras ESLint específicas para TypeScript       |
| **eslint-plugin-react-hooks**   | ^7.0.1  | Validação do uso correto de Hooks do React      |
| **eslint-plugin-react-refresh** | ^0.4.24 | Compatibilidade com React Fast Refresh          |

---

## Estrutura do Projeto

```
frontend/
├── public/                    # Ativos estáticos (logo, imagens)
├── src/
│   ├── assets/                # Imagens e SVGs importados nos componentes
│   ├── components/            # Componentes da landing page
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Promotion.tsx
│   │   ├── Contact.tsx
│   │   └── agendamento/       # Sub-componentes do formulário de agendamento
│   │       ├── ClientFields.tsx
│   │       ├── ServicesSection.tsx
│   │       ├── CalendarSection.tsx
│   │       └── TimeSelector.tsx
│   ├── hooks/                 # Lógica de negócio extraída em Hooks customizados
│   │   ├── useAgendamentoData.ts
│   │   ├── useAppointmentSchedule.ts
│   │   ├── useAppointmentSchedule.test.ts
│   │   └── useSelectedServicesSummary.ts
│   ├── pages/                 # Páginas roteadas
│   │   ├── Agendamento.tsx
│   │   └── AgendamentoSucesso.tsx
│   ├── services/              # Camada de integração com a API
│   │   ├── api.ts
│   │   ├── servicos.ts
│   │   └── agendaConfig.ts
│   ├── subComponents/         # Componentes reutilizáveis genéricos
│   │   ├── Card.tsx
│   │   └── Link.tsx
│   ├── utils/                 # Funções utilitárias puras
│   │   ├── cpf.ts
│   │   ├── phone.ts
│   │   └── name.ts
│   ├── App.tsx                # Configuração de rotas
│   ├── main.tsx               # Ponto de entrada da aplicação
│   └── style.css              # Estilos globais e configuração do Tailwind
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## O Que Foi Desenvolvido

### 1. Landing Page (Página Inicial)

A página principal (`/`) apresenta o salão com as seguintes seções:

- **Header** — Barra superior com informações de contato (e-mail, telefone, WhatsApp), links para redes sociais (Instagram, Facebook) e menu de navegação responsivo com toggle mobile.
- **Home** — Seção hero com imagem de fundo, tagline do salão e botão de chamada para ação ("Agendar agora") que redireciona para `/agendamento`.
- **About** — Seção institucional com apresentação do salão e quatro cartões de diferenciais (Equipamentos, Hidratação, Corte, Limpeza).
- **Services** — Lista de serviços carregada dinamicamente via `GET /servicos`, exibindo apenas serviços ativos (`ativo === true`) em cards com nome, descrição e preço.
- **Promotion** — Seção de promoções visuais.
- **Contact** — Formulário de contato integrado com o **EmailJS** para envio de mensagens ao e-mail do salão, além de botões de contato direto via telefone, WhatsApp e e-mail.
- **Footer** — Coluna com logo e descrição do salão, links de navegação e lista dinâmica dos 5 primeiros serviços cadastrados.

---

### 2. Página de Agendamento (`/agendamento`)

Formulário completo para criação de agendamentos com Header e Footer. A página foi organizada em **4 sub-componentes** independentes:

#### ClientFields — Dados do Cliente

- Campos: Nome completo, CPF e Telefone.
- Validação em tempo real com borda vermelha nos campos inválidos.
- Formatação automática: CPF (`XXX.XXX.XXX-XX`) e Telefone (`(XX) XXXXX-XXXX`).
- Capitalização automática do nome.
- Verificação assíncrona de CPF pendente: assim que o CPF é digitado e válido, o sistema consulta `GET /agendamentos/cpf/{cpf}/pendente` e bloqueia o formulário se já houver um agendamento ativo para aquele CPF.

#### ServicesSection — Seleção de Serviços

- Exibe os serviços disponíveis como botões selecionáveis.
- Permite selecionar até 3 serviços simultaneamente.
- Exibe em tempo real o resumo: duração total formatada (ex.: "1h 30min") e preço total acumulado.

#### CalendarSection — Seleção de Data

- Calendário interativo com janela de agendamento de `hoje +1` até `+30 dias`.
- Desabilita automaticamente: domingos e segundas-feiras (dias fechados), datas bloqueadas pela agenda do backend (`GET /datas`), e datas sem nenhum horário disponível para a duração dos serviços selecionados.
- Suporte a horários personalizados por data (`GET /datas/horarios`).

#### TimeSelector — Seleção de Horário

- Dropdown com os horários disponíveis para a data e duração selecionadas.
- Exibe o horário de início e término calculado (ex.: "09:00 até 10:00").
- Fica desabilitado até que uma data seja selecionada.
- Garante que serviços de múltiplas horas disponham de **blocos contínuos** sem ocupações entre o início e o fim.

#### Validações no Submit

Antes de criar o agendamento, o sistema valida:

1. Nome com sobrenome completo
2. CPF válido (formato + dígitos verificadores)
3. Telefone válido (DDD + 8-9 dígitos)
4. Ao menos 1 serviço selecionado
5. Data e horário selecionados
6. Ausência de agendamento pendente
7. Disponibilidade do horário em tempo real (`GET /agendamentos/{data}/{horario}`)

#### Envio com Fallbacks de Formato

O backend exigia formatos específicos para data e horário. Foi implementada lógica de **tentativas em cascata**:

- **Data:** Tenta primeiro `"2026-03-24T00:00:00"` (sem timezone, interpretada como hora local no Node.js, evitando o bug de fuso UTC-3) e, se falhar, `"2026-03-24"`.
- **Horário:** Tenta `"09:00"`, depois `"9:00"` (sem zero à esquerda, necessário porque o backend comparava strings e rejeitar `"09:00"` como inválido) e por fim `"09:00:00"`.

---

### 3. Página de Sucesso (`/agendamento/sucesso`)

Página exibida após a confirmação do agendamento, com Header e Footer. Contém:

- Ícone de check verde.
- Mensagem de confirmação do agendamento.
- Botão "Voltar para a página inicial" que redireciona para `/`.

---

### 4. Hooks Customizados

#### `useAgendamentoData`

Carrega em paralelo (via `Promise.allSettled`) o catálogo de serviços e a configuração da agenda, tolerando falhas parciais. Expõe estados de carregamento e erro separados para cada fonte de dados.

#### `useAppointmentSchedule`

Contém toda a lógica complexa de disponibilidade de horários:

- Busca horários ocupados do backend para a data selecionada.
- Gera a grade de horários padrão (09h–17h excluindo 12h) ou usa horários personalizados por data.
- Filtra horários que não possuem bloco contínuo suficiente para a duração total dos serviços selecionados.
- Recalcula a cada troca de data ou serviços.

#### `useSelectedServicesSummary`

Calcula de forma memoizada (via `useMemo`) a duração total em minutos, a quantidade de blocos hora necessários e o preço total dos serviços selecionados.

---

### 5. Camada de Serviços e Utilitários

- **`api.ts`** — Instância global do Axios com a base URL da API.
- **`servicos.ts`** — Normaliza a resposta de `GET /servicos` aceitando múltiplas variações de nomes de campos (`preco|valor|price`, `duracaoMinutos|duracao|minutos`, etc.).
- **`agendaConfig.ts`** — Parseia configuração de agenda aceitando datas em `dd/MM/yyyy` e `yyyy-MM-dd`, objetos e arrays na resposta do backend. Injeta automaticamente o token de autenticação do `localStorage`/`sessionStorage` nos headers das requisições autenticadas.
- **`cpf.ts`** — Formatação, extração de dígitos e validação completa de CPF (incluindo cálculo dos dígitos verificadores).
- **`phone.ts`** — Formatação e validação de telefone brasileiro.
- **`name.ts`** — Capitalização e validação de nome completo (mínimo nome + sobrenome).

---

### 6. Testes Unitários

Foi criado o arquivo `src/hooks/useAppointmentSchedule.test.ts` com testes usando **Vitest**, validando que o algoritmo de blocos contínuos funciona corretamente. Exemplo testado: um serviço de 3h não deve oferecer início às 14:00, 15:00 ou 16:00 quando o horário 16:00 já está ocupado.

---

## Rotas da Aplicação

| Rota                   | Componente           | Descrição                      |
| ---------------------- | -------------------- | ------------------------------ |
| `/`                    | `BookingPage`        | Landing page completa do salão |
| `/agendamento`         | `Agendamento`        | Formulário de agendamento      |
| `/agendamento/sucesso` | `AgendamentoSucesso` | Confirmação pós-agendamento    |

---

## Integração com o Backend

O frontend se comunica com a API REST via os seguintes endpoints:

| Método | Endpoint                           | Finalidade                       |
| ------ | ---------------------------------- | -------------------------------- |
| `GET`  | `/servicos`                        | Listar catálogo de serviços      |
| `GET`  | `/datas`                           | Datas bloqueadas na agenda       |
| `GET`  | `/datas/horarios`                  | Horários personalizados por data |
| `GET`  | `/agendamentos/{data}`             | Horários ocupados numa data      |
| `GET`  | `/agendamentos/{data}/{horario}`   | Verificar disponibilidade        |
| `GET`  | `/agendamentos/cpf/{cpf}/pendente` | Verificar agendamento pendente   |
| `POST` | `/agendamentos`                    | Criar novo agendamento           |

---

## Considerações Técnicas Relevantes

- **Bug de timezone corrigido:** O Node.js interpreta strings no formato `"YYYY-MM-DD"` como UTC meia-noite. No fuso UTC-3 do Brasil, isso fazia o dia 24 ser lido como dia 23 (segunda-feira), rejeitando o agendamento. A solução foi enviar `"YYYY-MM-DDTHH:mm:ss"` (sem timezone), que o ECMAScript interpreta como horário local.
- **Normalização de horários:** O backend comparava o horário como string e rejeitava `"09:00"` (com zero à esquerda). O frontend tenta múltiplos formatos em cascata.
- **Design responsivo:** A aplicação foi desenvolvida com abordagem mobile-first usando Tailwind CSS, adaptando layout, tipografia e navegação para diferentes tamanhos de tela.
