# 📐 Blueprint do Projeto no Mendix Studio Pro

Este documento descreve como reproduzir a lógica de negócio, modelo de dados e integrações do protótipo diretamente no **Mendix Studio Pro** (versão 9.24.x LTS ou 10.x recomendada).

---

## 1. 🗄️ Domain Model (Modelo de Dados)

No módulo do seu projeto Mendix (ex: `SupplierManagement`), abra o **Domain Model** e crie as seguintes entidades e enumerações:

### 🔹 Enumerations (Enumerações)

#### `EN_SupplierCategory`
*   `Tecnologia` (TI / Desenvolvimento / Licenciamento)
*   `Seguranca`
*   `LimpezaConservacao`
*   `Consultoria`
*   `ConstrucaoCivil`
*   `Outros`

#### `EN_ReclameAquiStatus`
*   `SemDados` (Sem dados / Não localizado)
*   `RA1000` (Selo de Excelência RA1000)
*   `Otimo`
*   `Bom`
*   `Regular`
*   `Ruim`
*   `NaoRecomendado`

### 🔹 Entidade: `Supplier`

| Atributo | Tipo de Dado | Descrição / Configurações |
| :--- | :--- | :--- |
| **CNPJ** | String (20) | Chave única (Adicionar regra de validação de formato e unicidade) |
| **Name** | String (200) | Razão Social ou Nome Fantasia |
| **Category** | Enum (`EN_SupplierCategory`) | Segmento de atuação do fornecedor |
| **RatingInternal** | Integer | Nota interna de avaliação do BDMG (valores de 1 a 5) |
| **RAScore** | Decimal | Nota do ReclameAqui (0.0 a 10.0) |
| **RAStatus** | Enum (`EN_ReclameAquiStatus`) | Selo de reputação atual no ReclameAqui |
| **Description** | String (Unlimited) | Observações técnicas / Histórico do fornecedor |

---

## 2. 🔌 Integração REST (ReclameAqui API)

Para recuperar a reputação em tempo real, utilizaremos uma chamada HTTP GET. No Mendix, configure:

### 1. JSON Structure
Crie um arquivo de estrutura JSON (`JSON_ReclameAquiResponse`) com o formato esperado de resposta:
```json
{
  "cnpj": "58069352000197",
  "companyName": "Stefanini Consultoria",
  "score": 7.8,
  "status": "bom"
}
```

### 2. Import Mapping
Crie um **Import Mapping** (`IM_ReclameAquiResponse`) baseado no `JSON_ReclameAquiResponse` anterior. Mapeie os atributos do JSON para uma entidade temporária (Não-Persistível) chamada `ReclameAquiResult` no seu modelo de dados.

---

## ⚡ 3. Microflows do Sistema

### 🛠️ Microflow: `ACT_Supplier_FetchReclameAqui`
Este microflow é disparado no formulário quando o usuário clica no botão **"Consultar ReclameAqui"** ao lado do campo CNPJ.

```mermaid
graph LR
    Start([Início]) --> CheckCNPJ{CNPJ preenchido?}
    CheckCNPJ -- Não --> ShowError[Show Message: CNPJ obrigatório] --> End([Fim])
    CheckCNPJ -- Sim --> ShowBusy[Show Busy Indicator]
    ShowBusy --> CallREST[Call REST: GET /api/reclameAqui/{cnpj}]
    CallREST --> MapJSON[Import mapping to ReclameAquiResult]
    MapJSON --> UpdateSupplier[Change Supplier: Name, RAScore, RAStatus]
    UpdateSupplier --> HideBusy[Hide Busy Indicator]
    HideBusy --> Refresh[Commit & Refresh in Client]
    Refresh --> End
```

#### Detalhes Técnicos das Atividades Mendix:
1.  **Call REST Action (GET):**
    *   **Location:** `'https://api.reclameaquimock.com/v1/supplier/' + $Supplier/CNPJ` (Caso use API mockada ou gateway BDMG).
    *   **HTTP Headers:** `Content-Type: application/json` e tokens de autenticação (se necessário).
    *   **Response:** Utilizar o Import Mapping `IM_ReclameAquiResponse` guardando o resultado na variável `$ReclameAquiResult`.
2.  **Change Object (`Supplier`):**
    *   `Name` = `if $Supplier/Name = empty then $ReclameAquiResult/companyName else $Supplier/Name`
    *   `RAScore` = `$ReclameAquiResult/score`
    *   `RAStatus` = `parseEnumeration($ReclameAquiResult/status)`

---

## 🖥️ 4. Pages (Interfaces de Usuário)

Utilize as seguintes estruturas de página no **Mendix Studio**:

### 🎛️ Página 1: `Supplier_Overview` (Painel Central)
*   **Layout:** Sidebar / Topbar standard do Atlas UI.
*   **Componentes Principais:**
    *   **Search & Filter Area:**
        *   Um campo de busca do tipo Text Box associado a uma entidade Helper (SearchHelper) para pesquisa dinâmica por CNPJ/Nome.
        *   Um Dropdown associado ao atributo Enum `RAStatus` para filtragem rápida.
    *   **List View (ou Template Grid) de Fornecedores:**
        *   Utilize uma visualização em cards com o estilo padrão do Atlas UI.
        *   Insira a reputação do ReclameAqui utilizando badges coloridas baseadas no valor de `RAStatus` (Configurado via conditional classes no CSS/Sass do projeto).
        *   Botões de ação rápida: **Editar** (dispara página de Edição) e **Excluir** (dispara microflow com deleção lógica ou física do objeto).

### 📝 Página 2: `Supplier_NewEdit` (Cadastro e Edição - Modal Popup)
*   **Layout:** PopupLayout (Modal).
*   **Componentes Principais:**
    *   **Data View** apontando para o objeto `Supplier`.
    *   **Form Container**:
        *   Campo **CNPJ**: Text Box com máscara de entrada e um botão posicionado ao lado contendo a ação "Call Microflow" apontando para `ACT_Supplier_FetchReclameAqui`.
        *   Campo **Razão Social**: Text Box.
        *   Campos **Categoria** e **Avaliação Interna**: Dropdowns.
        *   Campos **Status RA** e **Nota RA**: Campos de leitura (Read-only) atualizados de forma automatizada pelo botão de consulta.
        *   Campo **Observações**: Text Area com redimensionamento.
    *   **Ações do Rodapé:**
        *   Botão **Salvar**: Executa o Microflow padrão para commit e fechamento da página.
        *   Botão **Cancelar**: Executa Rollback e fecha página.
