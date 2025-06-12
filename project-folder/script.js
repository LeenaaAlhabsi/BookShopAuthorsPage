document.addEventListener('DOMContentLoaded', () => {
    // API URL for Authors
    const API_URL = 'http://192.168.100.9:1337/api/authors'; 

    // --- AUTHENTICATION SETUP ---
    // PASTE YOUR STRAPI API TOKEN HERE
    const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQ5NjM5MjIzLCJleHAiOjE3NTIyMzEyMjN9.H2CYbpQvWmJGdKs1rs-LlHpY2YbVUdYX73AcW5gGxyA'; 
    
    // Create a headers object to be reused in every API call
    const AUTH_HEADERS = {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    };
    // ----------------------------

    // DOM Elements
    const tableBody = document.getElementById('table-body');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('form-modal');
    const form = document.getElementById('author-form');
    const formTitle = document.getElementById('form-title');
    const addNewBtn = document.getElementById('add-new-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const authorIdInput = document.getElementById('author-id');

    const showLoader = () => loader.classList.add('show');
    const hideLoader = () => loader.classList.remove('show');
    const showModal = () => modal.style.display = 'flex';
    const hideModal = () => modal.style.display = 'none';

    // GET ALL Authors
    const fetchAuthors = async () => {
        showLoader();
        tableBody.innerHTML = '';
        try {
            const response = await fetch(`${API_URL}?populate=*`, {
                method: 'GET',
                headers: AUTH_HEADERS
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${errorData.message || response.statusText}`);
            }
            const result = await response.json();
            renderTable(result.data);
        } catch (error) {
            console.error("Failed to fetch authors:", error);
            tableBody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
        } finally {
            hideLoader();
        }
    };

    // RENDER TABLE for the Author data structure
    const renderTable = (authors) => {
        if (!authors || authors.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">No authors found.</td></tr>`;
            return;
        }
        authors.forEach(author => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Name">${author.Name || 'N/A'}</td>
                <td data-label="Country">${author.CountryOfOrigin || 'N/A'}</td>
                <td data-label="Area of Work">${author.AreaOfWork || 'N/A'}</td>
                <td data-label="Contact">${author.ContactInfo || 'N/A'}</td>
                <td class="action-buttons">
                    <button class="btn btn-edit" data-id="${author.id}">Edit</button>
                    <button class="btn btn-danger" data-id="${author.id}">Delete</button>
                </td>`;
            tableBody.appendChild(row);
        });
    };

    // CREATE (POST) or UPDATE (PUT) an Author
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const id = authorIdInput.value;
        const isUpdating = !!id;

        const authorData = {
            Name: document.getElementById('author-name').value,
            CountryOfOrigin: document.getElementById('country-of-origin').value,
            AreaOfWork: document.getElementById('area-of-work').value,
            ContactInfo: document.getElementById('contact-info').value,
            Biography: document.getElementById('biography').value,
        };

        const body = JSON.stringify({ data: authorData });
        const url = isUpdating ? `${API_URL}/${id}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: AUTH_HEADERS,
                body: body,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save: ${errorData.error.message}`);
            }
            hideModal();
            form.reset();
            fetchAuthors();
            alert(`Author successfully ${isUpdating ? 'updated' : 'created'}!`);
        } catch (error) {
            console.error("Error saving author:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // Prepare form for EDITING
    const handleEdit = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}?populate=*`, {
                method: 'GET',
                headers: AUTH_HEADERS
            });
            if (!response.ok) throw new Error('Failed to fetch author details.');
            
            const result = await response.json();
            const attributes = result.data.attributes;

            formTitle.textContent = 'Edit Author';
            authorIdInput.value = result.data.id;
            document.getElementById('author-name').value = attributes.Name || '';
            document.getElementById('country-of-origin').value = attributes.CountryOfOrigin || '';
            document.getElementById('area-of-work').value = attributes.AreaOfWork || '';
            document.getElementById('contact-info').value = attributes.ContactInfo || '';
            document.getElementById('biography').value = attributes.Biography || '';
            
            showModal();
        } catch (error) {
            console.error("Error preparing edit form:", error);
            alert(error.message);
        }
    };

    // DELETE an Author
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this author?')) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: AUTH_HEADERS
            });
            if (!response.ok) throw new Error('Failed to delete author.');
            fetchAuthors();
            alert('Author deleted successfully!');
        } catch (error) {
            console.error("Error deleting author:", error);
            alert(error.message);
        }
    };
    
    // --- EVENT LISTENERS ---
    addNewBtn.addEventListener('click', () => {
        form.reset();
        formTitle.textContent = 'Add Author';
        authorIdInput.value = '';
        showModal();
    });
    cancelBtn.addEventListener('click', hideModal);
    form.addEventListener('submit', handleFormSubmit);
    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.btn-edit')) handleEdit(target.dataset.id);
        else if (target.matches('.btn-danger')) handleDelete(target.dataset.id);
    });

    // --- INITIALIZATION ---
    fetchAuthors();
});