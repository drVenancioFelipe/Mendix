// Mock Database for ReclameAqui API Simulation
const reclameAquiMockDatabase = {
    "cemig": { name: "Cemig - Companhia Energética de Minas Gerais", status: "otimo", score: 8.2 },
    "copasa": { name: "Copasa MG", status: "regular", score: 6.5 },
    "totvs": { name: "TOTVS S.A.", status: "ra1000", score: 9.1 },
    "stefanini": { name: "Stefanini IT Solutions", status: "bom", score: 7.8 },
    "localiza": { name: "Localiza Rent a Car", status: "ra1000", score: 8.9 },
    "17.155.730/0001-64": { name: "Cemig - Distribuição S.A.", status: "otimo", score: 8.2 },
    "17.200.216/0001-47": { name: "Copasa - Companhia de Saneamento de Minas Gerais", status: "regular", score: 6.5 },
    "53.113.791/0001-22": { name: "TOTVS S.A.", status: "ra1000", score: 9.1 },
    "58.069.352/0001-97": { name: "Stefanini Consultoria e Assessoria em Informática", status: "bom", score: 7.8 },
    "16.670.085/0001-55": { name: "Localiza Rent a Car S.A.", status: "ra1000", score: 8.9 }
};

// Initial Suppliers to populate the system
const initialSuppliers = [
    {
        id: "1",
        name: "Stefanini IT Solutions",
        cnpj: "58.069.352/0001-97",
        category: "Tecnologia",
        ratingInternal: "4",
        raStatus: "bom",
        raScore: "7.8",
        description: "Prestador de serviços de outsourcing de TI e desenvolvimento. Bom desempenho histórico no banco."
    },
    {
        id: "2",
        name: "Copasa MG",
        cnpj: "17.200.216/0001-47",
        category: "Outros",
        ratingInternal: "3",
        raStatus: "regular",
        raScore: "6.5",
        description: "Fornecimento de água e saneamento para as agências de fomento regional do BDMG."
    },
    {
        id: "3",
        name: "TOTVS S.A.",
        cnpj: "53.113.791/0001-22",
        category: "Tecnologia",
        ratingInternal: "5",
        raStatus: "ra1000",
        raScore: "9.1",
        description: "Licenciamento de sistemas ERP e suporte técnico. Excelente qualidade e integridade de processos."
    }
];

// App State Management
let suppliers = JSON.parse(localStorage.getItem('bdmg_suppliers')) || [];

// DOM Elements
const supplierGrid = document.getElementById('supplier-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const btnAddSupplier = document.getElementById('btn-add-supplier');
const btnLoadMock = document.getElementById('btn-load-mock');
const supplierModal = document.getElementById('supplier-modal');
const modalClose = document.getElementById('modal-close');
const btnCancel = document.getElementById('btn-cancel');
const supplierForm = document.getElementById('supplier-form');
const btnFetchRa = document.getElementById('btn-fetch-ra');
const toastContainer = document.getElementById('toast-container');

// Form Inputs
const inputId = document.getElementById('supplier-id');
const inputCnpj = document.getElementById('cnpj');
const inputName = document.getElementById('name');
const inputCategory = document.getElementById('category');
const inputRatingInternal = document.getElementById('rating-internal');
const inputRaStatus = document.getElementById('ra-status');
const inputRaScore = document.getElementById('ra-score');
const inputDescription = document.getElementById('description');

// Toast Notification Helper
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'danger') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'none';
        toast.offsetHeight; // trigger reflow
        toast.style.animation = 'toastIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Format CNPJ Input dynamically
inputCnpj.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.substring(0, 14);
    
    if (value.length > 12) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    } else if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, "$1.$2.$3/$4");
    } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{3})/, "$1.$2");
    }
    e.target.value = value;
});

