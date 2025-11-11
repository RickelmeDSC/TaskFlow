import pymysql
from config import Config
from datetime import datetime

class Database:
    def __init__(self):
        self.config = Config()
    
    def get_connection(self):
        return pymysql.connect(
            host=self.config.DB_HOST,
            user=self.config.DB_USER,
            password=self.config.DB_PASSWORD,
            database=self.config.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )

class Task:
    def __init__(self, id=None, title=None, description=None, status='pendente', 
                 priority='media', category='outros', due_date=None, created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        self.priority = priority
        self.category = category
        self.due_date = self._parse_date(due_date)
        self.created_at = created_at
        self.updated_at = updated_at
    
    def _parse_date(self, date_value):
        """Converte a data para o formato MySQL YYYY-MM-DD"""
        if not date_value:
            return None
        
        if isinstance(date_value, str) and len(date_value) == 10 and date_value[4] == '-':
            return date_value
        
        try:
            if isinstance(date_value, str):
                if 'GMT' in date_value or 'UTC' in date_value:
                    date_value = date_value.split(' GMT')[0].split(' UTC')[0]
                
                for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%a, %d %b %Y %H:%M:%S']:
                    try:
                        dt = datetime.strptime(date_value, fmt)
                        return dt.strftime('%Y-%m-%d')
                    except ValueError:
                        continue
            
            if hasattr(date_value, 'strftime'):
                return date_value.strftime('%Y-%m-%d')
                
        except Exception as e:
            print(f"⚠️ Erro ao converter data '{date_value}': {e}")
        
        return None
    
    @staticmethod
    def get_all():
        db = Database()
        connection = db.get_connection()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM tasks ORDER BY created_at DESC"
                cursor.execute(sql)
                return cursor.fetchall()
        except Exception as e:
            print(f"❌ Erro em Task.get_all: {str(e)}")
            raise e
        finally:
            connection.close()
    
    @staticmethod
    def get_by_id(task_id):
        db = Database()
        connection = db.get_connection()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM tasks WHERE id = %s"
                cursor.execute(sql, (task_id,))
                return cursor.fetchone()
        except Exception as e:
            print(f"❌ Erro em Task.get_by_id: {str(e)}")
            raise e
        finally:
            connection.close()
    
    def save(self):
        db = Database()
        connection = db.get_connection()
        try:
            with connection.cursor() as cursor:
                if self.id:
                    sql = """UPDATE tasks 
                             SET title=%s, description=%s, status=%s, 
                                 priority=%s, category=%s, due_date=%s 
                             WHERE id=%s"""
                    cursor.execute(sql, (
                        self.title, 
                        self.description or '', 
                        self.status, 
                        self.priority, 
                        self.category,
                        self.due_date, 
                        self.id
                    ))
                    print(f"✅ Tarefa {self.id} atualizada: {self.title} (categoria: {self.category})")
                else:
                    sql = """INSERT INTO tasks (title, description, status, priority, category, due_date) 
                             VALUES (%s, %s, %s, %s, %s, %s)"""
                    cursor.execute(sql, (
                        self.title, 
                        self.description or '', 
                        self.status, 
                        self.priority, 
                        self.category,
                        self.due_date
                    ))
                    print(f"✅ Nova tarefa criada: {self.title} (categoria: {self.category})")
                
                connection.commit()
                return cursor.lastrowid if not self.id else self.id
        except Exception as e:
            print(f"❌ Erro em Task.save: {str(e)}")
            connection.rollback()
            raise e
        finally:
            connection.close()
    
    @staticmethod
    def delete(task_id):
        db = Database()
        connection = db.get_connection()
        try:
            with connection.cursor() as cursor:
                sql = "DELETE FROM tasks WHERE id = %s"
                cursor.execute(sql, (task_id,))
                connection.commit()
                deleted = cursor.rowcount > 0
                if deleted:
                    print(f"✅ Tarefa {task_id} excluída")
                return deleted
        except Exception as e:
            print(f"❌ Erro em Task.delete: {str(e)}")
            connection.rollback()
            raise e
        finally:
            connection.close()