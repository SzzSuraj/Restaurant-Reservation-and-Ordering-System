const tableList = document.getElementById('table-list');
const socket = io();
// Fetch and display tables
async function fetchTables() {
    try {
        const response = await fetch('/api/tables'); // Fetch tables from the backend
        const tables = await response.json();
        tableList.innerHTML = ''; // Clear previous table data
        tables.forEach((table) => {
            const div = document.createElement('div');
            div.className = `table-card ${table.isReserved ? 'reserved' : table.status.toLowerCase()}`;
            div.innerHTML = `
                <h3>Table ${table.tableNumber}</h3>
                <p>Capacity: ${table.capacity}</p>
                <p>Status: ${table.status}</p>
                <select id="status-${table._id}">
                    <option value="Available" ${table.status === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Occupied" ${table.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
                    <option value="Reserved" ${table.status === 'Reserved' ? 'selected' : ''}>Reserved</option>
                </select>
                <button onclick="updateTableStatus('${table._id}')">Update</button>
            `;
            tableList.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
    }
}
// Update table status
async function updateTableStatus(id) {
    const status = document.getElementById(`status-${id}`).value;
    try {
        await fetch(`/api/tables/${id}`, { // Send updated status to the backend
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        socket.emit('updateTableStatus', { id, status }); // Emit event for real-time updates
    } catch (error) {
        console.error('Error updating table status:', error);
    }
}
// Listen for real-time updates
socket.on('tableStatusUpdated', fetchTables);
// Initial fetch
fetchTables();