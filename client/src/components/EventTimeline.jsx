import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  Circle,
  Clock,
  Edit3,
  Plus,
  Trash2,
  X,
  ListChecks,
  AlertCircle,
  CheckCircle2,
  Timer,
  Sparkles,
} from "lucide-react";

import {
  fetchEventTasks,
  createEventTask,
  updateEventTask,
  completeEventTask,
  deleteEventTask,
} from "../services/eventTaskService";

import { generateAITasks } from "../services/aiTaskService";

const CATEGORIES = [
  "Venue",
  "Food",
  "Decoration",
  "Entertainment",
  "Photography",
  "Guests",
  "Transportation",
  "Budget",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];

const emptyForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  category: "Other",
  status: "Pending",
};

// ============================================================
// DATE HELPERS
// ============================================================

const formatDate = (date) => {
  if (!date) return "No date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDateInputValue = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();

  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ============================================================
// DATE-ONLY OVERDUE DETECTION
// ============================================================

const getLocalDateOnly = (date = new Date()) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTaskDateOnly = (date) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return getLocalDateOnly(parsedDate);
};

const isOverdue = (task) => {
  // Completed tasks are never overdue.
  if (task.status === "Completed") {
    return false;
  }

  // Cancelled tasks are never overdue.
  if (task.status === "Cancelled") {
    return false;
  }

  const taskDate = getTaskDateOnly(task.dueDate);

  if (!taskDate) {
    return false;
  }

  const today = getLocalDateOnly();

  // A task due today is still active.
  return taskDate < today;
};

// ============================================================
// STYLING
// ============================================================

const priorityClasses = {
  Low: "bg-slate-100 text-slate-700 border border-slate-200",

  Medium: "bg-blue-50 text-blue-700 border border-blue-200",

  High: "bg-amber-50 text-amber-700 border border-amber-200",

  Critical: "bg-red-50 text-red-700 border border-red-200",
};

const statusClasses = {
  Pending: "bg-slate-100 text-slate-700 border border-slate-200",

  "In Progress": "bg-indigo-50 text-indigo-700 border border-indigo-200",

  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",

  Cancelled: "bg-red-50 text-red-700 border border-red-200",
};

// ============================================================
// COMPONENT
// ============================================================

