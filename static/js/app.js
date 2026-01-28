// Application state
let currentView = 'parts';
let currentSearch = '';
let currentFilters = {};

// DOM elements
const viewButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeEventListeners();
    await loadInitialData();
});

// Event listeners
function initializeEventListeners() {
    // Navigation
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewId = e.target.id.replace('view-', '');
            switchView(viewId);
        });
    });

    // Search and filters
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    document.getElementById('clear-search').addEventListener('click', clearSearch);

    // Filter dropdowns
    document.getElementById('bin-filter').addEventListener('change', applyFilters);
    document.getElementById('category-filter').addEventListener('change', applyFilters);

    // Add buttons
    document.getElementById('add-part').addEventListener('click', () => showPartForm());
    document.getElementById('add-bin').addEventListener('click', () => showBinForm());
    document.getElementById('add-category').addEventListener('click', () => showCategoryForm());

    // CSV import/export buttons
    document.getElementById('import-csv').addEventListener('click', triggerCSVImport);
    document.getElementById('export-csv').addEventListener('click', exportCSV);
    document.getElementById('csv-file-input').addEventListener('change', handleCSVImport);

    // Modal
    closeModal.addEventListener('click', hideModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });
}

// Load initial data
async function loadInitialData() {
    try {
        await Promise.all([
            loadParts(),
            loadBins(),
            loadCategories(),
            populateFilters()
        ]);
    } catch (error) {
        showError('Failed to load initial data: ' + error.message);
    }
}

