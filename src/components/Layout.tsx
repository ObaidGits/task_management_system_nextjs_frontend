import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Navbar, Nav, Alert, Dropdown, Badge, Button, Offcanvas
} from 'react-bootstrap';
import {
  Bell, BarChartFill, CheckSquareFill, PeopleFill, FileEarmarkTextFill, Grid1x2Fill, BoxArrowRight
} from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { analyticsService, notificationService } from '@/services';
import Link from 'next/link';

interface Stats {
  total: number;
  completed: number;
  overdue: number;
  perUser: { _id: string; completed: number }[];
}

interface Notification {
  _id: string;
  type: 'assigned' | 'updated' | 'deleted';
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [liveNotes, setLiveNotes] = useState<Notification[]>([]);
  const [savedNotes, setSavedNotes] = useState<Notification[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const socket = useSocket(user?._id);

  useEffect(() => {
    if (!user) return;
    analyticsService.stats(user).then(setStats);
    notificationService.getAll(user).then(setSavedNotes);
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    const fetchNotifications = async () => {
      try {
        const freshNotes = await notificationService.getAll(user);
        setSavedNotes(freshNotes);
      } catch (error) {
        console.error("Error fetching notifications from DB:", error);
      }
    };

    const appendLive = (note: Omit<Notification, '_id' | 'isRead' | 'createdAt'>) => {
      const newNote = {
        _id: Date.now().toString(),
        isRead: false,
        createdAt: new Date().toISOString(),
        ...note,
      };
      setLiveNotes(prev => [...prev, newNote]);
      setTimeout(() => {
        setLiveNotes(prev => prev.filter(n => n._id !== newNote._id));
      }, 10000);
    };

    socket.on("task-assigned", ({ task }) => {
      appendLive({
        type: "assigned",
        message: `📌 "${task.title}" assigned by ${task.createdBy.fullName} (${task.createdBy.role})`,
      });
      fetchNotifications();
    });

    socket.on("task-updated", ({ task }) => {
      appendLive({
        type: "updated",
        message: `✏️ "${task.title}" updated by ${task.createdBy.fullName} (${task.createdBy.role})`,
      });
      fetchNotifications();
    });

    socket.on("task-deleted", ({ creator }) => {
      appendLive({
        type: "deleted",
        message: `🗑️ Task deleted by ${creator.fullName} (${creator.role})`,
      });
      fetchNotifications();
    });

    return () => {
      socket.off("task-assigned");
      socket.off("task-updated");
      socket.off("task-deleted");
    };
  }, [socket, user]);

  const unreadCount = savedNotes.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(savedNotes.map(note => notificationService.markAsRead(note._id)));
      setSavedNotes(prevNotes => prevNotes.map(note => ({ ...note, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setSavedNotes(prevNotes =>
        prevNotes.map(note =>
          note._id === notificationId ? { ...note, isRead: true } : note
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading || !stats) return <div className="p-5 text-center">Loading…</div>;

  return (
    <div id="layout-component">
      <Navbar bg="dark" variant="dark" expand="lg" className="px-2 shadow-sm sticky-top">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <div className='d-flex justify-content-start align-items-center'>
            <Button variant="outline-light" className="d-lg-none me-2" onClick={() => setShowSidebar(true)}>
              <Grid1x2Fill />
            </Button>
            <Navbar.Brand href="/dashboard" className="fw-bold">📝 Task Master</Navbar.Brand>
          </div>

          <div className='d-flex justify-content-center align-items-center small-toggle-wrapper' style={{ gap: '10px' }}>
            <Dropdown align="end" id="notifications-dropdown">
              <Dropdown.Toggle variant="link" className="text-white position-relative bell-toggle">
                <Bell size={22} />
                {unreadCount > 0 && (
                  <Badge bg="danger" pill className="notification-badge">
                    {unreadCount}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu className="notifications-menu animate__animated animate__fadeIn">
                <Dropdown.Header className="notifications-header">
                  <div>🔔 Notifications</div>
                  <div>
                    <Button variant="link" className="text-primary" onClick={handleMarkAllAsRead}>
                      Mark all as read
                    </Button>
                  </div>
                </Dropdown.Header>
                {savedNotes.length === 0 ? (
                  <Dropdown.ItemText className="text-muted text-center py-3">
                    No notifications yet
                  </Dropdown.ItemText>
                ) : (
                  savedNotes.map((n) => (
                    <Dropdown.ItemText
                      key={n._id}
                      className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                    >
                      {n.message}
                      <div className="timestamp">
                        <div>{new Date(n.createdAt).toLocaleString()}</div>
                        <div>
                          {!n.isRead && (
                            <Button variant="link" className="text-primary p-0" onClick={() => handleMarkAsRead(n._id)}>
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </Dropdown.ItemText>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" className="p-1" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="ms-auto align-items-center gap-3">
                <span className="text-white fw-semibold pt-2">{user?.fullName}</span>
                <Link href="#" onClick={logout} className="text-white d-flex align-items-center nav-link logout-link">
                  <span className="text-white fw-semibold pt-2">
                    <BoxArrowRight className="me-1" size={22} /> Logout
                  </span>
                </Link>
              </Nav>
            </Navbar.Collapse>
          </div>
        </Container>
      </Navbar>

      {liveNotes.length > 0 && (
        <Container className="mt-3" fluid>
          {liveNotes.map((n) => (
            <Alert key={n._id} variant="info" dismissible className="fade-in-alert">
              {n.message}
            </Alert>
          ))}
        </Container>
      )}

      <Container fluid>
        <Row>
          <Col lg={2} className="p-0">
            <Offcanvas
              show={showSidebar}
              onHide={() => setShowSidebar(false)}
              responsive="lg"
              scroll={false}
              backdrop={true}
              id="sidebar"
              className='position-fixed'
            >
              <Offcanvas.Header closeButton className="d-lg-none">
                <Offcanvas.Title>Menu</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body className="p-0 bg-light vh-100">
                <Nav className="flex-column p-3 sidebar-nav gap-2">
                  <Link href="/dashboard" className="nav-link"><BarChartFill className="me-2" />Dashboard</Link>
                  <Link href="/tasks" className="nav-link"><CheckSquareFill className="me-2" />Tasks</Link>
                  <Link href="/users" className="nav-link"><PeopleFill className="me-2" />Users</Link>
                  <Link href="/logs" className="nav-link"><FileEarmarkTextFill className="me-2" />Logs</Link>
                  <Link href="/analytics" className="nav-link"><BarChartFill className="me-2" />Analytics</Link>
                </Nav>
              </Offcanvas.Body>
            </Offcanvas>
          </Col>

          <Col lg={10} className="p-4 bg-white rounded shadow-sm fade-in-content">
            {children}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Layout;
