# fix_dates_complete.py
import pymysql
from config import Config
from datetime import datetime
import re

def fix_all_dates():
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
            # Busca todas as tarefas
            cursor.execute("SELECT id, due_date FROM tasks WHERE due_date IS NOT NULL")
            tasks = cursor.fetchall()
            
            print(f"🔍 Encontradas {len(tasks)} tarefas com datas para corrigir")
            
            for task in tasks:
                original_date = task['due_date']
                corrected_date = None
                
                try:
                    if isinstance(original_date, datetime):
                        # Se já é datetime, converte para string
                        corrected_date = original_date.strftime('%Y-%m-%d')
                    elif isinstance(original_date, str):
                        # Remove timezone info
                        clean_date = original_date.split(' GMT')[0].split(' UTC')[0].split('+')[0].strip()
                        
                        # Tenta diferentes formatos
                        for fmt in ['%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%d/%m/%Y', '%m/%d/%Y', '%a, %d %b %Y %H:%M:%S']:
                            try:
                                dt = datetime.strptime(clean_date, fmt)
                                corrected_date = dt.strftime('%Y-%m-%d')
                                break
                            except ValueError:
                                continue
                    
                    if corrected_date:
                        cursor.execute("UPDATE tasks SET due_date = %s WHERE id = %s", 
                                     (corrected_date, task['id']))
                        print(f"✅ Corrigido: ID {task['id']} - '{original_date}' -> '{corrected_date}'")
                    else:
                        print(f"❌ Não foi possível corrigir: ID {task['id']} - '{original_date}'")
                        cursor.execute("UPDATE tasks SET due_date = NULL WHERE id = %s", 
                                     (task['id'],))
                        
                except Exception as e:
                    print(f"❌ Erro ao corrigir tarefa {task['id']}: {e}")
                    cursor.execute("UPDATE tasks SET due_date = NULL WHERE id = %s", 
                                 (task['id'],))
            
            connection.commit()
            print("🎉 Todas as datas foram corrigidas!")
            
    except Exception as e:
        print(f"❌ Erro geral: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == '__main__':
    fix_all_dates()