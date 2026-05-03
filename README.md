# Sistema de Ponto Eletrônico

Sistema web de controle de jornada de trabalho baseado em arquitetura serverless, desenvolvido para registro de ponto eletrônico com cálculo automático de horas trabalhadas e banco de horas.

## 📋 Sobre o Projeto

Aplicação de ponto eletrônico para controle de jornada de trabalho conforme legislação brasileira (CLT), com foco em:

- Interface simplificada e responsiva
- Cálculo automático de horas trabalhadas, intervalo e banco de horas
- Espelho de ponto mensal com exportação para impressão
- Gestão de lançamentos (férias, atestados, compensações e feriados)
- Conformidade com legislação trabalhista brasileira

## 🚀 Funcionalidades

### Tela do Funcionário
- Registro de entrada, início/fim de intervalo e saída
- Relógio em tempo real
- Visualização do status do dia
- Fluxo guiado para evitar registros incorretos

### Tela do Gestor
- Espelho de ponto mensal completo (todos os dias do mês)
- Cálculo automático de horas trabalhadas e saldo diário
- Resumo mensal: horas previstas, trabalhadas e saldo
- Painel de banco de horas anual
- Lançamento de férias, compensações, atestados e feriados
- Edição manual de registros (correções)
- Impressão formatada em A4

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**
- **Bootstrap 5** via CDN (interface responsiva)
- Design otimizado para dispositivos móveis (Android)
- CSS @media print para formatação de impressão A4

### Backend
- **Cloudflare Workers** (API serverless)
- **Cloudflare KV** (armazenamento chave-valor)
- Autenticação via validação de origem (CORS)

### Hospedagem
- **GitHub Pages** (frontend estático)
- **Cloudflare** (infraestrutura de borda global)

## 📐 Arquitetura
