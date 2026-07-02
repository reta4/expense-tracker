import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const resolveContactId = (userData = {}) => {
  const contactId = userData.salesforceContactId
    || userData.User_Contact__c
    || userData.contactId;

  return contactId?.toString().trim() || '';
};

export const buildAppUser = (firebaseUser, userData) => {
  const contactId = resolveContactId(userData);

  if (!contactId) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    firstName: userData.firstName || 'User',
    lastName: userData.lastName || '',
    User_Contact__c: contactId,
  };
};

export const fetchValidatedUserProfile = async (firebaseUser) => {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (!userDoc.exists()) {
    return { valid: false, reason: 'missing_profile' };
  }

  const userData = userDoc.data();
  const contactId = resolveContactId(userData);

  if (!contactId) {
    return { valid: false, reason: 'missing_contact' };
  }

  const user = buildAppUser(firebaseUser, userData);

  return {
    valid: true,
    contactId,
    user,
    userData,
  };
};

export const getLoginValidationError = (reason) => {
  if (reason === 'missing_profile') {
    return 'Account not found. Please register first.';
  }

  if (reason === 'missing_contact') {
    return 'Your account setup is incomplete. Please register again or contact support.';
  }

  return 'Unable to sign in. Please try again.';
};
