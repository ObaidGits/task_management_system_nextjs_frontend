import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';
import styles from './WelcomeModal.module.css';

const WelcomeModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isModalShown = sessionStorage.getItem('modalShown');
    if (!isModalShown) {
      setShowModal(true);
      sessionStorage.setItem('modalShown', 'true');
    }
  }, []);

  const closeModal = () => setShowModal(false);

  return (
    <Modal
      show={showModal}
      onHide={closeModal}
      backdrop="static"
      keyboard={false}
      centered
      dialogClassName={styles.fullScreenModal}
      contentClassName={styles.modalContent}
    >
      <Modal.Header className={styles.modalHeader} closeButton closeVariant="white">
        <Modal.Title className={styles.title}>
          <InfoCircle className="me-2" size={28} /> Welcome to <span className={styles.brand}>TaskMaster</span>!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {/* What Makes Us Unique */}
        <h5 className={styles.sectionTitle}>✨ What Makes Us Unique?</h5>
        <p className={styles.highlight}>
          Unlike other task apps, <strong>TaskMaster</strong> sets itself apart with a focus on **real-time collaboration**, **smart prioritization**, and a **lightweight design**. Here’s why you’ll love using it:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Instant task updates and notifications for better teamwork.</li>
          <li className={styles.listItem}>Seamless user experience with fast and intuitive design.</li>
          <li className={styles.listItem}>Customizable task categories and priorities to keep things organized.</li>
          <li className={styles.listItem}>Real-time collaboration for a team-oriented workflow.</li>
        </ul>

        {/* Key Features */}
        <h5 className={styles.sectionTitle}>🧩 Key Features:</h5>
        <ul className={styles.list}>
          <li className={styles.listItem}>Create, update, and delete tasks with ease.</li>
          <li className={styles.listItem}>Assign tasks to users, with notifications when tasks are assigned or updated.</li>
          <li className={styles.listItem}>Track task status, due dates, and overdue alerts.</li>
          <li className={styles.listItem}>User roles and permissions (Admin, Manager, Regular User).</li>
          <li className={styles.listItem}>Responsive dashboard designed for efficient task management.</li>
          <li className={styles.listItem}>Advanced filtering and searching by title, description, status, priority, and due date.</li>
        </ul>

        {/* Technologies Used */}
        <h5 className={styles.sectionTitle}>🚀 Technologies Used:</h5>
        <ul className={styles.list}>
          <li className={styles.listItem}>React & Next.js for a fast, modern front-end framework.</li>
          <li className={styles.listItem}>TypeScript for type safety and better development experience.</li>
          <li className={styles.listItem}>Node.js and Express for a scalable backend solution.</li>
          <li className={styles.listItem}>MongoDB for flexible, schema-less database management.</li>
          <li className={styles.listItem}>Socket.IO for real-time notifications and updates.</li>
          <li className={styles.listItem}>Bootstrap & React-Bootstrap for responsive UI components.</li>
        </ul>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button className={styles.getStartedBtn} onClick={closeModal}>
          🚀 Get Started
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;
