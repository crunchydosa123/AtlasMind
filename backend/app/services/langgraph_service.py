from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_community.chat_models import ChatOllama

# 1. Define state
class ChatState(dict):
    pass

# 2. Define nodes
def retrieve_memories(state: ChatState):
    # episodic / long-term memory retrieval
    return {**state, "memories": ["example recalled memory"]}

def llm_node(state: ChatState):
    llm = ChatOllama(model="phi3:mini")
    response = llm.invoke(state["input"] + "\nMemories: " + str(state["memories"]))
    return {**state, "response": response.content}

# 3. Build graph
def build_graph():
    graph = StateGraph(ChatState)

    graph.add_node("memory", retrieve_memories)
    graph.add_node("llm", llm_node)

    graph.set_entry_point("memory")
    graph.add_edge("memory", "llm")
    graph.add_edge("llm", END)

    memory = MemorySaver()
    return graph.compile(checkpointer=memory)

# 4. Singleton compiled graph
compiled_graph = build_graph()

def run_agent(input_text: str):
    result = compiled_graph.invoke({"input": input_text})
    return result["response"]
