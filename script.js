// DOM Elements
const sidebarToggleLine = document.getElementById('sidebarToggleLine');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebar = document.getElementById('sidebar');
const urlInput = document.getElementById('urlInput');
const addVideoBtn = document.getElementById('addVideoBtn');
const videoGrid = document.getElementById('videoGrid');
const emptyState = document.getElementById('emptyState');
const videoCountEl = document.getElementById('videoCount');
const videosPerRowDisplay = document.getElementById('videosPerRowDisplay');
const videosPerRowValue = document.getElementById('videosPerRowValue');
const decreasePerRow = document.getElementById('decreasePerRow');
const increasePerRow = document.getElementById('increasePerRow');
const videoSizeSlider = document.getElementById('videoSizeSlider');
const videoSizeValue = document.getElementById('videoSizeValue');
const clearAllBtn = document.getElementById('clearAllBtn');
const resetLayoutBtn = document.getElementById('resetLayoutBtn');
const dragGhost = document.getElementById('dragGhost');

// State
let videoCount = 0;
let videosPerRow = 2;
let videoSizePercent = 100;

// Drag State
let isDragging = false;
let draggedElement = null;
let draggedVideoId = null;

// Sidebar Transparency State
let sidebarTransparencyTimeout = null;

// =========================================================
// SIDEBAR TRANSPARENCY EFFECT
// =========================================================
function triggerSidebarTransparency() {
    if (!sidebar) return;
    
    // Clear any existing timeout
    if (sidebarTransparencyTimeout) {
        clearTimeout(sidebarTransparencyTimeout);
    }
    
    // Make sidebar semi-transparent with smooth transition
    sidebar.style.transition = 'opacity 0.3s ease';
    sidebar.style.opacity = '0.5';
    
    // After 5 seconds, fade back to solid
    sidebarTransparencyTimeout = setTimeout(() => {
        sidebar.style.transition = 'opacity 0.1s ease';
        sidebar.style.opacity = '1';
    }, 1000);
}

// =========================================================
// SIDEBAR FUNCTIONS
// =========================================================
function openSidebar() {
    document.body.classList.add('sidebar-open');
    setTimeout(() => {
        urlInput.focus();
    }, 100);
}

function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    // Remove focus from any input when closing
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

