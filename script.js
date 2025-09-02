
const chatList = document.getElementById("chat-list");
const newChatBtn = document.getElementById("new-chat");
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menu-btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close-btn"); // ✅ Close button added

let sessions = JSON.parse(localStorage.getItem("chatSessions")) || [];
let currentSessionId = null;

function saveSessions() {
  localStorage.setItem("chatSessions", JSON.stringify(sessions));
}

function renderChatList() {
  chatList.innerHTML = "";
  sessions.forEach(session => {
    let div = document.createElement("div");
    div.className = "chat-item" + (session.id === currentSessionId ? " active" : "");

    let title = document.createElement("span");
    title.className = "chat-title";
    title.innerText = session.title;
    title.onclick = () => {
      currentSessionId = session.id;
      renderChatList();
      renderChats();
      closeSidebar();
    };

    let del = document.createElement("i");
    del.className = "fa fa-trash delete-icon";
    del.onclick = (e) => {
      e.stopPropagation();
      deleteChat(session.id);
    };

    div.appendChild(title);
    div.appendChild(del);
    chatList.appendChild(div);
  });
}

function renderChats() {
  chatBox.innerHTML = "";
  let session = sessions.find(s => s.id === currentSessionId);
  if (!session) return;
  session.messages.forEach(msg => {
    let div = document.createElement("div");
    div.className = "message " + msg.type;
    div.innerText = msg.text;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function newChat() {
  let id = Date.now();
  sessions.push({ id, title: "New Chat", messages: [] });
  currentSessionId = id;
  saveSessions();
  renderChatList();
  renderChats();
}

function deleteChat(id) {
  sessions = sessions.filter(s => s.id !== id);
  if (currentSessionId === id) {
    currentSessionId = sessions.length ? sessions[0].id : null;
  }
  saveSessions();
  renderChatList();
  renderChats();
}

async function sendMessage() {
  if (!currentSessionId) {
    alert("Please start a new chat first!");
    return;
  }
  if (input.value.trim() === "") return;

  let session = sessions.find(s => s.id === currentSessionId);

  let userMsg = { type: "user", text: input.value };
  session.messages.push(userMsg);
  renderChats();

  sendBtn.disabled = true;
  sendBtn.innerText = "Wait...";

  let typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.innerText = "Typing...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  let response = await fetch("backend.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "message=" + encodeURIComponent(input.value)
  });

  let data = await response.json();

  chatBox.removeChild(typingDiv);

  let botMsg = { type: "bot", text: data.reply };
  session.messages.push(botMsg);

  if (session.title === "New Chat") {
    session.title = input.value.slice(0, 20);
  }

  saveSessions();
  renderChatList();
  renderChats();
  input.value = "";

  sendBtn.disabled = false;
  sendBtn.innerHTML = '<i class="fa fa-arrow-up"></i>';
}

newChatBtn.addEventListener("click", newChat);
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

renderChatList();
if (sessions.length) {
  currentSessionId = sessions[0].id;
  renderChats();
}

/* ✅ Sidebar toggle for mobile */
menuBtn.addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
});

overlay.addEventListener("click", closeSidebar);
closeBtn.addEventListener("click", closeSidebar); // ✅ Close button working

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

