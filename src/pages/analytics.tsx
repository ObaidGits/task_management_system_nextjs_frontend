import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useAuthRedirect from '../hooks/useAuthRedirect';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services';
import { Card, Col, Row, Table, Spinner } from 'react-bootstrap';
import { CheckCircleFill, ClockFill, ListCheck } from 'react-bootstrap-icons';

interface Stats {
  total: number;
  completed: number;
  overdue: number;
  perUser: { _id: string; fullName: string; completed: number }[];
  tasksAssignedByPerson: number;
  tasksAssignedToPerson: number;
  givenTaskPending: number;
  yourTaskPending: number;
  tasksCompletedByPerson: number;
  tasksAssignedByOthersAndCompleted: number;
}

export default function Analytics() {
  useAuthRedirect(['admin', 'manager', 'user']);

  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (user) {
      analyticsService.stats(user).then(setStats).catch(console.error);
    }
  }, [user]);

  if (loading || !stats) return (
    <Layout>
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    </Layout>
  );

  const isRegularUser = user?.role === 'user';

  return (
    <Layout>
      <div id="analytics-page" className="p-4 fade-in-page">
        <h2 className="mb-4 fw-bold text-start fade-in-title">📊 Analytics</h2>

        {/* Stats Cards */}
        <Row className="mb-5 fade-in-cards">
          <Col md={4} className="mb-3">
            <Card className="shadow-sm stat-card border-start border-primary border-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <ListCheck size={28} className="text-primary" />
                <div>
                  <div className="fw-semibold text-muted">Total Tasks</div>
                  <h5>{stats.total}</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="shadow-sm stat-card border-start border-success border-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <CheckCircleFill size={28} className="text-success" />
                <div>
                  <div className="fw-semibold text-muted">Completed</div>
                  <h5>{stats.completed}</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="shadow-sm stat-card border-start border-danger border-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <ClockFill size={28} className="text-danger" />
                <div>
                  <div className="fw-semibold text-muted">Overdue</div>
                  <h5>{stats.overdue}</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Task Stats for Regular User */}
        {isRegularUser && (
          <>
            <h5 className="fw-bold mb-3 fade-in-table">Your Task Stats</h5>
            <Row className="mb-4">
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Assigned by You: {stats.tasksAssignedByPerson}</Card.Body>
              </Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Assigned to You: {stats.tasksAssignedToPerson}</Card.Body>
              </Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Your Completed Tasks: {stats.tasksCompletedByPerson}</Card.Body>
              </Card></Col>
            </Row>
            <Row className="mb-4">
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Given Tasks Pending: {stats.givenTaskPending}</Card.Body>
              </Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Your Tasks Pending: {stats.yourTaskPending}</Card.Body>
              </Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Tasks You Gave & Others Completed: {stats.tasksAssignedByOthersAndCompleted}</Card.Body>
              </Card></Col>
            </Row>

            {/* Task Completion Summary */}
            <h5 className="fw-bold mb-3 fade-in-table">Task Completion Summary</h5>
            <Table striped bordered hover responsive className="shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Completed Tasks</th>
                </tr>
              </thead>
              <tbody>
                {stats.perUser
                  .filter(u =>
                    u._id === user._id ||
                    (u._id !== user._id && stats.tasksAssignedByOthersAndCompleted > 0)
                  )
                  .map((u, index) => (
                    <tr key={u._id}>
                      <td>{index + 1}</td>
                      <td>{u._id === user._id ? 'You' : u.fullName}</td>
                      <td>{u.completed}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </>
        )}

        {/* Admin/Manager Stats */}
        {!isRegularUser && (
          <>
            <h5 className="fw-bold mb-3 fade-in-table">Admin/Manager Task Stats</h5>
            <Row className="mb-4">
              <Col><Card className="shadow-sm stat-card border-start border-primary border-4">
                <Card.Body>Total Tasks: {stats.total}</Card.Body>
              </Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-success border-4">
                <Card.Body>Completed: {stats.completed}</Card.Body></Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-danger border-4">
                <Card.Body>Overdue: {stats.overdue}</Card.Body></Card></Col>
            </Row>

            <h5 className="fw-bold mb-3 fade-in-table">Your Task Stats</h5>
            <Row className="mb-4">
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Assigned by You: {stats.tasksAssignedByPerson}</Card.Body></Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Assigned to You: {stats.tasksAssignedToPerson}</Card.Body></Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Your Completed Tasks: {stats.tasksCompletedByPerson}</Card.Body></Card></Col>
            </Row>
            <Row className="mb-4">
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Given Tasks Pending: {stats.givenTaskPending}</Card.Body></Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Your Tasks Pending: {stats.yourTaskPending}</Card.Body></Card></Col>
              <Col><Card className="shadow-sm stat-card border-start border-info border-4">
                <Card.Body>Tasks You Gave & Others Completed: {stats.tasksAssignedByOthersAndCompleted}</Card.Body></Card></Col>
            </Row>

            {/* Per User Completion Table */}
            <h5 className="fw-bold mb-3 fade-in-table">Task Completion Summary</h5>
            <Table striped bordered hover responsive className="shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Completed Tasks</th>
                </tr>
              </thead>
              <tbody>
                {stats.perUser.map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td>{u.fullName}</td>
                    <td>{u.completed}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </div>
    </Layout>
  );
}
