import React, { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { Alert } from "react-bootstrap";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  assignedTo?: string;
  createdBy?: string;
  dueDate?: string;
}

interface TaskAssignedData {
  message: string;
  task: Task;
}

interface TaskUpdatedData {
  message: string;
  task: Task;
}

interface TaskDeletedData {
  message: string;
  taskId: string;
}

type Notification =
  | { type: "assigned"; message: string; task: Task }
  | { type: "updated"; message: string; task: Task }
  | { type: "deleted"; message: string; taskId: string };

const TaskNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Debugging notifications
    console.log("🔌 Socket connected:", socket.id);

    socket.on("task-assigned", (data: TaskAssignedData) => {
      console.log("📥 task-assigned received:", data);
      setNotifications((prev) => [
        ...prev,
        { type: "assigned", message: data.message, task: data.task },
      ]);
    });

    socket.on("task-updated", (data: TaskUpdatedData) => {
      console.log("📥 task-updated received:", data);
      setNotifications((prev) => [
        ...prev,
        { type: "updated", message: data.message, task: data.task },
      ]);
    });

    socket.on("task-deleted", (data: TaskDeletedData) => {
      console.log("📥 task-deleted received:", data);
      setNotifications((prev) => [
        ...prev,
        { type: "deleted", message: data.message, taskId: data.taskId },
      ]);
    });

    return () => {
      console.log("🧹 Cleanup socket listeners");
      socket.off("task-assigned");
      socket.off("task-updated");
      socket.off("task-deleted");
    };
  }, [socket]);

  return (
    <div>
      {notifications.map((notification, index) => (
        <Alert key={index} variant="info">
          {notification.message}
        </Alert>
      ))}
    </div>
  );
};

export default TaskNotifications;
