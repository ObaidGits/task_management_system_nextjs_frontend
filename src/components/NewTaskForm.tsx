import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { taskService, userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FaPlusCircle } from 'react-icons/fa';

interface NewTaskFormProps {
  onSuccess?: () => void;
}

export default function NewTaskForm({ onSuccess }: NewTaskFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for task creation

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await userService.list();
      setUsers(allUsers);
    };
    fetchUsers();
  }, []);

  if (!user) {
    return <Alert variant="warning">Loading user information...</Alert>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const assignee = users.find((u: any) => u._id === assignedTo);
    if (!assignee) {
      setError('Please select a valid user to assign the task.');
      return;
    }

    setError('');
    setIsSubmitting(true); // Start loading
    try {
      await taskService.create({ title, description, dueDate, priority, status, assignedTo });
      if (onSuccess) onSuccess();
    } catch (error) {
      setError('An error occurred while creating the task.');
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="new-task-form animate__animated animate__fadeInUp">
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Due Date</Form.Label>
        <Form.Control type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Priority</Form.Label>
        <Form.Select value={priority} onChange={e => setPriority(e.target.value)}>
          <option>Low</option><option>Medium</option><option>High</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
          <option>Pending</option><option>In Progress</option><option>Completed</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Assign To</Form.Label>
        <Form.Select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
          <option value="">-- Select User --</option>
          {users.map((user: any) => (
            <option key={user._id} value={user._id}>{user.fullName} ({user.role})</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Creating...
          </>
        ) : (
          <>
            <FaPlusCircle /> Create Task
          </>
        )}
      </Button>
    </Form>
  );
}
