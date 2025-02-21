from phi.agent import Agent, RunResponse
from phi.model.groq import Groq
from phi.tools.yfinance import YFinanceTools 
from phi.tools.duckduckgo import DuckDuckGo
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins='*', methods=["*"], allow_headers=["*"], supports_credentials=True)

web_search_agent = Agent(
    name = 'Web search Agent',
    role = "search the web for information",
    model = Groq(id="llama-3.3-70b-versatile"),
    tools = [DuckDuckGo()],
    instructions = ["Always include sources"],
    show_tool_calls = True,
    markdown = True
)

finance_agent = Agent(
    name = "Fianace AI Agent",
    model = Groq(id="llama-3.3-70b-versatile"),
    tools = [YFinanceTools(stock_price=True, analyst_recommendations=True, stock_fundamentals=True)],
    instructions = ["Use tables to display the data"],
)

multi_ai_agent = Agent(
    team=[web_search_agent, finance_agent],
    model=Groq(id="llama-3.3-70b-versatile"),
    instructions=["Always include sources","Use table to display the data"],
    show_tool_calls=True,
    markdown=True,
)



@app.get("/get_stock_content/{query}")
def get_stock_info(query):
    """
    Fetches stock-related information using the multi-agent AI system.
    """
    response : RunResponse = finance_agent.run(query)
    print(response.content)
    return {'response': response.content}

@app.get("/hello")
def hello_world():
    return "hello world"

if __name__ == "__main__":
    app.run()