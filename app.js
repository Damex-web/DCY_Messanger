
// ================= DOM ELEMENTS =================
const profileBtn = document.getElementById("profile-btn");
const profilePicBtn = document.getElementById("profile-pic-btn");
const myProfile = document.getElementById("my-profile");
const overlay = document.getElementById("overlay");
const emojis = document.querySelector(".emojis");
const toggleButton = emojis.querySelector(".toggle");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn")
const emojiButtons = emojis.querySelectorAll(".emoji-list .emoji");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

const profileName = document.getElementById("profile-name");
const profileStatus = document.getElementById("profile-status");
const profileEmail = document.getElementById("profile-email");
const profilePhone = document.getElementById("profile-phone");
const profileAbout = document.getElementById("profile-about");
const profilePics = document.getElementById("profile-pics");
const changePics = document.getElementById("change-pics");

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const phoneInput = document.getElementById("phone");
const aboutInput = document.getElementById("about");
const fileInput = document.getElementById("profile-pic");

let loginUserEmail = document.getElementById("login-user-email");
let loginPassword = document.getElementById("login-password");

const chatCell = document.getElementById("chat-cell");
const sideBar = document.getElementById("sidebar");
const chatPanel = document.getElementById("chat-panel");
const searchInput = document.getElementById("search-input");
const chatList = document.getElementById("user-list");
const chatHeader = document.getElementById("chat-header");
const inputField = document.getElementById("input-field");
const messagesDiv = document.getElementById("chat-messages");
const displayInfo = document.getElementById("display-info");
const personName = document.getElementById("person-name");
const userStatus = document.getElementById("user-status");
const personPic = document.getElementById("person-pic");
const backBtn = document.getElementById("back-btn");

const modal = document.getElementById("profile-modal");
const profilePicsView = document.getElementById("profile-pic-view");
const profileUserView = document.getElementById("profile-username-view");
const profileStatusView = document.getElementById("profile-status-view");
const profileEmailView = document.getElementById("profile-email-view");
const profilePhoneView = document.getElementById("profile-phone-view");
const profileAboutView = document.getElementById("profile-about-view");
const closeProfile = document.getElementById("close-profile")

const toast = document.getElementById("network-toast");
const retryBtn = document.getElementById("toast-retry-btn");
const cancelBtn = document.getElementById("toast-cancel-btn");
const countdownEl = document.getElementById("toast-countdown");

const welcomeOverlay = document.getElementById("welcomeOverlay");
const pressStart = document.getElementById("pressStart");
const blink = document.querySelector("#pressStart .blink");
const terminal = document.getElementById("welcomeTerminal");
const welcomePrompt = document.getElementById("welcomePrompt");
const identifyInput = document.getElementById("identifyInput");
const identifyBtn = document.getElementById("identifyBtn");
const bootFill = document.getElementById("bootFill");
const skipWelcome = document.getElementById("skipWelcome");
const replayWelcome = document.getElementById("replayWelcome");
const matrixCanvas = document.getElementById("matrixBg");
const ctx = matrixCanvas.getContext("2d");
const speechEnabled = 'speechSynthesis' in window;
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()_+=-[]{};:'\",.<>/?";
const fontSize = 14;

let speechVoice = null;



// ================= STATE =================
let loggedInUser = null;
let currentChatUser = null;

// ================= SIGNUP FUNCTION =================
window.saveProfile = async function() {
        let username = usernameInput.value.trim();
        let email = emailInput.value.trim();
        let password = passwordInput.value.trim();
        let confirmPassword = confirmPasswordInput.value.trim();
        let phone = phoneInput.value.trim();
        let about = aboutInput.value.trim();
        let file = fileInput.files[0];

        if (!username || !email || !password || !confirmPassword || !phone || !about) {
            showSaveStatus(`Please Fill All Field. ${field}`, "error");
            return;
        }

        if (password !== confirmPassword) { 
            showSaveStatus(`Password do not Match ${field}`, "error");
            return; 
        }
        
        // --- Check if email or username already exists in Firebase ---
    try {

        if (!navigator.onLine) {
            showNetworkToast();
            return;
        }

        let emailQuery = query(collection(db,"users"), where("email","==",email));
        let emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) { 
            showSaveStatus(`Email is Already Registed. ${field}`, "error");
            return; 
        }

        let usernameQuery = query(collection(db,"users"), where("username","==",username));
        let usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) { 
            showSaveStatus(`Username is Taken. ${field}`, "error");
            return; 
        }

        let newUser = { 
            username, 
            email, 
            password, 
            phone, 
            about, 
            profilePics:"", 
            isOnline: true, 
            lastSeen: new Date().toISOString(),
            lastMsg: "",
            lastMsgTime: ""
        };

        if(file) {
            let reader = new FileReader();
            reader.onload = async function(e) {
                newUser.profilePics = e.target.result;
                let docRef = await addDoc(collection(db,"users"), newUser);
                newUser.id = docRef.id;
                loggedInUser = newUser;
                showSaveStatus("Account Created Successfully ✅", "success");
                showChatCell();
            };
            reader.readAsDataURL(file);
        } else {
            let docRef = await addDoc(collection(db,"users"), newUser);
            newUser.id = docRef.id;
            loggedInUser = newUser;
            showSaveStatus(" ✅ Account Created Successfully ", "success");
            showChatCell();

            loggedInUser = { id: userRef.id, ...newUserData };
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

        }
    } catch (error) {
        console.error("❌ Signup error:", error);

        if (error.code === "auth/network-request-failed" || error.message.includes("Could not reach Cloud Firestore")) {
            showNetworkToast();
        } else {
            showSaveStatus(" ❌ Network Error.", "success");
        }
    }
};


 // ================= LOGIN FUNCTION =================
