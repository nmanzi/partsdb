// Application state
let currentView = 'parts';
let currentSearch = '';
let currentFilters = {};
let currentParts = []; // Store loaded parts for sorting
let currentBins = []; // Store loaded bins for sorting
let sortColumn = null;
let sortDirection = 'asc';
let binsSortColumn = null;
let binsSortDirection = 'asc';

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

    // Table sorting - Parts
    document.querySelectorAll('#parts-table th.sortable').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.currentTarget.getAttribute('data-sort');
            handleSort(column);
        });
    });
    
    // Table sorting - Bins
    document.querySelectorAll('#bins-table th.sortable').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.currentTarget.getAttribute('data-sort');
            handleBinsSort(column);
        });
    });

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
        const tbody = document.getElementById('parts-list');
        tbody.innerHTML = '<tr><td colspan="9" class="loading">Loading parts...</td></tr>';
        
        const searchParams = {
            ...currentFilters,
            ...(currentSearch && { search: currentSearch })
        };
        
        console.log('Loading parts with params:', searchParams); // Debug log
        
        currentParts = await API.getParts(searchParams);
        
        if (currentParts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No parts found</td></tr>';
            return;
        }
        
        // Apply current sort if any
        if (sortColumn) {
            sortArray(currentParts, sortColumn, sortDirection, getPartValue);
        }
        
        renderParts();
    } catch (error) {
        document.getElementById('parts-list').innerHTML = 
            `<tr><td colspan="9" class="empty-state">Error loading parts: ${error.message}</td></tr>`;
    }
}

