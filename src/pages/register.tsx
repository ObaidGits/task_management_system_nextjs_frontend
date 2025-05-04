import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { authService } from '../services';
import { useRouter } from 'next/router';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import Link from 'next/link';

export default function Register() {
  const [fn, setFn] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [role, setRole] = useState('user');
  const [err, setErr] = useState('');
  const [submitFormLoading, setSubmitFormLoading] = useState(false); // Spinner state
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitFormLoading(true);  // Enable spinner
      await authService.register({ fullName: fn, email, password: pw, role });
      router.push('/login');
    } catch {
      setErr('Registration failed');
    } finally {
      setSubmitFormLoading(false); // Disable spinner after submission
    }
  };

  return (
    <Container id="register-page" className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="register-card shadow-lg p-5 animate__animated animate__fadeInUp">
        <Col>
          <h2 className="text-center mb-4 register-title">
            <i className="bi bi-person-plus me-2"></i>Create Account
          </h2>
          <p className="text-center mb-4 login-title"  style={{ "fontWeight":"700", "color":"#2c3e50"}}>
            <span className="me-2" style={{"fontSize":"18px"}}>📝 Task Master </span><br/>(By Obaidullah Zeeshan)
          </p>
          {err && <Alert variant="danger" className="text-center">{err}</Alert>}
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={fn}
                onChange={(e) => setFn(e.target.value)}
                className="form-control-custom"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control-custom"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="form-control-custom"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="form-label-custom">Role</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-control-custom"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" className="w-100 custom-register-btn" disabled={submitFormLoading}>
              {submitFormLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Registering...
                </>
              ) : (
                <>
                  <i className="bi bi-person-check me-2"></i>Register
                </>
              )}
            </Button>
            <div className="text-center mt-4">
              <Link href="/login" className="register-link">Already have an account? <strong>Login</strong></Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