window.login = async function () {
    var emailOrUsername = loginUserEmail.value.trim();
    var password = loginPassword.value.trim();

    if (!emailOrUsername || !password) {
        alert("Please enter your email/username and password.");
        return;
    }

    try {
        var user = null;

        // 🔹 Try login by email
        var qEmail = query(collection(db, "users"), where("email", "==", emailOrUsername));
        var snapEmail = await getDocs(qEmail);

        if (!snapEmail.empty) {
            snapEmail.forEach(function (doc) {
                var data = doc.data();
                if (data.password === password) {
                    user = { id: doc.id, ...data };
                }
            });
        }

        // 🔹 If not found, try username
        if (!user) {
            var qUser = query(collection(db, "users"), where("username", "==", emailOrUsername));
            var snapUser = await getDocs(qUser);

            if (!snapUser.empty) {
                snapUser.forEach(function (doc) {
                    var data = doc.data();
                    if (data.password === password) {
                        user = { id: doc.id, ...data };
                    }
                });
            }
        } 

        if (!user) {
            alert("Invalid credentials. Please check your details.");
            return;
        }
        // --- ✅ Save user to session ---
        loggedInUser = user;
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));

        // --- ✅ Update user to online ---
        await updateDoc(doc(db, "users", user.id), {
            isOnline: true,
            lastSeen: new Date().toISOString()
        });



        // --- ✅ Proceed to chat ---
        showSaveStatus(" ✅ Login Successfully", "success");

        // ✅ Load chat screen
        showChatCell();

    } catch (error) {
        showSaveStatus(" ❌ Login Failed.", "error");
        showNetworkToast();
        if (
            error.code === "auth/network-request-failed" || error.message.includes("Could not reach Cloud Firestore" || "net::ERR_INTERNET_DISCONNECTED")) {
            showNetworkToast();
        } else {
            showSaveStatus(`Login Failed, Please chaeck Your Internet Connection. ${field}`, "error");
        }
    }
};

// ================= LOGOUT =================
window.logout = async function () {
    try {
        if (loggedInUser) {
            let userRef = doc(db, "users", loggedInUser.id);

            await updateDoc(userRef, {
                isOnline: false,
                lastSeen: new Date().toISOString()
            });

            loggedInUser = null;
        }

        sessionStorage.removeItem("loggedInUser");
        loggedInUser = null;
        showSaveStatus("👋 Logged Out Successfully", "success");
        showLogin();

        myProfile.classList.remove("active");
        overlay.classList.remove("active");
    } catch (error) {
        showSaveStatus(` ❌Login Error, Please try Again. ${field}`, "error");
    }
};


// ================= SHOW UI FUNCTIONS =================
window.showSignup = function() {
    loginForm.style.display = "none";
    chatCell.style.display = "none";
    signupForm.style.display = "flex";
};

window.showLogin = function() {
    signupForm.style.display = "none";
    chatCell.style.display = "none";
    loginForm.style.display = "flex";
};

window.showChatCell = function() { 
    loginForm.style.display="none"; 
    signupForm.style.display="none"; 
    chatCell.style.display="grid"; 
    loadUserList(); 
    loadProfile(loggedInUser); 
}

// ================= LOAD PROFILE =================
function loadProfile(passedUser) {
    if(!loggedInUser) return;

    let user = passedUser || loggedInUser;

    if (!user) {
        console.error("❌ No user provided to loadProfile()");
        return;
    }

     // 🔹 Update UI with user data
    profileName.textContent = loggedInUser.username;
    profileEmail.textContent = loggedInUser.email;
    profilePhone.textContent = loggedInUser.phone;
    profileAbout.textContent = loggedInUser.about;
    profilePics.src = loggedInUser.profilePics || "avatar.png";
    profilePicBtn.src = loggedInUser.profilePics || "avatar.png";

     // --- Online / Last seen status ---
    if (loggedInUser.isOnline) {
        profileStatus.textContent = "Online";
        profileStatus.style.color = "green";
    } else if (user.lastSeen) {
        let lastSeenDate = new Date(user.lastSeen);
        let today = new Date();
        let yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (lastSeenDate.toDateString() === today.toDateString()) {
            let hrs = lastSeenDate.getHours().toString().padStart(2, "0");
            let mins = lastSeenDate.getMinutes().toString().padStart(2, "0");
            profileStatus.textContent = "Last seen today at " + hrs + ":" + mins;
        } else if (lastSeenDate.toDateString() === yesterday.toDateString()) {
            profileStatus.textContent = "Last seen yesterday";
        } else {
            profileStatus.textContent = "Last seen on " + lastSeenDate.toLocaleDateString();
        }
        profileStatus.style.color = "gray";
    } else {
        profileStatus.textContent = "Offline";
        profileStatus.style.color = "gray";
    }
}

