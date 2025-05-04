import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import Link from 'next/link';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
});

export default function Login() {
  const { login, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const registerUser = () => {
        console.log(`🔁 Re-registering user ${user._id} with socket ${socket.id}`);
        socket.emit('register', user._id);
      };

      if (socket.connected) {
        registerUser();
      } else {
        socket.connect();
        console.log("Socket connecting...");
      }

      socket.on('connect', () => {
        console.log("✅ Socket connected:", socket.id);
        registerUser();
      });

      socket.on('task-assigned', (data) => {
        console.log('📥 task-assigned received:', data);
        alert(data.message);
      });

      socket.on('task-updated', (data) => {
        console.log('📥 task-updated received:', data);
        alert(data.message);
      });

      socket.on('task-deleted', (data) => {
        console.log('📥 task-deleted received:', data);
        alert(data.message);
      });

      return () => {
        socket.off('connect', registerUser);
        socket.off('task-assigned');
        socket.off('task-updated');
        socket.off('task-deleted');
        console.log('🧹 Cleanup socket listeners');
      };
    }
  }, [isAuthenticated, user]);

  const [submitFormLoading, setSubmitFormLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitFormLoading(true);
      await login(email, pw);
      router.push('/dashboard');
    } catch {
      setErr('Invalid credentials');
    } finally { 
      setTimeout(() => {
      setSubmitFormLoading(false); // Disable spinner after 3 seconds
    }, 3000);
    }
  };

  return (
    <Container id="login-page" className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="login-card shadow-lg p-5 animate__animated animate__fadeInUp">
        <Col>
          <h2 className="text-center mb-4 login-title">
            <i className="bi bi-box-arrow-in-right me-2"></i>Welcome Back
          </h2>
          <p className="text-center mb-4 login-title">
            <span className="me-2" style={{"fontSize":"18px"}}>📝 Task Master </span><br/>(By Obaidullah Zeeshan)
          </p>
          {err && <Alert variant="danger" className="text-center">{err}</Alert>}
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3 position-relative">
              <Form.Label className="form-label-custom">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control-custom"
              />
              {submitFormLoading && (
                <Spinner
                  animation="border"
                  role="status"
                  size="sm"
                  style={{
                    position: 'absolute',
                    top: '60%',
                    right: '15px',
                  }}
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              )}
            </Form.Group>
            <Form.Group className="mb-4 position-relative">
              <Form.Label className="form-label-custom">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="form-control-custom"
              />
              {submitFormLoading && (
                <Spinner
                  animation="border"
                  role="status"
                  size="sm"
                  style={{
                    position: 'absolute',
                    top: '60%',
                    right: '15px',
                  }}
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              )}
            </Form.Group>
            <Button type="submit" className="w-100 custom-login-btn" disabled={submitFormLoading}>
              {submitFormLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Logging in...
                </>
              ) : (
                <>
                  <i className="bi bi-door-open me-2"></i>Login
                </>
              )}
            </Button>
            <div className="text-center mt-4">
              <Link href="/register" className="register-link">Don't have an account? <strong>Register</strong></Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
