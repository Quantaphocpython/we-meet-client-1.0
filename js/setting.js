// Get the modal elements
const modal = document.getElementById("settings-modal");
const settingsButton = document.getElementById("settings-btn");
const closeButton = document.querySelector(".close-button");

// Open the modal when the settings button is clicked
settingsButton.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close the modal when the close button is clicked
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close the modal when clicking outside the modal content
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