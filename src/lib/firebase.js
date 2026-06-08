import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// These values are public client identifiers, not secrets. Access is controlled
// by Firestore security rules (see firestore.rules), not by hiding this config.
const firebaseConfig = {
	apiKey: 'AIzaSyDFS84XeEJSD9O_CrtX4zvmQfWe-AOkPxw',
	authDomain: 'cours-form-submit.firebaseapp.com',
	projectId: 'cours-form-submit',
	storageBucket: 'cours-form-submit.firebasestorage.app',
	messagingSenderId: '300377981695',
	appId: '1:300377981695:web:791fe419f296978366c2ca'
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
