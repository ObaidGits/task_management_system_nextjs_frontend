import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useAuthRedirect from '../hooks/useAuthRedirect';
import { userService } from '../services';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { PencilSquare, TrashFill } from 'react-bootstrap-icons';
import UpdateUserModal from '../components/UpdateUserModal';
import { useAuth } from '@/context/AuthContext';

export default function Users() {
  useAuthRedirect(['admin', 'manager', 'user']);
  const logged_user = useAuth().user;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    userService.list().then((userList) => {
      setUsers(userList);
      setLoading(false);
    });
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will delete all their tasks, logs, and notifications.')) {
      await userService.remove(userId);
      fetchUsers();
    }
  };

  const handleUpdate = async (updatedUser: any) => {
    await userService.update(updatedUser._id, updatedUser);
    fetchUsers();
  };

  if (loading) return (
    <Layout>
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div id="users-page" className="container py-4 fade-in-page">
        <h2 className="mb-3 fw-bold text-start fade-in-title">👥 {logged_user?.role === "admin" ? "Users Management" : "Users"}</h2>

        <Row className="mb-4">
          {users.map((user) => (
            <Col md={4} lg={3} key={user._id} className="mb-4">
              <Card className="shadow-sm user-card">
                <Card.Body>
                  <h5 className="card-title">{user.fullName}</h5>
                  <p className="card-text">{user.email}</p>
                  <p className="card-text text-muted text-capitalize">{user.role}</p>

                  <div className="task-stats mt-3">
                    <small className="d-block">📋 Total: {user.total_tasks}</small>
                    <small className="d-block text-warning">⏳ Pending: {user.pending_task}</small>
                    <small className="d-block text-primary">🚧 In Progress: {user.progress_task}</small>
                    <small className="d-block text-success">✅ Completed: {user.completed_task}</small>
                  </div>

                  {logged_user?.role === "admin" && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button className="btn btn-sm btn-outline-info" onClick={() => handleEdit(user)}>
                        <PencilSquare size={18} /> Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user._id)}>
                        <TrashFill size={18} /> Delete
                      </button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <UpdateUserModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleUpdate}
          user={selectedUser}
        />
      </div>
    </Layout>
  );
}
