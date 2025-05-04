import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useAuthRedirect from '../hooks/useAuthRedirect';
import { taskService } from '../services';
import { Table, Button, Dropdown, ButtonGroup, Form, Modal, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import ViewTaskModal from '../components/ViewTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import NewTaskForm from '../components/NewTaskForm';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: string | { _id: string; fullName?: string };
  createdBy: string | { _id: string; fullName?: string };
  createdAt: Date;
  completionDate: Date;
}

export default function Tasks() {
  useAuthRedirect();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');

  const showCreate = router.query.create === 'true';

  const normalizeId = (id: any) =>
    typeof id === 'string' ? id : id?._id;

  const getDisplayName = (userObj: string | { _id: string; fullName?: string }) =>
    typeof userObj === 'string' ? userObj : userObj?.fullName || userObj?._id;

  const fetchTasks = async () => {
    if (!user) return;

    const query: any = {};
    if (search) query.search = search;
    if (filterStatus) query.status = filterStatus;
    if (filterPriority) query.priority = filterPriority;
    if (filterDueDate) query.dueDate = filterDueDate;

    const allTasks = await taskService.list(query);
    const filtered = showAll
      ? allTasks
      : allTasks.filter((t: Task) => {
        const assignedToId = normalizeId(t.assignedTo);
        const createdById = normalizeId(t.createdBy);
        return assignedToId === user._id || createdById === user._id;
      });

    setTasks(filtered);
  };

  useEffect(() => {
    fetchTasks();
  }, [user, showAll, search, filterStatus, filterPriority, filterDueDate]);

  const handleClose = () => {
    router.push('/tasks', undefined, { shallow: true });
  };

  const handleShowAllToggle = () => {
    setShowAll(prev => !prev);
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDelete = async (task: Task) => {
    const confirmDelete = confirm(`Are you sure you want to delete "${task.title}"?`);
    if (!confirmDelete) return;

    try {
      await taskService.remove(task._id);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await taskService.update(updatedTask._id, updatedTask);
      fetchTasks();
      setShowEditModal(false);
    } catch (err) {
      alert('Failed to update task. Please try again.');
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
    handleClose();
  };

  const [showFilter, setShowFilter] = useState(true);

  return (
    <Layout>
      <div id="task-page">
        <div className="d-block justify-content-start align-items-center mb-3">
          <h1 className='mb-3'>📝 Tasks</h1>
          <div className="d-flex justify-content-end align-items-center gap-2">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button variant="outline-primary" onClick={handleShowAllToggle}>
                {showAll ? 'Show My Tasks' : 'Show All Tasks'}
              </Button>
            )}
            <Button variant="primary" onClick={() => router.push('/tasks?create=true', undefined, { shallow: true })}>
              + New Task
            </Button>
            <Button variant="secondary" onClick={() => setShowFilter(!showFilter)}>
              Show Filters
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilter &&
          <Container fluid className="mb-3">
            <Form className="d-flex gap-2 flex-wrap">
              {/* Search Bar */}
              <Form.Control
                type="text"
                placeholder="🔍 Search title or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-control"
              />

              {/* Status Filter */}
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-control"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>

              {/* Priority Filter */}
              <Form.Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-control"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>

              {/* Due Date Filter */}
              <Form.Control
                type="date"
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value)}
                className="filter-control"
              />

              {/* Reset Button */}
              <Button variant="secondary" onClick={() => {
                setSearch('');
                setFilterStatus('');
                setFilterPriority('');
                setFilterDueDate('');
              }} className="filter-control">
                Reset
              </Button>
            </Form>
          </Container>
        }

        {/* Task Table */}
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due</th>
              <th>Assigned To</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...tasks]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort latest first
              .map((t: Task, index) => (
                <tr key={t._id}>
                  <td>{index + 1}</td>
                  <td>{t.title.length>50 ? t.title.substring(0, 20)+"..." : t.title}</td>
                  <td>{t.status==="Completed"? (`Completed on `+new Date(t.completionDate).toLocaleDateString()):(t.status)}</td>
                  <td>{t.priority}</td>
                  <td>{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td>{getDisplayName(t.assignedTo)}</td>
                  <td>{getDisplayName(t.createdBy)}</td>
                  <td className="text-center">
                    <Dropdown as={ButtonGroup} drop="end">
                      <Dropdown.Toggle
                        split
                        variant="link"
                        id={`dropdown-${t._id}`}
                        className="text-dark p-0 border-0"
                        style={{ fontSize: '1.2rem' }}
                      >
                        <ThreeDotsVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleView(t)}>👁 View</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleEdit(t)}>✏️ Edit</Dropdown.Item>
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                          <Dropdown.Item onClick={() => handleDelete(t)}>🗑 Delete</Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}

          </tbody>
        </Table>

        {/* Modals */}
        <ViewTaskModal
          task={selectedTask}
          show={showViewModal}
          onClose={() => setShowViewModal(false)}
        />

        <EditTaskModal
          task={selectedTask}
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateTask}
        />

        <Modal show={showCreate} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <NewTaskForm onSuccess={handleTaskCreated} />
          </Modal.Body>
        </Modal>
      </div>
    </Layout>
  );
}
