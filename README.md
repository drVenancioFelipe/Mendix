# 🏦 BDMG Low-Code - Sistema de Avaliação de Fornecedores

Este repositório contém a especificação técnica e um protótipo funcional do **Sistema de Gestão e Reputação de Fornecedores**, desenvolvido em alinhamento com a iniciativa de contratação de plataforma low-code (Mendix) pelo **BDMG (Banco de Desenvolvimento de Minas Gerais)** no ecossistema **Microsoft Azure**.

Como o Mendix é uma plataforma low-code com IDE gráfica proprietária e arquivos de modelo binários (`.mpr`), este repositório serve como base técnica híbrida contendo:
1.  **Protótipo Frontend Interativo (`HTML5/CSS3/VanillaJS`)**: Demonstração de UX/UI ágil de alta fidelidade e simulação de consumo da API do ReclameAqui.
2.  **Mendix Blueprint (`mendix_blueprint.md`)**: Documentação passo a passo detalhando entidades, enumerações, lógica de microflows e mapeamentos de integração REST necessários para recriar o sistema no Mendix Studio Pro.

---

## ⚡ Funcionalidades do Protótipo

A interface foi projetada seguindo as melhores práticas de design moderno, focando em simplicidade, agilidade e objetividade:

*   **Painel de Controle Financeiro (Tema Escuro/FinTech)**: Design moderno com cores corporativas do ecossistema BDMG, micro-animações de transição e responsividade completa.
*   **Operações CRUD de Fornecedores**:
    *   **Cadastro (Create)**: Formulário com máscara de CNPJ automática e validações de preenchimento.
    *   **Consulta (Read)**: Cards interativos contendo dados cadastrais, nota interna atribuída pelo BDMG e badges de reputação.
    *   **Edição (Update)**: Permite alterar a categoria do serviço, pareceres técnicos e avaliações.
    *   **Remoção (Delete)**: Exclusão com caixa de diálogo de confirmação.
*   **Simulador de API do ReclameAqui**:
    *   Mecanismo de busca assíncrona que simula o consumo de API Rest em tempo real para CNPJs/Nomes de empresas conhecidas no cenário brasileiro (ex: *Cemig, Copasa, Totvs, Stefanini, Localiza*), retornando a nota atual e o status de reputação corporativa (RA1000, Ótimo, Regular, etc.).
*   **Filtros & Busca Avançada**:
    *   Barra de pesquisa instantânea para busca por CNPJ, Nome Fantasia ou Categoria.
    *   Dropdown de filtragem rápida pelo status de reputação do ReclameAqui.
*   **Segurança (Captcha "I am human")**:
    *   Interceptador inteligente que bloqueia ações de busca e filtragem até que o usuário resolva o Captcha.
    *   Estilo visual moderno (estilo reCAPTCHA/hCaptcha) com feedback visual de carregamento e sucesso.
    *   **Persistência via Cookie**: O estado verificado é salvo em cookie do navegador por 24 horas, evitando interrupções em acessos recorrentes durante a mesma sessão de trabalho.


---

## 📂 Estrutura do Projeto

*   `index.html` — Estrutura semântica e esqueleto visual da aplicação.
*   `style.css` — Estilização Vanilla CSS moderna (Glassmorphism, custom scrollbars, layout responsivo e flexível).
*   `app.js` — Lógica do CRUD, persistência de dados em `LocalStorage` e simulação da API.
*   `mendix_blueprint.md` — Especificação técnica detalhada das entidades e regras do Mendix.
*   `.gitignore` — Exclusões de versionamento para arquivos temporários de sistemas operacionais e pastas de compilação da plataforma Mendix.

---

## 🚀 Como Executar o Protótipo Localmente

Para rodar a interface e testar os fluxos de CRUD e a simulação de integração com a API:

1.  Faça o clone deste repositório ou baixe os arquivos em sua máquina local.
2.  Dê dois cliques sobre o arquivo **`index.html`** para abri-lo diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).
3.  *Opcional*: Se preferir rodar com um servidor de desenvolvimento local (Live Server no VS Code, ou `python -m http.server 8000`), a aplicação funcionará perfeitamente.

---

## 🎨 Especificações Técnicas Mendix (Resumo)

O arquivo [mendix_blueprint.md](mendix_blueprint.md) detalha a implementação do sistema na plataforma low-code:

*   **Domain Model**: Configurações da entidade `Supplier` e enumerações associadas (`EN_ReclameAquiStatus`, `EN_SupplierCategory`).
*   **Microflows**: Arquitetura visual para a lógica do botão "Consultar ReclameAqui", incluindo chamada REST GET, tratamento de respostas nulas e mapeamento JSON usando *Import Mappings*.
*   **Páginas (Atlas UI)**: Mapeamento de grids de dados e modais de criação/edição.
