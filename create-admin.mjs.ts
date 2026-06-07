import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  const email = "ass.karenm@gmail.com";
  const password = "admin123456"; // Firebase requires 6 chars minimum! 'admin123' is 8 chars, so it's fine.
  
  try {
    // Try to create the user
    console.log("Tentando criar usuário...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Usuário criado com sucesso:", userCredential.user.uid);
  } catch (error: any) {
    console.log("Erro ao criar (talvez já exista):", error.code);
    if (error.code === 'auth/email-already-in-use') {
       console.log("O usuário já existe! Tentando logar para testar...");
       try {
         await signInWithEmailAndPassword(auth, email, password);
         console.log("Logado com sucesso com a senha admin123456");
       } catch (e: any) {
         console.log("Falha ao logar. A senha não é admin123456.", e.code);
       }
    } else {
       console.log("Outro erro:", error);
    }
  }
}

run();
