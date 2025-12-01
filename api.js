// api.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signOut, EmailAuthProvider, reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getDatabase, ref, query, orderByChild, equalTo, onValue, get, remove, set, update, push, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// Konfigurasi Firebase (Dari kode asli Anda)
const firebaseConfig = {
    apiKey: "AIzaSyD_-DI0MQIug3J8vciKcaFZ-knyYZC67K8",
    authDomain: "sosmed-7d6ee.firebaseapp.com",
    databaseURL: "https://sosmed-7d6ee-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sosmed-7d6ee",
    storageBucket: "sosmed-7d6ee.firebasestorage.app",
    messagingSenderId: "807759832196",
    appId: "1:807759832196:web:a96ddf6d45ae0a0e918ed1",
    measurementId: "G-1Y8EPWY825"
};

// Inisialisasi
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- AUTHENTICATION API ---

export const observeAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export const logoutUser = () => {
    return signOut(auth);
};

export const getCurrentUser = () => {
    return auth.currentUser;
};

export const reauthenticateUser = async (password) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    const credential = EmailAuthProvider.credential(user.email, password);
    return await reauthenticateWithCredential(user, credential);
};

// --- USER DATA API ---

export const getUserProfile = async (userId) => {
    const userRef = ref(db, 'users/' + userId);
    return await get(userRef);
};

// --- TICKETS / MARKETPLACE API ---

// Subscribe Realtime (Listener)
export const subscribeToTickets = (callback) => {
    const ticketsRef = ref(db, 'tickets');
    return onValue(ticketsRef, callback);
};

export const toggleTicketLike = async (ticketData, userId) => {
    const { id: ticketId, userId: ticketOwnerId, likes, dislikes } = ticketData;
    const hasLiked = likes && likes[userId];
    const likePath = `tickets/${ticketOwnerId}/${ticketId}/likes/${userId}`;
    const dislikePath = `tickets/${ticketOwnerId}/${ticketId}/dislikes/${userId}`;

    if (hasLiked) {
        await remove(ref(db, likePath));
        // Note: Object manipulation handled in frontend callback usually, 
        // but API ensures DB is updated.
    } else {
        await set(ref(db, likePath), true);
        if (dislikes && dislikes[userId]) {
            await remove(ref(db, dislikePath));
        }
    }
};

export const toggleTicketDislike = async (ticketData, userId) => {
    const { id: ticketId, userId: ticketOwnerId, likes, dislikes } = ticketData;
    const hasDisliked = dislikes && dislikes[userId];
    const likePath = `tickets/${ticketOwnerId}/${ticketId}/likes/${userId}`;
    const dislikePath = `tickets/${ticketOwnerId}/${ticketId}/dislikes/${userId}`;

    if (hasDisliked) {
        await remove(ref(db, dislikePath));
    } else {
        await set(ref(db, dislikePath), true);
        if (likes && likes[userId]) {
            await remove(ref(db, likePath));
        }
    }
};

export const incrementTicketView = async (ticketData) => {
    const viewPath = `tickets/${ticketData.userId}/${ticketData.id}/viewCount`;
    const currentViews = ticketData.viewCount || 0;
    await set(ref(db, viewPath), currentViews + 1);
};

// --- COMMENTS API ---

export const subscribeToComments = (ticketId, ticketOwnerId, callback) => {
    const commentsRef = ref(db, `tickets/${ticketOwnerId}/${ticketId}/comments`);
    return onValue(commentsRef, callback);
};

export const postComment = async (ticketId, ticketOwnerId, userId, userName, text) => {
    const commentsRef = ref(db, `tickets/${ticketOwnerId}/${ticketId}/comments`);
    const newCommentRef = push(commentsRef);
    const newComment = {
        userId,
        userName,
        text,
        timestamp: serverTimestamp() // Gunakan server timestamp agar akurat
    };
    return await set(newCommentRef, newComment);
};

// --- BOOKING / RIWAYAT API ---

export const subscribeToMyBookings = (userId, callback) => {
    const bookingsRef = ref(db, 'Pemesanan');
    const myBookingsQuery = query(bookingsRef, orderByChild('userId'), equalTo(userId));
    return onValue(myBookingsQuery, callback);
};

export const deleteBooking = async (bookingId) => {
    const bookingRef = ref(db, `Pemesanan/${bookingId}`);
    return await remove(bookingRef);
};

// --- ADS (IKLAN) API ---

export const subscribeToAds = (callback) => {
    const adsRef = ref(db, 'ads');
    return onValue(adsRef, callback);
};

export const subscribeToMyAds = (userId, callback) => {
    const adsRef = ref(db, 'ads');
    const myAdsQuery = query(adsRef, orderByChild('userId'), equalTo(userId));
    return onValue(myAdsQuery, callback);
};

export const createAd = async (adData) => {
    const adsRef = ref(db, 'ads');
    const newAdRef = push(adsRef);
    return await set(newAdRef, adData);
};

export const updateAd = async (adId, updateData) => {
    const adRef = ref(db, `ads/${adId}`);
    return await update(adRef, updateData);
};

export const deleteAd = async (adId) => {
    const adRef = ref(db, `ads/${adId}`);
    return await remove(adRef);
};

export const getAdById = async (adId) => {
    const adRef = ref(db, `ads/${adId}`);
    return await get(adRef);
};