// ================= CHANGE PROFILE PICTURE =================
["profile-about", "profile-phone"].forEach(function (id) {
    let element = document.getElementById(id);

    element.addEventListener("blur", async function () {
        if (!loggedInUser) return;

        let newValue = this.textContent.trim();
        let field = id === "profile-about" ? "about" : "phone";
        let userRef = doc(db, "users", loggedInUser.id);

        try {
            // --- 🔹 Show saving toast ---
            showSaveStatus("Updating Profile...", "info");

            await updateDoc(userRef, { [field]: newValue });

            // --- 🔹 Save locally to keep UI in sync ---
            loggedInUser[field] = newValue;
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

            // --- 🔹 Show success ---
            showSaveStatus("Profile updated ✅", "success");

        } catch (error) {
            console.error(`❌ Error updating ${field}:`, error);
            showSaveStatus(` ❌Failed to update ${field}`, "error");
        }
    });
});

// =================== Change Profile Picture =======================
profilePics.addEventListener("click", function () {
    changePics.click();
});

changePics.addEventListener("change", async function () {
    let file = this.files[0];
    if (!file) return;

    // --- ✅ Ensure we have a valid logged-in user ---
    let user = loggedInUser || JSON.parse(localStorage.getItem("currentUser"));
    if (!user || !(user.id || user.uid)) {
        return;
    }

    try {
        let reader = new FileReader();
        reader.onload = async function (e) {
            let base64Data = e.target.result;

            // --- ✅ Update UI immediately ---
            profilePics.src = base64Data;
            if (typeof profilePicBtn !== "undefined" && profilePicBtn) {
                profilePicBtn.src = base64Data;
            }

            // --- ✅ Show status (optional) ---
            showSaveStatus("Updating profile picture...", "info");

            // --- ✅ Get user ID safely (Firebase doc ID) ---
            let userId = user.id || user.uid;
            let userRef = doc(db, "users", userId);

            // --- ✅ Update in Firestore ---
            await updateDoc(userRef, { profilePics: base64Data });

            // --- ✅ Update global and localStorage copies ---
            user.profilePics = base64Data;
            loggedInUser = user;
            localStorage.setItem("currentUser", JSON.stringify(user));

            showSaveStatus("Profile picture updated ✅", "success");
        };
        reader.readAsDataURL(file);
    } catch (err) {
        console.error("❌ Error updating picture:", err);
        showSaveStatus("Error updating picture ❌", "error");
    }
});


// ============= 🔹 LOAD ALL USER MESSAGES ===========
async function loadMessages(senderUsername, receiverUsername, callback) {
    try {
        let messagesRef = collection(db, "messages");
        let q = query(messagesRef, orderBy("time"));
        let snapshot = await getDocs(q);

        let chatMessages = [];
        snapshot.forEach(function (docSnap) {
            let msg = docSnap.data();
            // --- ✅ Filter only messages between these two users ---
            if (
                (msg.sender === senderUsername && msg.receiver === receiverUsername) ||
                (msg.sender === receiverUsername && msg.receiver === senderUsername)
            ) {
                chatMessages.push(msg);
            }
        });

        callback(chatMessages);
    } catch (error) {
        console.error("❌ Error loading messages:", error);
        // callback([]);
    }
}

// ================= LOAD USER LIST =================
async function loadUserList(filter = "") {
    try {

        if (!loggedInUser) {
            console.warn("⚠ No logged-in user — cannot load user list");
            return;
        }

        let list = document.getElementById("user-list");
        if (!list) {
            console.error("❌ Element #user-list not found in HTML");
            return;
        }

        list.innerHTML = "";

        let usersSnapshot = await getDocs(collection(db, "users"));

        if (usersSnapshot.empty) {
            list.innerHTML = "<p>No users found.</p>";
            return;
        }

        // --- Load user list ---
        usersSnapshot.forEach( function (docSnap) {
            let user = { ...docSnap.data(), id: docSnap.id };

            // --- Exclude self ---
            if (user.email === loggedInUser.email) return;

            // --- Apply filter ---
            if (!user.username.toLowerCase().includes(filter.toLowerCase())) return;

            // --- Load messages between loggedInUser and this user ---
            loadMessages(loggedInUser.username, user.username, function (chatMessages) {
                chatMessages.sort(function (a, b) {
                    return new Date(a.time) - new Date(b.time);
                });

                let lastMsgObj = chatMessages.length
                    ? chatMessages[chatMessages.length - 1]
                    : null;

                let userItem = document.createElement("div");
                userItem.className = "user-item";

                let img = document.createElement("img");
                img.className = "profile-img";
                img.src = user.profilePics || "avatar.png";
                img.alt = user.username;
                userItem.appendChild(img);

                img.onclick = function(e) {
                    e.stopPropagation();
                    showUserProfile(user);
                };

                let details = document.createElement("div");
                details.className = "user-details";

                let name = document.createElement("h1");
                name.textContent = user.username;

                let lastMsg = document.createElement("div");
                lastMsg.className = "last-message";

                if (lastMsgObj) {
                    if (lastMsgObj.deleted || 
                        (lastMsgObj.deletedFor && lastMsgObj.deletedFor.includes(loggedInUser.id))) {
                        lastMsg.textContent = "This message was deleted";
                        lastMsg.classList.add("deleted-message");
                    } else if (lastMsgObj.text) {
                        lastMsg.textContent =
                            lastMsgObj.text.length > 30
                                ? lastMsgObj.text.substring(0, 31) + "..."
                                : lastMsgObj.text;
                    } else {
                        lastMsg.textContent = "You can Now Chat this User.";
                    }
                } else {
                    lastMsg.textContent = "You can Now Chat this User.";
                }

                let time = document.createElement("div");
                time.className = "time";

                if (lastMsgObj) {
                    let lastMsgDate = new Date(lastMsgObj.time);
                    let now = new Date();
                    let diff = now - lastMsgDate;

                    if (diff < 24 * 60 * 60 * 1000) {
                        let hours = lastMsgDate.getHours().toString().padStart(2, "0");
                        let mins = lastMsgDate.getMinutes().toString().padStart(2, "0");
                        time.textContent = `${hours}:${mins}`;
                    } else {
                        time.textContent = lastMsgDate.toLocaleDateString();
                    }
                }
                
                details.appendChild(name);
                details.appendChild(lastMsg);

                userItem.appendChild(details);
                userItem.appendChild(time);

                userItem.onclick = function () {
                    openChat(user);
                    userItem.classList.toggle("active");
                };

                list.appendChild(userItem);
            });
        });
    } catch (error) {
        showSaveStatus(`❌ Error Loading UserList. ${field}`, "error");
       
    }
}

