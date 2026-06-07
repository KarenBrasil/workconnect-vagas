import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserSession = {
  email: string;
  name: string;
};

const SESSION_KEY = '@techconnect/current-user';
const USER_PREFIX = '@techconnect/user:';

export function getNameFromEmail(email: string) {
  const localPart = email.trim().split('@')[0] || 'Admin';
  const firstPart = localPart.split(/[._-]/)[0] || localPart;

  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase();
}

export async function saveUserSession(user: UserSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(`${USER_PREFIX}${user.email.toLowerCase()}`, JSON.stringify(user));
}

export async function getSavedUserByEmail(email: string) {
  const saved = await AsyncStorage.getItem(`${USER_PREFIX}${email.toLowerCase()}`);
  return saved ? (JSON.parse(saved) as UserSession) : null;
}

export async function getCurrentUserSession() {
  const saved = await AsyncStorage.getItem(SESSION_KEY);
  return saved ? (JSON.parse(saved) as UserSession) : null;
}

export async function clearCurrentUserSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
