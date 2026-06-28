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

const defaultCarouselBanners = [
    {
        title: "BDMG Financiamento Verde 2026",
        desc: "Linhas de crédito especiais para projetos de sustentabilidade e transição energética em Minas Gerais. Taxas a partir de 0.5% a.m.",
        btnText: "Simular Agora",
        btnLink: "https://www.bdmg.mg.gov.br",
        theme: "banner-theme-bdmg"
    },
    {
        title: "BDMG Municípios",
        desc: "Financiamento para projetos de infraestrutura urbana, saneamento e mobilidade para prefeituras de todas as regiões de Minas Gerais.",
        btnText: "Ver Edital",
        btnLink: "https://www.bdmg.mg.gov.br",
        theme: "banner-theme-mint"
    },
    {
        title: "BDMG Inovação Digital",
        desc: "Crédito ágil para micro e pequenas empresas investirem em transformação digital, software e automação comercial.",
        btnText: "Saiba Mais",
        btnLink: "https://www.bdmg.mg.gov.br",
        theme: "banner-theme-cosmic"
    },
    {
        title: "BDMG Financiamento Agro",
        desc: "Recursos exclusivos para produtores rurais e cooperativas modernizarem frotas, silos e investirem na safra atual.",
        btnText: "Solicitar Crédito",
        btnLink: "https://www.bdmg.mg.gov.br",
        theme: "banner-theme-bdmg"
    },
    {
        title: "BDMG Capital de Giro",
        desc: "Reforce o caixa da sua empresa com as linhas de giro flexíveis BDMG. Carência estendida e prazos de pagamento de até 36 meses.",
        btnText: "Simular Giro",
        btnLink: "https://www.bdmg.mg.gov.br",
        theme: "banner-theme-dark"
    }
];

const defaultBannerSettings = {
    visible: true
};

let bannerSettings = JSON.parse(localStorage.getItem('bdmg_banner_settings')) || defaultBannerSettings;
let carouselBanners = JSON.parse(localStorage.getItem('bdmg_carousel_banners')) || defaultCarouselBanners;

const defaultWhatsappSettings = { number: "5531999999999" };
let whatsappSettings = JSON.parse(localStorage.getItem('bdmg_whatsapp_settings')) || defaultWhatsappSettings;

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

const promoBannerContainer = document.getElementById('promo-banner-container');
const btnAdminPanel = document.getElementById('btn-admin-panel');
const adminModal = document.getElementById('admin-modal');
const adminModalClose = document.getElementById('admin-modal-close');
const adminForm = document.getElementById('admin-form');

const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const btnLoginCancel = document.getElementById('btn-login-cancel');
const inputLoginUser = document.getElementById('login-user');
const inputLoginPass = document.getElementById('login-pass');

const whatsappFab = document.getElementById('whatsapp-fab');
const whatsappModal = document.getElementById('whatsapp-modal');
const btnWhatsappCancel = document.getElementById('btn-whatsapp-cancel');
const whatsappForm = document.getElementById('whatsapp-form');

// Form Inputs
const inputId = document.getElementById('supplier-id');
const inputCnpj = document.getElementById('cnpj');
const inputName = document.getElementById('name');
const inputCategory = document.getElementById('category');
const inputRatingInternal = document.getElementById('rating-internal');
const inputRaStatus = document.getElementById('ra-status');
const inputRaScore = document.getElementById('ra-score');
const inputDescription = document.getElementById('description');

const inputBannerVisible = document.getElementById('banner-visible');
const inputBannerTitle = document.getElementById('banner-title');
const inputBannerDesc = document.getElementById('banner-desc');
const inputBannerBtnText = document.getElementById('banner-btn-text');
const inputBannerBtnLink = document.getElementById('banner-btn-link');
const inputBannerStyle = document.getElementById('banner-style');

const draggableAdList = document.getElementById('draggable-ad-list');
const editAdIndex = document.getElementById('edit-ad-index');

const inputWhatsappName = document.getElementById('whatsapp-name');
const inputWhatsappUserPhone = document.getElementById('whatsapp-user-phone');

const adminWhatsappForm = document.getElementById('admin-whatsapp-form');
const inputAdminWhatsappNumber = document.getElementById('admin-whatsapp-number');

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
        const cleanQuery = query.trim().toLowerCase();
        const cleanNumQuery = query.replace(/\D/g, '');
        
        const matchesQuery = 
            (sup.name && sup.name.toLowerCase().includes(cleanQuery)) || 
            (cleanNumQuery !== '' && sup.cnpj && sup.cnpj.replace(/\D/g, '').includes(cleanNumQuery)) || 
            (sup.category && sup.category.toLowerCase().includes(cleanQuery));
            
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
                                <div class="rep-stat score-stat">
                                    <span class="rep-label">ReclameAqui</span>
                                    <span class="rep-value score">${sup.raScore || 'N/A'}</span>
                                </div>
                                <div class="rep-stat desc-stat">
                                    <span class="rep-label">Parecer</span>
                                    <span class="rep-desc-text">
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

