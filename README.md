📋 TaskFlow - Gerenciador de Tarefas Completo
https://img.shields.io/badge/Status-Conclu%C3%ADdo-green
https://img.shields.io/badge/Frontend-HTML/CSS/JS-orange
https://img.shields.io/badge/Backend-Flask/MySQL-blue
https://img.shields.io/badge/API-RESTful-lightgrey

📖 Sobre o Projeto
O TaskFlow é um sistema completo de gerenciamento de tarefas com frontend moderno e backend robusto. Desenvolvido com tecnologias web full-stack, oferece uma experiência fluida com design glassmorphism e funcionalidades completas de CRUD.

🛠️ Tecnologias Utilizadas
Frontend
HTML5 - Estrutura semântica

CSS3 - Glassmorphism e design responsivo

JavaScript ES6+ - Interatividade e consumo de API

Backend
Flask 3.0.0 - Framework web Python

MySQL - Banco de dados relacional

PyMySQL - Conexão com MySQL

Flask-CORS - Habilitar requisições cross-origin

🚀 Como Executar o Projeto
Pré-requisitos
Python 3.8+

MySQL Server

Navegador moderno

1. Configuração do Backend
bash
# Clone o repositório
git clone https://github.com/seu-usuario/taskflow.git
cd taskflow/backend

# Instale as dependências
pip install -r requirements.txt

# Configure o arquivo .env
cp .env.example .env
# Edite o .env com suas credenciais MySQL

# Execute o servidor Flask
python app.py
2. Configuração do Banco de Dados
bash
# Execute o schema inicial
mysql -u root -p < database/schema.sql

# Atualize o schema se necessário
python update_schema.py

# Corrija datas existentes (opcional)
python fix_dates.py
3. Execução do Frontend
bash
# Em outro terminal, na pasta frontend
python -m http.server 8000

# Acesse no navegador
http://localhost:8000
📁 Estrutura do Projeto
text
taskflow/
├── backend/
│   ├── app.py              # Aplicação Flask principal
│   ├── config.py           # Configurações da aplicação
│   ├── models.py           # Modelos de dados e lógica de negócio
│   ├── requirements.txt    # Dependências Python
│   ├── schema.sql          # Estrutura do banco de dados
│   ├── update_schema.py    # Atualizações do schema
│   ├── fix_dates.py        # Correção de datas
│   └── .env               # Variáveis de ambiente
└── frontend/
    ├── index.html          # Página principal
    ├── css/styles.css      # Estilos glassmorphism
    ├── js/app.js           # Configuração da aplicação
    └── js/tasks.js         # Funcionalidades de tarefas
🔌 API Endpoints
Método	Endpoint	Descrição
GET	/api/tasks	Listar todas as tarefas
POST	/api/tasks	Criar nova tarefa
PUT	/api/tasks/<id>	Atualizar tarefa
DELETE	/api/tasks/<id>	Excluir tarefa
GET	/api/health	Status da API
📊 Funcionalidades
Gerenciamento de Tarefas
✅ CRUD Completo - Criar, ler, editar e excluir

🏷️ Categorias - Lazer, Estudo, Trabalho, Saúde, Casa, Compras, Outros

⚡ Prioridades - Baixa, Média, Alta

📅 Datas de Vencimento - Controle de prazos

🔄 Status - Pendente/Concluída

Interface
🎨 Design Glassmorphism - Efeitos visuais modernos

🔍 Busca em Tempo Real - Filtro instantâneo

📱 Responsivo - Mobile-first design

⚡ Performance - Otimizado e rápido

🔧 Configuração
Variáveis de Ambiente (.env)
env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=taskflow_db
SECRET_KEY=sua_chave_secreta
Estrutura do Banco
sql
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pendente', 'concluida'),
    priority ENUM('baixa', 'media', 'alta'),
    category ENUM('lazer', 'estudo', 'trabalho', 'saude', 'casa', 'compras', 'outros'),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
🐛 Troubleshooting
Problemas Comuns
Backend não conecta ao MySQL:

Verifique credenciais no .env

Confirme se MySQL está rodando

Teste conexão manualmente

Frontend não carrega tarefas:

Verifique se backend está na porta 5000

Confirme CORS está habilitado

Cheque console do navegador (F12)

Erros de data:

Execute python fix_dates.py

Verifique formato das datas (YYYY-MM-DD)

📈 Próximas Melhorias
Autenticação de usuários

Sincronização em nuvem

Notificações push

Modo escuro

Exportação de relatórios

👨‍💻 Desenvolvimento
Este projeto demonstra habilidades full-stack com:

Arquitetura RESTful API

Design patterns MVC

Banco de dados relacional

Frontend moderno e responsivo

Integração contínua entre camadas

Desenvolvido com 💻 por [Seu Nome]
Sistema completo para organização pessoal e profissional

<div align="center"> 🎯 **TaskFlow - Organize sua vida, uma tarefa de cada vez!** </div>