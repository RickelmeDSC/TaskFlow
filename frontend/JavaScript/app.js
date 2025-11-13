const API_BASE_URL = 'http://localhost:5000/api';
let currentFilter = 'all';
let tasks = [];

console.log('✅ app.js carregado com sucesso');

function showError(message) {
    const existingError = document.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.innerHTML = `❌ ${message}`;
    
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.innerHTML = `✅ ${message}`;
    
    const container = document.querySelector('.container');
    container.insertBefore(successDiv, container.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

async function checkAPIHealth() {
    try {
        console.log('🔄 Verificando conexão com a API...');
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) throw new Error('API offline');
        
        const data = await response.json();
        console.log('✅ API está online:', data);
        return true;
    } catch (error) {
        showError('⚠️ Erro de conexão com o servidor. Verifique se o backend está rodando na porta 5000.');
        console.error('Erro na conexão com a API:', error);
        return false;
    }
}

async function apiRequest(endpoint, options = {}) {
    try {
        console.log(`🌐 Requisição para: ${API_BASE_URL}${endpoint}`, options);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erro HTTP ${response.status}:`, errorText);
            throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Resposta de ${endpoint}:`, data);
        return data;
        
    } catch (error) {
        console.error('❌ Erro na requisição API:', error);
        showError(`Erro na requisição: ${error.message}`);
        throw error;
    }
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            console.log(`🔍 Filtrando por: ${currentFilter}`);
            displayTasks(tasks);
        });
    });
}

function setupSearch() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" id="searchInput" placeholder="🔍 Buscar tarefas..." class="search-input">
    `;
    
    const tasksSection = document.querySelector('.tasks-section');
    const filters = document.querySelector('.filters');
    tasksSection.insertBefore(searchContainer, filters);
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filterTasksBySearch(term);
    });
}

function filterTasksBySearch(searchTerm) {
    if (!searchTerm) {
        displayTasks(tasks);
        return;
    }
    
    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm)) ||
        task.category.toLowerCase().includes(searchTerm)
    );
    
    displayTasks(filteredTasks);
}

function updateStats() {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pendente').length;
    const completed = tasks.filter(t => t.status === 'concluida').length;
    
    let statsElement = document.querySelector('.stats');
    if (!statsElement) {
        statsElement = document.createElement('div');
        statsElement.className = 'stats';
        document.querySelector('.tasks-section').insertBefore(statsElement, document.querySelector('.tasks-list'));
    }
    
    statsElement.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${total}</span>
            <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${pending}</span>
            <span class="stat-label">Pendentes</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${completed}</span>
            <span class="stat-label">Concluídas</span>
        </div>
    `;
}

function checkDueDates() {
    tasks.forEach(task => {
        if (task.due_date && task.status === 'pendente') {
            if (isTaskOverdue(task)) {
                console.log(`🔴 Tarefa "${task.title}" está VENCIDA!`);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TaskFlow inicializado');
    
    console.log('📝 Formulário encontrado:', document.getElementById('taskForm'));
    console.log('📋 Lista de tarefas encontrada:', document.getElementById('tasksList'));
    
    setupFilters();
    setupSearch();
    
    checkAPIHealth().then(apiOnline => {
        if (apiOnline) {
            loadTasks();
        }
    });
    
    setInterval(checkDueDates, 60000);
});

window.isTaskOverdue = function(task) {
    if (!task.due_date || task.status === 'concluida') return false;
    
    try {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth() + 1;
        const dia = hoje.getDate();
        const hojeFormatado = `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        
        const dataVencimento = task.due_date;
        
        console.log('🔍 VERIFICAÇÃO:', {
            tarefa: task.title,
            vencimento: dataVencimento,
            hoje: hojeFormatado,
            comparacao: dataVencimento <= hojeFormatado
        });
        
        return dataVencimento <= hojeFormatado;
        
    } catch (error) {
        console.error('Erro ao verificar vencimento:', error);
        return false;
    }
}

window.formatDate = function(dateString) {
    if (!dateString) return '';
    
    try {
        const partes = dateString.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return dateString;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dateString;
    }
}

window.getStatusText = function(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'concluida': 'Concluída'
    };
    return statusMap[status] || status;
}

window.getPriorityText = function(priority) {
    const priorityMap = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta'
    };
    return priorityMap[priority] || priority;
}

window.getCategoryText = function(category) {
    const categoryMap = {
        'lazer': 'Lazer',
        'estudo': 'Estudo',
        'trabalho': 'Trabalho',
        'saude': 'Saúde',
        'casa': 'Casa',
        'compras': 'Compras',
        'outros': 'Outros'
    };
    return categoryMap[category] || category;
}

window.escapeHtml = function(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.debugTask = function(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (task) {
        const hoje = new Date();
        const hojeFormatado = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;
        
        console.log('🐛 DEBUG TAREFA:', {
            id: task.id,
            titulo: task.title,
            vencimento: task.due_date,
            hoje: hojeFormatado,
            vencida: task.due_date < hojeFormatado,
            status: task.status
        });
    }
}

window.apiRequest = apiRequest;
window.showError = showError;
window.showSuccess = showSuccess;
window.currentFilter = currentFilter;
window.filterTasksBySearch = filterTasksBySearch;

console.log('✅ Todas as funções do app.js carregadas');