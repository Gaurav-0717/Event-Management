import api from "./api";

// Get all tasks for an event
export const fetchEventTasks = async (eventId) => {
  const response = await api.get(`/events/${eventId}/tasks`);
  return response.data;
};

// Create a new task
export const createEventTask = async (eventId, taskData) => {
  const response = await api.post(`/events/${eventId}/tasks`, taskData);

  return response.data;
};

// Update an existing task
export const updateEventTask = async (eventId, taskId, taskData) => {
  const response = await api.put(
    `/events/${eventId}/tasks/${taskId}`,
    taskData,
  );

  return response.data;
};

// Mark a task as completed
export const completeEventTask = async (eventId, taskId) => {
  const response = await api.patch(
    `/events/${eventId}/tasks/${taskId}/complete`,
  );

  return response.data;
};

// Delete a task
export const deleteEventTask = async (eventId, taskId) => {
  const response = await api.delete(`/events/${eventId}/tasks/${taskId}`);

  return response.data;
};
