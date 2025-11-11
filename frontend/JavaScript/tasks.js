// Gerenciamento de Tarefas

// Carregar todas as tarefas
async function loadTasks() {
    const tasksList = document.getElementById('tasksList');
    
    try {
        tasksList.innerHTML = '<div class="loading">🔄 Carregando tarefas...</div>';
        console.log('📥 Carregando tarefas...');
        
        const tasksData = await apiRequest('/tasks');
        tasks = tasksData; // Atualizar estado global
        displayTasks(tasks);
        updateStats();
        checkDueDates();
        
        console.log(`✅ ${tasks.length} tarefas carregadas`);
    } catch (error) {
        tasksList.innerHTML = '<div class="error">❌ Erro ao carregar tarefas. Verifique se o backend está rodando.</div>';
        console.error('Erro ao carregar tarefas:', error);
    }
}

// Exibir tarefas na lista
function displayTasks(tasksToDisplay = tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasksToDisplay.length === 0) {
        tasksList.innerHTML = '<div class="empty-state">📝 Nenhuma tarefa encontrada. Adicione sua primeira tarefa!</div>';
        return;
    }
    
    // Filtrar tarefas conforme o filtro atual
    const filteredTasks = tasksToDisplay.filter(task => {
        if (currentFilter === 'all') return true;
        return task.status === currentFilter;
    });
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `<div class="empty-state">📝 Nenhuma tarefa ${getFilterText(currentFilter)} encontrada.</div>`;
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => {
        const isOverdue = isTaskOverdue(task);
        const taskClasses = `task-item ${task.status} ${task.priority} ${isOverdue ? 'task-overdue' : ''}`;
        
        return `
            <div class="${taskClasses}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title">
                        ${escapeHtml(task.title)}
                        ${isTaskNew(task) ? '<span class="new-badge">NOVO</span>' : ''}
                    </div>
                    <div class="task-badges">
                        <span class="task-priority priority-${task.priority}">
                            ${getPriorityText(task.priority)}
                        </span>
                        <span class="category-badge category-${task.category}">
                            ${getCategoryText(task.category)}
                        </span>
                        <span class="status-indicator status-${task.status}"></span>
                    </div>
                </div>
                
                ${task.description ? `
                    <div class="task-description">${escapeHtml(task.description)}</div>
                ` : ''}
                
                <div class="task-meta">
                    <div class="task-info">
                        <span class="task-status">
                            <span class="status-indicator status-${task.status}"></span>
                            ${getStatusText(task.status)}
                        </span>
                        ${task.due_date ? `
                            <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                                📅 ${formatDate(task.due_date)} ${isOverdue ? '(VENCIDA)' : ''}
                            </span>
                        ` : ''}
                        ${task.created_at ? `
                            <span class="task-created">
                                🗓️ ${formatDate(task.created_at)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="task-actions">
                        <button class="btn btn-success btn-sm" onclick="updateTaskStatus(${task.id}, '${task.status === 'concluida' ? 'pendente' : 'concluida'}')">
                            ${task.status === 'concluida' ? '↶ Reabrir' : '✓ Concluir'}
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="editTask(${task.id})">✏️ Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">🗑️ Excluir</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Adicionar nova tarefa
document.getElementById('taskForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const taskData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        priority: formData.get('priority'),
        category: formData.get('category'),
        due_date: formData.get('due_date') || null
    };
    
    // Validação básica
    if (!taskData.title) {
        showError('Por favor, insira um título para a tarefa.');
        return;
    }
    
    console.log('📤 Enviando nova tarefa...', taskData);
    
    try {
        const result = await apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
        
        // Limpar formulário
        this.reset();
        document.getElementById('priority').value = 'media';
        document.getElementById('category').value = 'outros';
        
        // Recarregar tarefas
        await loadTasks();
        showSuccess('Tarefa criada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
    }
});

// Editar tarefa - abrir modal
async function editTask(taskId) {
    try {
        console.log(`📝 Editando tarefa ID: ${taskId}`);
        const task = await apiRequest(`/tasks/${taskId}`);
        
        // Preencher formulário de edição
        document.getElementById('edit_id').value = task.id;
        document.getElementById('edit_title').value = task.title;
        document.getElementById('edit_description').value = task.description || '';
        document.getElementById('edit_status').value = task.status;
        document.getElementById('edit_priority').value = task.priority;
        document.getElementById('edit_category').value = task.category;
        document.getElementById('edit_due_date').value = task.due_date || '';
        
        // Abrir modal
        document.getElementById('editModal').style.display = 'block';
        console.log('✅ Formulário de edição carregado');
        
    } catch (error) {
        showError('Erro ao carregar tarefa para edição.');
        console.error('Erro ao carregar tarefa:', error);
    }
}

// Salvar edição da tarefa
document.getElementById('editTaskForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const taskData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        status: formData.get('status'),
        priority: formData.get('priority'),
        category: formData.get('category'),
        due_date: formData.get('due_date') || null
    };
    
    const taskId = formData.get('id');
    
    // Validação
    if (!taskData.title) {
        showError('Por favor, insira um título para a tarefa.');
        return;
    }
    
    console.log(`💾 Salvando tarefa ID: ${taskId}`, taskData);
    
    try {
        await apiRequest(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
        
        // Fechar modal e recarregar tarefas
        closeEditModal();
        await loadTasks();
        showSuccess('Tarefa atualizada com sucesso!');
        
    } catch (error) {
        showError('Erro ao atualizar tarefa.');
        console.error('Erro ao atualizar tarefa:', error);
    }
});

