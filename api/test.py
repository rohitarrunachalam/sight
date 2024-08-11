from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri('POSTGRES_URI')

print(db.dialect)
print(db.get_usable_table_names())


llm = ChatOpenAI(
    openai_api_key="OPENAI_KEY",
    model="gpt-3.5-turbo", temperature=0)
agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
agent_executor.invoke(
    "using the UserData table, find the owner name of vehicle having vehiclenumber TN 23 ZG 4875"
)