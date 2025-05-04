import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { analyticsService } from "../services";
import { Card, Row, Col, Table } from "react-bootstrap";
import { CheckCircleFill, ClockFill, ListCheck } from "react-bootstrap-icons";

interface Stats {
  total: number;
  completed: number;
  overdue: number;
  perUser: { _id: string; fullName: string; completed: number }[];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    analyticsService.stats(user).then(setStats);
  }, [user]);

  if (loading || !stats) return <div className="p-5 text-center">Loading…</div>;

  return (
    <Layout>
      <div id="dashboard-page">
        <h2 className="mb-4 fw-bold fade-in-title">📊 Dashboard</h2>

        {/* Stats Cards */}
        <Row className="mb-5 fade-in-cards">
          <Col md={4} className="mb-3">
            <Card className="shadow-sm stat-card border-start border-primary border-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <ListCheck size={28} className="text-primary" />
                <div>
                  <div className="fw-semibold text-muted">Total Tasks</div>
                  <h5 className="mb-0">{stats.total}</h5>
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
                  <h5 className="mb-0">{stats.completed}</h5>
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
                  <h5 className="mb-0">{stats.overdue}</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Per-User Table */}
        <div className="fade-in-table">
          <h5 className="fw-bold mb-3">🧑‍🤝‍🧑 Task Completion Summary</h5>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Tasks Completed</th>
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
        </div>
      </div>
    </Layout>
  );
}
