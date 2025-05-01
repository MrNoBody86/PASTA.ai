from phi.agent import Agent, RunResponse
from phi.model.groq import Groq
from phi.tools.yfinance import YFinanceTools 
from phi.tools.duckduckgo import DuckDuckGo
from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import json

app = Flask(__name__)
cors = CORS(app, origins='*', methods=["*"], allow_headers=["*"], supports_credentials=True)

# Path to your service account JSON file
SERVICE_ACCOUNT_FILE = "serviceAccountKey.json"

# Initialize Firebase app
cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

USER_ID = ""

# Route path to get all the documents in a collection
@app.route("/get_collection/<collection_name>")
def get_collection(collection_name):
    doc_ref = db.collection('users').document(USER_ID).collection(collection_name)
    docs = doc_ref.stream()
    data = []
    for doc in docs:
        data.append(doc.to_dict())

    return {"response" :data}

@app.route("/get_userid/<user_id>")
def get_user(user_id):
    global USER_ID
    USER_ID = user_id
    return {"response": f"USER_ID set to {USER_ID}"}

@app.get("/get_personality_scores")
def get_personality_scores():
    """
    Fetches personality scores from 'personalityScores' subcollection for the current USER_ID.
    """
    if not USER_ID:
        return {"error": "USER_ID not set. Call /get_userid/<user_id> first."}
    
    scores_ref = db.collection('users').document(USER_ID).collection('personalityScores')
    docs = scores_ref.stream()

    personality_scores = []
    for doc in docs:
        data = doc.to_dict()
        personality_scores.append({
            "id": doc.id,
            "scoreEXT": data.get("scoreEXT"),
            "scoreAGG": data.get("scoreAGG"),
            "scoreCON": data.get("scoreCON"),
            "scoreNEU": data.get("scoreNEU"),
            "scoreOPE": data.get("scoreOPE"),
        })

    return {"response": personality_scores}


# A Web search agent that uses DuckDuckGo to search the web for information
web_search_agent = Agent(
    name = 'Web search Agent',
    role = "search the web for information",
    model = Groq(id="llama-3.3-70b-versatile"),
    tools = [DuckDuckGo()],
    instructions = ["Always include sources"],
    show_tool_calls = True,
    markdown = True
)

# A Fitness AI agent that provides fitness and nutrition advice
def get_fitness_agent(user_personality_scores, chat_history=""):
    # Subtle internal context for LLM
    personality_context = (
        f"The user has the following personality profile based on Big Five traits:\n"
        f"- Extraversion (EXT): {user_personality_scores.get('scoreEXT', 'N/A')}\n"
        f"- Agreeableness (AGG): {user_personality_scores.get('scoreAGG', 'N/A')}\n"
        f"- Conscientiousness (CON): {user_personality_scores.get('scoreCON', 'N/A')}\n"
        f"- Neuroticism (NEU): {user_personality_scores.get('scoreNEU', 'N/A')}\n"
        f"- Openness (OPE): {user_personality_scores.get('scoreOPE', 'N/A')}\n"
        "Use this profile internally to guide your tone, motivational style, and structure of advice.\n"
        "Do not mention the personality profile explicitly in responses unless asked directly.\n"
        "Give reasons for the advice provided according to the personality profile, here you can mention it in a simple way.\n"
        "Adjust your recommendations to best suit this user's likely preferences and mindset."
    )

    # General and behavioral instructions
    instructions = [
        personality_context,
        "You are a personal fitness and nutrition assistant.",
        f"Conversation so far:\n{chat_history}",
        "Continue the conversation naturally.",
        "Give answers in a conversational chat format.",
        "If the user asks for a plan (diet or workout), provide a full structured plan (e.g. a week-long plan with daily breakdowns).",
        "Avoid linking or referring to external resources unless absolutely necessary.",
        "Only respond to fitness, diet, nutrition, and health-related queries. Politely decline unrelated queries.",
        "Be supportive and motivating based on the user's personality.",
        "Be clear and practical. Don't repeat instructions unless asked.",
    ]

    return Agent(
        name='Fitness AI Agent',
        role='Provide personalized fitness and nutrition advice.',
        model=Groq(id="llama-3.3-70b-versatile"),
        tools=[],  # Remove DuckDuckGo to avoid unnecessary external lookups
        instructions=instructions
    )



# A Finance AI agent that provides financial advice
finance_agent = Agent(
    name = "Finance AI Agent",
    model = Groq(id="llama-3.3-70b-versatile"),
    tools = [YFinanceTools(stock_price=True, analyst_recommendations=True, stock_fundamentals=True)],
    instructions = ["Give answer in the form of chat messages",
                    "Give financial advice like investment plans, stock prices, etc.",
                    "If prompt is not relevent to finance, then give a message saying that the prompt is not related to finance."],
)

