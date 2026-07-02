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

// Real ReclameAqui API Integration Helpers
function mapReclameAquiStatus(raStatus) {
    if (!raStatus) return 'semdados';
    const s = raStatus.toLowerCase();
    if (s.includes('ra1000')) return 'ra1000';
    if (s.includes('great') || s.includes('otimo') || s.includes('ótimo')) return 'otimo';
    if (s.includes('good') || s.includes('bom')) return 'bom';
    if (s.includes('regular')) return 'regular';
    if (s.includes('bad') || s.includes('ruim')) return 'ruim';
    if (s.includes('not') || s.includes('recomendado')) return 'naorecomendado';
    return 'semdados';
}

async function fetchRealReclameAquiData(query) {
    const slug = query.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "")                   // Remove special chars
        .replace(/\s+/g, "-")                           // Spaces to hyphens
        .replace(/-+/g, "-");                           // Multiple hyphens to single
    
    const targetUrl = `https://www.reclameaqui.com.br/empresa/${slug}/`;
    let html = null;
    let fetchMethod = "";
    
    // Try Proxy 1: AllOrigins (JSON wrapped)
    try {
        const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(allOriginsUrl);
        if (res.ok) {
            const json = await res.json();
            html = json.contents;
            fetchMethod = "AllOrigins";
        }
    } catch (err) {
        console.warn("Proxy 1 (AllOrigins) blocked or failed, retrying with Proxy 2...", err);
    }
    
    // Try Proxy 2: CorsProxy.io (transparent HTML proxy)
    if (!html) {
        try {
            const corsProxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
            const res = await fetch(corsProxyUrl);
            if (res.ok) {
                html = await res.text();
                fetchMethod = "CorsProxy.io";
            }
        } catch (err) {
            console.error("Proxy 2 (CorsProxy.io) also failed:", err);
        }
    }
    
    // If both failed, return null to trigger mock database fallback
    if (!html) {
        return null;
    }
    
    try {
        if (html.includes("Página não encontrada") || html.includes("404") || html.includes("Oops!")) {
            return null;
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const nextDataScript = doc.getElementById("__NEXT_DATA__");
        
        if (nextDataScript) {
            const nextData = JSON.parse(nextDataScript.textContent);
            const companyProps = nextData.props?.pageProps?.company || nextData.props?.pageProps?.initialState?.company;
            if (companyProps) {
                return {
                    name: companyProps.name,
                    status: mapReclameAquiStatus(companyProps.reputation?.reputationStatus),
                    score: companyProps.reputation?.reputationScore || "N/A",
                    description: `Fornecedor recuperado da plataforma ReclameAqui via API real (${fetchMethod}).`
                };
            }
        }
        
        // Regex parsing fallback
        const scoreMatch = html.match(/class="[^"]*reputation-rating[^"]*">([\d.,]+)</);
        const score = scoreMatch ? scoreMatch[1].replace(',', '.') : "N/A";
        
        const nameMatch = html.match(/<h1 class="[^"]*company-name[^"]*">([^<]+)</) || html.match(/<title>([^<]+) - Reclame Aqui/);
        const name = nameMatch ? nameMatch[1].trim() : query;
        
        let status = "semdados";
        if (html.includes("RA1000") || html.includes("ra1000")) status = "ra1000";
        else if (html.includes("Ótimo") || html.includes("otimo")) status = "otimo";
        else if (html.includes("Bom") || html.includes("bom")) status = "bom";
        else if (html.includes("Regular") || html.includes("regular")) status = "regular";
        else if (html.includes("Ruim") || html.includes("ruim")) status = "ruim";
        else if (html.includes("Não Recomendado") || html.includes("nao-recomendado")) status = "naorecomendado";
        
        return {
            name: name,
            status: status,
            score: score,
            description: `Fornecedor recuperado da plataforma ReclameAqui via raspagem real (${fetchMethod}).`
        };
    } catch (e) {
        console.error("Fetch ReclameAqui HTML parse error:", e);
        return null;
    }
}