// ================= SEARCH USER FUNCTION =================
searchInput.oninput = function() {
    loadUserList(this.value); 
};

// ================= OPEN CHAT =================
async function openChat(chatUser){
    currentChatUser = chatUser;

     // --- Show chat panel, hide sidebar (mobile only) ---
    if (window.innerWidth <= 710) {
        sideBar.classList.add("hidden");
        chatPanel.classList.add("active");
    }

    chatHeader.style.display = "flex"; 
    inputField.style.display = "grid"; 
    messagesDiv.style.display = "block";    
    displayInfo.style.display = "none";
    personName.textContent = chatUser.username;
    personPic.src = chatUser.profilePics || "avatar.png";

    // --- PersonPic onlick function ---
    personPic.onclick = async function () {
        try {
            if (!currentChatUser || !currentChatUser.id) {
                console.warn("⚠ No user selected");
                return;
            }

            // --- get user document from Firestore ---
            let userRef = doc(db, "users", currentChatUser.id);
            let userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                let userData = userSnap.data();
                showUserProfile(userData);
            } else {
                showSaveStatus(` ⚠ User not Found. ${field}`, "error");
            }
        } catch (error) {
            showSaveStatus(` ❌ Failed to load User Profile. ${field}`, "error");
        }
    };

    // --- Status ---
    if (!userStatus) {
        userStatus = document.createElement("div");
        userStatus.id = "user-status";
        userStatus.className = "status";
        chatHeader.appendChild(userStatus);
    }
    
    if(chatUser.isOnline){ 
        userStatus.textContent="online"; 
        userStatus.style.color="green"; 
    } else if(chatUser.lastSeen){ 

        // --- update user last seen ---
        let lastSeenDate = new Date(chatUser.lastSeen);
        let today = new Date();
        let yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (lastSeenDate.toDateString() === today.toDateString()) {
            userStatus.textContent =
                "last seen " +
                lastSeenDate.getHours().toString().padStart(2, "0") +
                ":" +
                lastSeenDate.getMinutes().toString().padStart(2, "0");

        } else if (lastSeenDate.toDateString() === yesterday.toDateString()) {
            userStatus.textContent = "last seen Yesterday";

        } else {
            userStatus.textContent = "last seen " + lastSeenDate.toLocaleDateString();
        }

        userStatus.style.color="gray"; 
    } else { 
        userStatus.textContent="Offline"; 
        userStatus.style.color="gray"; 
    }

    // --- Real-time messages between loggedInUser & chatUser ---
    messagesDiv.innerHTML = "";
    let messagesQuery = query(collection(db,"messages"), orderBy("time"));
    onSnapshot(messagesQuery, function(snapshot){

        messagesDiv.innerHTML = "";
        let lastDate = "";

        // --- When click on users ---
        snapshot.forEach(function(docSnap){
            let msg = { id: docSnap.id, ...docSnap.data() };
            let msgDate = new Date(msg.time);
            let dateKey = msgDate.toDateString();

            if((msg.sender === loggedInUser.username && msg.receiver === chatUser.username) || (msg.sender === chatUser.username && msg.receiver === loggedInUser.username)) {

                 // --- show chat date on each day ---
                if (dateKey !== lastDate) {
                    let dateHeader = document.createElement("div");
                    dateHeader.className = "day-set";

                    let today = new Date();
                    let yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    if (msgDate.toDateString() === today.toDateString()) {
                        dateHeader.textContent = "Today";
                    } else if (msgDate.toDateString() === yesterday.toDateString()) {
                        dateHeader.textContent = "Yesterday";
                    } else {
                        dateHeader.textContent = msgDate.toLocaleDateString();
                    }
                    messagesDiv.appendChild(dateHeader);
                    lastDate = dateKey;
                }
                
                // --- chat row and bubbles ---
                let row = document.createElement("div");
                row.className = "row " + (msg.sender === loggedInUser.username ? "me":"you");

                let bubble = document.createElement("div");
                bubble.className = "bubble " + (msg.sender === loggedInUser.username ? "me" : "you");

                if (msg.deleted) {
                    // --- Fully deleted for Everyone  ---
                    bubble.textContent = " 🚫 This message was deleted";
                    bubble.classList.add("deleted-message");
                    bubble.onclick = null;
                } 
                else if (msg.deletedFor && msg.deletedFor.includes(loggedInUser.id)) {
                    // --- Deleted only for only me ---
                    bubble.textContent = " 🚫 This message was deleted";
                    bubble.classList.add("deleted-message");
                    bubble.onclick = null;                    
                } 
                else {
                    // --- Normal visible message ---
                    bubble.textContent = msg.text;
                }

                // --- Add delete message handler ---
                bubble.onclick = async function () {
                    if (!navigator.onLine) {
                        showNetworkToast();
                        return;
                    }

                    // --- 🛑 Prevent clicking deleted messages ---
                    if (msg.deleted || (msg.deletedFor && msg.deletedFor.includes(loggedInUser.id))) {
                        return;
                    }

                    if (confirm(" 🤷‍♂️ Do you want to delete this message?")) {
                        try {
                            // --- Case 1: Sender deletes → remove for both
                            if (msg.sender === loggedInUser.username) {
                                await updateDoc(doc(db, "messages", msg.id), {
                                    deleted: true,
                                    deletedFor: [],

                                
                                });

                                bubble.textContent = " 🚫 This message was deleted";
                                bubble.classList.add("deleted-message");
                                bubble.onclick = null; 
                            }
                            // --- Case 2: Receiver deletes → only hide for themselves
                            else {
                                let deletedForArr = msg.deletedFor || [];
                                if (!deletedForArr.includes(loggedInUser.id)) {
                                    deletedForArr.push(loggedInUser.id);
                                    
                                }

                                await updateDoc(doc(db, "messages", msg.id), {
                                    deletedFor: deletedForArr,
                                });

                                bubble.textContent = " 🚫 This message was deleted";
                                bubble.classList.add("deleted-message");
                                bubble.onclick = null;
                            }

                            // --- Refresh chat and user list
                            loadMessages(loggedInUser.username, currentChatUser.username, function(){});
                            loadUserList(searchInput.value || "", true);

                        } catch (error) {
                            showSaveStatus(` ❌ Failed to delete message. please check your internet connection. ${field}`, "error");
                        }
                    }
                };

                // --- This tells when conversation take place ---
                let timeDiv = document.createElement("div"); 
                timeDiv.className="meta";
                timeDiv.textContent = msgDate.getHours().toString().padStart(2, "0") + ":" + msgDate.getMinutes().toString().padStart(2, "0");

                row.appendChild(bubble); 
                row.appendChild(timeDiv);

                messagesDiv.appendChild(row);
            }
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// ================= DELETE MESSAGE FUNCTION ================
window.deleteMessage = async function (messageId, currentUserId, receiverId) {
    try {
        let msgRef = doc(db, "messages", messageId);
        let msgSnap = await getDoc(msgRef);

        if (!msgSnap.exists()) {
            console.warn("⚠ Message not found:", messageId);
            return;
        }

        let msgData = msgSnap.data();

        // --- CASE 1: Sender deletes for everyone ---
        if (msgData.senderId === currentUserId || msgData.senderId === receiverId) {
            await updateDoc(msgRef, {
                text: "🚫 This message was deleted",
                deleted: true,
                deletedAt: new Date().toISOString()
            });

            // -- 🔹 Check if this was the last message between users --
            let chatRef = doc(db, "chats", msgData.chatId);
            let chatSnap = await getDoc(chatRef);
            if (chatSnap.exists()) {
                let chatData = chatSnap.data();

                if (chatData.lastMsgId === messageId) {
                    await updateDoc(chatRef, {
                        lastMsgText: "🚫 This message was deleted"
                    });
                }
            }

        } 
        // --- CASE 2: Receiver deletes for self only ---
        else {
            let deletedFor = msgData.deletedFor || [];
            if (!deletedFor.includes(currentUserId)) {
                deletedFor.push(currentUserId);
            }

            await updateDoc(msgRef, { deletedFor });

            let chatRef = doc(db, "chats", msgData.chatId);
            let chatSnap = await getDoc(chatRef);
            if (chatSnap.exists()) {
                let chatData = chatSnap.data();

                if (chatData.lastMsgId === messageId) {
                    await updateDoc(chatRef, {
                        lastMsgText: "🚫 This message was deleted"
                    });
                }
            }
        }

    } catch (error) {
        showSaveStatus(`Failed to delete message. Please check your internet connection ${field}`, "error");
    }
};


// ================= SEND MESSAGE FUNCTION =================
sendBtn.onclick = async function(){
    let msg = messageInput.value.trim();
    if(!msg || !currentChatUser) return;
        await addDoc(collection(db, "messages"), {
        sender: loggedInUser.username,
        receiver: currentChatUser.username,
        text: msg,
        time: new Date().toISOString()
    });

    messageInput.value = "";
    openChat(currentChatUser);
    loadUserList(searchInput.value || "", true);
    watchUserList();
};

// ======== Grow smoothly, but stop after 3 lines =======
messageInput.addEventListener("input", function () {
    let maxLines = 3;
    let lineHeight = 20;

    this.style.height = "auto";
    let scrollHeight = this.scrollHeight;
    let maxHeight = maxLines * lineHeight;

    
    this.style.height = Math.min(scrollHeight, maxHeight) + "px";
    this.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
});


// ==================== SEND MESSAGES ON ENTER KEY ===============
messageInput.addEventListener("keydown", function (e) {
    let isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // ================= 📱 MOBILE → Enter should always insert a new line (not send) ==============
    if (isMobile && e.key === "Enter") {
        e.preventDefault();
        let cursorPos = messageInput.selectionStart;
        let text = messageInput.value;
        messageInput.value =
            text.substring(0, cursorPos) + "\n" + text.substring(cursorPos);
        messageInput.selectionStart = messageInput.selectionEnd = cursorPos + 1;
        return;
    }

    // ==================== NEW LINE WHEN CLICK SHIFT + ENTER ===============
    if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        let cursorPos = messageInput.selectionStart;
        let text = messageInput.value;
        messageInput.value =
            text.substring(0, cursorPos) + "\n" + text.substring(cursorPos);
        messageInput.selectionStart = messageInput.selectionEnd = cursorPos + 1;
    }

    // ================== 💻 DESKTOP: ENTER (without SHIFT) → send message ==================
    else if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
        watchUserList();
    }
});


// --- BACK BUTTON FUNCTION ---
backBtn.addEventListener("click", function () {
    chatPanel.classList.remove("active");
    sideBar.classList.remove("hidden");
});

// ================= SHOW PROFILE FUNCTIONS =================
profileBtn.onclick = function(event) {
    myProfile.classList.toggle("active");
    overlay.classList.toggle("active");
    event.stopPropagation();
};

// --- Clicking overlay closes modal ---
overlay.onclick = function() {
    myProfile.classList.remove("active");
    overlay.classList.remove("active");
};

// --- Prevent close when clicking inside modal ---
myProfile.onclick = function(event) {
    event.stopPropagation();
};

// --- Close modal with ESC key ---
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        myProfile.classList.remove("active");
        overlay.classList.remove("active");
    }
});

