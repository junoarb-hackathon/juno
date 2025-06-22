import os
import json
import time
import numpy as np
import faiss
from vertexai.preview.language_models import TextEmbeddingModel, TextEmbeddingInput

# --- CONFIGURATION (Adjust as needed) ---
# FIX #1: Define the MODEL_NAME variable
MODEL_NAME = "text-embedding-004"
INDEX_FILE_NAME = "junoarb.index"
DOCUMENTS_FILE_NAME = "junoarb_documents.json"
DATASET_PATH = "/home/devstar5805/llm-auditor/llm-auditor/jus_mundi_hackathon_data/cases"
INDEX_PATH = "/home/devstar5805/llm-auditor/llm-auditor/index"


def load_and_process_data(dataset_path):
    """Loads all JSON case files and prepares the text corpus and metadata."""
    corpus_texts = []  # List of texts to be embedded
    documents_metadata = [] # Metadata for each document
    print(f"--> [INFO] Scanning directory: {dataset_path}", flush=True)

    file_names = [f for f in os.listdir(dataset_path) if f.endswith('.json')]

    for filename in file_names:
        filepath = os.path.join(dataset_path, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                case_data = json.load(f)
                
                # --- FIX #2: Changed the data loading logic for RAG ---
                # We no longer look for 'key_takeaways'. We just load the
                # text we want to make searchable.
                # Combine summary and text_content for a richer embedding.
                input_text = f"Case Summary: {case_data.get('summary', '')}\n\nFull Text: {case_data.get('text_content', '')}"

                if input_text.strip(): # Only add if there is actual text
                    corpus_texts.append(input_text)
                    documents_metadata.append({
                        'case_id': case_data.get('id', filename),
                        'case_name': case_data.get('name', 'Unnamed Case'),
                        'summary': case_data.get('summary', ''),
                        # Storing the original text is useful for retrieval
                        'original_text': input_text
                    })
                # --- End of fix ---

        except Exception as e:
            print(f"--> [ERROR] Could not process file {filename}: {e}", flush=True)

    print(f"--> [INFO] Prepared {len(corpus_texts)} documents for indexing.", flush=True)
    return corpus_texts, documents_metadata


def create_embeddings_with_vertexai(corpus, model_name):
    """Generates embeddings by making API calls to the Vertex AI TextEmbeddingModel."""
    # This function will now be called with a non-empty corpus
    if not corpus:
        print("--> [ERROR] Corpus is empty. Cannot generate embeddings.", flush=True)
        return np.array([]) # Return an empty array

    print(f"--> [INFO] Initializing Vertex AI embedding model: {model_name}", flush=True)
    model = TextEmbeddingModel.from_pretrained(model_name)
    embeddings = []

    print("--> [INFO] Generating embeddings via API calls... This will take several minutes.", flush=True)
    batch_size = 5
    for i in range(0, len(corpus), batch_size):
        batch = corpus[i:i+batch_size]
        inputs = [TextEmbeddingInput(text, "RETRIEVAL_DOCUMENT") for text in batch]
        response = model.get_embeddings(inputs)
        for embedding in response:
            embeddings.append(embedding.values)

        print(f"      Processed batch {i//batch_size + 1} of {len(corpus)//batch_size + 1}", flush=True)
        time.sleep(1) # Respect API rate limits

    return np.array(embeddings)


if __name__ == "__main__":
    print("--- JunoArb Gemini-Powered Index Build Protocol ACTIVATED ---", flush=True)
    start_time = time.time()

    # Create the index directory if it doesn't exist
    if not os.path.exists(INDEX_PATH):
        os.makedirs(INDEX_PATH)

    print("\n[Step 1/3] Processing all JSON files from the dataset...", flush=True)
    main_corpus, metadata = load_and_process_data(DATASET_PATH)

    if main_corpus: # Only proceed if documents were loaded successfully
        print("\n[Step 2/3] Generating embeddings with Vertex AI...", flush=True)
        document_embeddings = create_embeddings_with_vertexai(main_corpus, MODEL_NAME)
        print(f"--> [SUCCESS] Embeddings created with shape: {document_embeddings.shape}", flush=True)

        print("\n[Step 3/3] Building FAISS index and saving files...", flush=True)
        index = faiss.IndexFlatL2(document_embeddings.shape[1])
        index.add(document_embeddings)
        print(f"--> [INFO] FAISS index built. Total entries: {index.ntotal}", flush=True)

        faiss.write_index(index, os.path.join(INDEX_PATH, INDEX_FILE_NAME))
        with open(os.path.join(INDEX_PATH, DOCUMENTS_FILE_NAME), 'w') as f:
            json.dump(metadata, f, indent=4)
        print(f"--> [SUCCESS] Index and metadata saved to '{INDEX_PATH}' directory.", flush=True)
    else:
        print("\n--- Index Build Protocol HALTED. No documents were found to process. ---")


    end_time = time.time()
    print(f"\n--- Index Build Protocol Complete. Total time: {end_time - start_time:.2f} seconds. ---", flush=True)