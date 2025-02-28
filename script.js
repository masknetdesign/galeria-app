// Elementos do DOM
const captureBtn = document.getElementById('capture-btn');
const uploadBtn = document.getElementById('upload-btn');
const createAlbumBtn = document.getElementById('create-album-btn');
const fileInput = document.getElementById('file-input');
const albumsContainer = document.getElementById('albums-container');
const captureModal = document.getElementById('capture-modal');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapPhotoBtn = document.getElementById('snap-photo');
const recordVideoBtn = document.getElementById('record-video');
const stopRecordBtn = document.getElementById('stop-record');
const closeModalBtn = document.getElementById('close-modal');
const fullscreenModal = document.getElementById('fullscreen-modal');
const fullscreenContent = document.getElementById('fullscreen-content');
const closeFullscreenBtn = document.getElementById('close-fullscreen');

let mediaRecorder;
let recordedChunks = [];
let albums = [];

// Abrir modal de captura
captureBtn.addEventListener('click', async () => {
    captureModal.style.display = 'flex';
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
    mediaRecorder.onstop = saveVideo;
});

// Capturar foto
snapPhotoBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageUrl = canvas.toDataURL('image/png');
    addMediaToAlbum(imageUrl, 'image');
    closeModal();
});

// Gravar vídeo
recordVideoBtn.addEventListener('click', () => {
    recordedChunks = [];
    mediaRecorder.start();
    recordVideoBtn.style.display = 'none';
    stopRecordBtn.style.display = 'inline';
});

stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    recordVideoBtn.style.display = 'inline';
    stopRecordBtn.style.display = 'none';
    closeModal();
});

// Fechar modal de captura
closeModalBtn.addEventListener('click', closeModal);

function closeModal() {
    captureModal.style.display = 'none';
    const stream = video.srcObject;
    stream.getTracks().forEach(track => track.stop());
}

// Salvar vídeo gravado
function saveVideo() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(blob);
    addMediaToAlbum(videoUrl, 'video');
}

// Escolher mídia da galeria
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
    Array.from(fileInput.files).forEach(file => {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image') ? 'image' : 'video';
        addMediaToAlbum(url, type);
    });
    fileInput.value = ''; // Limpar input
});

// Criar novo álbum
createAlbumBtn.addEventListener('click', () => {
    const albumName = prompt('Nome do álbum:');
    if (albumName) {
        const album = { name: albumName, media: [] };
        albums.push(album);
        renderAlbums();
    }
});

// Adicionar mídia ao álbum (padrão: último álbum ou cria um novo)
function addMediaToAlbum(url, type) {
    if (albums.length === 0) {
        albums.push({ name: 'Álbum Padrão', media: [] });
    }
    albums[albums.length - 1].media.push({ url, type });
    renderAlbums();
}

// Renderizar álbuns
function renderAlbums() {
    albumsContainer.innerHTML = '';
    albums.forEach((album, index) => {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album';
        albumDiv.innerHTML = `<h3>${album.name}</h3>`;
        
        const mediaGrid = document.createElement('div');
        mediaGrid.className = 'media-grid';
        
        album.media.forEach((item, mediaIndex) => {
            const element = item.type === 'image' 
                ? `<img src="${item.url}" alt="Foto">`
                : `<video src="${item.url}" controls></video>`;
            
            const mediaDiv = document.createElement('div');
            mediaDiv.innerHTML = element;
            mediaDiv.onclick = () => showFullscreen(item);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                album.media.splice(mediaIndex, 1);
                renderAlbums();
            };
            mediaDiv.appendChild(deleteBtn);
            mediaGrid.appendChild(mediaDiv);
        });
        
        albumDiv.appendChild(mediaGrid);
        albumsContainer.appendChild(albumDiv);
    });
}

// Visualizar em tela cheia
function showFullscreen(item) {
    fullscreenModal.style.display = 'flex';
    fullscreenContent.innerHTML = item.type === 'image' 
        ? `<img src="${item.url}" alt="Foto">`
        : `<video src="${item.url}" controls autoplay></video>`;
}

// Fechar modal de tela cheia
closeFullscreenBtn.addEventListener('click', () => {
    fullscreenModal.style.display = 'none';
    fullscreenContent.innerHTML = '';
});