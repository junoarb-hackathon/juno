# junoarb/junoarb_tool.py (FINAL VERSION)
import os
import json
import numpy as np
import faiss
from vertexai.preview.language_models import TextEmbeddingModel, TextEmbeddingInput

# --- CONFIGURATION ---
MODEL_NAME = "text-embedding-004"
INDEX_PATH = "/home/devstar5805/llm-auditor/llm-auditor/index"
INDEX_FILE = os.path.join(INDEX_PATH, "junoarb.index")
DOCUMENTS_FILE = os.path.join(INDEX_PATH, "junoarb_documents.json")

# --- GLOBAL VARIABLES to hold the loaded resources ---
# We initialize them to None. They will be loaded by the main app at startup.
faiss_index = None
documents_metadata = []
embedding_model = None

def load_resources():
    """Loads the FAISS index, metadata, and embedding model into memory."""
    global faiss_index, documents_metadata, embedding_model
    
    print("--- [TOOL LIFESPAN] Loading FAISS index and document metadata... ---")
    try:
        faiss_index = faiss.read_index(INDEX_FILE)
        print(f"--- [TOOL LIFESPAN] FAISS index loaded. Contains {faiss_index.ntotal} vectors. ---")
        
        with open(DOCUMENTS_FILE, 'r') as f:
            documents_metadata = json.load(f)
        print(f"--- [TOOL LIFESPAN] Metadata for {len(documents_metadata)} documents loaded. ---")
        
        embedding_model = TextEmbeddingModel.from_pretrained(MODEL_NAME)
        print("--- [TOOL LIFESPAN] Vertex AI Embedding Model initialized. ---")
        
    except FileNotFoundError:
        print(f"--- [TOOL ERROR] Index files not found in '{INDEX_PATH}'. Please run the build_index.py script first.")
        faiss_index = None

def junoarb_search(legal_query: str) -> str:
    """
    Performs a semantic search on a local FAISS index of arbitration cases
    to find relevant precedents for a given legal query.
    """
    if not faiss_index or not embedding_model:
        return "Error: The search index or embedding model is not available. Check server startup logs."

    print(f"--- [TOOL] Received search query: '{legal_query}' ---")

    query_embedding_response = embedding_model.get_embeddings([
        TextEmbeddingInput(legal_query, "RETRIEVAL_QUERY")
    ])
    query_vector = np.array([query_embedding_response[0].values])

    k = 3
    distances, indices = faiss_index.search(query_vector, k)

    if len(indices[0]) == 0:
        return "No relevant precedents were found in the knowledge base."

    response_parts = ["Found relevant precedents from the knowledge base:", "---"]
    for i in range(len(indices[0])):
        doc_index = indices[0][i]
        matched_doc = documents_metadata[doc_index]
        
        response_parts.append(
            f"Case: {matched_doc.get('case_name', 'N/A')}\n"
            f"Summary: {matched_doc.get('summary', 'No summary available.')}\n"
            f"Relevance Score (lower is better): {distances[0][i]:.2f}\n---"
        )

    final_response = "\n".join(response_parts)
    print(f"--- [TOOL] Returning formatted results. ---")
    return final_response