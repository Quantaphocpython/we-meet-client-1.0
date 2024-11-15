const modal = document.getElementById('settings-modal');
const settingsButton = document.getElementById('settings-btn');
const closeButton = document.querySelector('.close-button');
const menuItems = document.querySelectorAll('.menu-item');
const audioSettings = document.querySelector('.audio-settings');
const videoSettings = document.querySelector('.video-settings');
const generalSettings = document.querySelector('.general-settings');
const microphoneSelect = document.getElementById('microphone-select');
const speakerSelect = document.getElementById('speaker-select');
const videoDeviceSelect = document.getElementById('video-device-select');

// Nhấn nút cài đặt sẽ mở modal
settingsButton.addEventListener('click', () => {
  modal.style.display = 'flex';
  // Show the audio settings by default
  audioSettings.style.display = 'block';
  videoSettings.style.display = 'none';
  generalSettings.style.display = 'none';
});

// Nhấn nút tắt để tắt modal
closeButton.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Tắt modal khi nhấn ra ngoài modal
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Handle menu item clicks to switch settings sections
menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    // Remove active class from all menu items
    menuItems.forEach((i) => i.classList.remove('active'));
    // Add active class to the clicked menu item
    item.classList.add('active');

    // Show the corresponding settings based on the clicked item
    if (item.textContent === 'Âm thanh') {
      audioSettings.style.display = 'block';
      videoSettings.style.display = 'none';
      generalSettings.style.display = 'none';
    } else if (item.textContent === 'Video') {
      audioSettings.style.display = 'none';
      videoSettings.style.display = 'block';
      generalSettings.style.display = 'none';
    } else if (item.textContent === 'Cài đặt chung') {
      audioSettings.style.display = 'none';
      videoSettings.style.display = 'none';
      generalSettings.style.display = 'block';
    }
  });
});

function updateDateTime() {
  const now = new Date();

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const dateTimeString = now.toLocaleString('vi-VN', options);

  // Cập nhật vào thẻ span
  document.getElementById('date-time').textContent = dateTimeString;
}

setInterval(updateDateTime, 1000);
updateDateTime();

async function populateDeviceLists() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioInputs = devices.filter(device => device.kind === 'audioinput');
  const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
  const videoInputs = devices.filter(device => device.kind === 'videoinput');

  microphoneSelect.innerHTML = audioInputs.map(device => `<option value="${device.deviceId}">${device.label}</option>`).join('');
  speakerSelect.innerHTML = audioOutputs.map(device => `<option value="${device.deviceId}">${device.label}</option>`).join('');
  videoDeviceSelect.innerHTML = videoInputs.map(device => `<option value="${device.deviceId}">${device.label}</option>`).join('');
}

populateDeviceLists();