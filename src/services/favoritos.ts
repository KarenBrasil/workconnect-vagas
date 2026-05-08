import { db } from './firebaseConfig';
import { collection, addDoc, deleteDoc, getDocs, query, where, doc } from 'firebase/firestore';

export interface Favorito {
  id?: string;
  userId: string;
  vagaId: string;
  titulo: string;
  empresa: string;
  fonte: string;
  link?: string;
}

export const salvarFavorito = async (favorito: Favorito) => {
  await addDoc(collection(db, 'favoritos'), favorito);
};

export const removerFavorito = async (id: string) => {
  await deleteDoc(doc(db, 'favoritos', id));
};

export const buscarFavoritos = async (userId: string): Promise<Favorito[]> => {
  const q = query(collection(db, 'favoritos'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Favorito));
};
