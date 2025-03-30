// Main JavaScript for MyInsta Download

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const downloadForm = document.getElementById('downloadForm');
  const instagramUrlInput = document.getElementById('instagramUrl');
  const downloadBtn = document.getElementById('downloadBtn');
  const btnText = document.getElementById('btnText');
  const loadingIcon = document.getElementById('loadingIcon');
  const urlError = document.getElementById('urlError');
  const previewSection = document.getElementById('previewSection');
  const previewContainer = document.getElementById('previewContainer');
  const downloadAllBtn = document.getElementById('downloadAllBtn');
  const dmcaLink = document.getElementById('dmcaLink');
  const dmcaModal = document.getElementById('dmcaModal');
  const dmcaCloseBtn = document.getElementById('dmcaCloseBtn');
  const dmcaForm = document.getElementById('dmcaForm');
  
  // Instagram URL validation regex
  const instagramUrlRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[^/?#&]+/i;
  
  // Handle download form submission
  downloadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const url = instagramUrlInput.value.trim();
    
    // Validate URL
    if (!instagramUrlRegex.test(url)) {
      showError('Please enter a valid Instagram URL');
      return;
    }
    
    // Clear any previous errors
    hideError();
    
    // Show loading state
    setLoadingState(true);
    
    try {
      // Make API request to the server
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to download content');
      }
      
      // Show success animation
      downloadBtn.classList.add('success-pulse');
      setTimeout(() => {
        downloadBtn.classList.remove('success-pulse');
      }, 1500);
      
      // Display preview
      displayPreview(data.data);
      
    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Something went wrong. Please try again.');
    } finally {
      // Reset loading state
      setLoadingState(false);
    }
  });
  
  // Display preview of content
  function displayPreview(data) {
    // Clear previous previews
    previewContainer.innerHTML = '';
    
    // Create preview elements based on content type
    if (data.media && data.media.length > 0) {
      data.media.forEach((item, index) => {
        const mediaCard = document.createElement('div');
        mediaCard.className = 'preview-card bg-gray-900 rounded-lg overflow-hidden w-full max-w-md';
        
        let mediaElement = '';
        
        if (item.type === 'video') {
          // Video preview
          mediaElement = `
            <div class="relative media-content">
              <video controls poster="${item.thumbnail || ''}" class="w-full">
                <source src="${item.url}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          `;
        } else {
          // Image preview
          mediaElement = `
            <div class="media-content">
              <img src="${item.url}" alt="Instagram content" class="w-full">
            </div>
          `;
        }
        
        // Add metadata if available
        let metadataElement = '';
        if (data.metadata) {
          const { username, caption } = data.metadata;
          metadataElement = `
            <div class="p-4 border-t border-gray-800">
              ${username ? `<p class="font-semibold text-accent">${username}</p>` : ''}
              ${caption ? `<p class="text-gray-300 text-sm mt-1">${caption}</p>` : ''}
            </div>
          `;
        }
        
        // Download button for individual item
        const downloadButton = `
          <div class="p-4 bg-gray-900">
            <button 
              class="download-single-btn w-full bg-accent hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              data-url="${item.url}"
              data-type="${item.type}"
              data-index="${index}"
            >
              Download ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </button>
          </div>
        `;
        
        mediaCard.innerHTML = mediaElement + metadataElement + downloadButton;
        
        // Add event listener to the download button
        setTimeout(() => {
          const downloadBtn = mediaCard.querySelector('.download-single-btn');
          if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
              downloadMedia(item.url, `instagram-${item.type}-${index}.${item.type === 'video' ? 'mp4' : 'jpg'}`);
            });
          }
        }, 0);
        
        previewContainer.appendChild(mediaCard);
      });
      
      // Show the preview section
      previewSection.classList.remove('hidden');
      
      // Scroll to preview section
      previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Add event listener to "Download All" button
      downloadAllBtn.addEventListener('click', function() {
        data.media.forEach((item, index) => {
          const extension = item.type === 'video' ? 'mp4' : 'jpg';
          downloadMedia(item.url, `instagram-${item.type}-${index}.${extension}`);
        });
      });
    } else {
      // No media found
      previewContainer.innerHTML = `
        <div class="text-center p-6">
          <p class="text-gray-400">No downloadable content found. Make sure the URL is correct and the content is from a public account.</p>
        </div>
      `;
      previewSection.classList.remove('hidden');
    }
  }
  
  // Function to download media
  function downloadMedia(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  }
  
  // Set loading state
  function setLoadingState(isLoading) {
    if (isLoading) {
      btnText.textContent = 'Downloading...';
      loadingIcon.classList.remove('hidden');
      downloadBtn.disabled = true;
    } else {
      btnText.textContent = 'Download';
      loadingIcon.classList.add('hidden');
      downloadBtn.disabled = false;
    }
  }
  
  // Show error message
  function showError(message) {
    urlError.textContent = message;
    urlError.classList.remove('hidden');
    instagramUrlInput.classList.add('shake');
    instagramUrlInput.classList.add('border-red-500');
    
    // Remove shake animation after it completes
    setTimeout(() => {
      instagramUrlInput.classList.remove('shake');
    }, 500);
  }
  
  // Hide error message
  function hideError() {
    urlError.classList.add('hidden');
    instagramUrlInput.classList.remove('border-red-500');
  }
  
  // Reset form when input changes
  instagramUrlInput.addEventListener('input', hideError);
  
  // DMCA Modal functionality
  dmcaLink.addEventListener('click', function(e) {
    e.preventDefault();
    dmcaModal.classList.remove('hidden');
  });
  
  dmcaCloseBtn.addEventListener('click', function() {
    dmcaModal.classList.add('hidden');
  });
  
  // Close modal when clicking outside of it
  dmcaModal.addEventListener('click', function(e) {
    if (e.target === dmcaModal) {
      dmcaModal.classList.add('hidden');
    }
  });
  
  // Handle DMCA form submission
  dmcaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // In a real implementation, you would send this data to the server
    // For now, just show an alert and close the modal
    alert('Thank you for your submission. We will review your request.');
    dmcaModal.classList.add('hidden');
  });
  
  // Add particles animation when loading
  function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    
    // Create particles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random positioning
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 1.5}s`;
      
      particlesContainer.appendChild(particle);
    }
    
    return particlesContainer;
  }
  
  // Add particles when loading
  const originalBtnContent = downloadBtn.innerHTML;
  downloadBtn.addEventListener('mouseenter', function() {
    if (!downloadBtn.disabled) {
      downloadBtn.classList.add('hover:shadow-lg');
    }
  });
}); 