const EventTimeline = ({ eventId }) => {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [error, setError] = useState("");

  const [aiError, setAiError] = useState("");

  const [aiSuccess, setAiSuccess] = useState("");

  // ==========================================================
  // LOAD TASKS
  // ==========================================================

  const loadTasks = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError("");

      const data = await fetchEventTasks(eventId);

      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to load event tasks:", err);

      setError(err?.message || "Failed to load event tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadTasks();
    }
  }, [eventId]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.status === "Completed",
    ).length;

    const cancelled = tasks.filter(
      (task) => task.status === "Cancelled",
    ).length;

    // Cancelled tasks do not count toward progress.
    const active = total - cancelled;

    const pending = tasks.filter(
      (task) => task.status === "Pending" || task.status === "In Progress",
    ).length;

    const overdue = tasks.filter((task) => isOverdue(task)).length;

    const progress =
      active === 0 ? 0 : Math.min(100, Math.round((completed / active) * 100));

    return {
      total,
      completed,
      cancelled,
      active,
      pending,
      overdue,
      progress,
    };
  }, [tasks]);

  // ==========================================================
  // FORM
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingTaskId(null);

    setShowForm(false);

    setError("");
  };

  const handleAddTask = () => {
    setEditingTaskId(null);

    setForm({
      ...emptyForm,
    });

    setError("");

    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);

    setForm({
      title: task.title || "",

      description: task.description || "",

      dueDate: getDateInputValue(task.dueDate),

      priority: task.priority || "Medium",

      category: task.category || "Other",

      status: task.status || "Pending",
    });

    setError("");

    setShowForm(true);
  };

  // ==========================================================
  // CREATE / UPDATE TASK
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!form.dueDate) {
      setError("Task due date is required.");
      return;
    }

    try {
      setSaving(true);

      setError("");

      if (editingTaskId) {
        const data = await updateEventTask(eventId, editingTaskId, form);

        setTasks((previous) =>
          previous.map((task) =>
            task._id === editingTaskId ? data.task : task,
          ),
        );
      } else {
        const data = await createEventTask(eventId, form);

        setTasks((previous) => [...previous, data.task]);
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save task:", err);

      setError(err?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // AI TASK GENERATION
  // ==========================================================

  const handleGenerateAITasks = async () => {
    if (!eventId || aiLoading) {
      return;
    }

    try {
      setAiLoading(true);

      setAiError("");

      setAiSuccess("");

      setError("");

      const response = await generateAITasks(eventId);

      setAiSuccess(response?.message || "AI tasks generated successfully.");

      /*
       * Refresh tasks from MongoDB so the UI
       * always displays the saved server state.
       */
      await loadTasks();
    } catch (err) {
      console.error("Failed to generate AI tasks:", err);

      setAiError(err?.message || "Failed to generate AI tasks.");
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================================
  // INTERACTIVE CHECKLIST
  // ==========================================================

  const handleToggleComplete = async (task) => {
    if (task.status === "Cancelled") {
      return;
    }

    try {
      setError("");

      // --------------------------------------------------------
      // COMPLETED -> PENDING
      // --------------------------------------------------------

      if (task.status === "Completed") {
        const response = await updateEventTask(eventId, task._id, {
          status: "Pending",
        });

        setTasks((currentTasks) =>
          currentTasks.map((item) =>
            item._id === task._id ? response.task : item,
          ),
        );

        return;
      }

      // --------------------------------------------------------
      // PENDING / IN PROGRESS -> COMPLETED
      // --------------------------------------------------------

      const response = await completeEventTask(eventId, task._id);

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id ? response.task : item,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle task completion:", err);

      setError(err?.message || "Failed to update task completion.");
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteEventTask(eventId, taskId);

      setTasks((previous) => previous.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);

      setError(err?.message || "Failed to delete task.");
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* TITLE */}

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ListChecks size={23} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Timeline & Checklist
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Organize and track everything that needs to be completed
                  before your event.
                </p>
              </div>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* AI BUTTON */}

            <button
              type="button"
              onClick={handleGenerateAITasks}
              disabled={aiLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-300 border-t-purple-700" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate AI Tasks
                </>
              )}
            </button>

            {/* ADD TASK */}

            <button
              type="button"
              onClick={handleAddTask}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus size={17} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          AI SUCCESS
      ====================================================== */}

      {aiSuccess && (
        <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

          <span>{aiSuccess}</span>
        </div>
      )}

      {/* ======================================================
          AI ERROR
      ====================================================== */}

      {aiError && (
        <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <span>{aiError}</span>
        </div>
      )}

      {/* ======================================================
          GENERAL ERROR
      ====================================================== */}

      {error && (
        <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-2 gap-4 px-6 pt-6 lg:grid-cols-4">
        {/* TOTAL */}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Tasks</p>

            <ListChecks size={18} className="text-slate-400" />
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        {/* COMPLETED */}

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-700">Completed</p>

            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {stats.completed}
          </p>
        </div>

        {/* PENDING */}

        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-700">Pending</p>

            <Timer size={18} className="text-indigo-600" />
          </div>

          <p className="mt-2 text-2xl font-bold text-indigo-700">
            {stats.pending}
          </p>
        </div>

        {/* OVERDUE */}

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-700">Overdue</p>

            <AlertCircle size={18} className="text-red-600" />
          </div>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {stats.overdue}
          </p>
        </div>
      </div>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <div className="px-6 pt-7">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Preparation Progress
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {stats.completed} of {stats.active} active tasks completed
              </p>
            </div>

            <span className="text-lg font-bold text-indigo-600">
              {stats.progress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${stats.progress}%`,
              }}
            />
          </div>

          {stats.cancelled > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              {stats.cancelled} cancelled{" "}
              {stats.cancelled === 1 ? "task" : "tasks"} excluded from progress.
            </p>
          )}
        </div>
      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mx-6 mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingTaskId ? "Edit Task" : "Add New Task"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter the task details below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* TITLE */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Task Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Confirm wedding venue"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add task details..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* DUE DATE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Due Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* PRIORITY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {PRIORITIES.map((priority) => (
                  <option
                    key={priority}
                    value={priority}
                    className="bg-white text-slate-900"
                  >
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {CATEGORIES.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-white text-slate-900"
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                    className="bg-white text-slate-900"
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FORM BUTTONS */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-indigo-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingTaskId
                  ? "Update Task"
                  : "Create Task"}
            </button>
          </div>
        </form>
      )}

      {/* ======================================================
          TASK LIST
      ====================================================== */}

      <div className="px-6 py-6">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading timeline...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
              <CalendarDays size={28} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No tasks yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Add your first event preparation task or let AI generate tasks
              automatically.
            </p>

            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerateAITasks}
                disabled={aiLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-300 border-t-purple-700" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate AI Tasks
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAddTask}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={17} />
                Add First Task
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const overdue = isOverdue(task);

              const completed = task.status === "Completed";

              const cancelled = task.status === "Cancelled";

              return (
                <div
                  key={task._id}
                  className={`rounded-2xl border p-5 transition-all ${
                    completed
                      ? "border-emerald-200 bg-emerald-50/30"
                      : cancelled
                        ? "border-slate-200 bg-slate-50"
                        : overdue
                          ? "border-red-200 bg-red-50/30"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* ==================================================
                        CHECKLIST
                    ================================================== */}

                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task)}
                      disabled={cancelled}
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        completed
                          ? "border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                          : cancelled
                            ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400"
                            : "border-slate-300 bg-white text-transparent hover:border-indigo-500 hover:bg-indigo-50"
                      }`}
                      title={
                        cancelled
                          ? "Cancelled task"
                          : completed
                            ? "Mark as pending"
                            : "Mark as completed"
                      }
                      aria-label={
                        cancelled
                          ? `Cancelled task: ${task.title}`
                          : completed
                            ? `Mark ${task.title} as pending`
                            : `Mark ${task.title} as completed`
                      }
                    >
                      {completed ? (
                        <Check size={16} strokeWidth={3} />
                      ) : cancelled ? (
                        <X size={15} />
                      ) : (
                        <Circle size={15} />
                      )}
                    </button>

                    {/* ==================================================
                        CONTENT
                    ================================================== */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <h3
                            className={`text-base font-semibold ${
                              completed
                                ? "text-slate-500 line-through"
                                : cancelled
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              priorityClasses[task.priority] ||
                              priorityClasses.Medium
                            }`}
                          >
                            {task.priority}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleEditTask(task)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit task"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(task._id)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* ==================================================
                          META
                      ================================================== */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          <CalendarDays size={14} className="text-slate-400" />

                          {formatDate(task.dueDate)}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          <Clock size={14} className="text-slate-400" />

                          {task.category}
                        </span>

                        <span
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                            statusClasses[task.status] || statusClasses.Pending
                          }`}
                        >
                          {task.status}
                        </span>

                        {overdue && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700">
                            <AlertCircle size={14} />
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventTimeline;
