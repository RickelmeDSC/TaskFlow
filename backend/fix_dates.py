import pymysql
from config import Config
from datetime import datetime

def fix_existing_dates():
    config = Config()
    
    try:
        connection = pymysql.connect(
            host=config.DB_HOST,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, due_date FROM tasks WHERE due_date IS NOT NULL")
            tasks = cursor.fetchall()
            
            print(f"🔍 Encontradas {len(tasks)} tarefas com datas")
            
            for task in tasks:
                original_date = task['due_date']
                if isinstance(original_date, str) and ('GMT' in original_date or 'UTC' in original_date):
                    try:
                        date_str = original_date.split(' GMT')[0].split(' UTC')[0]
                        dt = datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S')
                        mysql_date = dt.strftime('%Y-%m-%d')
                        cursor.execute("UPDATE tasks SET due_date = %s WHERE id = %s", 
                                     (mysql_date, task['id']))
                        print(f"✅ Corrigido: ID {task['id']} - {original_date} -> {mysql_date}")
                        
                    except Exception as e:
                        print(f"❌ Erro ao corrigir tarefa {task['id']}: {e}")
                        cursor.execute("UPDATE tasks SET due_date = NULL WHERE id = %s", 
                                     (task['id'],))
                        print(f"⚠️  Definido como NULL: ID {task['id']}")
            
            connection.commit()
            print("🎉 Correção de datas concluída!")
            
    except Exception as e:
        print(f"❌ Erro geral: {e}")
    finally:
        connection.close()

if __name__ == '__main__':
    fix_existing_dates()