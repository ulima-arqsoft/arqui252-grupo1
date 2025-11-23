# src/movie_recommender.py
import pandas as pd
import numpy as np
import os
from sklearn.decomposition import PCA
import plotly.express as px
from config import PineconeConfig

class MovieVectorDemo:
    def __init__(self):
        try:
            self.config = PineconeConfig()
            self.index_name = "movie-demo-semantic"
            self.movies_df = None
            self.embedding_model = None
            print("MovieVectorDemo inicializado correctamente")
        except Exception as e:
            print(f"Error al inicializar MovieVectorDemo: {e}")
            raise
        
    def load_sample_data(self):
        """Cargar datos SOLO desde CSV - falla si no existe"""
        try:
            # Cargar únicamente desde CSV
            csv_path = "/app/data/movies.csv"
            if not os.path.exists(csv_path):
                raise FileNotFoundError(f"No se encontró el archivo CSV: {csv_path}")
            
            self.movies_df = pd.read_csv(csv_path)
            print(f"{len(self.movies_df)} películas cargadas desde CSV")
            
            return self.movies_df

        except Exception as e:
            print(f"Error cargando datos desde CSV: {e}")
            raise
    
    def initialize_embedding_model(self):
        """Inicializar modelo de embeddings semánticos"""
        try:
            from sentence_transformers import SentenceTransformer
            self.embedding_model = SentenceTransformer('all-mpnet-base-v2')  # Más potente
            print("Modelo de embeddings cargado")
            return self.embedding_model
        except Exception as e:
            print(f"Error cargando modelo de embeddings: {e}")
            raise
    
    def create_embeddings(self):
        """Crear embeddings semánticos usando sentence-transformers"""
        try:
            if self.movies_df is None:
                self.load_sample_data()
            
            if self.embedding_model is None:
                self.initialize_embedding_model()
            
            # Crear texto combinado para embeddings
            combined_text = []
            for _, movie in self.movies_df.iterrows():
                # Usar título, género y descripción
                text = f"{movie['title']}. {movie['genre']}. {movie['description']}"
                
                # Si existen keywords, agregarlas también
                if 'keywords' in movie and pd.notna(movie['keywords']):
                    text += f". {movie['keywords']}"
                
                combined_text.append(text)
            
            # Generar embeddings semánticos
            embeddings = self.embedding_model.encode(combined_text)
            
            print(f"Embeddings semánticos creados: {embeddings.shape}")
            return embeddings
        except Exception as e:
            print(f"Error creando embeddings: {e}")
            raise
    
    def upload_to_pinecone(self):
        """Subir datos a Pinecone"""
        try:
            embeddings = self.create_embeddings()
            
            # Obtener la dimensión REAL de los embeddings
            actual_dimension = embeddings.shape[1]
            print(f"Dimensión de embeddings semánticos: {actual_dimension}")
            
            # Crear índice con la dimensión correcta
            index = self.config.get_index(self.index_name, dimension=actual_dimension, force_recreate=True)
            
            # Preparar datos para Pinecone
            vectors = []
            for i, (_, movie) in enumerate(self.movies_df.iterrows()):
                vector_data = {
                    'id': str(movie['id']),
                    'values': embeddings[i].tolist(),
                    'metadata': {
                        'title': movie['title'],
                        'genre': movie['genre'],
                        'description': movie['description']
                    }
                }
                
                # Agregar campos adicionales si existen
                if 'year' in movie and pd.notna(movie['year']):
                    vector_data['metadata']['year'] = int(movie['year'])
                if 'director' in movie and pd.notna(movie['director']):
                    vector_data['metadata']['director'] = movie['director']
                if 'keywords' in movie and pd.notna(movie['keywords']):
                    vector_data['metadata']['keywords'] = movie['keywords']
                
                vectors.append(vector_data)
            
            # Subir datos
            if vectors:
                index.upsert(vectors=vectors)
            
            print(f"{len(vectors)} películas subidas a Pinecone")
            return len(vectors)
        except Exception as e:
            print(f"Error subiendo a Pinecone: {e}")
            raise
    
    def search_similar_movies(self, query, top_k=3):
        """Buscar películas similares usando embeddings semánticos"""
        try:
            if self.embedding_model is None:
                self.initialize_embedding_model()
            
            # Obtener embeddings para conocer la dimensión
            embeddings = self.create_embeddings()
            actual_dimension = embeddings.shape[1]
            
            index = self.config.get_index(self.index_name, dimension=actual_dimension)
            
            # Convertir query a embedding semántico
            query_embedding = self.embedding_model.encode([query])[0]
            
            # Buscar en Pinecone
            results = index.query(
                vector=query_embedding.tolist(),
                top_k=top_k,
                include_metadata=True,
                include_values=False
            )
            
            print(f"Búsqueda semántica completada: {len(results['matches'])} resultados")
            
            # Mostrar similitudes en consola para debug
            print(f"Búsqueda: '{query}'")
            for match in results['matches']:
                print(f"   - {match['metadata']['title']}: {match['score']:.3f}")
            
            return results
        except Exception as e:
            print(f"Error en búsqueda: {e}")
            raise
    
    def visualize_embeddings(self):
        """Visualizar embeddings en 2D usando PCA"""
        try:
            embeddings = self.create_embeddings()
            
            # Reducir dimensionalidad
            pca = PCA(n_components=2)
            embeddings_2d = pca.fit_transform(embeddings)
            
            # Crear DataFrame para visualización
            viz_df = pd.DataFrame({
                'x': embeddings_2d[:, 0],
                'y': embeddings_2d[:, 1],
                'title': self.movies_df['title'],
                'genre': self.movies_df['genre']
            })
            
            # Crear gráfico interactivo
            fig = px.scatter(viz_df, x='x', y='y', color='genre', 
                            hover_data=['title'], title='Visualización de Embeddings Semánticos de Películas')
            
            print("Visualización creada")
            return fig
        except Exception as e:
            print(f"Error en visualización: {e}")
            raise
    def get_all_movies_from_pinecone(self):
        """Obtener todas las películas desde Pinecone"""
        try:
            embeddings = self.create_embeddings()
            actual_dimension = embeddings.shape[1]
            
            index = self.config.get_index(self.index_name, dimension=actual_dimension)
            
            # Obtener TODOS los vectores con sus metadatos
            zero_vector = [0] * actual_dimension
            
            results = index.query(
                vector=zero_vector,
                top_k=10000,
                include_metadata=True,
                include_values=False
            )
            
            # Convertir a DataFrame
            movies_data = []
            for match in results['matches']:
                movie_data = {
                    'id': match['id'],
                    'title': match['metadata']['title'],
                    'genre': match['metadata']['genre'],
                    'description': match['metadata']['description']
                }
                # Agregar campos opcionales si existen
                if 'year' in match['metadata']:
                    movie_data['year'] = match['metadata']['year']
                if 'director' in match['metadata']:
                    movie_data['director'] = match['metadata']['director']
                if 'keywords' in match['metadata']:
                    movie_data['keywords'] = match['metadata']['keywords']
                    
                movies_data.append(movie_data)
            
            movies_df = pd.DataFrame(movies_data)
            print(f"{len(movies_df)} películas cargadas desde Pinecone")
            return movies_df
            
        except Exception as e:
            print(f"Error cargando desde Pinecone: {e}")
            raise

    def get_movies_count(self):
        """Obtener número de películas en Pinecone"""
        try:
            embeddings = self.create_embeddings()
            actual_dimension = embeddings.shape[1]
            
            index = self.config.get_index(self.index_name, dimension=actual_dimension)
            stats = index.describe_index_stats()
            return stats.total_vector_count
        except Exception as e:
            print(f"Error obteniendo conteo: {e}")
            return 0