// Mock reviews database to initially populate the system
const defaultReviews = [
    {
        id: "rev1",
        supplierId: "1", // Stefanini
        userName: "Felipe Venâncio",
        userEmail: "felipe@sindicos.com.br",
        title: "Excelente parceiro de tecnologia",
        comment: "Fizemos a migração dos sistemas da portaria com a Stefanini e o atendimento superou todas as expectativas. Resposta rápida e suporte técnico de alto nível.",
        rating: 5,
        status: "approved",
        createdAt: "2026-06-25T14:30:00Z"
    },
    {
        id: "rev2",
        supplierId: "1", // Stefanini
        userName: "Reginaldo Portaria",
        userEmail: "reginaldo@condominio.com",
        title: "Bom atendimento, mas valor elevado",
        comment: "Os técnicos são experientes e resolveram nossos problemas de rede interna, mas o valor cobrado pela hora de suporte extra é acima da média.",
        rating: 4,
        status: "approved",
        createdAt: "2026-06-28T10:15:00Z"
    },
    {
        id: "rev3",
        supplierId: "2", // Copasa
        userName: "Síndica Amanda",
        userEmail: "amanda.predial@gmail.com",
        title: "Problemas recorrentes na leitura de consumo",
        comment: "Temos hidrômetros individuais no condomínio e frequentemente ocorrem erros na leitura mensal da Copasa. Demoram muito para enviar equipe de retificação.",
        rating: 2,
        status: "approved",
        createdAt: "2026-06-29T16:45:00Z"
    },
    {
        id: "rev4",
        supplierId: "3", // Totvs
        userName: "Cláudio Adm",
        userEmail: "claudio@totvs-parceiro.com",
        title: "Sistema robusto e excelente suporte",
        comment: "Usamos o ERP da Totvs para toda a gestão financeira da nossa administradora de condomínios. O sistema é extremamente robusto.",
        rating: 5,
        status: "approved",
        createdAt: "2026-06-30T09:00:00Z"
    },
    {
        id: "rev5",
        supplierId: "2", // Copasa
        userName: "Roberto Silva",
        userEmail: "roberto@condominiobh.com.br",
        title: "Suporte lento para vazamentos na rua",
        comment: "Acionamos a Copasa por causa de um vazamento grave na calçada do condomínio. Demoraram mais de 48 horas para comparecer ao local, gerando desperdício.",
        rating: 3,
        status: "approved",
        createdAt: "2026-07-01T11:20:00Z"
    },
    {
        id: "rev6",
        supplierId: "1", // Stefanini
        userName: "Morador Insatisfeito",
        userEmail: "morador@sindicos.com.br",
        title: "Demora na resolução de ticket de portaria",
        comment: "Estou aguardando a liberação de um cadastro no aplicativo há mais de uma semana. O suporte joga a culpa no condomínio e vice-versa.",
        rating: 2,
        status: "pending",
        createdAt: "2026-07-02T08:10:00Z"
    }
];

// Active reviews list
let reviews = JSON.parse(localStorage.getItem('sf_supplier_reviews')) || [];

// Save reviews to localStorage
function saveReviews() {
    localStorage.setItem('sf_supplier_reviews', JSON.stringify(reviews));
}

// Initializing reviews if empty
if (reviews.length === 0) {
    reviews = [...defaultReviews];
    saveReviews();
}


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
        description: "Fornecimento de água e saneamento."
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
let suppliers = JSON.parse(localStorage.getItem('sf_suppliers')) || [];

const defaultCarouselBanners = [
    {
        title: "Sustentabilidade em Foco",
        desc: "Soluções especiais para projetos de sustentabilidade, energia solar e transição energética nos condomínios.",
        btnText: "Saiba Mais",
        btnLink: "#",
        theme: "banner-theme-sf",
        logoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M17 8C8 10 5.9 16.1 5.1 19c-.1.3.1.6.4.5C8.9 18.1 15 16 17 8zm0 0c5-5 .2-6-.3-6s-4.5 3.1-4.7 6.1c2 0 4-.1 5-.1z'/></svg>"
    },
    {
        title: "Gestão de Condomínios",
        desc: "Apoio completo para projetos de infraestrutura, reformas, saneamento e melhoria urbana em condomínios residenciais.",
        btnText: "Ver Edital",
        btnLink: "#",
        theme: "banner-theme-mint",
        logoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233b82f6'><path d='M12 3L2 12h3v8h5v-6h4v6h5v-8h3L12 3z'/></svg>"
    },
    {
        title: "Inovação & Tecnologia",
        desc: "Sistemas ágeis para portaria inteligente, monitoramento por câmeras, controle de acesso e automação condominial.",
        btnText: "Ver Detalhes",
        btnLink: "#",
        theme: "banner-theme-cosmic",
        logoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2306b6d4'><path d='M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'/></svg>"
    },
    {
        title: "Manutenção Preventiva",
        desc: "Facilidades para contratar manutenção de elevadores, pintura de fachadas, reformas estruturais e segurança contra incêndios.",
        btnText: "Solicitar Orçamento",
        btnLink: "#",
        theme: "banner-theme-sf",
        logoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fbbf24'><path d='M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1.1 0-1.5z'/></svg>"
    },
    {
        title: "Crédito Condominial",
        desc: "Reforce o caixa do seu condomínio com linhas de crédito flexíveis, taxas reduzidas e prazos de pagamento estendidos.",
        btnText: "Simular Crédito",
        btnLink: "#",
        theme: "banner-theme-dark",
        logoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f59e0b'><path d='M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 0.67 1.5 1.5-0.67 1.5-1.5 1.5z'/></svg>"
    }
];

