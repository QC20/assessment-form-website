// script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const loadingMessage = document.getElementById('loadingMessage');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    function generateUniqueId() {
        return 'P' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    // Show/hide "Other" text inputs
    function setupOtherField(selectId) {
        const sel = document.getElementById(selectId);
        const otherContainer = document.getElementById(selectId + '-other-container');
        const otherInput = otherContainer.querySelector('input');
        
        // Initialize on page load in case "Other" is selected
        if (sel.value === 'other') {
            otherContainer.style.display = 'block';
            otherInput.setAttribute('required', 'required');
        }
        
        sel.addEventListener('change', () => {
            if (sel.value === 'other') {
                otherContainer.style.display = 'block';
                otherInput.setAttribute('required', 'required');
            } else {
                otherContainer.style.display = 'none';
                otherInput.removeAttribute('required');
                otherInput.value = '';
            }
        });
    }

    // Initialize each "Other" field
    ['gender', 'industry', 'org_size', 'education'].forEach(id => {
        if (document.getElementById(id)) {
            setupOtherField(id);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        loadingMessage.style.display = 'block';
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
            // Handle "Other" fields by combining them with their parent fields
            if (key.endsWith('-other')) {
                const parentKey = key.replace('-other', '');
                if (jsonData[parentKey] === 'other') {
                    jsonData[parentKey] = value;
                }
            } else if (!key.endsWith('-other')) {
                jsonData[key] = value;
            }
        });
        
        jsonData.timestamp = new Date().toISOString();
        
        // Convert to URL encoded form data for Google Sheets
        const formDataUrl = new URLSearchParams();
        Object.keys(jsonData).forEach(key => {
            formDataUrl.append(key, jsonData[key]);
        });
        
        // Replace this URL with the one from your Google Script deployment
        const googleScriptUrl = 'https://script.google.com/macros/library/d/1t9a-vvDoTB9aQBLtNobJRhwFgcKnUWoEn9_pMzrBtkCoUDDQsivstqNE/1';
        
        fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Important for CORS issues
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formDataUrl
        })
        .then(() => {
            // We can't actually read the response due to no-cors mode
            // So we just assume success after a delay
            setTimeout(() => {
                loadingMessage.style.display = 'none';
                successMessage.style.display = 'block';
                form.reset();
                successMessage.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);
            loadingMessage.style.display = 'none';
            errorMessage.style.display = 'block';
            
            // For local testing fallback
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Data would be sent to Google Sheets:', jsonData);
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
                form.reset();
            }
        });
    });
});