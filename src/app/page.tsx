'use client';

import React, { useState } from 'react';
import DiskUsageChart from '@/components/Dashboard/DiskUsageChart';
import ScanButton from '@/components/Dashboard/ScanButton';
import ScanResults from '@/components/Dashboard/ScanResults';
import styles from './page.module.css';

export default function Home() {
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaned, setIsCleaned] = useState(false);

  // Mock data
  const totalDisk = 512;
  const usedDisk = 340;

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scan delay
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 2500);
  };

  const handleClean = () => {
    setIsCleaned(true);
    setHasScanned(false);
    // Reset after a delay
    setTimeout(() => setIsCleaned(false), 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Smart Scan</h1>
        <p className={styles.subtitle}>Check your Mac for junk and potential threats.</p>
      </header>

      <div className={styles.content}>
        {isCleaned ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2>System Cleaned!</h2>
            <p>You reclaimed 1.2 GB of space.</p>
          </div>
        ) : !hasScanned ? (
          <>
            <div className={styles.chartContainer}>
              <DiskUsageChart used={usedDisk} total={totalDisk} />
            </div>
            <div className={styles.actionArea}>
              <ScanButton onClick={handleScan} scanning={isScanning} />
              {isScanning && <p className={styles.statusText}>Scanning system files...</p>}
            </div>
          </>
        ) : (
          <ScanResults
            junkSize="1.2 GB"
            itemCount={1452}
            onClean={handleClean}
          />
        )}
      </div>
    </div>
  );
}
