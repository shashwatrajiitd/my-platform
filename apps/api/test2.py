from src.modules.rag.embeddings import embed_texts
from src.modules.rag.vectorstore import get_collection

profile = "recruiter"
q = "Tell me about your RAG-based AI assistant"
q_emb = embed_texts([q])[0]

col = get_collection(profile)
res = col.query(query_embeddings=[q_emb], n_results=3, include=["documents", "metadatas", "distances"])

print("query:", q)
for i, (doc, meta, dist) in enumerate(zip(res["documents"][0], res["metadatas"][0], res["distances"][0]), 1):
    print(f"\n#{i} distance={dist:.4f}")
    print("title:", meta.get("section_title"))
    print("doc:", doc[:220], "...")