const defaultBannerSettings = {
    visible: true
};

let bannerSettings = JSON.parse(localStorage.getItem('sf_banner_settings')) || defaultBannerSettings;
let carouselBanners = JSON.parse(localStorage.getItem('sf_carousel_banners')) || defaultCarouselBanners;

const defaultWhatsappSettings = { number: "5531999999999" };
let whatsappSettings = JSON.parse(localStorage.getItem('sf_whatsapp_settings')) || defaultWhatsappSettings;

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
const inputBannerLogoUrl = document.getElementById('banner-logo-url');

const draggableAdList = document.getElementById('draggable-ad-list');
const editAdIndex = document.getElementById('edit-ad-index');

const inputWhatsappName = document.getElementById('whatsapp-name');
const inputWhatsappUserPhone = document.getElementById('whatsapp-user-phone');

const adminWhatsappForm = document.getElementById('admin-whatsapp-form');
const inputAdminWhatsappNumber = document.getElementById('admin-whatsapp-number');

const adminSuppliersList = document.getElementById('admin-suppliers-list');
const btnDeleteSupplierModal = document.getElementById('btn-delete-supplier-modal');

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
// Helper to render filtered list items
// Helper to render rating stars and computed average rating
function getSupplierRatingStars(sup) {
    const irs = calculateSupplierIrs(sup.id);
    const score = irs.count > 0 ? irs.avg : parseFloat(sup.ratingInternal || 5);
    const rounded = Math.round(score);
    const starsStr = '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
    return `<span style="color: var(--warning); font-weight: bold; letter-spacing: 1px;">${starsStr}</span> <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: normal; margin-left: 0.25rem;">(${score.toFixed(1)})</span>`;
}

// Helper to mask CNPJ for public display
function maskCnpjPublic(cnpj) {
    if (!cnpj) return '';
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return cnpj;
    const branch = clean.substring(8, 12); // e.g. "0001"
    return `XX.XXX.XXX/${branch}-XX`;
}

