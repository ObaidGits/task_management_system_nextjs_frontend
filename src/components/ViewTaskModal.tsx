import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import { Task } from '../pages/tasks';

interface ViewTaskModalProps {
  task: Task | null;
  show: boolean;
  onClose: () => void;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, show, onClose }) => {
  if (!task) return null;

  const renderAssignedTo = (assignedTo: string | { _id: string; fullName?: string }) => {
    if (typeof assignedTo === 'string') {
      return assignedTo;
    }
    return assignedTo.fullName || 'Unknown';
  };

  const renderCreatedBy = (createdBy: string | { _id: string; fullName?: string }) => {
    if (typeof createdBy === 'string') {
      return createdBy;
    }
    return createdBy.fullName || 'Unknown';
  };

  return (
    <Modal show={show} onHide={onClose} className="task-modal animate__animated animate__fadeIn">
      <Modal.Header closeButton className="task-modal-header">
        <Modal.Title><FaEye /> View Task</Modal.Title>
      </Modal.Header>
      <Modal.Body className="task-modal-body">
        <p><strong>Title:</strong> {task.title}</p>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
        {task.completionDate && <p><strong>Completion Date:</strong> {new Date(task.completionDate).toLocaleDateString()}</p>}
        <p><strong>Assigned To:</strong> {renderAssignedTo(task.assignedTo)}</p>
        <p><strong>Created By:</strong> {renderCreatedBy(task.createdBy)}</p>
      </Modal.Body>
      <Modal.Footer className="task-modal-footer">
        <Button variant="primary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewTaskModal;
