'use client';

import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function ResultPage() {
  const router = useRouter();
  const loanRate = typeof window !== 'undefined' ? localStorage.getItem('loan_rate') : null;

  const handleRecalculate = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1>Predicted Loan Rate</h1>
      <p><strong>{loanRate}</strong></p>
      <button className={styles.button} onClick={handleRecalculate}>Recalculate</button>
    </div>
  );
}