// ================= SHOW USERS PROFILE FUNCTIONS =================
function showUserProfile(user) {
    profilePicsView.src = user.profilePics && user.profilePics !== "" ? user.profilePics : "avatar.png";
    profileUserView.textContent = user.username;
    profileAboutView.textContent = user.about;
    profilePhoneView.textContent = user.phone;
    profileEmailView.textContent = user.email;

     // --- Online / Last seen status ---
    if (user.isOnline) {
        profileStatusView.textContent = "Online";
        profileStatusView.style.color = "green";
    } else if (user.lastSeen) {
        let lastSeenDate = new Date(user.lastSeen);
        let today = new Date();
        let yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (lastSeenDate.toDateString() === today.toDateString()) {
            let hrs = lastSeenDate.getHours().toString().padStart(2, "0");
            let mins = lastSeenDate.getMinutes().toString().padStart(2, "0");
            profileStatusView.textContent = "Last seen today at " + hrs + ":" + mins;
        } else if (lastSeenDate.toDateString() === yesterday.toDateString()) {
            profileStatusView.textContent = "Last seen yesterday";
        } else {
            profileStatusView.textContent = "Last seen on " + lastSeenDate.toLocaleDateString();
        }
        profileStatusView.style.color = "gray";
    } else {
        profileStatusView.textContent = "Offline";
        profileStatusView.style.color = "gray";
    }

    modal.style.display = "flex";
}

