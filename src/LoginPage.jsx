// LoginPage.jsx - Updated with employee name search + PIN entry
import { useState, useEffect } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState("zoho"); // "zoho" or "pin"
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // ─── Fetch all employees on mount ───
  useEffect(() => {
    fetchEmployees();
  }, []);

  // ─── Filter employees based on search query ───
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  // ─── Fetch employees from backend ───
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // ─── Handle Zoho OAuth login ───
  const handleZohoLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth?action=login-url");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Failed to initiate Zoho login");
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle PIN login ───
  const handlePinLogin = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }
    if (!pin) {
      setError("Please enter PIN");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth?action=verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        // Store user session
        sessionStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.accessToken) {
          sessionStorage.setItem("accessToken", data.user.accessToken);
        }
        // Redirect to dashboard
        window.location.href = "/";
      } else {
        setError(data.message || "Invalid PIN");
        setPin("");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>🍳 Phyllis Brunch</h1>
          <p>Operations Portal</p>
          <p className="subtitle">Powered by Zoho Creator & Zoho Shifts</p>
        </div>

        {/* Login Method Tabs */}
        <div className="login-tabs">
          <button
            className={`tab ${loginMethod === "zoho" ? "active" : ""}`}
            onClick={() => {
              setLoginMethod("zoho");
              setError("");
            }}
          >
            🔐 Manager Login
          </button>
          <button
            className={`tab ${loginMethod === "pin" ? "active" : ""}`}
            onClick={() => {
              setLoginMethod("pin");
              setError("");
            }}
          >
            👨‍🍳 Staff Login
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Zoho OAuth Login */}
        {loginMethod === "zoho" && (
          <div className="login-form zoho-form">
            <p className="form-description">
              Sign in with your Zoho account to access the manager dashboard.
            </p>
            <button
              className="btn btn-zoho"
              onClick={handleZohoLogin}
              disabled={loading}
            >
              {loading ? "Redirecting..." : "🔓 Sign in with Zoho"}
            </button>
          </div>
        )}

        {/* PIN Login */}
        {loginMethod === "pin" && (
          <form className="login-form pin-form" onSubmit={handlePinLogin}>
            <p className="form-description">
              Select your name and enter your PIN to login.
            </p>

            {/* Employee Search/Select */}
            <div className="form-group">
              <label htmlFor="employee-search">Select Employee</label>
              <div className="search-container">
                <input
                  id="employee-search"
                  type="text"
                  placeholder="Search by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  autoComplete="off"
                />

                {/* Dropdown Results */}
                {filteredEmployees.length > 0 && (
                  <div className="dropdown-results">
                    {filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className={`dropdown-item ${
                          selectedEmployee?.id === emp.id ? "selected" : ""
                        }`}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSearchQuery(emp.name);
                          setFilteredEmployees([]);
                        }}
                      >
                        <div className="employee-info">
                          <div className="employee-name">{emp.name}</div>
                          <div className="employee-role">{emp.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Employee Display */}
              {selectedEmployee && (
                <div className="selected-employee">
                  <div className="employee-avatar">
                    {selectedEmployee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-details">
                    <div className="name">{selectedEmployee.name}</div>
                    <div className="role">{selectedEmployee.role}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-clear"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setSearchQuery("");
                      setPin("");
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* PIN Input */}
            {selectedEmployee && (
              <div className="form-group">
                <label htmlFor="pin-input">Enter PIN</label>
                <input
                  id="pin-input"
                  type="password"
                  placeholder="Enter your 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.slice(0, 6))}
                  className="pin-input"
                  maxLength="6"
                  inputMode="numeric"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedEmployee || !pin || loading}
            >
              {loading ? "Logging in..." : "🔓 Login"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>Need help? Contact your manager.</p>
        </div>
      </div>
    </div>
  );
}