btnAddSupplier.addEventListener('click', () => {
    closeAdminModal();
    openModal('Cadastrar Fornecedor');
});
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

// Cookie Helpers
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        ...options
    };
    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

// Captcha Security Feature
const captchaModal = document.getElementById('captcha-modal');
const captchaCheckbox = document.getElementById('captcha-checkbox');

function isCaptchaVerified() {
    return getCookie('bdmg_captcha_verified') === 'true';
}

function handleSearchAndFilter() {
    if (!isCaptchaVerified()) {
        // Intercept search, blur input to prevent typing during verification
        searchInput.blur();
        captchaModal.classList.add('active');
        return;
    }
    renderSuppliers();
}

// Captcha Checkbox Click Event
captchaCheckbox.addEventListener('click', () => {
    if (captchaCheckbox.classList.contains('loading') || captchaCheckbox.classList.contains('verified')) {
        return;
    }
    
    captchaCheckbox.classList.add('loading');
    
    setTimeout(() => {
        captchaCheckbox.classList.remove('loading');
        captchaCheckbox.classList.add('verified');
        
        // Save cookie for 1 day (86400 seconds)
        setCookie('bdmg_captcha_verified', 'true', { 'max-age': 86400 });
        
        showToast('Identidade verificada! Pesquisa desbloqueada.', 'success');
        
        setTimeout(() => {
            captchaModal.classList.remove('active');
            renderSuppliers();
            searchInput.focus();
        }, 800);
    }, 1500);
});

// Search & Filter Listeners (Intercepted by Captcha)
searchInput.addEventListener('input', handleSearchAndFilter);
filterStatus.addEventListener('change', handleSearchAndFilter);

// Initialize Render
renderSuppliers();
if (suppliers.length === 0) {
    // Load default mockup suppliers automatically on first load to look complete
    suppliers = [...initialSuppliers];
    saveSuppliers();
}

// ==========================================
// Banner Management & Admin Logic
// ==========================================
let carouselIntervalId = null;
let currentSlideIndex = 0;

function renderBanner() {
    if (carouselIntervalId) {
        clearInterval(carouselIntervalId);
        carouselIntervalId = null;
    }
    
    if (!bannerSettings.visible || carouselBanners.length === 0) {
        promoBannerContainer.innerHTML = '';
        return;
    }
    
    let slidesHtml = '';
    let dotsHtml = '';
    
    carouselBanners.forEach((banner, index) => {
        slidesHtml += `
            <li class="carousel-slide ${banner.theme}" style="min-width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 1rem 3.5rem 1.25rem 2rem; position: relative;">
                <div class="promo-banner-content">
                    <h2>${banner.title}</h2>
                    <p>${banner.desc}</p>
                </div>
                <div class="promo-banner-actions">
                    <a href="${banner.btnLink}" target="_blank" class="promo-banner-btn">${banner.btnText}</a>
                </div>
            </li>
        `;
        
        dotsHtml += `
            <button type="button" class="carousel-dot ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Slide ${index + 1}"></button>
        `;
    });
    
    promoBannerContainer.innerHTML = `
        <div class="promo-banner-carousel" id="promo-banner" style="position: relative; overflow: hidden; width: 100%; border-radius: 12px; margin-bottom: 2rem;">
            <button class="promo-banner-close" id="promo-banner-close-btn" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); z-index: 10; background: none; border: none; font-size: 1.5rem; color: rgba(255,255,255,0.7); cursor: pointer;">&times;</button>
            
            <div class="carousel-track-container" style="width: 100%; overflow: hidden;">
                <ul class="carousel-track" id="carousel-track" style="display: flex; list-style: none; margin: 0; padding: 0; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); width: 100%;">
                    ${slidesHtml}
                </ul>
            </div>
            
            <div class="carousel-nav" id="carousel-nav-dots" style="position: absolute; bottom: 0.5rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; z-index: 10;">
                ${dotsHtml}
            </div>
        </div>
    `;
    
    document.getElementById('promo-banner-close-btn').addEventListener('click', () => {
        const banner = document.getElementById('promo-banner');
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.3s ease';
        if (carouselIntervalId) {
            clearInterval(carouselIntervalId);
            carouselIntervalId = null;
        }
        setTimeout(() => banner.remove(), 300);
    });
    
    const dots = document.querySelectorAll('.carousel-dot');
    const track = document.getElementById('carousel-track');
    
    currentSlideIndex = 0;
    
    function goToSlide(index) {
        if (index < 0 || index >= carouselBanners.length) return;
        currentSlideIndex = index;
        
        track.style.transform = `translateX(-${index * 100}%)`;
        
        dots.forEach((dot, idx) => {
            if (idx === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            goToSlide(slideIndex);
            resetCarouselTimer();
        });
    });
    
    function nextSlide() {
        const nextIdx = (currentSlideIndex + 1) % carouselBanners.length;
        goToSlide(nextIdx);
    }
    
    function resetCarouselTimer() {
        if (carouselIntervalId) {
            clearInterval(carouselIntervalId);
        }
        carouselIntervalId = setInterval(nextSlide, 5000);
    }
    
    resetCarouselTimer();
}

