import pymysql
from config import Config

def update_schema():
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
            # Verificar se a coluna category existe
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = %s 
                AND TABLE_NAME = 'tasks' 
                AND COLUMN_NAME = 'category'
            """, (config.DB_NAME,))
            
            result = cursor.fetchone()
            
            if result['count'] == 0:
                print("🔄 Adicionando coluna 'category' à tabela tasks...")
                cursor.execute("""
                    ALTER TABLE tasks 
                    ADD COLUMN category ENUM('lazer', 'estudo', 'trabalho', 'saude', 'casa', 'compras', 'outros') DEFAULT 'outros'
                """)
                print("✅ Coluna 'category' adicionada com sucesso!")
            else:
                print("✅ Coluna 'category' já existe!")
            
            # Atualizar status para remover 'em_andamento'
            print("🔄 Atualizando enum de status...")
            cursor.execute("""
                ALTER TABLE tasks 
                MODIFY COLUMN status ENUM('pendente', 'concluida') DEFAULT 'pendente'
            """)
            print("✅ Status atualizado para ('pendente', 'concluida')")
            
        connection.commit()
        print("🎉 Schema atualizado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar schema: {e}")
    finally:
        connection.close()

if __name__ == '__main__':
    update_schema()