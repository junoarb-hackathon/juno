import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class DocumentSearcher:
    def __init__(self, data_dir="jus_mundi_hackathon_data"):
        self.data_dir = data_dir
        self.documents = []
        self.vectorizer = None
        self.tfidf_matrix = None
        self._load_and_process_data()

    def _load_and_process_data(self):
        all_texts = []
        for filename in os.listdir(self.data_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(self.data_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Assuming each JSON file contains a list of documents or a single document
                    # and each document has a 'text' field or similar for content.
                    # Adjust this parsing based on your actual JSON structure.
                    if isinstance(data, list):
                        for item in data:
                            if 'text' in item:
                                self.documents.append(item)
                                all_texts.append(item['text'])
                            elif 'content' in item: # Alternative common key
                                self.documents.append(item)
                                all_texts.append(item['content'])
                    elif isinstance(data, dict):
                        if 'text' in data:
                            self.documents.append(data)
                            all_texts.append(data['text'])
                        elif 'content' in data:
                            self.documents.append(data)
                            all_texts.append(data['content'])
        
        if all_texts:
            self.vectorizer = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            print(f"Loaded and processed {len(self.documents)} documents.")
        else:
            print("No text data found to train the vectorizer.")

    def find_similar_documents(self, query_text, top_n=5):
        if not self.vectorizer