let tempCarouselBanners = [];
let activeEditIndex = 0;

function renderAdminAdList() {
    draggableAdList.innerHTML = tempCarouselBanners.map((ad, index) => `
        <div class="draggable-ad-item ${index === activeEditIndex ? 'active' : ''}" 
             draggable="true" 
             data-index="${index}"
             style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background-color: rgba(255,255,255,0.03); border: 1px solid ${index === activeEditIndex ? 'var(--warning)' : 'rgba(255,255,255,0.08)'}; border-radius: 6px; margin-bottom: 0.5rem; cursor: grab; transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                <i class="fa-solid fa-grip-lines" style="color: var(--text-secondary);"></i>
                <span style="font-size: 0.85rem; font-weight: 500; color: ${index === activeEditIndex ? 'var(--warning)' : 'var(--text-primary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">
                    ${ad.title || 'Slide ' + (index + 1)}
                </span>
            </div>
            <button type="button" class="btn-edit-ad" onclick="selectAdToEdit(${index})" style="background: none; border: none; color: var(--accent); cursor: pointer; padding: 0.25rem;">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
        </div>
    `).join('');
    
    bindDragAndDropEvents();
}

function saveActiveAdFieldsToTemp() {
    if (activeEditIndex >= 0 && activeEditIndex < tempCarouselBanners.length) {
        tempCarouselBanners[activeEditIndex] = {
            title: inputBannerTitle.value.trim(),
            desc: inputBannerDesc.value.trim(),
            btnText: inputBannerBtnText.value.trim(),
            btnLink: inputBannerBtnLink.value.trim(),
            theme: inputBannerStyle.value
        };
    }
}

function loadAdFieldsIntoEditor(index) {
    const ad = tempCarouselBanners[index];
    if (ad) {
        editAdIndex.value = index;
        inputBannerTitle.value = ad.title;
        inputBannerDesc.value = ad.desc;
        inputBannerBtnText.value = ad.btnText;
        inputBannerBtnLink.value = ad.btnLink;
        inputBannerStyle.value = ad.theme;
    }
}

window.selectAdToEdit = function(index) {
    saveActiveAdFieldsToTemp();
    activeEditIndex = index;
    renderAdminAdList();
    loadAdFieldsIntoEditor(index);
};

let dragSrcEl = null;

function bindDragAndDropEvents() {
    const items = draggableAdList.querySelectorAll('.draggable-ad-item');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-index'));
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (dragSrcEl !== this) {
        const fromIndex = parseInt(dragSrcEl.getAttribute('data-index'));
        const toIndex = parseInt(this.getAttribute('data-index'));
        
        saveActiveAdFieldsToTemp();
        
        const movedItem = tempCarouselBanners.splice(fromIndex, 1)[0];
        tempCarouselBanners.splice(toIndex, 0, movedItem);
        
        if (activeEditIndex === fromIndex) {
            activeEditIndex = toIndex;
        } else if (fromIndex < activeEditIndex && toIndex >= activeEditIndex) {
            activeEditIndex--;
        } else if (fromIndex > activeEditIndex && toIndex <= activeEditIndex) {
            activeEditIndex++;
        }
        
        renderAdminAdList();
        loadAdFieldsIntoEditor(activeEditIndex);
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

function openAdminModal() {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabPanels = document.querySelectorAll('.admin-tab-panel');
    
    tabButtons.forEach(b => b.classList.remove('active'));
    tabButtons[0].classList.add('active');
    tabPanels.forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });
    tabPanels[0].style.display = 'block';
    tabPanels[0].classList.add('active');

    inputBannerVisible.checked = bannerSettings.visible;
    
    tempCarouselBanners = JSON.parse(JSON.stringify(carouselBanners));
    activeEditIndex = 0;
    
    renderAdminAdList();
    loadAdFieldsIntoEditor(0);
    
    inputAdminWhatsappNumber.value = whatsappSettings.number;
    
    adminModal.classList.add('active');
}

