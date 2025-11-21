# src/app.py
import streamlit as st
import pandas as pd
from movie_recommender import MovieVectorDemo

# Configurar página
st.set_page_config(
    page_title="Demo Pinecone - Búsqueda Vectorial",
    page_icon="🎬",
    layout="wide"
)

# Título de la aplicación
st.title("Bases de Datos Vectoriales con Pinecone")
st.markdown("Búsqueda semántica de películas usando embeddings vectoriales")

# Inicializar demo
@st.cache_resource
def init_demo():
    return MovieVectorDemo()

demo = init_demo()

# Sidebar
st.sidebar.header("Configuración")
if st.sidebar.button("Inicializar Base de Datos"):
    with st.spinner("Subiendo datos a Pinecone..."):
        try:
            count = demo.upload_to_pinecone()
            st.sidebar.success(f"{count} películas cargadas")
            # Limpiar cache para forzar recarga
            st.cache_data.clear()
        except Exception as e:
            st.sidebar.error(f"Error: {str(e)}")

# Tabs principales
tab1, tab2, tab3 = st.tabs(["🔍 Búsqueda", "📊 Datos", "📈 Visualización"])

with tab1:
    st.header("Búsqueda Semántica de Películas")
    
    # Input de búsqueda
    query = st.text_input(
        "Describe la película que buscas:",
        "película de ciencia ficción sobre realidad virtual"
    )
    
    top_k = st.slider("Número de resultados:", 1, 10, 3)
    
    if st.button("Buscar Películas Similares"):
        with st.spinner("Buscando en la base vectorial..."):
            try:
                results = demo.search_similar_movies(query, top_k=top_k)
                
                st.subheader("🎯 Resultados de la Búsqueda")
                for i, match in enumerate(results['matches']):
                    score = match['score']
                    metadata = match['metadata']
                    
                    col1, col2 = st.columns([3, 1])
                    with col1:
                        st.write(f"**{i+1}. {metadata['title']}**")
                        st.write(f"**Género:** {metadata['genre']}")
                        st.write(f"**Descripción:** {metadata['description']}")
                    with col2:
                        st.metric("Similitud", f"{score:.3f}")
                    
                    st.divider()
            except Exception as e:
                st.error(f"Error en la búsqueda: {str(e)}")

with tab2:
    st.header("Base de Datos Vectorial")
    
    # Cargar datos automáticamente desde Pinecone
    @st.cache_data
    def load_pinecone_data():
        try:
            return demo.get_all_movies_from_pinecone()
        except Exception as e:
            st.error(f"Error cargando desde Pinecone: {str(e)}")
            return pd.DataFrame()
    
    # Cargar datos
    pinecone_df = load_pinecone_data()
    
    if not pinecone_df.empty:
        # Mostrar estadísticas
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Películas en Vector DB", len(pinecone_df))
        with col2:
            st.metric("Géneros Únicos", pinecone_df['genre'].nunique())
        with col3:
            st.metric("Dimensión Embeddings", 768)
        
        # Mostrar tabla de películas desde Pinecone
        st.dataframe(pinecone_df, use_container_width=True)
        st.success(f"{len(pinecone_df)} películas cargadas desde Pinecone")
        
        # Botón para recargar si es necesario
        if st.button("Actualizar Datos"):
            st.cache_data.clear()
            st.rerun()
    else:
        st.error("No se pudieron cargar los datos desde Pinecone")
        st.info("💡 Asegúrate de haber inicializado la base de datos primero")

with tab3:
    st.header("Visualización de Embeddings")
    st.markdown("Representación 2D de los embeddings usando PCA")
    
    if st.button("Generar Visualización"):
        with st.spinner("Calculando visualización..."):
            try:
                fig = demo.visualize_embeddings()
                st.plotly_chart(fig, use_container_width=True)
            except Exception as e:
                st.error(f"Error en visualización: {str(e)}")
