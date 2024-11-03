const modal = document.getElementById("settings-modal");
const settingsButton = document.getElementById("settings-btn");
const closeButton = document.querySelector(".close-button");

// Nhấn nút cài đặt sẽ mở modal
settingsButton.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Nhấn nút tắt để tắt modal
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// Tắt modal khi nhấn ra ngoài modal
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
const inputField = document.getElementById('meeting-code');
const joinButton = document.getElementById('join-button');
    inputField.addEventListener('input', () => {
      joinButton.disabled = !inputField.value.trim();
});