function toggleSidebar() {
    if (document.body.classList.contains('sidebar-open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Sidebar Event Listeners
sidebarToggleLine.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Keyboard Shortcuts - Shift to toggle (open and close)
document.addEventListener('keydown', (e) => {
    // Only respond to Shift key (alone, not with other keys)
    if (e.key === 'Shift' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        toggleSidebar();
    }
});

// =========================================================
// YOUTUBE URL PARSING
// =========================================================
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// =========================================================
// VIDEO DIMENSION CALCULATIONS
// =========================================================
function calculateVideoDimensions() {
    const containerWidth = document.querySelector('.video-grid-container').clientWidth;
    const maxWidth = containerWidth;
    
    let baseWidth = maxWidth / videosPerRow;
    let actualWidth = baseWidth * (videoSizePercent / 100);
    actualWidth = Math.max(actualWidth, 150);
    
    return Math.floor(actualWidth);
}

function updateGridLayout() {
    const videoWidth = calculateVideoDimensions();
    
    document.querySelectorAll('.video-item').forEach(item => {
        item.style.width = `${videoWidth}px`;
    });
}

// =========================================================
// VIDEO ELEMENT CREATION
// =========================================================
function createVideoElement(videoId) {
    const videoWidth = calculateVideoDimensions();
    const uniqueId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.dataset.uniqueId = uniqueId;
    videoItem.dataset.videoId = videoId;
    videoItem.style.width = `${videoWidth}px`;
    
    videoItem.innerHTML = `
        <div class="video-overlay-controls">
            <button class="control-btn move-btn" aria-label="Move video">
                <svg viewBox="0 0 24 24">
                    <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
                </svg>
            </button>
            <button class="control-btn delete-btn" aria-label="Remove video">
                <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
        <div class="video-wrapper">
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
        <div class="delete-confirmation">
            <div class="delete-confirmation-content">
                <p>Remove this video?</p>
                <div class="delete-confirmation-buttons">
                    <button class="confirm-btn cancel-btn" aria-label="Cancel">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                    <button class="confirm-btn remove-btn" aria-label="Remove">
                        <svg viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Delete button handler - show confirmation
    const deleteBtn = videoItem.querySelector('.delete-btn');
    const deleteConfirmation = videoItem.querySelector('.delete-confirmation');
    const cancelBtn = videoItem.querySelector('.cancel-btn');
    const removeBtn = videoItem.querySelector('.remove-btn');

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirmation(videoItem);
    });

    cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideDeleteConfirmation(videoItem);
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeVideo(videoItem);
    });

    // Click outside confirmation to cancel
    deleteConfirmation.addEventListener('click', (e) => {
        if (e.target === deleteConfirmation) {
            hideDeleteConfirmation(videoItem);
        }
    });

    // Move button - initiate drag
    const moveBtn = videoItem.querySelector('.move-btn');
    moveBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startDrag(e, videoItem);
    });

    // Setup touch support
    setupTouchDrag(videoItem);

    return videoItem;
}

// =========================================================
// DELETE CONFIRMATION
// =========================================================
function showDeleteConfirmation(videoItem) {
    videoItem.classList.add('showing-confirmation');
}

function hideDeleteConfirmation(videoItem) {
    videoItem.classList.remove('showing-confirmation');
}

// =========================================================
// DRAG AND DROP FUNCTIONALITY
// =========================================================
function startDrag(e, element) {
    // Don't drag if showing confirmation
    if (element.classList.contains('showing-confirmation')) return;
    
    isDragging = true;
    draggedElement = element;
    draggedVideoId = element.dataset.videoId;
    
    // Add dragging class
    element.classList.add('dragging');
    document.body.classList.add('is-dragging');
    
    // Setup ghost element
    const rect = element.getBoundingClientRect();
    const ghostWidth = Math.min(300, rect.width * 0.8);
    const ghostHeight = ghostWidth * 0.5625;
    
    dragGhost.style.width = `${ghostWidth}px`;
    dragGhost.style.height = `${ghostHeight}px`;
    dragGhost.innerHTML = `
        <img src="https://img.youtube.com/vi/${draggedVideoId}/mqdefault.jpg" alt="Video thumbnail">
    `;
    dragGhost.classList.add('visible');
    
    updateGhostPosition(e.clientX, e.clientY);
    
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    updateGhostPosition(e.clientX, e.clientY);
    
    const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    const targetVideo = elementsUnderCursor.find(el => 
        el.classList.contains('video-item') && el !== draggedElement
    );
    
    document.querySelectorAll('.video-item.drag-over').forEach(item => {
        if (item !== targetVideo) {
            item.classList.remove('drag-over');
        }
    });
    
    if (targetVideo) {
        targetVideo.classList.add('drag-over');
    }
}

function onDragEnd(e) {
    if (!isDragging) return;
    
    const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    const targetVideo = elementsUnderCursor.find(el => 
        el.classList.contains('video-item') && el !== draggedElement
    );
    
    if (targetVideo && draggedElement) {
        swapElements(draggedElement, targetVideo);
    }
    
    cleanupDrag();
}

function swapElements(el1, el2) {
    const parent = el1.parentNode;
    const allItems = Array.from(parent.querySelectorAll('.video-item'));
    const index1 = allItems.indexOf(el1);
    const index2 = allItems.indexOf(el2);
    
    if (index1 < index2) {
        parent.insertBefore(el1, el2.nextSibling);
    } else {
        parent.insertBefore(el1, el2);
    }
}

function updateGhostPosition(x, y) {
    dragGhost.style.left = `${x}px`;
    dragGhost.style.top = `${y}px`;
}

function cleanupDrag() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    
    document.querySelectorAll('.video-item.drag-over').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    document.body.classList.remove('is-dragging');
    dragGhost.classList.remove('visible');
    dragGhost.innerHTML = '';
    
    isDragging = false;
    draggedElement = null;
    draggedVideoId = null;
    
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
}

// =========================================================
// VIDEO MANAGEMENT
// =========================================================
function addVideo(url) {
    const videoId = extractVideoId(url.trim());
    
    if (!videoId) {
        showToast('Invalid YouTube URL', 'error');
        return;
    }

    const videoItem = createVideoElement(videoId);
    videoGrid.appendChild(videoItem);
    
    videoCount++;
    updateVideoCount();
    updateEmptyState();
    showToast('Video added successfully', 'success');
    urlInput.value = '';
}

function removeVideo(element) {
    element.style.transform = 'scale(0.8)';
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.remove();
        videoCount--;
        updateVideoCount();
        updateEmptyState();
    }, 200);
}

function updateVideoCount() {
    videoCountEl.textContent = videoCount;
}

function updateEmptyState() {
    if (videoCount === 0) {
        emptyState.classList.add('visible');
    } else {
        emptyState.classList.remove('visible');
    }
}

// =========================================================
// TOAST NOTIFICATIONS
// =========================================================
function showToast(message, type = 'success') {
    document.querySelectorAll('.toast-message').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        ${type === 'success' 
            ? '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
            : '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'}
        ${message}
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =========================================================
// CONTROL EVENT LISTENERS
// =========================================================

// Videos Per Row Controls
decreasePerRow.addEventListener('click', () => {
    if (videosPerRow > 1) {
        videosPerRow--;
        videosPerRowDisplay.textContent = videosPerRow;
        videosPerRowValue.textContent = videosPerRow;
        updateGridLayout();
        triggerSidebarTransparency();
    }
});

increasePerRow.addEventListener('click', () => {
    if (videosPerRow < 10) {
        videosPerRow++;
        videosPerRowDisplay.textContent = videosPerRow;
        videosPerRowValue.textContent = videosPerRow;
        updateGridLayout();
        triggerSidebarTransparency();
    }
});

// Video Size Slider
videoSizeSlider.addEventListener('input', (e) => {
    videoSizePercent = parseInt(e.target.value);
    videoSizeValue.textContent = `${videoSizePercent}%`;
    updateGridLayout();
    triggerSidebarTransparency();
});

// Add Video Button
addVideoBtn.addEventListener('click', () => {
    if (urlInput.value.trim()) {
        addVideo(urlInput.value);
    }
});

// URL Input Enter Key
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && urlInput.value.trim()) {
        addVideo(urlInput.value);
    }
});

// =========================================================
// CLEAR ALL CONFIRMATION MODAL
// =========================================================
function createClearAllModal() {
    const modal = document.createElement('div');
    modal.id = 'clearAllModal';
    modal.className = 'clear-all-modal';
    modal.innerHTML = `
        <div class="clear-all-modal-content">
            <p>Remove all videos?</p>
            <div class="clear-all-modal-buttons">
                <button class="confirm-btn cancel-btn" id="clearAllCancel" aria-label="Cancel">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <button class="confirm-btn remove-btn" id="clearAllConfirm" aria-label="Remove All">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('clearAllCancel').addEventListener('click', hideClearAllConfirmation);
    document.getElementById('clearAllConfirm').addEventListener('click', confirmClearAll);
    
    // Click outside to cancel
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideClearAllConfirmation();
        }
    });
    
    // Escape key to cancel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            hideClearAllConfirmation();
        }
    });
    
    return modal;
}