function closeAdminModal() {
    adminModal.classList.remove('active');
}

// Authentication Logic for Admin Panel
function checkAdminAuth() {
    return sessionStorage.getItem('bdmg_admin_logged') === 'true';
}

function openAdminPanelFlow() {
    if (checkAdminAuth()) {
        openAdminModal();
    } else {
        loginForm.reset();
        loginModal.classList.add('active');
    }
}

// Login Form Submit Event
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = inputLoginUser.value.trim();
    const pass = inputLoginPass.value.trim();
    
    if (user === 'admin' && pass === 'admin') {
        sessionStorage.setItem('bdmg_admin_logged', 'true');
        loginModal.classList.remove('active');
        showToast('Login efetuado com sucesso!', 'success');
        setTimeout(openAdminModal, 300);
    } else {
        showToast('Usuário ou senha incorretos!', 'danger');
    }
});

// Cancel Login
btnLoginCancel.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

// Admin Panel Tab Navigation Logic
const tabButtons = document.querySelectorAll('.admin-tab-btn');
const tabPanels = document.querySelectorAll('.admin-tab-panel');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabPanels.forEach(panel => {
            if (panel.id === targetId) {
                panel.style.display = 'block';
                panel.classList.add('active');
            } else {
                panel.style.display = 'none';
                panel.classList.remove('active');
            }
        });
    });
});

// Event Listeners for Admin panel
btnAdminPanel.addEventListener('click', openAdminPanelFlow);
adminModalClose.addEventListener('click', closeAdminModal);
document.querySelectorAll('.btn-admin-cancel-btn').forEach(btn => {
    btn.addEventListener('click', closeAdminModal);
});

adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Save current active editing fields to temp array first
    saveActiveAdFieldsToTemp();
    
    // Commit temp list to actual state
    carouselBanners = JSON.parse(JSON.stringify(tempCarouselBanners));
    localStorage.setItem('bdmg_carousel_banners', JSON.stringify(carouselBanners));
    
    // Save banner visibility
    bannerSettings = {
        visible: inputBannerVisible.checked
    };
    localStorage.setItem('bdmg_banner_settings', JSON.stringify(bannerSettings));
    
    renderBanner();
    closeAdminModal();
    showToast('Configurações de publicidade atualizadas com sucesso!', 'success');
});

// Real-time title update in Admin draggable list
inputBannerTitle.addEventListener('input', (e) => {
    const activeItemText = draggableAdList.querySelector(`.draggable-ad-item[data-index="${activeEditIndex}"] span`);
    if (activeItemText) {
        activeItemText.textContent = e.target.value.trim() || `Slide ${activeEditIndex + 1}`;
    }
});

// Admin WhatsApp Form Submit Event
adminWhatsappForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cleanNumber = inputAdminWhatsappNumber.value.replace(/\D/g, '');
    
    if (cleanNumber.length < 10) {
        showToast('Por favor, insira um número de WhatsApp válido (ex: 5531999999999).', 'danger');
        return;
    }
    
    whatsappSettings = { number: cleanNumber };
    localStorage.setItem('bdmg_whatsapp_settings', JSON.stringify(whatsappSettings));
    
    closeAdminModal();
    showToast('Configurações do WhatsApp salvas com sucesso!', 'success');
});

// WhatsApp Lead Capture Interactions
whatsappFab.addEventListener('click', () => {
    whatsappForm.reset();
    whatsappModal.classList.add('active');
});

btnWhatsappCancel.addEventListener('click', () => {
    whatsappModal.classList.remove('active');
});

// Format User Phone Input dynamically
inputWhatsappUserPhone.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    }
    e.target.value = value;
});

// Submit Lead and Redirect to WhatsApp
whatsappForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputWhatsappName.value.trim();
    const phone = inputWhatsappUserPhone.value.trim();
    
    const preConfiguredText = `Gostaria de indicar o cadastro de um fornecedor. Nome: ${name}, Contato: ${phone}`;
    const encodedText = encodeURIComponent(preConfiguredText);
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappSettings.number}&text=${encodedText}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank');
    
    whatsappModal.classList.remove('active');
    showToast('Redirecionando para o WhatsApp...', 'success');
});

// Render the banner initially on page load
renderBanner();

if (!localStorage.getItem('bdmg_carousel_banners')) {
    localStorage.setItem('bdmg_carousel_banners', JSON.stringify(carouselBanners));
}



