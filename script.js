// updated-script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const loadingMessage = document.getElementById('loadingMessage');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    function generateUniqueId() {
        return 'P' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    // Initialize AI tools field visibility based on initial selection
    function initAIToolsField() {
        const selectedOption = document.querySelector('input[name="ai_frequency"]:checked');
        const aiToolsField = document.getElementById('aiToolsField');
        const aiToolsInput = document.getElementById('ai_tools_specific');
        
        if (selectedOption && selectedOption.value !== 'never') {
            aiToolsField.style.display = 'block';
            aiToolsInput.required = true;
        } else {
            aiToolsField.style.display = 'none';
            aiToolsInput.required = false;
        }
    }

    // Show/hide AI tools field based on frequency selection
    function toggleAIToolsField(radio) {
        const aiToolsField = document.getElementById('aiToolsField');
        const aiToolsInput = document.getElementById('ai_tools_specific');
        
        if (radio.value !== 'never') {
            aiToolsField.style.display = 'block';
            aiToolsInput.required = true;
        } else {
            aiToolsField.style.display = 'none';
            aiToolsInput.required = false;
            aiToolsInput.value = '';
        }
    }

    // Set up event listeners for AI frequency radio buttons
    function setupAIFrequencyListeners() {
        const frequencyRadios = document.querySelectorAll('input[name="ai_frequency"]');
        frequencyRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                toggleAIToolsField(this);
            });
        });
    }

    // Show/hide "Other" text inputs for both select elements and checkboxes
    function setupOtherField(elementId, isCheckbox = false) {
        const element = document.getElementById(elementId);
        if (!element) return; // Skip if element doesn't exist
        
        const otherContainer = document.getElementById(elementId + '-other-container');
        if (!otherContainer) return; // Skip if container doesn't exist
        
        const otherInput = document.getElementById(elementId + '_other_specify') || 
                           otherContainer.querySelector('input');
        if (!otherInput) return; // Skip if input doesn't exist
        
        if (isCheckbox) {
            // For checkboxes
            element.addEventListener('change', () => {
                if (element.checked) {
                    otherContainer.style.display = 'block';
                    otherInput.setAttribute('required', 'required');
                } else {
                    otherContainer.style.display = 'none';
                    otherInput.removeAttribute('required');
                    otherInput.value = '';
                }
            });
            
            // Initialize on page load
            if (element.checked) {
                otherContainer.style.display = 'block';
                otherInput.setAttribute('required', 'required');
            }
        } else {
            // For select dropdowns
            element.addEventListener('change', () => {
                if (element.value === 'other') {
                    otherContainer.style.display = 'block';
                    otherInput.setAttribute('required', 'required');
                } else {
                    otherContainer.style.display = 'none';
                    otherInput.removeAttribute('required');
                    otherInput.value = '';
                }
            });
            
            // Initialize on page load
            if (element.value === 'other') {
                otherContainer.style.display = 'block';
                otherInput.setAttribute('required', 'required');
            }
        }
    }
    
    // Set up event listeners for specific checkbox "Other" fields
    function setupCheckboxOther(checkboxId, otherSpecifyId) {
        const checkbox = document.getElementById(checkboxId);
        const otherSpecify = document.getElementById(otherSpecifyId);
        
        if (!checkbox || !otherSpecify) return; // Skip if elements don't exist
        
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                otherSpecify.style.display = 'inline-block';
                otherSpecify.parentElement.style.display = 'flex';
            } else {
                otherSpecify.style.display = 'none';
                otherSpecify.value = '';
            }
        });
        
        // Initialize on page load
        if (checkbox.checked) {
            otherSpecify.style.display = 'inline-block';
            otherSpecify.parentElement.style.display = 'flex';
        } else {
            otherSpecify.style.display = 'none';
        }
    }

    // Initialize the original "Other" fields
    ['gender', 'industry', 'org_size', 'education'].forEach(id => {
        setupOtherField(id);
    });
    
    // Initialize new checkbox "Other" fields
    setupCheckboxOther('ai_task_other', 'ai_task_other_specify');
    setupCheckboxOther('ai_value_other', 'ai_value_other_specify');
    
    // Handle checkbox validation for "Select up to two" fields
    function setupLimitedCheckboxes(name, maxAllowed) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
                
                if (checked.length > maxAllowed) {
                    checkbox.checked = false;
                    alert(`Please select up to ${maxAllowed} options.`);
                }
            });
        });
    }
    
    // Set up the "Select up to two" validation for AI applications
    setupLimitedCheckboxes('ai_value_applications', 2);

    // Initialize AI tools field functionality
    setupAIFrequencyListeners();
    initAIToolsField();

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        loadingMessage.style.display = 'block';
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        const formData = new FormData(form);
        const jsonData = {};
        
        // Collect checkbox values into arrays
        const checkboxGroups = {};
        
        formData.forEach((value, key) => {
            // Handle checkboxes (they can have multiple values for same name)
            if (key === 'ai_tasks' || key === 'ai_value_applications') {
                if (!checkboxGroups[key]) {
                    checkboxGroups[key] = [];
                }
                checkboxGroups[key].push(value);
            }
            // Handle "Other" fields
            else if (key.endsWith('-other')) {
                const parentKey = key.replace('-other', '');
                if (jsonData[parentKey] === 'other') {
                    jsonData[parentKey] = value;
                }
            } 
            // Handle the new "Other specify" fields for checkboxes
            else if (key === 'ai_task_other_specify' && formData.get('ai_tasks') && formData.getAll('ai_tasks').includes('other')) {
                // This will be added with the checkboxGroups later
            } 
            else if (key === 'ai_value_other_specify' && formData.get('ai_value_applications') && formData.getAll('ai_value_applications').includes('other')) {
                // This will be added with the checkboxGroups later
            }
            // Handle AI tools specific field
            else if (key === 'ai_tools_specific') {
                // Only include if frequency is not "never"
                const frequency = formData.get('ai_frequency');
                if (frequency && frequency !== 'never') {
                    jsonData[key] = value;
                }
            }
            // Regular fields
            else if (!key.endsWith('-other')) {
                jsonData[key] = value;
            }
        });
        
        // Add special handling for checkbox groups
        Object.keys(checkboxGroups).forEach(key => {
            // Convert to JSON string to preserve the array
            jsonData[key] = JSON.stringify(checkboxGroups[key]);
            
            // Special handling for "other" checkboxes
            if (key === 'ai_tasks' && checkboxGroups[key].includes('other')) {
                jsonData['ai_task_other_value'] = formData.get('ai_task_other_specify');
            }
            if (key === 'ai_value_applications' && checkboxGroups[key].includes('other')) {
                jsonData['ai_value_other_value'] = formData.get('ai_value_other_specify');
            }
        });
        
        jsonData.timestamp = new Date().toISOString();
        jsonData.participant_id = generateUniqueId();
        
        // Convert to URL encoded form data for Google Sheets
        const formDataUrl = new URLSearchParams();
        Object.keys(jsonData).forEach(key => {
            formDataUrl.append(key, jsonData[key]);
        });
        
        // Replace this URL with the one from your Google Script deployment
        const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbwskHFT99xWppPdaSLCypO3C6BPm_GP7zEFzh9lcHQkE6Hx0gTSO_-ypvmnrgeiJRpe/exec';
        
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