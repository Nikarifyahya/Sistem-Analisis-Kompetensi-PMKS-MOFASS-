import { AssessmentResult } from '../types';
import { calculateAssessmentScores, ensureCompleteAssessment } from '../utils/mlEngine';

export function getInitialSeedAssessments(): AssessmentResult[] {
  // Sample 1: Rasa Warisan Delights Sdn Bhd (F&B, Tahap 2)
  const answers1: Record<string, number> = {
    M1: 4, M2: 3, M3: 3, M4: 3, M5: 2, M6: 3, M7: 2, M8: 3, M9: 3, M10: 2, // M: 28/50 (56%)
    O1: 3, O2: 4, O3: 3, O4: 3, O5: 2, O6: 3, O7: 3, O8: 2, O9: 3, O10: 2, // O: 28/50 (56%)
    F1: 2, F2: 2, F3: 3, F4: 2, F5: 2, F6: 3, F7: 2, F8: 2, F9: 2, F10: 1, // F: 21/50 (42%)
    A1: 4, A2: 3, A3: 4, A4: 3, A5: 2, A6: 3, A7: 3, A8: 2, A9: 3, A10: 2, // A: 29/50 (58%)
    S_SALES1: 4, S_SALES2: 3, S_SALES3: 3, S_SALES4: 3, S_SALES5: 2, S_SALES6: 3, S_SALES7: 3, S_SALES8: 2, S_SALES9: 3, S_SALES10: 3, // S1: 29/50 (58%)
    S_SYSTEM1: 2, S_SYSTEM2: 2, S_SYSTEM3: 2, S_SYSTEM4: 3, S_SYSTEM5: 2, S_SYSTEM6: 2, S_SYSTEM7: 2, S_SYSTEM8: 2, S_SYSTEM9: 2, S_SYSTEM10: 2 // S2: 21/50 (42%)
  };
  const comp1 = {
    companyName: 'Rasa Warisan Delights Sdn Bhd',
    ssmNumber: '202101034521 (1434521-T)',
    sector: 'Makanan & Minuman (F&B)' as const,
    businessSize: 'Kecil (RM300k - RM15m / 5 - 75 Pekerja)' as const,
    yearsInOperation: 4,
    annualTurnover: 'RM 1,250,000',
    employeeCount: 14,
    state: 'Selangor',
    district: 'Shah Alam',
    website: 'https://rasawarisan.my',
    briefDescription: 'Pengeluar pes masakan tradisional Melayu dan restoran francais berskala sederhana.'
  };
  const user1 = {
    uid: 'pmks-user-001',
    fullName: 'Pn. Siti Rahmah binti Osman',
    email: 'siti.rahmah@rasawarisan.my',
    phone: '012-3456789',
    role: 'Pengarah Urusan'
  };

  const a1 = ensureCompleteAssessment(calculateAssessmentScores(answers1, comp1, user1));
  a1.id = 'MOFASS-2026-FNB01';
  a1.createdAt = '2026-11-03T10:15:00.000Z';

  // Sample 2: Nexus Automation & Engineering (Teknologi & Kejuruteraan, Tahap 3)
  const answers2: Record<string, number> = {
    M1: 4, M2: 4, M3: 3, M4: 4, M5: 3, M6: 4, M7: 3, M8: 4, M9: 3, M10: 3, // M: 35/50 (70%)
    O1: 4, O2: 4, O3: 4, O4: 4, O5: 4, O6: 3, O7: 4, O8: 3, O9: 4, O10: 3, // O: 37/50 (74%)
    F1: 4, F2: 3, F3: 4, F4: 3, F5: 3, F6: 4, F7: 3, F8: 3, F9: 4, F10: 3, // F: 34/50 (68%)
    A1: 4, A2: 4, A3: 4, A4: 3, A5: 4, A6: 4, A7: 3, A8: 3, A9: 4, A10: 3, // A: 36/50 (72%)
    S_SALES1: 4, S_SALES2: 4, S_SALES3: 4, S_SALES4: 3, S_SALES5: 4, S_SALES6: 3, S_SALES7: 4, S_SALES8: 3, S_SALES9: 4, S_SALES10: 3, // S1: 36/50 (72%)
    S_SYSTEM1: 4, S_SYSTEM2: 4, S_SYSTEM3: 5, S_SYSTEM4: 4, S_SYSTEM5: 4, S_SYSTEM6: 4, S_SYSTEM7: 3, S_SYSTEM8: 4, S_SYSTEM9: 4, S_SYSTEM10: 4 // S2: 40/50 (80%)
  };
  const comp2 = {
    companyName: 'Nexus Automation Solutions Sdn Bhd',
    ssmNumber: '201901089201 (1349201-P)',
    sector: 'Teknologi & Digital' as const,
    businessSize: 'Kecil (RM300k - RM15m / 5 - 75 Pekerja)' as const,
    yearsInOperation: 6,
    annualTurnover: 'RM 3,800,000',
    employeeCount: 22,
    state: 'Pulau Pinang',
    district: 'Bayan Lepas',
    website: 'https://nexusautomation.com.my',
    briefDescription: 'Penyedia solusi IoT kilang dan integrasi automasi industri 4.0.'
  };
  const user2 = {
    uid: 'pmks-user-002',
    fullName: 'Ir. Ahmad Faisal bin Ramli',
    email: 'faisal@nexusautomation.com.my',
    phone: '019-8765432',
    role: 'Ketua Pegawai Eksekutif'
  };

  const a2 = ensureCompleteAssessment(calculateAssessmentScores(answers2, comp2, user2));
  a2.id = 'MOFASS-2026-TECH02';
  a2.createdAt = '2026-11-02T14:40:00.000Z';

  // Sample 3: Anggun Tekstil & Busana Sdn Bhd (Peruncitan & Pemborongan, Tahap 1)
  const answers3: Record<string, number> = {
    M1: 3, M2: 2, M3: 2, M4: 2, M5: 2, M6: 2, M7: 2, M8: 1, M9: 2, M10: 2, // M: 20/50 (40%)
    O1: 2, O2: 3, O3: 2, O4: 2, O5: 2, O6: 2, O7: 2, O8: 2, O9: 2, O10: 2, // O: 21/50 (42%)
    F1: 2, F2: 1, F3: 2, F4: 1, F5: 1, F6: 2, F7: 1, F8: 2, F9: 1, F10: 1, // F: 14/50 (28%)
    A1: 3, A2: 2, A3: 3, A4: 2, A5: 2, A6: 2, A7: 2, A8: 2, A9: 2, A10: 2, // A: 22/50 (44%)
    S_SALES1: 3, S_SALES2: 3, S_SALES3: 2, S_SALES4: 2, S_SALES5: 2, S_SALES6: 2, S_SALES7: 2, S_SALES8: 2, S_SALES9: 2, S_SALES10: 2, // S1: 22/50 (44%)
    S_SYSTEM1: 1, S_SYSTEM2: 1, S_SYSTEM3: 1, S_SYSTEM4: 2, S_SYSTEM5: 1, S_SYSTEM6: 1, S_SYSTEM7: 1, S_SYSTEM8: 1, S_SYSTEM9: 1, S_SYSTEM10: 1 // S2: 11/50 (22%)
  };
  const comp3 = {
    companyName: 'Anggun Tekstil & Busana Sdn Bhd',
    ssmNumber: '202201019876 (1459876-V)',
    sector: 'Peruncitan & Pemborongan' as const,
    businessSize: 'Mikro (< RM300k / < 5 Pekerja)' as const,
    yearsInOperation: 2,
    annualTurnover: 'RM 280,000',
    employeeCount: 4,
    state: 'Kelantan',
    district: 'Kota Bharu',
    website: 'https://anggunbusana.com',
    briefDescription: 'Butik pakaian muslimah dan pembekal kain pasang tempatan.'
  };
  const user3 = {
    uid: 'pmks-user-003',
    fullName: 'Cik Nurul Huda binti Salleh',
    email: 'huda@anggunbusana.com',
    phone: '013-9988771',
    role: 'Pengasas'
  };

  const a3 = ensureCompleteAssessment(calculateAssessmentScores(answers3, comp3, user3));
  a3.id = 'MOFASS-2026-RET03';
  a3.createdAt = '2026-11-01T09:20:00.000Z';

  return [a1, a2, a3];
}