// Render Suppliers
function renderSuppliers() {
    const query = searchInput.value.toLowerCase();
    const filter = filterStatus.value;
    
    const filtered = suppliers.filter(sup => {
        const matchesQuery = 
            sup.name.toLowerCase().includes(query) || 
            sup.cnpj.replace(/\D/g, '').includes(query.replace(/\D/g, '')) || 
            sup.category.toLowerCase().includes(query);
            
        const matchesFilter = filter === 'all' || sup.raStatus === filter;
        
        return matchesQuery && matchesFilter;
    });
    
    if (filtered.length === 0) {
        supplierGrid.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        supplierGrid.innerHTML = filtered.map(sup => {
            const stars = '⭐'.repeat(parseInt(sup.ratingInternal));
            const badgeClass = `badge badge-${sup.raStatus}`;
            const badgeText = sup.raStatus === 'ra1000' ? 'RA1000' : 
                              sup.raStatus === 'semdados' ? 'Sem Dados' : 
                              sup.raStatus;
            
            return `
                <div class="supplier-card">
                    <div>
                        <div class="card-header">
                            <div class="supplier-info">
                                <h3>${sup.name}</h3>
                                <span class="cnpj">CNPJ: ${sup.cnpj}</span>
                            </div>
                            <span class="${badgeClass}">${badgeText}</span>
                        </div>
                        <div class="card-body">
                            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                <strong>Categoria:</strong> ${sup.category}
                            </p>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">
                                <strong>Avaliação BDMG:</strong> ${stars}
                            </p>
                            <div class="reputation-details">
                                <div class="rep-stat">
                                    <span class="rep-label">ReclameAqui</span>
                                    <span class="rep-value score">${sup.raScore || 'N/A'}</span>
                                </div>
                                <div class="rep-stat">
                                    <span class="rep-label">Parecer</span>
                                    <span class="rep-value" style="font-size: 0.75rem; font-weight: normal; max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        ${sup.description || 'Sem observações.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-secondary btn-sm" onclick="editSupplier('${sup.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
                            <i class="fa-solid fa-pen-to-square"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSupplier('${sup.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
                            <i class="fa-solid fa-trash-can"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Save to LocalStorage
function saveSuppliers() {
    localStorage.setItem('bdmg_suppliers', JSON.stringify(suppliers));
    renderSuppliers();
}

// Load Mock Initial Data
btnLoadMock.addEventListener('click', () => {
    if (suppliers.length > 0) {
        if (!confirm('Deseja sobrescrever a lista atual com os fornecedores padrão do BDMG?')) return;
    }
    suppliers = [...initialSuppliers];
    saveSuppliers();
    showToast('Fornecedores de demonstração carregados com sucesso!', 'success');
});

// Modal Controls
function openModal(title = 'Cadastrar Fornecedor', supplier = null) {
    document.getElementById('modal-title').innerText = title;
    supplierForm.reset();
    
    if (supplier) {
        inputId.value = supplier.id;
        inputCnpj.value = supplier.cnpj;
        inputName.value = supplier.name;
        inputCategory.value = supplier.category;
        inputRatingInternal.value = supplier.ratingInternal;
        inputRaStatus.value = supplier.raStatus;
        inputRaScore.value = supplier.raScore;
        inputDescription.value = supplier.description;
    } else {
        inputId.value = '';
    }
    
    supplierModal.classList.add('active');
}

function closeModal() {
    supplierModal.classList.remove('active');
}

btnAddSupplier.addEventListener('click', () => openModal('Cadastrar Fornecedor'));
modalClose.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);

// ReclameAqui API Scraper Simulation
btnFetchRa.addEventListener('click', async () => {
    const query = inputCnpj.value.trim() || inputName.value.trim();
    if (!query) {
        showToast('Insira o CNPJ ou a Razão Social para pesquisar no ReclameAqui.', 'danger');
        return;
    }
    
    // UI Feedback
    btnFetchRa.disabled = true;
    btnFetchRa.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Consultando...`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cleanQuery = query.toLowerCase().replace(/\D/g, '') || query.toLowerCase();
    
    // Search in our mock registry
    let found = null;
    for (const key in reclameAquiMockDatabase) {
        if (cleanQuery.includes(key.replace(/\D/g, '')) || cleanQuery.includes(key)) {
            found = reclameAquiMockDatabase[key];
            break;
        }
    }
    
    btnFetchRa.disabled = false;
    btnFetchRa.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Consultar ReclameAqui`;
    
    if (found) {
        inputName.value = found.name;
        inputRaStatus.value = found.status;
        inputRaScore.value = found.score;
        showToast(`Fornecedor '${found.name}' localizado no ReclameAqui!`, 'success');
    } else {
        // Not found mock case
        inputRaStatus.value = 'semdados';
        inputRaScore.value = '0.0';
        showToast('Empresa não cadastrada ou sem índice de reputação ativa no ReclameAqui.', 'info');
    }
});

// Form Submit (Create / Update)
supplierForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = inputId.value;
    const data = {
        id: id || Date.now().toString(),
        cnpj: inputCnpj.value,
        name: inputName.value,
        category: inputCategory.value,
        ratingInternal: inputRatingInternal.value,
        raStatus: inputRaStatus.value,
        raScore: inputRaScore.value || '0.0',
        description: inputDescription.value
    };
    
    if (id) {
        // Update
        const index = suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            suppliers[index] = data;
            showToast('Dados do fornecedor atualizados com sucesso!', 'success');
        }
    } else {
        // Create
        // Duplicate CNPJ Check
        if (suppliers.some(s => s.cnpj === data.cnpj)) {
            showToast('Já existe um fornecedor cadastrado com este CNPJ.', 'danger');
            return;
        }
        suppliers.push(data);
        showToast('Fornecedor cadastrado e avaliado no sistema!', 'success');
    }
    
    saveSuppliers();
    closeModal();
});

// Edit supplier handler (global scope for onclick in template strings)
window.editSupplier = function(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
        openModal('Editar Fornecedor', supplier);
    }
};

// Delete supplier handler
window.deleteSupplier = function(id) {
    if (confirm('Tem certeza que deseja excluir permanentemente este fornecedor de sua base BDMG?')) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveSuppliers();
        showToast('Fornecedor removido com sucesso.', 'success');
    }
};

// Search & Filter Listeners
searchInput.addEventListener('input', renderSuppliers);
filterStatus.addEventListener('change', renderSuppliers);

// Initialize Render
renderSuppliers();
if (suppliers.length === 0) {
    // Load default mockup suppliers automatically on first load to look complete
    suppliers = [...initialSuppliers];
    saveSuppliers();
}