// Atualizar status da tarefa
async function updateTaskStatus(taskId, newStatus) {
    try {
        console.log(`🔄 Atualizando status da tarefa ${taskId} para ${newStatus}`);
        const task = await apiRequest(`/tasks/${taskId}`);
        
        await apiRequest(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...task,
                status: newStatus
            })
        });
        
        await loadTasks();
        showSuccess(`Tarefa ${newStatus === 'concluida' ? 'concluída' : 'reaberta'}!`);
        
    } catch (error) {
        showError('Erro ao atualizar status da tarefa.');
        console.error('Erro ao atualizar status:', error);
    }
}

// Excluir tarefa
async function deleteTask(taskId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        console.log(`🗑️ Excluindo tarefa ID: ${taskId}`);
        await apiRequest(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        await loadTasks();
        showSuccess('Tarefa excluída com sucesso!');
        
    } catch (error) {
        showError('Erro ao excluir tarefa.');
        console.error('Erro ao excluir tarefa:', error);
    }
}

// Fechar modal de edição
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    console.log('📋 Modal fechado');
}

// Event listeners para o modal
document.querySelector('.close').addEventListener('click', closeEditModal);
document.getElementById('cancelEdit').addEventListener('click', closeEditModal);

// Fechar modal ao clicar fora dele
window.addEventListener('click', function(e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// =============================================
// FUNÇÕES UTILITÁRIAS
// =============================================

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getStatusText(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'concluida': 'Concluída'
    };
    return statusMap[status] || status;
}

function getPriorityText(priority) {
    const priorityMap = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta'
    };
    return priorityMap[priority] || priority;
}

function getCategoryText(category) {
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

function getFilterText(filter) {
    const filterMap = {
        'all': '',
        'pendente': 'pendente',
        'concluida': 'concluída'
    };
    return filterMap[filter] || filter;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dateString;
    }
}

function isTaskOverdue(task) {
    if (!task.due_date || task.status === 'concluida') return false;
    
    const today = new Date();
    const dueDate = new Date(task.due_date);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
}

function isTaskNew(task) {
    if (!task.created_at) return false;
    
    const created = new Date(task.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1; // Considera "novo" por 1 dia
}

// Exportar funções para escopo global
window.loadTasks = loadTasks;
window.editTask = editTask;
window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;
window.closeEditModal = closeEditModal;
window.displayTasks = displayTasks;
window.filterTasksBySearch = filterTasksBySearch;

console.log('✅ tasks.js carregado com sucesso');