// View switching
function switchView(viewName) {
    currentView = viewName;
    
    // Update navigation buttons
    viewButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    // Update views
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active');
    
    // Load data for the current view
    switch(viewName) {
        case 'parts':
            loadParts();
            break;
        case 'bins':
            loadBins();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// Load and display parts
async function loadParts() {
    try {
        const container = document.getElementById('parts-list');
        container.innerHTML = '<div class="loading">Loading parts...</div>';
        
        const searchParams = {
            ...currentFilters,
            ...(currentSearch && { search: currentSearch })
        };
        
        const parts = await API.getParts(searchParams);
        
        if (parts.length === 0) {
            container.innerHTML = '<div class="empty-state">No parts found</div>';
            return;
        }
        
        container.innerHTML = parts.map(part => `
            <div class="card">
                <h3>${escapeHtml(part.name)}</h3>
                <p><strong>Type:</strong> ${escapeHtml(part.part_type || 'N/A')}</p>
                <p><strong>Description:</strong> ${escapeHtml(part.description || 'N/A')}</p>
                <p><strong>Specifications:</strong> ${escapeHtml(part.specifications || 'N/A')}</p>
                <p><strong>Manufacturer:</strong> ${escapeHtml(part.manufacturer || 'N/A')}</p>
                <p><strong>Model:</strong> ${escapeHtml(part.model || 'N/A')}</p>
                <p><strong>Bin:</strong> Bin ${part.bin.number} ${part.bin.name ? '(' + escapeHtml(part.bin.name) + ')' : ''}</p>
                ${part.category ? `<p><strong>Category:</strong> ${escapeHtml(part.category.name)}</p>` : ''}
                <div class="meta">
                    <span class="quantity">Qty: ${part.quantity}</span>
                    <span class="badge">ID: ${part.id}</span>
                </div>
                <div class="actions">
                    <button class="btn-edit" onclick="editPart(${part.id})">Edit</button>
                    <button class="btn-danger" onclick="deletePart(${part.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('parts-list').innerHTML = 
            `<div class="empty-state">Error loading parts: ${error.message}</div>`;
    }
}

// Load and display bins
async function loadBins() {
    try {
        const container = document.getElementById('bins-list');
        container.innerHTML = '<div class="loading">Loading bins...</div>';
        
        const bins = await API.getBins();
        
        if (bins.length === 0) {
            container.innerHTML = '<div class="empty-state">No bins found</div>';
            return;
        }
        
        container.innerHTML = bins.map(bin => `
            <div class="card">
                <h3>Bin ${bin.number}</h3>
                <p><strong>Description:</strong> ${escapeHtml(bin.description || 'N/A')}</p>
                <p><strong>Location:</strong> ${escapeHtml(bin.location || 'N/A')}</p>
                <div class="meta">
                    <span class="badge">ID: ${bin.id}</span>
                </div>
                <div class="actions">
                    <button class="btn-edit" onclick="editBin(${bin.id})">Edit</button>
                    <button class="btn-danger" onclick="deleteBin(${bin.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('bins-list').innerHTML = 
            `<div class="empty-state">Error loading bins: ${error.message}</div>`;
    }
}

// Load and display categories
async function loadCategories() {
    try {
        const container = document.getElementById('categories-list');
        container.innerHTML = '<div class="loading">Loading categories...</div>';
        
        const categories = await API.getCategories();
        
        if (categories.length === 0) {
            container.innerHTML = '<div class="empty-state">No categories found</div>';
            return;
        }
        
        container.innerHTML = categories.map(category => `
            <div class="card">
                <h3>${escapeHtml(category.name)}</h3>
                <p><strong>Description:</strong> ${escapeHtml(category.description || 'N/A')}</p>
                <div class="meta">
                    <span class="badge">ID: ${category.id}</span>
                </div>
                <div class="actions">
                    <button class="btn-edit" onclick="editCategory(${category.id})">Edit</button>
                    <button class="btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('categories-list').innerHTML = 
            `<div class="empty-state">Error loading categories: ${error.message}</div>`;
    }
}

// Populate filter dropdowns
async function populateFilters() {
    try {
        const [bins, categories] = await Promise.all([
            API.getBins(),
            API.getCategories()
        ]);
        
        // Populate bin filter
        const binFilter = document.getElementById('bin-filter');
        binFilter.innerHTML = '<option value="">All Bins</option>';
        bins.forEach(bin => {
            binFilter.innerHTML += `<option value="${bin.id}">Bin ${bin.number}</option>`;
        });
        
        // Populate category filter
        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    } catch (error) {
        console.error('Failed to populate filters:', error);
    }
}

// Search and filter functions
function performSearch() {
    currentSearch = document.getElementById('search-input').value.trim();
    if (currentView === 'parts') {
        loadParts();
    }
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    currentSearch = '';
    if (currentView === 'parts') {
        loadParts();
    }
}

function applyFilters() {
    const binId = document.getElementById('bin-filter').value;
    const categoryId = document.getElementById('category-filter').value;
    
    currentFilters = {};
    if (binId) currentFilters.bin_id = binId;
    if (categoryId) currentFilters.category_id = categoryId;
    
    if (currentView === 'parts') {
        loadParts();
    }
}

// Modal functions
function showModal() {
    modal.style.display = 'block';
}

function hideModal() {
    modal.style.display = 'none';
    modalBody.innerHTML = '';
}

// Form functions
async function showPartForm(partId = null) {
    try {
        const [bins, categories] = await Promise.all([
            API.getBins(),
            API.getCategories()
        ]);
        
        let part = null;
        if (partId) {
            part = await API.getPart(partId);
        }
        
        modalBody.innerHTML = `
            <h3>${partId ? 'Edit Part' : 'Add New Part'}</h3>
            <form id="part-form">
                <div class="form-group">
                    <label for="part-name">Name *</label>
                    <input type="text" id="part-name" value="${part ? escapeHtml(part.name) : ''}" required>
                </div>
                <div class="form-group">
                    <label for="part-description">Description</label>
                    <textarea id="part-description">${part ? escapeHtml(part.description || '') : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="part-type">Type</label>
                    <input type="text" id="part-type" value="${part ? escapeHtml(part.part_type || '') : ''}">
                </div>
                <div class="form-group">
                    <label for="part-specifications">Specifications</label>
                    <textarea id="part-specifications">${part ? escapeHtml(part.specifications || '') : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="part-manufacturer">Manufacturer</label>
                    <input type="text" id="part-manufacturer" value="${part ? escapeHtml(part.manufacturer || '') : ''}">
                </div>
                <div class="form-group">
                    <label for="part-model">Model</label>
                    <input type="text" id="part-model" value="${part ? escapeHtml(part.model || '') : ''}">
                </div>
                <div class="form-group">
                    <label for="part-quantity">Quantity *</label>
                    <input type="number" id="part-quantity" value="${part ? part.quantity : 1}" min="0" required>
                </div>
                <div class="form-group">
                    <label for="part-bin">Bin *</label>
                    <select id="part-bin" required>
                        <option value="">Select a bin...</option>
                        ${bins.map(bin => `
                            <option value="${bin.id}" ${part && part.bin_id === bin.id ? 'selected' : ''}>
                                Bin ${bin.number} ${bin.name ? '(' + bin.name + ')' : ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="part-category">Category</label>
                    <select id="part-category">
                        <option value="">No category</option>
                        ${categories.map(category => `
                            <option value="${category.id}" ${part && part.category_id === category.id ? 'selected' : ''}>
                                ${category.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                    <button type="submit" class="btn-primary">${partId ? 'Update' : 'Create'}</button>
                </div>
            </form>
        `;
        
        document.getElementById('part-form').addEventListener('submit', (e) => {
            e.preventDefault();
            savePart(partId);
        });
        
        showModal();
    } catch (error) {
        showError('Failed to load form data: ' + error.message);
    }
}

async function showBinForm(binId = null) {
    let bin = null;
    if (binId) {
        try {
            bin = await API.getBin(binId);
        } catch (error) {
            showError('Failed to load bin data: ' + error.message);
            return;
        }
    }
    
    modalBody.innerHTML = `
        <h3>${binId ? 'Edit Bin' : 'Add New Bin'}</h3>
        <form id="bin-form">
            <div class="form-group">
                <label for="bin-number">Bin Number *</label>
                <input type="number" id="bin-number" value="${bin ? bin.number : ''}" required ${binId ? 'readonly' : ''}>
            </div>
            <div class="form-group">
                <label for="bin-description">Description</label>
                <textarea id="bin-description">${bin ? escapeHtml(bin.description || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="bin-location">Location</label>
                <input type="text" id="bin-location" value="${bin ? escapeHtml(bin.location || '') : ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">${binId ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    
    document.getElementById('bin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBin(binId);
    });
    
    showModal();
}

async function showCategoryForm(categoryId = null) {
    let category = null;
    if (categoryId) {
        try {
            category = await API.getCategory(categoryId);
        } catch (error) {
            showError('Failed to load category data: ' + error.message);
            return;
        }
    }
    
    modalBody.innerHTML = `
        <h3>${categoryId ? 'Edit Category' : 'Add New Category'}</h3>
        <form id="category-form">
            <div class="form-group">
                <label for="category-name">Name *</label>
                <input type="text" id="category-name" value="${category ? escapeHtml(category.name) : ''}" required>
            </div>
            <div class="form-group">
                <label for="category-description">Description</label>
                <textarea id="category-description">${category ? escapeHtml(category.description || '') : ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">${categoryId ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    
    document.getElementById('category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCategory(categoryId);
    });
    
    showModal();
}

// Save functions
async function savePart(partId = null) {
    try {
        const formData = {
            name: document.getElementById('part-name').value.trim(),
            description: document.getElementById('part-description').value.trim() || null,
            part_type: document.getElementById('part-type').value.trim() || null,
            specifications: document.getElementById('part-specifications').value.trim() || null,
            manufacturer: document.getElementById('part-manufacturer').value.trim() || null,
            model: document.getElementById('part-model').value.trim() || null,
            quantity: parseInt(document.getElementById('part-quantity').value),
            bin_id: parseInt(document.getElementById('part-bin').value),
            category_id: document.getElementById('part-category').value ? parseInt(document.getElementById('part-category').value) : null,
        };
        
        if (partId) {
            await API.updatePart(partId, formData);
            showSuccess('Part updated successfully');
        } else {
            await API.createPart(formData);
            showSuccess('Part created successfully');
        }
        
        hideModal();
        loadParts();
        populateFilters();
    } catch (error) {
        showError('Failed to save part: ' + error.message);
    }
}

async function saveBin(binId = null) {
    try {
        const formData = {
            description: document.getElementById('bin-description').value.trim() || null,
            location: document.getElementById('bin-location').value.trim() || null,
        };
        
        if (!binId) {
            formData.number = parseInt(document.getElementById('bin-number').value);
        }
        
        if (binId) {
            await API.updateBin(binId, formData);
            showSuccess('Bin updated successfully');
        } else {
            await API.createBin(formData);
            showSuccess('Bin created successfully');
        }
        
        hideModal();
        loadBins();
        populateFilters();
    } catch (error) {
        showError('Failed to save bin: ' + error.message);
    }
}

async function saveCategory(categoryId = null) {
    try {
        const formData = {
            name: document.getElementById('category-name').value.trim(),
            description: document.getElementById('category-description').value.trim() || null,
        };
        
        if (categoryId) {
            await API.updateCategory(categoryId, formData);
            showSuccess('Category updated successfully');
        } else {
            await API.createCategory(formData);
            showSuccess('Category created successfully');
        }
        
        hideModal();
        loadCategories();
        populateFilters();
    } catch (error) {
        showError('Failed to save category: ' + error.message);
    }
}

// Edit functions (called from HTML)
function editPart(partId) {
    showPartForm(partId);
}

function editBin(binId) {
    showBinForm(binId);
}

function editCategory(categoryId) {
    showCategoryForm(categoryId);
}

// Delete functions (called from HTML)
async function deletePart(partId) {
    showConfirmModal(
        'Are you sure you want to delete this part? This action cannot be undone.',
        async () => {
            try {
                await API.deletePart(partId);
                showSuccess('Part deleted successfully');
                loadParts();
            } catch (error) {
                showError('Failed to delete part: ' + error.message);
            }
        }
    );
}

async function deleteBin(binId) {
    showConfirmModal(
        'Are you sure you want to delete this bin? This will also delete all parts in this bin. This action cannot be undone.',
        async () => {
            try {
                await API.deleteBin(binId);
                showSuccess('Bin deleted successfully');
                loadBins();
                populateFilters();
            } catch (error) {
                showError('Failed to delete bin: ' + error.message);
            }
        }
    );
}

async function deleteCategory(categoryId) {
    showConfirmModal(
        'Are you sure you want to delete this category? This action cannot be undone.',
        async () => {
            try {
                await API.deleteCategory(categoryId);
                showSuccess('Category deleted successfully');
                loadCategories();
                populateFilters();
            } catch (error) {
                showError('Failed to delete category: ' + error.message);
            }
        }
    );
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    showFlashMessage(message, 'success');
}

function showFlashMessage(message, type = 'info', duration = 5000) {
    const container = document.getElementById('flash-messages');
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    flashMessage.innerHTML = `
        <span class="flash-icon">${icons[type] || icons.info}</span>
        <span class="flash-text">${message}</span>
        <button class="flash-close">×</button>
        <div class="flash-progress"></div>
    `;
    
    container.appendChild(flashMessage);
    
    // Auto-remove after duration
    const timer = setTimeout(() => {
        removeFlashMessage(flashMessage);
    }, duration);
    
    // Click to dismiss
    flashMessage.addEventListener('click', () => {
        clearTimeout(timer);
        removeFlashMessage(flashMessage);
    });
    
    // Close button
    const closeBtn = flashMessage.querySelector('.flash-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(timer);
        removeFlashMessage(flashMessage);
    });
}

function removeFlashMessage(flashMessage) {
    flashMessage.classList.add('slide-out');
    setTimeout(() => {
        if (flashMessage.parentNode) {
            flashMessage.parentNode.removeChild(flashMessage);
        }
    }, 300);
}

// CSV Import/Export functions
function triggerCSVImport() {
    document.getElementById('csv-file-input').click();
}

async function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
        showError('Please select a CSV file');
        return;
    }

    try {
        showLoading('Importing CSV...');
        const result = await API.importCSV(file);
        
        hideLoading();
        
        // Show results with appropriate message type
        if (result.errors && result.errors.length > 0) {
            // Show warning for partial import
            let message = result.message;
            if (result.errors.length <= 3) {
                message += '\n\nErrors encountered:\n' + result.errors.join('\n');
            } else {
                message += `\n\n${result.errors.length} errors encountered. First few:\n` + result.errors.slice(0, 3).join('\n');
            }
            showFlashMessage(message, 'warning', 10000);
        } else {
            // Show success for complete import
            let message = result.message;
            if (result.created_parts && result.created_parts.length > 0) {
                message += ` (${result.created_parts.length} parts imported)`;
            }
            showSuccess(message);
        }
        
        // Refresh the current view if we're on parts
        if (currentView === 'parts') {
            await loadParts();
        }
        
        // Clear the file input
        event.target.value = '';
        
    } catch (error) {
        hideLoading();
        showError('Import failed: ' + error.message);
    }
}

async function exportCSV() {
    try {
        showLoading('Exporting CSV...');
        const blob = await API.exportCSV();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parts_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        hideLoading();
        showSuccess('CSV export completed');
        
    } catch (error) {
        hideLoading();
        showError('Export failed: ' + error.message);
    }
}

function showLoading(message) {
    // Simple loading indicator - could be enhanced
    const loadingEl = document.createElement('div');
    loadingEl.id = 'loading-indicator';
    loadingEl.innerHTML = `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000;">${message}</div>`;
    document.body.appendChild(loadingEl);
}

function hideLoading() {
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) {
        loadingEl.remove();
    }
}

function showError(message) {
    showFlashMessage(message, 'error', 8000); // Show errors longer
}

// Custom confirmation modal
function showConfirmModal(message, onConfirm, onCancel = null) {
    // Create modal if it doesn't exist
    let confirmModal = document.getElementById('confirm-modal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'confirm-modal';
        confirmModal.className = 'confirm-modal';
        confirmModal.innerHTML = `
            <div class="confirm-modal-content">
                <h3>Confirm Action</h3>
                <p id="confirm-message"></p>
                <div class="button-group">
                    <button id="confirm-yes" class="btn-confirm">Yes</button>
                    <button id="confirm-no" class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
    }
    
    // Update message
    document.getElementById('confirm-message').textContent = message;
    
    // Show modal
    confirmModal.style.display = 'block';
    
    // Handle confirmation
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');
    
    // Remove existing listeners
    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);
    
    // Add new listeners
    newYesBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        if (onConfirm) onConfirm();
    });
    
    newNoBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        if (onCancel) onCancel();
    });
    
    // Close on outside click
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.style.display = 'none';
            if (onCancel) onCancel();
        }
    });
}