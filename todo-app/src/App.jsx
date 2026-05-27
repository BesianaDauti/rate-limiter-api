import { useState } from "react";
import axios from "axios";

const API_URL =
  "http://ratelimiterapi-env.eba-ppdfdmbw.eu-north-1.elasticbeanstalk.com/api";

const API_KEY = "YOUR_RATELIMITER_API_KEY".trim();

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [resetIn, setResetIn] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendApiRequest = async () => {
    try {
      const response = await axios.get(`${API_URL}/data/test`, {
        headers: {
          "X-API-Key": API_KEY,
          Accept: "application/json",
        },
        timeout: 15000,
        validateStatus: () => true,
      });

      const headers = response.headers || {};

      setRemaining(
        headers["x-ratelimit-remaining"] ||
          headers["X-RateLimit-Remaining"] ||
          "-"
      );

      setResetIn(
        headers["x-ratelimit-reset"] ||
          headers["X-RateLimit-Reset"] ||
          "-"
      );

      return response.status;
    } catch {
      return 0;
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;

    const todoText = input.trim();

    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: todoText,
      },
    ]);

    setInput("");
    setMessage("🟡 Sending request...");

    const status = await sendApiRequest();

    if (status === 200) {
      setMessage("✅ Request logged successfully");
    } else if (status === 429) {
      setMessage("🚫 Rate limit exceeded");
    } else if (status === 401) {
      setMessage("⚠️ API key rejected");
    } else {
      setMessage("⚠️ Request sent locally");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Todo App</h1>

        <p style={styles.subtitle}>Protected by Rate Limiter API Key</p>

        <div style={styles.statusBox}>
          <p>
            Remaining Requests: <strong>{remaining ?? "-"}</strong>
          </p>

          <p>
            Reset In: <strong>{resetIn ?? "-"}s</strong>
          </p>
        </div>

        <div style={styles.row}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add todo"
            style={styles.input}
          />

          <button onClick={addTodo} style={styles.button}>
            Add
          </button>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.todoList}>
          {todos.map((todo) => (
            <div key={todo.id} style={styles.todo}>
              {todo.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    padding: "20px",
    fontFamily: "Arial",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#111827",
    borderRadius: "20px",
    padding: "30px",
    color: "white",
  },
  title: { marginTop: 0, fontSize: "2rem" },
  subtitle: { color: "#94a3b8", marginBottom: "20px" },
  statusBox: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  row: { display: "flex", gap: "10px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },
  button: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: "15px",
    padding: "12px",
    background: "#1e293b",
    borderRadius: "10px",
  },
  todoList: {
    marginTop: "20px",
    display: "grid",
    gap: "10px",
  },
  todo: {
    background: "#1e293b",
    padding: "14px",
    borderRadius: "10px",
  },
};

export default App;