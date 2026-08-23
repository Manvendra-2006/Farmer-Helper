import React, { createContext, useContext } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
export const FireBaseContext = createContext()
const firebaseConfig = {
  apiKey: "AIzaSyD72hN5YWmDSJdLebNldlbLInD5j5nyJrw",
  authDomain: "mini-project-7ecfd.firebaseapp.com",
  databaseURL: "https://mini-project-7ecfd-default-rtdb.firebaseio.com",
  projectId: "mini-project-7ecfd",
  storageBucket: "mini-project-7ecfd.firebasestorage.app",
  messagingSenderId: "172423282435",
  appId: "1:172423282435:web:6846ac41354665c7bdb336",
  measurementId: "G-3TK28C53LC"
};
const firebaseapp = initializeApp(firebaseConfig)
const firebaseAuth = getAuth(firebaseapp)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})
export const FireBaseProvider = ({children}) => {
    const googleSignup = ()=>{
        return signInWithPopup(firebaseAuth,googleProvider)
    }
  const googleLogout = ()=> signOut(firebaseAuth)
  return (
  <FireBaseContext.Provider value={{googleSignup, googleLogout}}>
        {children}
    </FireBaseContext.Provider>
  )
}

export default FireBaseProvider