# to matrix generate matrices
import numpy as np

# importing cosine similarity module from chunkdot
from chunkdot import cosine_similarity_top_k

# to calculate computation time
import timeit


def cosine_presudocode(query, doc, num_indices):
    # highest score of the query with vector and embeddings

    cosine_simlilarities = []
    query_norm = np.linalg.norm(query)

    for vec in doc:
        dot_product = np.dot(vec, query_norm.T)
        embedding_norm = np.linalg.norm(dot_product)
        cosine_similarity = dot_product / (embedding_norm * query_norm)

        cosine_similarities.append(cosine_similarity)

    cosine_similarities = np.array(cosine_similarities) # change to np array

    sorted_array  = sorted(range(len(cosine_similarities)), 
        key = lambda i : cosine_similarities[i], reversed=True)

    top_indices = sorted_array[:num_indices]

    return top_indices


def cosine_chunkdot(query_v, doc_v, num_indices, max_memory):
    """
    Calculate cosine similarity using the chunkdot library.
    
    Parameters:
        query_v (numpy.ndarray): Query vector.
        doc_v (numpy.ndarray): List of Embedding vectors.
        num_indices (int): Number of top indices to retrieve.
        max_memory (float): Maximum memory to use.
        
    Returns:
        numpy.ndarray: Top k indices.
    """
    
    # Calculate Cosine Similarity
    cosine_array = cosine_similarity_top_k(embeddings=query_v, embeddings_right=doc_v, 
                                          top_k=num_indices, max_memory=max_memory)  # Calculate cosine similarity using chunkdot

    # Get indices of the top values
    top_indices = cosine_array.nonzero()[1]
    
    # return the top similar results
    return top_indices

# doc_embeddings = np.random.randn(10, 100) # 10 document embeddings (100 dim)

# user_query = np.random.rand(1,100) # 1 user query (100 dim)

# top_indices = 1 # number of top indices to retrieve

# max_memory = 5E9 # maximum memory to use (5GB)

# # retrieve indices of the highest cosine similarity values using pseudocode
# print("top indices using pseudocode:", cosine_pseudocode(user_query, doc_embeddings, top_indices))

# # retrieve indices of the highest cosine similarity values using chunkdot
# print("top indices using chunkdot:", cosine_chunkdot(user_query, doc_embeddings, top_indices, max_memory))

# ### OUTPUT ###
# top indices using pseudocode: [4]
# top indices using chunkdot: [4]
# ### OUTPUT ###


# calculate time taken
def calculate_execution_time(query_v, doc_v, num_indices, max_memory, times):
    
    pseudocode_time = round(timeit.timeit(lambda: cosine_pseudocode(query_v, doc_v, num_indices), number=times), 5)

    chunkdot_time = round(timeit.timeit(lambda: cosine_chunkdot(query_v, doc_v, num_indices, max_memory), number=times), 5)

    print("Time taken for pseudocode function:", pseudocode_time, "seconds")
    print("Time taken for chunkdot function:", chunkdot_time, "seconds")