// Render parts table
function renderParts() {
    const tbody = document.getElementById('parts-list');
    
    tbody.innerHTML = currentParts.map(part => {
        const binText = `${part.bin.number}`;
        const categoriesText = part.categories && part.categories.length > 0 
            ? part.categories.map(cat => escapeHtml(cat.name)).join(', ') 
            : '-';
        
        return `
            <tr>
                <td class="cell-name">${escapeHtml(part.name)}</td>
                <td class="cell-quantity">${part.quantity}</td>
                <td>${escapeHtml(part.part_type || '-')}</td>
                <td class="cell-specs">${escapeHtml(part.specifications || '-')}</td>
                <td>${escapeHtml(part.manufacturer || '-')}</td>
                <td>${escapeHtml(part.model || '-')}</td>
                <td>${binText}</td>
                <td class="cell-categories">${categoriesText}</td>
                <td class="cell-actions">
                    <button class="btn-edit" onclick="editPart(${part.id})" title="Edit">Edit</button>
                    <button class="btn-danger" onclick="deletePart(${part.id})" title="Delete">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Handle sorting
function handleSort(column) {
    if (sortColumn === column) {
        // Toggle direction if clicking same column
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, default to ascending
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    sortArray(currentParts, column, sortDirection, getPartValue);
    renderParts();
    updateTableSortIndicators('#parts-table', sortColumn, sortDirection);
}

// Generic array sorting function
function sortArray(array, column, direction, valueExtractor) {
    array.sort((a, b) => {
        const aVal = valueExtractor(a, column);
        const bVal = valueExtractor(b, column);
        
        // Handle numeric vs string comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
            const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            return direction === 'asc' ? comparison : -comparison;
        }
    });
}

// Extract value from part based on column
function getPartValue(part, column) {
    switch(column) {
        case 'name':
            return part.name || '';
        case 'quantity':
            return part.quantity || 0;
        case 'part_type':
            return part.part_type || '';
        case 'specifications':
            return part.specifications || '';
        case 'manufacturer':
            return part.manufacturer || '';
        case 'model':
            return part.model || '';
        case 'bin':
            return part.bin.number || 0;
        default:
            return '';
    }
}

// Extract value from bin based on column
function getBinValue(bin, column) {
    switch(column) {
        case 'number':
            return bin.number || 0;
        case 'location':
            return bin.location || '';
        case 'part_count':
            return bin.part_count || 0;
        default:
            return '';
    }
}

// Update table sort indicators in headers
function updateTableSortIndicators(tableSelector, column, direction) {
    // Clear all indicators for this table
    document.querySelectorAll(`${tableSelector} th.sortable`).forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        indicator.textContent = '';
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Add indicator to current sort column
    if (column) {
        const header = document.querySelector(`${tableSelector} th[data-sort="${column}"]`);
        if (header) {
            const indicator = header.querySelector('.sort-indicator');
            indicator.textContent = direction === 'asc' ? '▲' : '▼';
            header.classList.add(`sorted-${direction}`);
        }
    }
}

// Load and display bins
async function loadBins() {
    try {
        const tbody = document.getElementById('bins-list');
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading bins...</td></tr>';
        
        currentBins = await API.getBins();
        
        // Get all parts to calculate part counts per bin
        const allParts = await API.getParts();
        
        // Calculate part count for each bin
        currentBins = currentBins.map(bin => ({
            ...bin,
            part_count: allParts.filter(part => part.bin_id === bin.id).length
        }));
        
        if (currentBins.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No bins found</td></tr>';
            return;
        }
        
        // Apply current sort if any
        if (binsSortColumn) {
            sortArray(currentBins, binsSortColumn, binsSortDirection, getBinValue);
        }
        
        renderBins();
    } catch (error) {
        document.getElementById('bins-list').innerHTML = 
            `<tr><td colspan="5" class="empty-state">Error loading bins: ${error.message}</td></tr>`;
    }
}

// Render bins table
function renderBins() {
    const tbody = document.getElementById('bins-list');
    
    tbody.innerHTML = currentBins.map(bin => `
        <tr>
            <td class="cell-bin-number">${bin.number}</td>
            <td>${escapeHtml(bin.location || '-')}</td>
            <td class="cell-part-count">
                ${bin.part_count > 0
                    ? `<a class="part-count-link" href="#" onclick="filterPartsByBin(${bin.id}); return false;" title="View parts in Bin ${bin.number}">${bin.part_count}</a>`
                    : '0'
                }
            </td>
            <td class="cell-size">${escapeHtml(bin.size || '-')}</td>
            <td class="cell-actions">
                <button class="btn-edit" onclick="editBin(${bin.id})" title="Edit">Edit</button>
                <button class="btn-danger" onclick="deleteBin(${bin.id})" title="Delete">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Navigate to the parts view filtered by a specific bin
function filterPartsByBin(binId) {
    document.getElementById('bin-filter').value = binId;
    currentFilters = { bin_id: binId };
    switchView('parts');
}

// Handle bins sorting
function handleBinsSort(column) {
    if (binsSortColumn === column) {
        // Toggle direction if clicking same column
        binsSortDirection = binsSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, default to ascending
        binsSortColumn = column;
        binsSortDirection = 'asc';
    }
    
    sortArray(currentBins, column, binsSortDirection, getBinValue);
    renderBins();
    updateTableSortIndicators('#bins-table', binsSortColumn, binsSortDirection);
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
    if (categoryId) currentFilters.category_ids = [categoryId];
    
    console.log('Applying filters:', currentFilters); // Debug log
    
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
                    <label for="part-categories">Categories</label>
                    <div class="multi-select-container">
                        <div class="multi-select-display" id="categories-display" onclick="toggleCategoriesDropdown()">
                            <span id="categories-text">Select categories...</span>
                            <span class="dropdown-arrow">▼</span>
                        </div>
                        <div class="multi-select-options" id="categories-options" style="display: none;">
                            ${categories.map(category => {
                                const isSelected = part && part.categories && part.categories.some(c => c.id === category.id);
                                return `
                                    <label class="checkbox-option">
                                        <input type="checkbox" value="${category.id}" ${isSelected ? 'checked' : ''} onchange="updateCategoriesDisplay()">
                                        <span>${escapeHtml(category.name)}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
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
        
        // Initialize categories display
        updateCategoriesDisplay();
        
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
                <label for="bin-size">Size</label>
                <span class="form-help">e.g. "Small", "Medium", "Large"</span>
                <input type="text" id="bin-size" value="${bin ? escapeHtml(bin.size || '') : ''}">
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
        // Get selected category IDs
        const categoryCheckboxes = document.querySelectorAll('#categories-options input[type="checkbox"]:checked');
        const categoryIds = Array.from(categoryCheckboxes).map(cb => parseInt(cb.value));
        
        const formData = {
            name: document.getElementById('part-name').value.trim(),
            description: document.getElementById('part-description').value.trim() || null,
            part_type: document.getElementById('part-type').value.trim() || null,
            specifications: document.getElementById('part-specifications').value.trim() || null,
            manufacturer: document.getElementById('part-manufacturer').value.trim() || null,
            model: document.getElementById('part-model').value.trim() || null,
            quantity: parseInt(document.getElementById('part-quantity').value),
            bin_id: parseInt(document.getElementById('part-bin').value),
            category_ids: categoryIds,
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

// Multi-select category functions
function toggleCategoriesDropdown() {
    const dropdown = document.getElementById('categories-options');
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    
    // Close dropdown when clicking outside
    if (!isVisible) {
        setTimeout(() => {
            document.addEventListener('click', closeCategoriesDropdown);
        }, 0);
    }
}

function closeCategoriesDropdown(event) {
    const dropdown = document.getElementById('categories-options');
    const display = document.getElementById('categories-display');
    
    if (dropdown && display && !dropdown.contains(event.target) && !display.contains(event.target)) {
        dropdown.style.display = 'none';
        document.removeEventListener('click', closeCategoriesDropdown);
    }
}

function updateCategoriesDisplay() {
    const checkboxes = document.querySelectorAll('#categories-options input[type="checkbox"]');
    const selectedCategories = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const label = checkbox.nextElementSibling.textContent;
            selectedCategories.push(label);
        }
    });
    
    const displayText = selectedCategories.length > 0 
        ? selectedCategories.join(', ')
        : 'Select categories...';
    
    document.getElementById('categories-text').textContent = displayText;
}