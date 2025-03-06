from phi.agent import Agent, RunResponse
from phi.model.groq import Groq
from phi.tools.yfinance import YFinanceTools 
from phi.tools.duckduckgo import DuckDuckGo
from flask import Flask
from flask_cors import CORS

# Create a Flask application instance
app = Flask(__name__)

# Enable CORS for all origins, methods, and headers to allow cross-origin requests
cors = CORS(app, origins='*', methods=["*"], allow_headers=["*"], supports_credentials=True)

# Define a web search agent using the Groq model and DuckDuckGo tool
web_search_agent = Agent(
    name='Web search Agent',
    role="search the web for information",
    model=Groq(id="llama-3.3-70b-versatile"),
    tools=[DuckDuckGo()],
    instructions=["Always include sources"],
    show_tool_calls=True,
    markdown=True
)

# Define a fitness agent for providing fitness and nutrition advice
fitness_agent = Agent(
    name='Fitness AI Agent',
    role='Provide fitness and nutrition advice for the user.',
    model=Groq(id="llama-3.3-70b-versatile"),
    tools=[DuckDuckGo()],
    instructions=[
        "Give calories of the food items",
        "Provide Fitness advices like exercises",
        "Give nutritional advice if the user asks for it like diet plans.",
        "Give answers in the form of chat messages"
    ]
)

# Define a finance agent for providing financial advice and stock information
finance_agent = Agent(
    name="Finance AI Agent",
    model=Groq(id="llama-3.3-70b-versatile"),
    tools=[YFinanceTools(stock_price=True, analyst_recommendations=True, stock_fundamentals=True)],
    instructions=[
        "Give answer in the form of chat messages",
        "Give financial advice like investment plans, stock prices, etc."
    ],
)

# Define a multi-agent system combining web search and finance agents
multi_ai_agent = Agent(
    team=[web_search_agent, finance_agent],
    model=Groq(id="llama-3.3-70b-versatile"),
    instructions=["Always include sources", "Give answer in the form of chat messages"],
    show_tool_calls=True,
    markdown=True,
)

# Define an API endpoint for fetching stock-related information
@app.get("/get_stock_content/<query>")
def get_stock_info(query):
    """
    Fetches stock-related information using the finance agent.
    Args:
        query (str): The stock-related query to process.
    Returns:
        dict: A dictionary containing the response from the finance agent.
    """
    response: RunResponse = finance_agent.run(query)
    print(response.content)  # Log the response content
    return {'response': response.content}

# Define an API endpoint for fetching fitness-related information
@app.get("/get_fitness_content/<query>")
def get_fitness_info(query):
    """
    Fetches fitness-related information using the fitness agent.
    Args:
        query (str): The fitness-related query to process.
    Returns:
        dict: A dictionary containing the response from the fitness agent.
    """
    response: RunResponse = fitness_agent.run(query)
    print(response.content)  # Log the response content
    return {'response': response.content}

# Define a simple test endpoint to check if the server is running
@app.get("/hello")
def hello_world():
    """
    A simple endpoint to test the server.
    Returns:
        str: A greeting message.
    """
    return "hello world"

# Run the Flask application if the script is executed directly
if __name__ == "__main__":
    app.run()