// ================= CLOSE PROFILE FUNCTIONS =================
closeProfile.onclick = function() {
    modal.style.display = "none";
};

// ================= SHOW SAVE STATUS FUNCTIONS =================
function showSaveStatus(message, type = "info") {
    let toast = document.createElement("div");
    toast.className = `save-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 20);
    setTimeout(() => toast.classList.remove("show"), 2000);
    setTimeout(() => toast.remove(), 2500);
}

// ================= SHOW NWETWORK TOAST FUNCTIONS ===============
function showNetworkToast() {
    // --- Show the toast ---
    toast.style.display = "block";
    toast.style.opacity = "1";

    // --- Start countdown from 10 seconds ---
    let countdown = 10;
    countdownEl.textContent = `Auto-closing in ${countdown} seconds...`;

    let countdownInterval = setInterval( function () {
        countdown--;
        countdownEl.textContent = `Auto-closing in ${countdown} seconds...`;

        if (countdown <= 0) {
            closeToast();
        }
    }, 1000);

    // --- Retry button --- 
    retryBtn.onclick = function () {
        closeToast();
        if (!navigator.onLine) {
            showSaveStatus(` ⚠ Still offline. please reconnect to the internet. ${field}`, "error");
        }
    };

    // --- Cancel button ---
    cancelBtn.onclick = function () {
        closeToast();
    };

    // ------ CLOSE TOAST FUNCTION ---
    function closeToast() {
        clearInterval(countdownInterval);
        toast.style.opacity = "0";
        setTimeout( function () {
            toast.style.display = "none";
        }, 300);
    }
}

// ================= TOGGLE EMOJI LIST FUNCTIONS =================
toggleButton.onclick = function() {
    emojis.classList.toggle("show");
};
for(let i = 0; i < emojiButtons.length; i++) {
    emojiButtons[i].onclick = function() {
        let emoji = this.textContent;
        let start = messageInput.selectionStart;
        let end = messageInput.selectionEnd;
        let text = messageInput.value;
        messageInput.value = text.slice(0, start) + emoji + text.slice(end);
        messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
        messageInput.focus();
        emojis.classList.remove("show");
    };
    messageInput.onclick = function() {
        emojis.classList.remove("show");
    };
};




// ======================== WELCOME MESSAGE ========================

(function () {
    // Resize matrix
    function resizeCanvas() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
    }
    resizeCanvas();

    let drops = Array(Math.floor(matrixCanvas.width / fontSize)).fill(1);
    function drawMatrix() {
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        ctx.fillStyle = "#00ff88";
        ctx.font = fontSize + "px monospace";
        for (let i = 0; i < drops.length; i++) {
            let text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    let matrixInterval = setInterval(drawMatrix, 33);


    let LINES = [
        "[System Boot] Initializing Secure Node...",
        "Loading encryption modules (AES, RSA, ECDSA)...",
        "Verifying secure socket connections...",
        "Importing DCY Messenger runtime...",
        "Scanning message database integrity...",
        "[OK] All systems operational",
        "",
        "Welcome to DCY Messenger.",
        "Fast. Encrypted. Reliable.",
        "Preparing secure signup interface..."
    ];

    function wait(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async function typeLine(line) {
        let span = document.createElement("span");
        terminal.appendChild(span);
        let cursor = document.createElement("span");
        cursor.className = "cursor";
        terminal.appendChild(cursor);
        for (var i = 0; i < line.length; i++) {
            span.textContent += line[i];
            terminal.scrollTop = terminal.scrollHeight;
            await wait(rand(10, 30));
        }
        terminal.removeChild(cursor);
        terminal.appendChild(document.createElement("br"));
        await wait(160);
    }

    function setBootProgress(p) {
        bootFill.style.width = p + "%";
    }

    function chooseVoice() {
        if (!speechEnabled) return null;
        let voices = speechSynthesis.getVoices();
        if (!voices.length) return null;
        let preferred = ["Google UK English Female", "Google US English", "Microsoft Zira", "Alex"];
        for (let i = 0; i < preferred.length; i++) {
            let v = voices.find(function (vv) { 
                return vv.name.includes(preferred[i]); 
            });
            if (v) return v;
        }
        return voices.find(function (vv) { 
            return vv.lang.startsWith("en"); 
        }) || voices[0];
    }

    function speakWelcome(name) {
        if (!speechEnabled) return;

        let voice = speechVoice || chooseVoice();
        if (!voice) return;

        let text = "System online. Welcome " + (name || "") + ". Initializing DCY Messenger interface. Please create an account.";

        let utter = new SpeechSynthesisUtterance(text);
        utter.voice = voice;
        utter.rate = 0.95;
        utter.pitch = 1;

        // --- 🔹 When voice finishes, stop the Matrix rain ---
        utter.onend = function () {
            clearInterval(matrixInterval);
        };

        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
    }


    function waitForIdentify() {
        return new Promise(function (resolve) {
            function finish(n) {
                resolve(n || null);
            }
            identifyBtn.onclick = function () {
                finish(identifyInput.value.trim());
            };
            identifyInput.onkeydown = function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    finish(identifyInput.value.trim());
                }
            };
            skipWelcome.onclick = function () {
                finish(null);
            };
        });
    }

    async function runBoot() {
        welcomeOverlay.style.display = "flex";
        pressStart.style.display = "none";
        terminal.textContent = "";
        welcomePrompt.style.display = "none";
        setBootProgress(0);

        if (speechEnabled) {
            if (!speechSynthesis.getVoices().length) {
                speechSynthesis.onvoiceschanged = function () {
                    speechVoice = chooseVoice();
                };
            } else {
                speechVoice = chooseVoice();
            }
        }

        for (var i = 0; i < LINES.length; i++) {
            await typeLine("> " + LINES[i]);
            setBootProgress(Math.round(((i + 1) / LINES.length) * 70));
            await wait(80);
        }

        setBootProgress(98);
        await wait(300);
        welcomePrompt.style.display = "flex";
        identifyInput.focus();

        var displayName = await waitForIdentify();
        setBootProgress(100);
        usernameInput.value = displayName;

        terminal.appendChild(document.createElement("br"));
        let done = document.createElement("div");
        done.textContent = "[System] Ready. Opening signup form...";
        done.style.color = "#aaffc8";
        terminal.appendChild(done);

        if (displayName) {
            let greet = document.createElement("div");
            greet.textContent = "Welcome, " + displayName + ".";
            greet.style.color = "#c8ffd6";
            terminal.appendChild(greet);
            localStorage.setItem("visitorName", displayName);
        }

        // 🗣️ Voice speaks welcome
        speakWelcome(displayName);

        // 🎯 Wait until speech ends, then mark boot complete
        if ('speechSynthesis' in window) {
            let checkEnd = setInterval(function() {
                if (!speechSynthesis.speaking) {
                    clearInterval(checkEnd);
                    localStorage.setItem("welcomeSeen", "true"); 
                    matrixCanvas.style.display = "none"; // ✅ hide rain
                    welcomeOverlay.style.display = "none"; // ✅ hide overlay

                    showSignup();
                }
            }, 500);
        } else {
            // Fallback if speech not supported
            localStorage.setItem("welcomeSeen", "true");
            matrixCanvas.style.display = "none";
            welcomeOverlay.style.display = "none";
            showSignup();
        }

    }

    function showPressStart() {
        welcomeOverlay.style.display = "flex";
        pressStart.style.display = "flex";
        terminal.style.display = "none";
    }

    function hidePressStart() {
        pressStart.style.display = "none";
        terminal.style.display = "block";
    }

    window.login = async function () {
        let isMobile = /Mobi|Android/i.test(navigator.userAgent);
        showPressStart();
        blink.textContent = isMobile ? " Tap anywhere to start" : " Press any key or click to start";

        function startBoot() {
            document.removeEventListener("keydown", startBoot);
            document.removeEventListener("click", startBoot);
            document.removeEventListener("touchstart", startBoot);
            hidePressStart();
            runBoot();
        }

        document.addEventListener("keydown", startBoot, { once: true });
        document.addEventListener("click", startBoot, { once: true });
        document.addEventListener("touchstart", startBoot, { once: true });
    }


    replayWelcome.onclick = function () {
        localStorage.removeItem("welcomeSeen");
        startFlow();
    };

    skipWelcome.onclick = function () {
        // 🧹 Clear matrix and overlay
        matrixCanvas.style.display = "none";
        welcomeOverlay.style.display = "none";

        // 🎯 Mark the welcome as seen
        localStorage.setItem("welcomeSeen", "1");

        // 🧭 Stop any running speech
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }

        // 🧩 Stop matrix animation loop (optional safety)
        clearInterval(matrixInterval);

        // 🚀 Go straight to signup page
        if (typeof showSignup === "function") {
            showSignup();
        } else {
            console.warn("⚠️ showSignup() not found. Make sure it’s defined globally.");
        }
        showSaveStatus(" ✅ Welcome Back.", "success");
    };


    window.onload = function () {
        startFlow();
    };

    window.onresize = resizeCanvas;

})();





// ================= WINDOW LOAD FUNCTION =================
// --- Close modal if clicked outside ---
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
    if (event.target === myProfile) {
        myProfile.classList.remove("active");
        overlay.classList.remove("active");
    }
};

// --- When User Refresh the Page ---
window.onload = async function () {
    // 🟢 Skip welcome if already seen
    if (localStorage.getItem("welcomeSeen")) {

        welcomeOverlay.style.display = "none";
        matrixCanvas.style.display = "none";        

        showLogin();
    } else {
        // 🎬 Start cinematic boot for first-time visitors
        let isMobile = /Mobi|Android/i.test(navigator.userAgent);
        blink.textContent = isMobile ? " Tap anywhere to start" : " Press any key or click to start";
        
        startFlow();
        return; 
    }

    // 🧩 Continue app logic after skipping or finishing boot
    let savedUser = sessionStorage.getItem("loggedInUser");

    if (savedUser) {
        loggedInUser = JSON.parse(savedUser);

        try {
        await updateDoc(doc(db, "users", loggedInUser.id), {
            isOnline: true,
            lastSeen: new Date().toISOString()
        });
        } catch (error) {
        showSaveStatus(" ⚠ Could not update user status", "error");
        }

        showChatCell();
        watchUserList();
    } else {
        try {
        let snapshot = await getDocs(collection(db, "users"));

        if (snapshot.empty) {

            showSignup();
        } else {
            showSaveStatus(` Welcome Back.  Please Login ${field}`, "succes");
            showLogin();
        }

        watchUserList();
        } catch (error) {

        showLogin();
        }
    }
};



// --- 🌐 Handle network changes (for accurate online/offline status) ---
window.addEventListener("online", async function () {
    if (loggedInUser) {
        await updateDoc(doc(db, "users", loggedInUser.id), {
            isOnline: true,
            lastSeen: new Date().toISOString()
        });
    }
});

window.addEventListener("offline", async function () {
    if (loggedInUser) {
        await updateDoc(doc(db, "users", loggedInUser.id), {
            isOnline: false,
            lastSeen: new Date().toISOString()
        });
        console.warn("⚠ Offline — user marked offline temporarily");
    }
});

// ============ 📴 Auto mark user offline on window/tab close =========
window.addEventListener("beforeunload", async function () {
    if (loggedInUser) {
        try {
            await updateDoc(doc(db, "users", loggedInUser.id), {
                isOnline: false,
                lastSeen: new Date().toISOString()
            });
            sessionStorage.removeItem("loggedInUser");
        } catch (e) {
            console.warn("Could not update status before unload", e);
        }
    }
});

// =========  If the user resizes their window  =========
window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        sideBar.classList.remove("hidden");
        chatPanel.classList.add("active");
    } else {
        // back to mobile default view
        if (!currentChatUser) {
            sideBar.classList.remove("hidden");
            chatPanel.classList.remove("active");
        }
    }
});

//  ----- real time ---
function watchUserList() {
    let usersRef = collection(db, "users");
    // Listen for live updates
    onSnapshot(usersRef, function(snapshot) {
        let users = [];
        snapshot.forEach(function(docSnap) {
            let data = docSnap.data();
            users.push({ id: docSnap.id, ...data });
        });
    });
}

function watchMessages(currentUserId, chatUserId) {
    let q = query(
        collection(db, "messages"),
        where("chatBetween", "array-contains", [currentUserId, chatUserId].sort().join("_")),
        orderBy("timestamp", "asc")
    );

    onSnapshot(q, function (snapshot) {
        let messages = [];
        snapshot.forEach(function (docSnap) {
            let msg = { id: docSnap.id, ...docSnap.data() };

            // skip messages deleted for this user
            if (msg.deletedFor && msg.deletedFor.includes(currentUserId)) 
                return;
            bubble.classList.add("deleted-message");
            bubble.onclick = null;
            messages.push(msg);
        });
    });
}




