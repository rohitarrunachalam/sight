import re
from flask import Flask, request, Response, jsonify
import openai
from openai import OpenAI
from flask_cors import CORS
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_core.messages import HumanMessage 
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.getenv("OPENAI_KEY")
DB_URI = os.getenv("DB_URI")

openai.api_key = SECRET_KEY
db = SQLDatabase.from_uri(DB_URI)

llm = ChatOpenAI(
    openai_api_key=SECRET_KEY,
    model="gpt-3.5-turbo", temperature=0
)

agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])

    graph_type = None
    query = None

    if messages:
        latest_message = messages[-1].get('content', '')
        print(f"Latest Message: {latest_message}")

        # Check if the latest message includes graph instructions
        if "plot" in latest_message.lower():
            graph_type = latest_message
            print(f"Graph Type: {graph_type}")
        else:
            query = latest_message
            print("Query:", query)

    if query:
        try:
            result = agent_executor.invoke(query)
            output = result['output']

            return Response(output, mimetype='text/plain')

        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    elif graph_type:
        try:
            print("Generating Graph...")
            graph_prompt = "You are a data analyst. Fetch the data according to the user's request and return it as JSON with keys 'type' for the graph type, 'x' for the x-axis data, and 'y' for the y-axis data. The prompt is: " + graph_type
            
            result = agent_executor.invoke(graph_prompt)
            output = result['output']
            print(output)
            # Extract JSON part from the output using regular expressions
            match = re.search(r'\{.*\}', output, re.DOTALL)
            if match:
                json_data = match.group(0)
                graph_data = eval(json_data)  # Convert string to dictionary
                print(f"Graph Data: {graph_data}")

                return jsonify(graph_data)
            else:
                return jsonify({"error": "No valid JSON found in the response"}), 500

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "No valid query or graph request found"}), 400

if __name__ == '__main__':
    app.run(debug=True)
