document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://tranquil-happiness-9964cd1a40.strapiapp.com/api/assessments';

    const tableBody = document.getElementById('table-body');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('form-modal');
    const form = document.getElementById('assessment-form');
    const formTitle = document.getElementById('form-title');
    const addNewBtn = document.getElementById('add-new-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const assessmentIdInput = document.getElementById('assessment-id');

    const showLoader = () => loader.classList.add('show');
    const hideLoader = () => loader.classList.remove('show');
    const showModal = () => modal.style.display = 'flex';
    const hideModal = () => modal.style.display = 'none';

    const fetchAssessments = async () => {
        showLoader();
        tableBody.innerHTML = '';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${errorData.message || response.statusText}`);
            }
            const result = await response.json();
            console.log(result); // Log the API response
            renderTable(result.data);
        } catch (error) {
            console.error("Failed to fetch assessments:", error);
            tableBody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
        } finally {
            hideLoader();
        }
    };

    const renderTable = (assessments) => {
        assessments.forEach(item => {
            const assessment = item.attributes || item;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${assessment.AssessmentName || 'N/A'}</td>
                <td>${assessment.CourseName || 'N/A'}</td>
                <td>${assessment.TopicName || 'N/A'}</td>
                <td>${assessment.Points || 'N/A'}</td>
                <td>${assessment.Date || 'N/A'}</td>
                <td class="action-buttons">
                    <button class="btn btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn btn-danger" data-id="${item.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const id = assessmentIdInput.value;
        const isUpdating = !!id;

        const assessmentData = {
            AssessmentName: document.getElementById('assessment-name').value,
            CourseName: document.getElementById('course-name').value,
            TopicName: document.getElementById('topic-name').value,
            SprintNumber: parseInt(document.getElementById('sprint-number').value, 10),
            Points: parseInt(document.getElementById('points').value, 10),
            Date: document.getElementById('date').value,
            Description: document.getElementById('description').value,
        };

        const body = JSON.stringify({ data: assessmentData });
        const url = isUpdating ? `${API_URL}/${id}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save: ${errorData.error.message}`);
            }

            hideModal();
            form.reset();
            fetchAssessments();
            alert(`Assessment successfully ${isUpdating ? 'updated' : 'created'}!`);
        } catch (error) {
            console.error("Error saving assessment:", error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) throw new Error('Failed to fetch assessment details.');
            
            const result = await response.json();
            const assessment = result.data.attributes;

            formTitle.textContent = 'Edit Assessment';
            assessmentIdInput.value = result.data.id;

            document.getElementById('assessment-name').value = assessment.AssessmentName;
            document.getElementById('course-name').value = assessment.CourseName;
            document.getElementById('topic-name').value = assessment.TopicName;
            document.getElementById('sprint-number').value = assessment.SprintNumber;
            document.getElementById('points').value = assessment.Points;
            document.getElementById('date').value = assessment.Date;
            document.getElementById('description').value = assessment.Description || '';
            
            showModal();
        } catch (error) {
            console.error("Error preparing edit form:", error);
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this assessment?')) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete the assessment.');

            fetchAssessments();
            alert('Assessment deleted successfully!');
        } catch (error) {
            console.error("Error deleting assessment:", error);
            alert(error.message);
        }
    };

    addNewBtn.addEventListener('click', () => {
        form.reset();
        formTitle.textContent = 'Add Assessment';
        assessmentIdInput.value = '';
        showModal();
    });

    cancelBtn.addEventListener('click', () => hideModal());
    form.addEventListener('submit', handleFormSubmit);

    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
            handleEdit(id);
        } else if (target.classList.contains('btn-danger')) {
            handleDelete(id);
        }
    });

    fetchAssessments();
});