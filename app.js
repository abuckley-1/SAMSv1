// --- DATABASE INITIALIZATION ---
let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

// --- DASHBOARD RENDER ---
function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    if (audits.length === 0) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;">No audits scheduled. Click "+ Schedule Audit" to begin.</td></tr>';
    } else {
        body.innerHTML = audits.map(a => `
            <tr>
                <td>${a.ref}</td>
                <td><strong>${a.title}</strong></td>
                <td>${a.dept} / ${a.func}</td>
                <td>${a.email}</td>
                <td>${a.type}</td>
                <td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td>
                <td><a href="auditee.html?ref=${a.ref}" class="small-link">View Portal</a></td>
            </tr>
        `).join('');
    }
    updateStats();
}

// --- CORE FUNCTIONS ---
function createAudit() {
    // Get values from the IDs in index.html
    const titleVal = document.getElementById('title').value.toUpperCase();
    const emailVal = document.getElementById('email').value;
    const deptVal = document.getElementById('dept').value;
    const funcVal = document.getElementById('function').value;
    const typeVal = document.getElementById('type').value;

    if (!titleVal || !emailVal) {
        alert("Please enter at least a Title and Auditee Email.");
        return;
    }

    const year = new Date().getFullYear();
    const ref = `ST0096/${titleVal}/${year}`;

    const newAudit = {
        ref: ref,
        title: titleVal,
        email: emailVal,
        dept: deptVal,
        func: funcVal,
        type: typeVal,
        status: 'Planned',
        responses: {},
        lastUpdated: new Date().toISOString()
    };

    audits.push(newAudit);
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    
    // Close modal and refresh list
    document.getElementById('schedule-modal').style.display = 'none';
    renderSchedule();
    
    // Reset form
    document.getElementById('title').value = '';
    document.getElementById('email').value = '';
    document.getElementById('dept').value = '';
    document.getElementById('function').value = '';
}

function updateStats() {
    if(!document.getElementById('count-total')) return;
    document.getElementById('count-total').innerText = audits.length;
    document.getElementById('count-planned').innerText = audits.filter(a => a.status === 'Planned').length;
    document.getElementById('count-open').innerText = audits.filter(a => a.status === 'Open').length;
    document.getElementById('count-closed').innerText = audits.filter(a => a.status === 'Closed').length;
}

function syncToCloud() {
    alert("Cloud Sync initialized. This feature requires a GitHub Token to push data to abuckley-1/SAMSv1.");
}

// Initialize on load
window.onload = renderSchedule;
