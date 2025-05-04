import React, { useEffect, useState } from 'react'; 
import Layout from '../components/Layout';
import useAuthRedirect from '../hooks/useAuthRedirect';
import { logService } from '../services';
import { Table, Alert, Spinner, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Logs() {
  const { user } = useAuth();

  // ✅ Allow all roles (access controlled server-side)
  useAuthRedirect(['admin', 'manager', 'user']);

  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return; // Wait until user is loaded

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const fetchedLogs = await logService.list(user);
        setLogs(fetchedLogs);
        setError(''); // Clear any previous errors
      } catch (err) {
        setError('Failed to load logs');
        setLogs([]); // Clear previous logs if any
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  return (
    <Layout>
      <div id="logs-page">
        <h1 className="logs-header fw-bold fade-in-title">📜 Logs</h1>        
        {error && <Alert variant="danger" className="logs-alert">{error}</Alert>}
        
        {/* Loading Spinner */}
        {loading && (
          <div className="d-flex justify-content-center logs-loading">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {/* Logs Table or Empty State */}
        {logs.length === 0 && !loading ? (
          <p className="logs-empty-state">No logs available. Please try again later.</p>
        ) : (
          <Table striped bordered responsive className="logs-table">
            <thead className="logs-table-header">
              <tr>
                <th>Assigned By</th>
                <th>Assigned To</th>
                <th>Action</th>
                <th>Task</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="logs-table-row">
                  <td>{log.task_assigned_by?.fullName || 'N/A'}</td>
                  <td>{log.task_assigned_to?.fullName || 'N/A'}</td>
                  <td>{log.action}</td>
                  <td>{log.task_id?.title || 'N/A'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Retry Button */}
        {error && !loading && (
          <div className="d-flex justify-content-center">
            <Button variant="primary" onClick={() => setLogs([])} className="logs-retry-btn">
              Retry
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
