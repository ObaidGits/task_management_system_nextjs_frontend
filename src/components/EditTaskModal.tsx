import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Task } from '../pages/tasks';
import { userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FaEdit } from 'react-icons/fa';

interface UserOption {
  _id: string;
  fullName?: string;
}

interface EditTaskModalProps {
  task: Task | null;
  show: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const statusOptions = ['Pending', 'In Progress', 'Completed'];
const priorityOptions = ['Low', 'Medium', 'High'];

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, show, onClose, onSave }) => {
  const [updatedTask, setUpdatedTask] = useState<Task | null>(null);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (task) {
      setUpdatedTask(task);
    }
  }, [task]);

  useEffect(() => {
    userService.list().then((users) => setAllUsers(users));
  }, []);

  if (!updatedTask || !user) return null;

  const userId = user._id;
  const userRole = user.role;

  const isAssignedUser =
    typeof updatedTask.assignedTo === 'string'
      ? updatedTask.assignedTo === userId
      : updatedTask.assignedTo?._id === userId;

  const isAdminOrManager = ['admin', 'manager'].includes(userRole);
  const isCreator =
    updatedTask.createdBy === userId ||
    (typeof updatedTask.createdBy === 'object' && updatedTask.createdBy._id === userId);


  const canEditAll = isAdminOrManager || isCreator;

  // const handleChange = (e: React.ChangeEvent<any>) => {
  //   const { name, value } = e.target;
  //   setUpdatedTask({ ...updatedTask, [name]: value });
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedTask({ ...updatedTask, [name]: value });
  };
  

  const handleSave = () => {
    if (updatedTask) {
      onSave(updatedTask);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <Modal show={show} onHide={onClose} className="edit-task-modal animate__animated animate__zoomIn">
      <Modal.Header closeButton className="task-modal-header">
        <Modal.Title><FaEdit /> Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body className="task-modal-body">
        <Form>
          {canEditAll && (
            <>
              <Form.Group controlId="formTitle" className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={updatedTask.title}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formDescription" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={updatedTask.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formPriority" className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select name="priority" value={updatedTask.priority} onChange={handleChange}>
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="formDueDate" className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formatDate(updatedTask.dueDate)}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formAssignedTo" className="mb-3">
                <Form.Label>Assigned To</Form.Label>
                <Form.Select
                  name="assignedTo"
                  value={
                    typeof updatedTask.assignedTo === 'string'
                      ? updatedTask.assignedTo
                      : updatedTask.assignedTo?._id
                  }
                  onChange={handleChange}
                >
                  <option value="">Select a user</option>
                  {allUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName || user._id}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}

          {(canEditAll || isAssignedUser) && (
            <Form.Group controlId="formStatus" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={updatedTask.status} onChange={handleChange}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskModal;