def get_task_agent(user_personality_scores):
    personality_context = (
        f"The user has the following personality profile based on Big Five traits:\n"
        f"- Extraversion (EXT): {user_personality_scores.get('scoreEXT', 'N/A')}\n"
        f"- Agreeableness (AGG): {user_personality_scores.get('scoreAGG', 'N/A')}\n"
        f"- Conscientiousness (CON): {user_personality_scores.get('scoreCON', 'N/A')}\n"
        f"- Neuroticism (NEU): {user_personality_scores.get('scoreNEU', 'N/A')}\n"
        f"- Openness (OPE): {user_personality_scores.get('scoreOPE', 'N/A')}\n"
        "Use this profile internally to guide how you auto-fill tasks and structure them.\n"
        "Adapt the task details like urgency (priority), level of detail, tone, and task suggestions accordingly.\n"
        "Do not mention the personality profile explicitly in the output."
    )

    instructions = [
        personality_context,
        "You are a Task Agent that auto-fills task details in a task manager.",
        "Give me the response in a json format from a prompt sentence containing the following objects:- taskName, taskDescription, taskCategory, taskPriority, and subTasks",
        "The taskCategory contains (1.Personal 2.Work 3.Shopping 4.Health 5.Other) and taskPriority contains (1.Low 2.Medium 3.High)",
        """The JSON response should be in the following format:- {"taskName": "MyTask", "taskDescription": "Task Description", "taskCategory": "Personal or Work or Shopping or Health or Others", "taskPriority": "Low or Medium or High", "subTasks": [{"key": "subTask1"}, {"key": "subtask2"}]}""",
        """Strictly follow the above format and do not add any extra information or text also write the subTasks in this format, "subTasks": [{"key": "subTask1"}, {"key": "subtask2"}].""",
        "Any one category must be chosen from the mentioned categories same with the task priority."
        "If the prompt is not related to task filling, then give a message saying that the prompt is not related to task filling."
    ]

    return Agent(
        name="Personalized Task Agent",
        model=Groq(id="llama-3.3-70b-versatile"),
        instructions=instructions,
    )


# A multi-agent system that combines the Web search agent and the Finance AI agent
multi_ai_agent = Agent(
    team=[web_search_agent, finance_agent],
    model=Groq(id="llama-3.3-70b-versatile"),
    instructions=["Always include sources","Give answer in the form of chat messages"],
    show_tool_calls=True,
    markdown=True,
)

# Home Page of the Backend API
@app.get("/")
def home_page():
    return {"response":"This is the home page of PASTA.ai Backend API. To get financial advice, go to /get_stock_content/(your query). To get fitness advice, go to /get_fitness_content/(your query). For Task Agent, go to /task_agent/(your query)."}

# Route path to get response from Finance AI Agent
@app.get("/get_stock_content/<query>")
def get_stock_info(query):
    """
    Fetches stock-related information using the multi-agent AI system.
    """
    response : RunResponse = finance_agent.run(query)
    print(response.content)
    return {'response': response.content}

def get_recent_fitness_history(limit=5):
    chat_ref = db.collection('users').document(USER_ID).collection('fitnessMessages')
    docs = chat_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
    
    history = []
    for doc in reversed(list(docs)):  # reverse to maintain correct order
        data = doc.to_dict()
        role = data.get("role", "user").capitalize()
        content = data.get("content", "")
        history.append(f"{role}: {content}")
    
    return "\n".join(history)


# Route path to get response from Fitness AI Agent
@app.get("/get_fitness_content/<query>")
def get_fitness_info(query):
    """
    Fetches fitness-related information using the multi-agent AI system.
    """
    if not USER_ID:
        return {"error": "USER_ID not set."}
    
    # Fetch personality
    scores_ref = db.collection('users').document(USER_ID).collection('personalityScores')
    docs = scores_ref.stream()
    personality = {}
    for doc in docs:
        personality = doc.to_dict()
        break
    
    print(personality)
    chat_history = get_recent_fitness_history()
    agent = get_fitness_agent(personality, chat_history=chat_history)
    full_prompt = f"{chat_history}\nUser: {query}"
    response: RunResponse = agent.run(query)
    print(response.content)
    return {'response': response.content}

@app.get("/task_agent/<query>")
def my_task_agent(query):
    """
    Autofills task info using LLMs
    """
    if not USER_ID:
        return {"error": "USER_ID not set."}

    # Fetch personality
    scores_ref = db.collection('users').document(USER_ID).collection('personalityScores')
    docs = scores_ref.stream()
    personality = {}
    for doc in docs:
        personality = doc.to_dict()
        break

    agent = get_task_agent(personality)
    response: RunResponse = agent.run(query)

    try:
        json_object = json.loads(response.content)
        print(type(json_object))

    except:
        print("Error parsing JSON")
        return {"error": "Failed to parse JSON response"}
    
    return {
        "taskName": json_object["taskName"],
        "taskDescription": json_object["taskDescription"],
        "taskCategory": json_object["taskCategory"],
        "taskPriority": json_object["taskPriority"],
        "subTasks": json_object["subTasks"]
    }


@app.get("/hello")
def hello_world():
    return "hello world"

if __name__ == "__main__":
    app.run(debug=True)