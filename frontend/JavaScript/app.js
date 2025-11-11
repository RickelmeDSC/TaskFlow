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
        task.description.toLowerCase().includes(searchTerm) ||
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    tasks.forEach(task => {
        if (task.due_date && task.status === 'pendente') {
            const dueDate = new Date(task.due_date);
            if (dueDate.toDateString() === today.toDateString()) {
                console.log(`⚠️ Tarefa "${task.title}" vence hoje!`);
            } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                console.log(`🔔 Tarefa "${task.title}" vence amanhã!`);
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

window.debugAPI = async function() {
    console.log('🔍 Debugando API...');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Resposta da API:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro na API:', error);
        return null;
    }
}

setTimeout(() => {
    window.debugAPI();
}, 1000);

window.apiRequest = apiRequest;
window.showError = showError;
window.showSuccess = showSuccess;
window.currentFilter = currentFilter;