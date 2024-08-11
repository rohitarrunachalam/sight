from flask import Flask, request, Response, jsonify
import openai
from openai import OpenAI
from flask_cors import CORS
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase

app = Flask(__name__)
CORS(app)

# Configure OpenAI client
openai.api_key = "OPENAI_KEY"
db = SQLDatabase.from_uri('POSTGRES_URI')

llm = ChatOpenAI(
    openai_api_key="OPENAI_KEY",
    model="gpt-3.5-turbo", temperature=0)

agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)


client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key="OPENAI_KEY",
)


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])

    # Check for #sql marker in the messages
    for message in reversed(messages):
        # if "#sql" in message.get('content', ''):
            query = message['content']
            try:
                result = agent_executor.invoke(query)
                output = result['output']
                return Response(output, mimetype='text/plain')
                
            except Exception as e:
                return jsonify({"error": str(e)})

    # If no SQL marker, proceed with normal chat response using OpenAI
    # def generate():
    #     stream = client.chat.completions.create(
    #         model="gpt-3.5-turbo-0125",
    #         messages=messages,
    #         stream=True
    #     )

    #     for chunk in stream:
    #         if chunk.choices[0].delta.get("content"):
    #             yield chunk.choices[0].delta.content

    # return Response(generate(), mimetype='text/event-stream')




if __name__ == '__main__':
    app.run(debug=True)
