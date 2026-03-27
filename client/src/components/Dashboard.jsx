import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createDashboardItem,
  deleteDashboardItem,
  fetchDashboard,
  updateDashboardItem,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "lead",
    status: "active",
  });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadDashboard() {
    try {
      const response = await fetchDashboard();
      setData(response);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load dashboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        await updateDashboardItem(editId, form);
      } else {
        await createDashboardItem(form);
      }

      setForm({ title: "", type: "lead", status: "active" });
      setEditId(null);
      await loadDashboard();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to save item.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditId(item._id);
    setForm({
      title: item.title,
      type: item.type,
      status: item.status || "active",
    });
  }

  async function handleDelete(id) {
    setError("");
    try {
      await deleteDashboardItem(id);
      await loadDashboard();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to delete item.";
      setError(message);
    }
  }

  function clearForm() {
    setEditId(null);
    setForm({ title: "", type: "lead", status: "active" });
  }

  if (loading) {
    return <div className="page dashboard-page">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="dashboard-card">
          <p className="error">{error}</p>
          <button className="secondary-btn" onClick={handleLogout}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1>Operations Dashboard</h1>
            <p className="subtitle">Welcome, {data?.user?.name || "User"}.</p>
          </div>
          <button className="danger-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="stats-strip">
          <div className="stat-box">
            <h2>Leads</h2>
            <p>{data?.stats?.leads ?? 0}</p>
          </div>
          <div className="stat-box">
            <h2>Tasks</h2>
            <p>{data?.stats?.tasks ?? 0}</p>
          </div>
          <div className="stat-box">
            <h2>Users</h2>
            <p>{data?.stats?.users ?? 0}</p>
          </div>
        </div>

        <div className="dashboard-body">
          <form className="crud-form" onSubmit={handleSave}>
            <h3>{editId ? "Edit Record" : "Add New Record"}</h3>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter record title"
            />

            <label htmlFor="type">Type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}>
              <option value="lead">Lead</option>
              <option value="task">Task</option>
              <option value="user">User</option>
            </select>

            <label htmlFor="status">Status</label>
            <input
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              placeholder="active"
            />

            <div className="form-actions">
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
              {editId ? (
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={clearForm}
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          <div className="records-panel">
            <h3>Records</h3>
            {data?.items?.length ? (
              <div className="records-list">
                {data.items.map((item) => (
                  <div className="record-row" key={item._id}>
                    <div className="record-meta">
                      <p className="record-title">{item.title}</p>
                      <p className="record-subtitle">
                        {item.type.toUpperCase()} | {item.status}
                      </p>
                    </div>
                    <div className="record-actions">
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-btn"
                        type="button"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No records yet. Add your first item.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
