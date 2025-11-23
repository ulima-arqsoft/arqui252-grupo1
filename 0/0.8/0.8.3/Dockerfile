FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero (para mejor caching)
COPY requirements.txt .

# Instalar dependencias asegurándonos de la versión correcta de pinecone
RUN pip install --no-cache-dir -r requirements.txt
RUN pip uninstall -y pinecone-client 2>/dev/null || true
RUN pip install --force-reinstall pinecone>=4.0.0

# Verificar la instalación
RUN python -c "import pinecone; print(f' Pinecone version: {pinecone.__version__}')"

# Copiar código fuente
COPY src/ ./src/
COPY data/ ./data/

# Puerto expuesto
EXPOSE 8501

# Comando para ejecutar la aplicación
CMD ["streamlit", "run", "src/app.py", "--server.port=8501", "--server.address=0.0.0.0"]