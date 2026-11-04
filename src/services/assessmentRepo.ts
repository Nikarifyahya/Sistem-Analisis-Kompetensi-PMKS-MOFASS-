import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, CompanyProfile, AssessmentResult } from '../types';
import { ensureCompleteAssessment } from '../utils/mlEngine';
import { MOFASS_CATEGORIES } from '../data/mofassQuestions';

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

  // 1. Save to local storage list
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_ASSESSMENTS);
    const existingList: AssessmentResult[] = existingStr ? JSON.parse(existingStr) : [];
    const filtered = existingList.filter((a) => a.id !== assessment.id);
    filtered.unshift(assessment);
    localStorage.setItem(LOCAL_STORAGE_KEY_ASSESSMENTS, JSON.stringify(filtered.slice(0, 100)));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Clear active draft
  localStorage.removeItem(LOCAL_STORAGE_KEY_DRAFT);

  // 3. Dispatch in-browser event so open Admin views receive the update instantly
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mofass_assessment_submitted', { detail: assessment }));
  }

  // 4. Save to Firestore (Real-time backend)
  try {
    const docRef = doc(db, 'assessments', assessment.id);
    await setDoc(docRef, {
      ...assessment,
      userId: assessment.userId,
      userEmail: assessment.userEmail || assessment.userProfile?.email || '',
      updatedAt: new Date().toISOString()
    });
    console.log('Berjaya simpan penilaian ke Firestore:', assessment.id);
  } catch (error) {
    console.error('Ralat simpan ke Firestore:', error);
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

export async function getAllAssessmentsAdmin(): Promise<AssessmentResult[]> {
  const combinedMap = new Map<string, AssessmentResult>();

  // 1. Try reading from Firestore
  try {
    const colRef = collection(db, 'assessments');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      snap.forEach((docSnap) => {
        const data = docSnap.data() as AssessmentResult;
        if (data && data.id) {
          combinedMap.set(data.id, ensureCompleteAssessment(data));
        }
      });
    }
  } catch (err) {
    console.warn('Firestore admin fetch failed or restricted, reading local cache:', err);
  }

  // 2. Read from LocalStorage cache
  try {
    const localStr = localStorage.getItem(LOCAL_STORAGE_KEY_ASSESSMENTS);
    if (localStr) {
      const localList: AssessmentResult[] = JSON.parse(localStr);
      localList.forEach((a) => {
        if (!combinedMap.has(a.id)) {
          combinedMap.set(a.id, ensureCompleteAssessment(a));
        }
      });
    }
  } catch (e) {
    console.warn('LocalStorage admin fetch error:', e);
  }

  // If map has items, sort them by createdAt descending
  if (combinedMap.size > 0) {
    const resultList = Array.from(combinedMap.values());
    resultList.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    return resultList;
  }

  // If no assessments exist at all, populate with realistic baseline PMKS assessments
  try {
    const { getInitialSeedAssessments } = await import('../data/seedAssessments');
    const seeds = getInitialSeedAssessments();
    localStorage.setItem(LOCAL_STORAGE_KEY_ASSESSMENTS, JSON.stringify(seeds));
    return seeds;
  } catch (err) {
    console.warn('Failed to load seed assessments:', err);
    return [];
  }
}

export async function deleteAssessmentRecordAdmin(assessmentId: string): Promise<boolean> {
  let success = false;

  // 1. Delete from Firestore
  try {
    const docRef = doc(db, 'assessments', assessmentId);
    await deleteDoc(docRef);
    success = true;
  } catch (error) {
    console.warn('Firestore delete failed:', error);
  }

  // 2. Delete from LocalStorage
  try {
    const localStr = localStorage.getItem(LOCAL_STORAGE_KEY_ASSESSMENTS);
    if (localStr) {
      const localList: AssessmentResult[] = JSON.parse(localStr);
      const filtered = localList.filter((a) => a.id !== assessmentId);
      localStorage.setItem(LOCAL_STORAGE_KEY_ASSESSMENTS, JSON.stringify(filtered));
      success = true;
    }
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }

  return success;
}

export function subscribeAllAssessmentsAdmin(
  onUpdate: (assessments: AssessmentResult[]) => void
): () => void {
  // Helper to merge Firestore snapshots and LocalStorage cleanly
  const mergeAndSort = (firestoreItems: AssessmentResult[]) => {
    const combinedMap = new Map<string, AssessmentResult>();

    firestoreItems.forEach((a) => {
      if (a && a.id) {
        combinedMap.set(a.id, ensureCompleteAssessment(a));
      }
    });

    try {
      const localStr = localStorage.getItem(LOCAL_STORAGE_KEY_ASSESSMENTS);
      if (localStr) {
        const localList: AssessmentResult[] = JSON.parse(localStr);
        localList.forEach((a) => {
          if (!combinedMap.has(a.id)) {
            combinedMap.set(a.id, ensureCompleteAssessment(a));
          }
        });
      }
    } catch (e) {
      console.warn('Local merge warning:', e);
    }

    const sorted = Array.from(combinedMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return sorted;
  };

  // 1. Initial immediate push from local + cached database
  getAllAssessmentsAdmin().then((initialList) => {
    if (initialList && initialList.length > 0) {
      onUpdate(initialList);
    }
  });

  // 2. Real-time Firestore onSnapshot listener
  let unsubscribeFirestore = () => {};
  try {
    const colRef = collection(db, 'assessments');
    unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        const items: AssessmentResult[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as AssessmentResult;
          if (item && item.id) {
            items.push(ensureCompleteAssessment(item));
          }
        });
        const combined = mergeAndSort(items);
        if (combined.length > 0) {
          onUpdate(combined);
        }
      },
      (error) => {
        console.warn('Realtime onSnapshot listener error (falling back to local):', error);
      }
    );
  } catch (err) {
    console.warn('Could not establish onSnapshot:', err);
  }

  // 3. In-browser instant event listener (handles when user finishes assessment in same browser/tab)
  const handleImmediateEvent = (e: any) => {
    getAllAssessmentsAdmin().then((list) => {
      if (list && list.length > 0) {
        onUpdate(list);
      }
    });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('mofass_assessment_submitted', handleImmediateEvent);
    window.addEventListener('storage', handleImmediateEvent);
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('mofass_assessment_submitted', handleImmediateEvent);
      window.removeEventListener('storage', handleImmediateEvent);
    }
  };
}
