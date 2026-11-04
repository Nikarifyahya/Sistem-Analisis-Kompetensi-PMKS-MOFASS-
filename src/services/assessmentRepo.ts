import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, CompanyProfile, AssessmentResult } from '../types';
import { ensureCompleteAssessment } from '../utils/mlEngine';

const LOCAL_STORAGE_KEY_USER = 'mofass_user_profile';
const LOCAL_STORAGE_KEY_COMPANY = 'mofass_company_profile';
const LOCAL_STORAGE_KEY_ASSESSMENTS = 'mofass_saved_assessments';
const LOCAL_STORAGE_KEY_DRAFT = 'mofass_active_draft_answers';

export async function saveUserProfile(user: UserProfile): Promise<void> {
  // Always cache locally
  localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));

  if (user.isDemo) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      userId: user.uid,
      fullName: user.fullName || 'Usahawan PMKS',
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'Pengasas / Pemilik Perniagaan',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
  const localParsed = local ? JSON.parse(local) : null;
  if (localParsed && localParsed.uid === uid) {
    return localParsed;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
  return null;
}

export async function saveCompanyProfile(userId: string, company: CompanyProfile): Promise<void> {
  localStorage.setItem(LOCAL_STORAGE_KEY_COMPANY, JSON.stringify(company));

  try {
    const compRef = doc(db, 'companies', userId);
    await setDoc(compRef, {
      userId,
      ...company,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `companies/${userId}`);
  }
}

export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY_COMPANY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }

  try {
    const compRef = doc(db, 'companies', userId);
    const snap = await getDoc(compRef);
    if (snap.exists()) {
      return snap.data() as CompanyProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `companies/${userId}`);
  }
  return null;
}

export async function saveAssessmentRecord(rawAssessment: AssessmentResult): Promise<void> {
  const assessment = ensureCompleteAssessment(rawAssessment);
  // Save to local storage list
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_ASSESSMENTS);
    const existingList: AssessmentResult[] = existingStr ? JSON.parse(existingStr) : [];
    const filtered = existingList.filter((a) => a.id !== assessment.id);
    filtered.unshift(assessment);
    localStorage.setItem(LOCAL_STORAGE_KEY_ASSESSMENTS, JSON.stringify(filtered.slice(0, 20)));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // Clear draft
  localStorage.removeItem(LOCAL_STORAGE_KEY_DRAFT);

  // Save to Firestore
  try {
    const docRef = doc(db, 'assessments', assessment.id);
    await setDoc(docRef, {
      ...assessment,
      userId: assessment.userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `assessments/${assessment.id}`);
  }
}

export async function getUserAssessments(userId: string): Promise<AssessmentResult[]> {
  // Read local storage first
  const localStr = localStorage.getItem(LOCAL_STORAGE_KEY_ASSESSMENTS);
  const localList: AssessmentResult[] = localStr ? JSON.parse(localStr) : [];

  try {
    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const items: AssessmentResult[] = [];
      snapshot.forEach((d) => items.push(ensureCompleteAssessment(d.data() as AssessmentResult)));
      return items;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'assessments');
  }

  return localList
    .filter((a) => a.userId === userId || a.userId === 'demo-pmks-user-001')
    .map(ensureCompleteAssessment);
}

export function saveDraftAnswers(answers: Record<string, number>): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(answers));
}

export function getDraftAnswers(): Record<string, number> | null {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}
