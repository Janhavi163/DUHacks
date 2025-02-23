import React, { useState, useEffect } from "react";
import axios from "axios";
import { TbMessageChatbotFilled } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "./ViewAnalysis.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ViewAnalysis = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const toggleChatbot = () => setIsChatOpen(!isChatOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    try {
      const response = await axios.post("http://localhost:5001/chatbot", { message: input });
      setMessages((prev) => [...prev, { sender: "bot", text: response.data.response }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error: Unable to fetch response." }]);
    }

    setInput("");
  };

  useEffect(() => {
    fetchCategoryAnalytics();
    fetchMonthlyAnalytics();
  }, []);

  const fetchCategoryAnalytics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/expenses/analytics/category");
      setCategoryData(response.data);
    } catch (error) {
      console.error("Error fetching category analytics:", error);
    }
  };

  const fetchMonthlyAnalytics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/expenses/analytics/monthly");
      setMonthlyData(response.data);
    } catch (error) {
      console.error("Error fetching monthly analytics:", error);
    }
  };

  return (
    <div className="view-analysis-container">
      <h2 className="title">Admin Dashboard - Expense Analytics</h2>

      {/* Graphs Side-by-Side */}
      <div className="charts-row">
        {/* Expense Breakdown by Category */}
        <div className="chart-container">
          <h3>Expense Breakdown by Category</h3>
          <div className="chart-wrapper">
            <Pie
              data={{
                labels: categoryData.map((item) => item._id),
                datasets: [
                  {
                    data: categoryData.map((item) => item.totalAmount),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0"],
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Monthly Expense Trends */}
        <div className="chart-container">
          <h3>Monthly Expense Trends</h3>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: monthlyData.map((item) => item._id),
                datasets: [
                  {
                    label: "Total Expense",
                    data: monthlyData.map((item) => item.totalAmount),
                    backgroundColor: "#36A2EB",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Financial Insights Below */}
      <div className="insights-container">
        <h3>📊 Financial Insights</h3>
        <div className="insights-grid">
          <div className="insight-box">
            <h4>🔹 Highest Expense Category</h4>
            <p>{categoryData.length ? categoryData[0]._id : "Loading..."}</p>
          </div>
          <div className="insight-box">
            <h4>📅 Peak Spending Month</h4>
            <p>{monthlyData.length ? monthlyData[0]._id : "Loading..."}</p>
          </div>
          <div className="insight-box">
            <h4>💰 Total Expenses This Year</h4>
            <p>₹{monthlyData.reduce((total, item) => total + item.totalAmount, 0).toLocaleString()}</p>
          </div>
          <div className="insight-box">
            <h4>📉 Lowest Spending Month</h4>
            <p>{monthlyData.length ? monthlyData[monthlyData.length - 1]._id : "Loading..."}</p>
          </div>
        </div>
      </div>

      {/* Chatbot Toggle Icon */}
      {!isChatOpen && (
        <div className="chatbot-icon" onClick={toggleChatbot}>
          <TbMessageChatbotFilled />
        </div>
      )}

      {/* Chatbot Section */}
      {isChatOpen && (
        <div className="chatbot-section open">
          <div className="chatbot-header">
            <h2>Financial Chatbot</h2>
            <IoMdClose className="close-icon" onClick={toggleChatbot} />
          </div>

          <div className="chatbox">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask a financial question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()} // Fixed event
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAnalysis;