function renderFilteredSuppliersList(filtered) {
    supplierGrid.innerHTML = filtered.map(sup => {
        const badgeClass = `badge badge-${sup.raStatus}`;
        const badgeText = sup.raStatus === 'ra1000' ? 'RA1000' : 
                          sup.raStatus === 'semdados' ? 'Sem Dados' : 
                          sup.raStatus;
        const irs = calculateSupplierIrs(sup.id);
        
        return `
            <div class="supplier-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div class="card-header">
                        <div class="supplier-info">
                            <h3>${sup.name}</h3>
                            <span class="cnpj">CNPJ: ${maskCnpjPublic(sup.cnpj)}</span>
                        </div>
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="card-body" style="padding-bottom: 0.25rem;">
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                            <strong>Categoria:</strong> ${sup.category}
                        </p>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                            <span><strong>Avaliação Interna:</strong> ${getSupplierRatingStars(sup)}</span>
                            <button type="button" onclick="openReviewsModal('${sup.id}')" style="background: none; border: none; color: var(--accent); font-size: 0.75rem; text-decoration: underline; padding: 0; cursor: pointer; font-weight: 500;">
                                Opiniões (${irs.count})
                            </button>
                        </p>
                        <div class="reputation-details" style="margin-bottom: 0.75rem;">
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
                <div class="card-footer-actions" style="margin-top: 0.75rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: space-between; align-items: center;">
                    <button class="btn btn-sm" onclick="openAddReviewModal('${sup.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; border: 1px solid rgba(255,255,255,0.1); background-color: rgba(255,255,255,0.02); color: var(--text-primary); flex-grow: 1; justify-content: center; font-weight: 600;">
                        <i class="fa-solid fa-star" style="color: var(--warning);"></i> Avaliar
                    </button>
                    <button class="btn btn-sm" onclick="openReviewsModal('${sup.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; background-color: var(--accent); color: #000; flex-grow: 1; justify-content: center; font-weight: 700;">
                        <i class="fa-solid fa-comments"></i> Ver Avaliações
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

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
    
    if (filtered.length === 0 && query.trim().length > 2) {
        // No local database records found, query ReclameAqui API!
        supplierGrid.innerHTML = `
            <div class="api-loading-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--accent); margin-bottom: 0.75rem;"></i>
                <p style="font-size: 0.9rem;">Buscando '${searchInput.value}' na API real do ReclameAqui...</p>
            </div>
        `;
        emptyState.style.display = 'none';
        triggerReclameAquiApiSearch(searchInput.value);
    } else if (filtered.length === 0) {
        supplierGrid.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        renderFilteredSuppliersList(filtered);
    }
}

let apiSearchTimeoutId = null;
let lastApiQuery = "";

function triggerReclameAquiApiSearch(query) {
    if (query === lastApiQuery) return;
    
    if (apiSearchTimeoutId) clearTimeout(apiSearchTimeoutId);
    
    apiSearchTimeoutId = setTimeout(async () => {
        lastApiQuery = query;
        const result = await fetchRealReclameAquiData(query);
        
        if (searchInput.value !== query) return;
        
        if (result) {
            emptyState.style.display = 'none';
            supplierGrid.innerHTML = `
                <div class="supplier-card api-result-card" style="border-color: var(--accent); background: linear-gradient(135deg, rgba(6,182,212,0.02) 0%, rgba(0,0,0,0) 100%);">
                    <div style="position: absolute; top: 0.5rem; left: 0.5rem; background-color: var(--accent); color: #000; font-size: 0.65rem; font-weight: bold; padding: 0.15rem 0.4rem; border-radius: 4px; display: flex; align-items: center; gap: 0.25rem; z-index: 5;">
                        <i class="fa-solid fa-cloud"></i> VIA API RECLAMEAQUI
                    </div>
                    <div style="margin-top: 0.75rem;">
                        <div class="card-header">
                            <div class="supplier-info">
                                <h3>${result.name}</h3>
                                <span class="cnpj">CNPJ: Não cadastrado localmente</span>
                            </div>
                            <span class="badge badge-${result.status}">
                                ${result.status === 'ra1000' ? 'RA1000' : result.status === 'semdados' ? 'Sem Dados' : result.status}
                            </span>
                        </div>
                        <div class="card-body">
                            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                <strong>Categoria:</strong> Outros
                            </p>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">
                                <strong>Avaliação Interna:</strong> N/A (Não cadastrado)
                            </p>
                            <div class="reputation-details">
                                <div class="rep-stat score-stat">
                                    <span class="rep-label">ReclameAqui</span>
                                    <span class="rep-value score">${result.score}</span>
                                </div>
                                <div class="rep-stat desc-stat">
                                    <span class="rep-label">Histórico</span>
                                    <span class="rep-desc-text">${result.description}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${checkAdminAuth() ? `
                    <div class="card-footer" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; display: flex; justify-content: flex-end;">
                        <button class="btn btn-primary btn-sm" onclick="importApiSupplier('${encodeURIComponent(JSON.stringify(result))}')" style="background-color: var(--accent); color: #000; font-size: 0.75rem; font-weight: bold; padding: 0.4rem 0.8rem;">
                            <i class="fa-solid fa-download"></i> Importar para Base
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        } else {
            supplierGrid.innerHTML = '';
            emptyState.style.display = 'block';
        }
    }, 800);
}

window.importApiSupplier = function(encodedData) {
    const data = JSON.parse(decodeURIComponent(encodedData));
    closeAdminModal();
    openModal('Cadastrar Fornecedor', {
        id: '',
        name: data.name,
        cnpj: '',
        category: 'Outros',
        ratingInternal: '5',
        raStatus: data.status,
        raScore: data.score,
        description: data.description
    });
};

// Save to LocalStorage
function saveSuppliers() {
    localStorage.setItem('sf_suppliers', JSON.stringify(suppliers));
    renderSuppliers();
    renderAdminSuppliersList();
}

// Load Mock Initial Data
btnLoadMock.addEventListener('click', () => {
    if (suppliers.length > 0) {
        if (!confirm('Deseja sobrescrever a lista atual com os fornecedores padrão?')) return;
    }
    suppliers = [...initialSuppliers];
    saveSuppliers();
    showToast('Fornecedores de demonstração carregados com sucesso!', 'success');
});

// Admin Panel Suppliers List Renderer
function renderAdminSuppliersList() {
    if (!adminSuppliersList) return;
    
    if (suppliers.length === 0) {
        adminSuppliersList.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); font-size: 0.85rem; padding: 1.5rem 0;">
                Nenhum fornecedor cadastrado.
            </div>
        `;
        return;
    }
    
    adminSuppliersList.innerHTML = suppliers.map(sup => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; gap: 0.75rem;">
            <div style="display: flex; flex-direction: column; overflow: hidden; text-align: left;">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${sup.name}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">CNPJ: ${sup.cnpj}</span>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="editSupplier('${sup.id}')" style="padding: 0.35rem 0.7rem; font-size: 0.75rem; flex-shrink: 0; border-color: var(--accent); color: var(--accent); background-color: rgba(6, 182, 212, 0.05);">
                <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
        </div>
    `).join('');
}

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
        
        btnDeleteSupplierModal.style.display = 'block';
        btnDeleteSupplierModal.onclick = () => {
            if (confirm('Tem certeza que deseja excluir permanentemente este fornecedor?')) {
                suppliers = suppliers.filter(s => s.id !== supplier.id);
                saveSuppliers();
                closeModal();
                showToast('Fornecedor removido com sucesso.', 'success');
            }
        };
    } else {
        inputId.value = '';
        btnDeleteSupplierModal.style.display = 'none';
        btnDeleteSupplierModal.onclick = null;
    }
    
    supplierModal.classList.add('active');
}

function closeModal() {
    supplierModal.classList.remove('active');
    openAdminModal('tab-suppliers');
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
    
    // Query real ReclameAqui API first
    let found = await fetchRealReclameAquiData(query);
    
    // Fall back to local mock registry
    if (!found) {
        const cleanQuery = query.toLowerCase().replace(/\D/g, '') || query.toLowerCase();
        for (const key in reclameAquiMockDatabase) {
            if (cleanQuery.includes(key.replace(/\D/g, '')) || cleanQuery.includes(key)) {
                const mock = reclameAquiMockDatabase[key];
                found = {
                    name: mock.name,
                    status: mock.status,
                    score: mock.score,
                    description: "Fornecedor localizado na base de simulação local."
                };
                break;
            }
        }
    }
    
    btnFetchRa.disabled = false;
    btnFetchRa.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Consultar ReclameAqui`;
    
    if (found) {
        inputName.value = found.name;
        inputRaStatus.value = found.status;
        inputRaScore.value = found.score;
        inputDescription.value = found.description || '';
        showToast(`Fornecedor '${found.name}' localizado!`, 'success');
    } else {
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
        closeAdminModal();
        openModal('Editar Fornecedor', supplier);
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
    return getCookie('sf_captcha_verified') === 'true';
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
        setCookie('sf_captcha_verified', 'true', { 'max-age': 86400 });
        
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
                ${banner.logoUrl ? `
                <div class="promo-banner-logo">
                    <img src="${banner.logoUrl}" alt="Logo">
                </div>
                ` : ''}
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
            theme: inputBannerStyle.value,
            logoUrl: inputBannerLogoUrl.value.trim()
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
        inputBannerLogoUrl.value = ad.logoUrl || '';
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

function openAdminModal(defaultTabId = 'tab-banner') {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabPanels = document.querySelectorAll('.admin-tab-panel');
    
    tabButtons.forEach(b => {
        if (b.getAttribute('data-target') === defaultTabId) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    
    tabPanels.forEach(p => {
        if (p.id === defaultTabId) {
            p.style.display = 'block';
            p.classList.add('active');
        } else {
            p.style.display = 'none';
            p.classList.remove('active');
        }
    });

    inputBannerVisible.checked = bannerSettings.visible;
    
    tempCarouselBanners = JSON.parse(JSON.stringify(carouselBanners));
    activeEditIndex = 0;
    
    renderAdminAdList();
    loadAdFieldsIntoEditor(0);
    
    renderAdminSuppliersList();
    renderAdminReviewsList();
    updatePendingReviewsBadge();
    
    inputAdminWhatsappNumber.value = whatsappSettings.number;
    
    adminModal.classList.add('active');
}

function closeAdminModal() {
    adminModal.classList.remove('active');
}

// Authentication Logic for Admin Panel
function checkAdminAuth() {
    return sessionStorage.getItem('sf_admin_logged') === 'true';
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
    
    if (user === 'admin' && pass === 'W!qHowG7') {
        sessionStorage.setItem('sf_admin_logged', 'true');
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
    localStorage.setItem('sf_carousel_banners', JSON.stringify(carouselBanners));
    
    // Save banner visibility
    bannerSettings = {
        visible: inputBannerVisible.checked
    };
    localStorage.setItem('sf_banner_settings', JSON.stringify(bannerSettings));
    
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
    localStorage.setItem('sf_whatsapp_settings', JSON.stringify(whatsappSettings));
    
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

if (!localStorage.getItem('sf_carousel_banners')) {
    localStorage.setItem('sf_carousel_banners', JSON.stringify(carouselBanners));
}

// ==========================================
// REVIEWS & IRS SYSTEM IMPLEMENTATION
// ==========================================

// Helper to calculate IRS metrics
function calculateSupplierIrs(supplierId) {
    const approvedReviews = reviews.filter(r => r.supplierId === supplierId && r.status === 'approved');
    const count = approvedReviews.length;
    
    if (count === 0) {
        return {
            avg: 0.0,
            badge: 'Sem Índice ⚪',
            badgeClass: 'badge-semdados',
            recommendationRate: 0,
            count: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
    }
    
    const sum = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sum / count;
    
    const recommendedCount = approvedReviews.filter(r => r.rating >= 3).length;
    const recommendationRate = Math.round((recommendedCount / count) * 100);
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach(r => {
        if (distribution[r.rating] !== undefined) {
            distribution[r.rating]++;
        }
    });
    
    for (const stars in distribution) {
        distribution[stars] = Math.round((distribution[stars] / count) * 100);
    }
    
    let badge = 'Regular';
    let badgeClass = 'badge-regular';
    if (avg >= 4.5) {
        badge = 'Excelente 💎';
        badgeClass = 'badge-excelente';
    } else if (avg >= 3.5) {
        badge = 'Recomendado ✅';
        badgeClass = 'badge-recomendado';
    } else if (avg >= 2.5) {
        badge = 'Regular ⚠️';
        badgeClass = 'badge-regular';
    } else {
        badge = 'Não Recomendado ❌';
        badgeClass = 'badge-naorecomendado';
    }
    
    return {
        avg,
        badge,
        badgeClass,
        recommendationRate,
        count,
        distribution
    };
}

// Sync supplier star rating with average review rating
function syncSupplierRatings() {
    let updated = false;
    suppliers.forEach(sup => {
        const irs = calculateSupplierIrs(sup.id);
        if (irs.count > 0) {
            const newRating = Math.round(irs.avg).toString();
            if (sup.ratingInternal !== newRating) {
                sup.ratingInternal = newRating;
                updated = true;
            }
        }
    });
    if (updated) {
        saveSuppliers();
    }
}

// Select reviews DOM Elements
const reviewsDetailModal = document.getElementById('reviews-detail-modal');
const reviewsModalClose = document.getElementById('reviews-modal-close');
const addReviewModal = document.getElementById('add-review-modal');
const addReviewClose = document.getElementById('add-review-close');
const btnOpenAddReview = document.getElementById('btn-open-add-review');
const btnAddReviewCancel = document.getElementById('btn-add-review-cancel');
const addReviewForm = document.getElementById('add-review-form');

const starSelector = document.getElementById('star-selector');
const reviewRatingValue = document.getElementById('review-rating-value');
const starIcons = starSelector.querySelectorAll('i');

let selectedRating = 0;

// Star Selector click and hover handlers
starIcons.forEach(star => {
    star.addEventListener('mouseover', () => {
        const val = parseInt(star.getAttribute('data-value'));
        highlightStars(val);
    });
    
    star.addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
    });
    
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-value'));
        reviewRatingValue.value = selectedRating;
        highlightStars(selectedRating);
    });
});

function highlightStars(count) {
    starIcons.forEach(star => {
        const val = parseInt(star.getAttribute('data-value'));
        if (val <= count) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid', 'selected');
        } else {
            star.classList.remove('fa-solid', 'selected');
            star.classList.add('fa-regular');
        }
    });
}

// Modal open/close listeners
reviewsModalClose.addEventListener('click', () => reviewsDetailModal.classList.remove('active'));
addReviewClose.addEventListener('click', () => addReviewModal.classList.remove('active'));
btnAddReviewCancel.addEventListener('click', () => addReviewModal.classList.remove('active'));
btnOpenAddReview.addEventListener('click', () => {
    const supplierId = document.getElementById('review-supplier-id').value;
    openAddReviewModal(supplierId);
});

// Open reviews details and IRS dashboard
window.openReviewsModal = function(supplierId) {
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) return;
    
    document.getElementById('reviews-modal-supplier-name').innerText = `Avaliações de: ${sup.name}`;
    document.getElementById('review-supplier-id').value = supplierId;
    
    const irs = calculateSupplierIrs(supplierId);
    
    document.getElementById('irs-avg-score').innerText = irs.count > 0 ? irs.avg.toFixed(1) : 'N/A';
    
    const irsStarsContainer = document.getElementById('irs-stars-container');
    const roundedStars = irs.count > 0 ? Math.round(irs.avg) : 0;
    irsStarsContainer.innerText = '★'.repeat(roundedStars) + '☆'.repeat(5 - roundedStars);
    
    const badgeEl = document.getElementById('irs-badge');
    badgeEl.innerText = irs.badge;
    badgeEl.className = `irs-badge ${irs.badgeClass}`;
    
    document.getElementById('irs-recommendation-rate').innerText = irs.count > 0 ? `${irs.recommendationRate}%` : 'N/A';
    
    // Dist bars
    const distContainer = document.getElementById('irs-distribution-container');
    let distHtml = '';
    for (let i = 5; i >= 1; i--) {
        const pct = irs.distribution[i];
        distHtml += `
            <div class="irs-dist-bar-row">
                <span style="width: 35px; text-align: right;">${i} ★</span>
                <div class="irs-dist-bar-track">
                    <div class="irs-dist-bar-fill" style="width: ${pct}%;"></div>
                </div>
                <span style="width: 30px; text-align: left;">${pct}%</span>
            </div>
        `;
    }
    distContainer.innerHTML = distHtml;
    
    // Load comments
    const scrollList = document.getElementById('reviews-scroll-list');
    const approvedReviews = reviews.filter(r => r.supplierId === supplierId && r.status === 'approved');
    
    document.getElementById('reviews-count-label').innerText = `Exibindo ${approvedReviews.length} avaliações`;
    
    if (approvedReviews.length === 0) {
        scrollList.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 3rem 1rem;">
                <i class="fa-solid fa-face-meh" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--text-secondary); display: block;"></i>
                <p style="font-size: 0.9rem;">Este fornecedor ainda não recebeu avaliações.</p>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">Seja o primeiro a avaliar clicando no botão abaixo!</p>
            </div>
        `;
    } else {
        scrollList.innerHTML = approvedReviews.map(r => {
            const date = new Date(r.createdAt).toLocaleDateString('pt-BR');
            const starsStr = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            return `
                <div class="review-item-card">
                    <div class="review-card-header">
                        <div>
                            <h4 class="review-card-title">${r.title}</h4>
                            <div class="review-card-author">
                                <i class="fa-solid fa-user"></i> ${r.userName} • <i class="fa-solid fa-calendar"></i> ${date}
                            </div>
                        </div>
                        <span style="color: var(--warning); font-size: 0.85rem; font-weight: bold; letter-spacing: 1px;">
                            ${starsStr}
                        </span>
                    </div>
                    <p class="review-card-text">${r.comment}</p>
                </div>
            `;
        }).join('');
    }
    
    reviewsDetailModal.classList.add('active');
};

// Open add review modal
window.openAddReviewModal = function(supplierId) {
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) return;
    
    reviewsDetailModal.classList.remove('active');
    
    document.getElementById('review-supplier-id').value = supplierId;
    document.getElementById('add-review-title').innerText = `Avaliar: ${sup.name}`;
    addReviewForm.reset();
    
    selectedRating = 0;
    reviewRatingValue.value = "";
    highlightStars(0);
    
    addReviewModal.classList.add('active');
};

// Handle review submit
addReviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!isCaptchaVerified()) {
        addReviewModal.classList.remove('active');
        captchaModal.classList.add('active');
        showToast('Por favor, resolva o Captcha antes de submeter a avaliação.', 'warning');
        return;
    }
    
    const supplierId = document.getElementById('review-supplier-id').value;
    const rating = parseInt(reviewRatingValue.value);
    
    if (!rating) {
        showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'warning');
        return;
    }
    
    const newReview = {
        id: 'rev_' + Date.now().toString(),
        supplierId: supplierId,
        userName: document.getElementById('review-username').value.trim(),
        userEmail: document.getElementById('review-useremail').value.trim(),
        title: document.getElementById('review-title').value.trim(),
        comment: document.getElementById('review-comment').value.trim(),
        rating: rating,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    reviews.push(newReview);
    saveReviews();
    
    updatePendingReviewsBadge();
    
    addReviewModal.classList.remove('active');
    showToast('Sua avaliação foi enviada para moderação da administração!', 'success');
});

// Admin Moderation Helpers
function updatePendingReviewsBadge() {
    const pendingCount = reviews.filter(r => r.status === 'pending').length;
    const badge = document.getElementById('pending-reviews-badge');
    if (badge) {
        if (pendingCount > 0) {
            badge.innerText = pendingCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function renderAdminReviewsList() {
    const container = document.getElementById('admin-reviews-list-container');
    if (!container) return;
    
    const pendingReviews = reviews.filter(r => r.status === 'pending');
    
    if (pendingReviews.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                <i class="fa-solid fa-square-check" style="font-size: 2.2rem; color: var(--success); margin-bottom: 0.5rem; display: block;"></i>
                Nenhuma avaliação pendente de moderação.
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendingReviews.map(r => {
        const sup = suppliers.find(s => s.id === r.supplierId);
        const supplierName = sup ? sup.name : 'Fornecedor Desconhecido';
        const date = new Date(r.createdAt).toLocaleDateString('pt-BR');
        const starsStr = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        
        return `
            <div class="admin-pending-review-item">
                <div class="admin-pending-review-meta">
                    <span>Para: <strong>${supplierName}</strong></span>
                    <span>Enviado em: ${date}</span>
                </div>
                <div style="margin-top: 0.5rem;">
                    <h4 style="font-size: 0.9rem; font-weight: bold; margin-bottom: 0.25rem; color: var(--text-primary);">${r.title}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.75rem;">${r.comment}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">
                            Por: ${r.userName} (${r.userEmail}) • <span style="color: var(--warning); font-weight: bold;">${starsStr}</span>
                        </span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button type="button" class="btn btn-sm" onclick="approveReview('${r.id}')" style="background-color: var(--success); color: white; padding: 0.35rem 0.7rem; font-size: 0.75rem; font-weight: bold; border-radius: 4px;">
                                <i class="fa-solid fa-check"></i> Aprovar
                            </button>
                            <button type="button" class="btn btn-sm" onclick="rejectReview('${r.id}')" style="background-color: var(--danger); color: white; padding: 0.35rem 0.7rem; font-size: 0.75rem; font-weight: bold; border-radius: 4px;">
                                <i class="fa-solid fa-xmark"></i> Rejeitar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.approveReview = function(reviewId) {
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return;
    
    rev.status = 'approved';
    saveReviews();
    
    syncSupplierRatings();
    
    updatePendingReviewsBadge();
    renderAdminReviewsList();
    renderSuppliers();
    
    showToast('Avaliação aprovada e publicada com sucesso!', 'success');
};

window.rejectReview = function(reviewId) {
    if (!confirm('Deseja realmente rejeitar e excluir esta avaliação permanentemente?')) return;
    
    reviews = reviews.filter(r => r.id !== reviewId);
    saveReviews();
    
    updatePendingReviewsBadge();
    renderAdminReviewsList();
    renderSuppliers();
    
    showToast('Avaliação rejeitada e removida com sucesso.', 'info');
};

// Initial triggers on load
syncSupplierRatings();
updatePendingReviewsBadge();



