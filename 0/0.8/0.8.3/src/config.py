# src/config.py
import os
import time
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

class PineconeConfig:
    def __init__(self):
        self.api_key = os.getenv('PINECONE_API_KEY')
        if not self.api_key:
            raise ValueError("PINECONE_API_KEY no encontrada en variables de entorno")
        
        self.pc = Pinecone(api_key=self.api_key)
        print("Pinecone configurado correctamente")
    
    def get_index(self, index_name, dimension=384, metric='cosine', force_recreate=False):
        """Obtener o crear índice de Pinecone"""
        try:
            # Listar índices existentes
            existing_indexes = self.pc.list_indexes()
            index_names = [index.name for index in existing_indexes]
            
            print(f"Índices existentes: {index_names}")
            
            if index_name not in index_names:
                print(f"Creando nuevo índice: {index_name} con dimensión {dimension}")
                self.pc.create_index(
                    name=index_name,
                    dimension=dimension,
                    metric=metric,
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
                print("Esperando a que el índice esté listo...")
                time.sleep(10)
                print("Índice creado y listo")
            else:
                print(f"Usando índice existente: {index_name}")
            
            return self.pc.Index(index_name)
            
        except Exception as e:
            print(f"Error al obtener índice: {e}")
            raise