function showClearAllConfirmation() {
    let modal = document.getElementById('clearAllModal');
    if (!modal) {
        modal = createClearAllModal();
    }
    modal.classList.add('visible');
}

function hideClearAllConfirmation() {
    const modal = document.getElementById('clearAllModal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

function confirmClearAll() {
    hideClearAllConfirmation();
    
    document.querySelectorAll('.video-item').forEach(item => {
        item.style.transform = 'scale(0.8)';
        item.style.opacity = '0';
    });
    
    setTimeout(() => {
        videoGrid.innerHTML = '';
        videoCount = 0;
        updateVideoCount();
        updateEmptyState();
        showToast('All videos cleared', 'success');
    }, 200);
}

// Clear All Videos (updated)
clearAllBtn.addEventListener('click', () => {
    if (videoCount === 0) {
        showToast('No videos to clear', 'error');
        return;
    }
    
    showClearAllConfirmation();
});

// Reset Layout
resetLayoutBtn.addEventListener('click', () => {
    videosPerRow = 2;
    videoSizePercent = 100;
    videosPerRowDisplay.textContent = videosPerRow;
    videosPerRowValue.textContent = videosPerRow;
    videoSizeSlider.value = 100;
    videoSizeValue.textContent = '100%';
    updateGridLayout();
    showToast('Layout reset to default', 'success');
});

// =========================================================
// WINDOW EVENTS
// =========================================================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateGridLayout();
    }, 100);
});

window.addEventListener('blur', () => {
    if (isDragging) {
        cleanupDrag();
    }
});

document.addEventListener('mouseleave', (e) => {
    if (isDragging && (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        cleanupDrag();
    }
});

// =========================================================
// TOUCH SUPPORT FOR MOBILE
// =========================================================
function setupTouchDrag(videoItem) {
    const moveBtn = videoItem.querySelector('.move-btn');
    
    moveBtn.addEventListener('touchstart', (e) => {
        if (videoItem.classList.contains('showing-confirmation')) return;
        e.preventDefault();
        const touch = e.touches[0];
        startDrag({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} }, videoItem);
    }, { passive: false });
}

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    onDragMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    
    const touch = e.changedTouches[0];
    onDragEnd({ clientX: touch.clientX, clientY: touch.clientY });
});

// =========================================================
// INITIALIZATION
// =========================================================
function init() {
    updateEmptyState();
}

init();