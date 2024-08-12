"use client"
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Message from "@/components/Messges";
import Plot from "react-plotly.js"; // Plotly for graph rendering

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState(null); // Store graph data
  const formRef = useRef<HTMLFormElement>(null);

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");
    setIsLoading(true);
    setGraphData(null);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const contentType = response.headers.get("Content-Type");

      if (contentType.includes("application/json")) {
        const data = await response.json();
        setGraphData(data); // Set the received graph data
      } else {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantResponse = "";

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantResponse += chunk;
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { role: "assistant", content: assistantResponse },
          ]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <main className="w-full h-screen bg-muted">
      <div className="container h-full w-full flex flex-col py-8">
        <div className="flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          {graphData && (
            <Plot
              data={[
                {
                  x: graphData.x,
                  y: graphData.y.length > 0 ? graphData.y : undefined,
                  type: graphData.type === "bar" ? "bar" : graphData.type === "line" ? "scatter" : graphData.type === "pie" ? "pie" : undefined,
                  mode: graphData.type === "line" ? "lines+markers" : undefined,
                  labels: graphData.type === "pie" ? graphData.x : undefined,
                  values: graphData.type === "pie" ? graphData.y : undefined,
                  marker: { color: "blue" },
                },
              ]}
              layout={{ title: "Generated Graph" }}
            />
          )}
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-auto relative"
        >
          <Textarea
            className="w-full text-lg"
            placeholder="Say something"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input || isLoading}
            className="absolute top-1/2 transform -translate-y-1/2 right-4 rounded-full"
          >
            <Send size={24} />
          </Button>
        </form>
      </div>
    </main>
  );
}
