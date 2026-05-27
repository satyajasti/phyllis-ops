import { useState, useEffect } from "react";

export default function StaffLogin({ onLoginSuccess, S }) {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [staffPin, setStaffPin] = useState("");
  const [staffPinErr, setStaffPinErr] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Fetch employees when component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success && data.employees) {
        setEmployees(data.employees);
        setFilteredEmployees(data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setStaffPinErr("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.role.toLowerCase().includes(query)
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchQuery(emp.name);
    setFilteredEmployees([]);
    setStaffPin("");
    setStaffPinErr("");
  };

  const handleLogin = async () => {
    if (!selectedEmployee) {
      setStaffPinErr("Please select an employee");
      return;
    }
    if (!staffPin) {
      setStaffPinErr("Please enter PIN");
      return;
    }

    setLoggingIn(true);
    setStaffPinErr("");

    try {
      const res = await fetch("/api/auth?action=verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          pin: staffPin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Call the success callback with user data
        onLoginSuccess(data.user);
      } else {
        setStaffPinErr(data.message || data.error || "Invalid PIN");
      }
    } catch (error) {
      console.error("Login error:", error);
      setStaffPinErr("Network error. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Search/Select Employee */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ ...S.lbl, marginBottom: "6px", display: "block" }}>
          👨‍🍳 Select Your Name
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={loadingEmployees}
            style={{
              ...S.inp,
              width: "100%",
              boxSizing: "border-box",
              paddingRight: "32px",
              opacity: loadingEmployees ? 0.5 : 1,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedEmployee(null);
                setFilteredEmployees(employees);
              }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          )}

          {/* Dropdown */}
          {searchQuery &&
            filteredEmployees.length > 0 &&
            !selectedEmployee && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#1a1814",
                  border: "1px solid #2e2b26",
                  borderTop: "none",
                  borderRadius: "0 0 4px 4px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #2e2b26",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#ccc",
                      fontSize: "13px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#2a1e0a";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "none";
                    }}
                  >
                    <div style={{ fontWeight: "500" }}>👨 {emp.name}</div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "2px",
                      }}
                    >
                      {emp.role}
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Selected Employee Display */}
        {selectedEmployee && (
          <div
            style={{
              marginTop: "8px",
              padding: "10px 12px",
              background: "#0a160a",
              border: "1px solid #1a3a1a",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#5a9a5a",
                }}
              >
                👨 {selectedEmployee.name}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}
              >
                {selectedEmployee.role}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setSearchQuery("");
                setStaffPin("");
                setFilteredEmployees(employees);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* PIN Input */}
      {selectedEmployee && (
        <div style={{ marginBottom: "16px" }}>
          <label style={{ ...S.lbl, marginBottom: "6px", display: "block" }}>
            Enter PIN
          </label>
          <input
            type="password"
            placeholder="4-digit PIN"
            value={staffPin}
            onChange={(e) => {
              setStaffPin(e.target.value);
              setStaffPinErr("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              ...S.inp,
              width: "100%",
              boxSizing: "border-box",
              fontSize: "16px",
              letterSpacing: "2px",
            }}
          />
        </div>
      )}

      {/* Error Message */}
      {staffPinErr && (
        <div
          style={{
            background: "#1a0a0a",
            border: "1px solid #3a1e1e",
            borderRadius: "3px",
            padding: "10px 12px",
            marginBottom: "12px",
            fontSize: "12px",
            color: "#c07070",
          }}
        >
          {staffPinErr}
        </div>
      )}

      {/* Login Button */}
      {selectedEmployee && (
        <button
          onClick={handleLogin}
          disabled={loggingIn}
          style={{
            ...S.btn,
            width: "100%",
            background: "#0a160a",
            border: "1px solid #1a3a1a",
            color: "#5a9a5a",
            opacity: loggingIn ? 0.6 : 1,
            cursor: loggingIn ? "not-allowed" : "pointer",
          }}
        >
          {loggingIn ? "🔓 Logging in..." : "🔓 Login"}
        </button>
      )}

      {!selectedEmployee && !loadingEmployees && (
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
            padding: "20px",
          }}
        >
          Search and select your name above
        </div>
      )}

      {loadingEmployees && (
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
            padding: "20px",
          }}
        >
          Loading employees...
        </div>
      )}
    </div>
  );
}
