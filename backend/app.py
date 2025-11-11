from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Task

app = Flask(__name__)
CORS(app)

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.get_all()
        return jsonify(tasks)
    except Exception as e:
        print(f"❌ Erro em GET /api/tasks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    try:
        task = Task.get_by_id(task_id)
        if task:
            return jsonify(task)
        return jsonify({'error': 'Tarefa não encontrada'}), 404
    except Exception as e:
        print(f"❌ Erro em GET /api/tasks/{task_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        print(f"📝 Dados recebidos para criação: {data}")
        
        task = Task(
            title=data.get('title'),
            description=data.get('description', ''),
            status=data.get('status', 'pendente'),
            priority=data.get('priority', 'media'),
            category=data.get('category', 'outros'),
            due_date=data.get('due_date')
        )
        task_id = task.save()
        return jsonify({'id': task_id, 'message': 'Tarefa criada com sucesso'}), 201
    except Exception as e:
        print(f"❌ Erro em POST /api/tasks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        print(f"📝 Dados recebidos para atualização da tarefa {task_id}: {data}")
        
        existing_task = Task.get_by_id(task_id)
        if not existing_task:
            return jsonify({'error': 'Tarefa não encontrada'}), 404
        
        task = Task(
            id=task_id,
            title=data.get('title', existing_task['title']),
            description=data.get('description', existing_task.get('description', '')),
            status=data.get('status', existing_task['status']),
            priority=data.get('priority', existing_task['priority']),
            category=data.get('category', existing_task.get('category', 'outros')),
            due_date=data.get('due_date', existing_task.get('due_date'))
        )
        
        print(f"🔄 Salvando tarefa: {task.title} (categoria: {task.category})")
        
        task.save()
        return jsonify({'message': 'Tarefa atualizada com sucesso'})
    except Exception as e:
        print(f"❌ Erro em PUT /api/tasks/{task_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        success = Task.delete(task_id)
        if success:
            return jsonify({'message': 'Tarefa excluída com sucesso'})
        return jsonify({'error': 'Tarefa não encontrada'}), 404
    except Exception as e:
        print(f"❌ Erro em DELETE /api/tasks/{task_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'API está funcionando!'})

@app.route('/api/tasks', methods=['OPTIONS'])
def options_tasks():
    return '', 200

@app.route('/api/tasks/<int:task_id>', methods=['OPTIONS'])
def options_task(task_id):
    return '', 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)