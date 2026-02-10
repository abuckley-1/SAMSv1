// Load data from browser storage
let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

// 1. Draw the table rows
function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    if (audits.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No audits scheduled. Click "+ Schedule Audit" to begin.</td></tr>';
    } else {
        body.innerHTML = audits.map((a, index) => `
            <tr>
                <td>${a.ref}</td>
                <td><strong>${a.title}</strong></td>
                <td>${a.period}</td>
                <td>${a.date || 'TBC'}</td>
                <td>${a.dept} / ${a.func}</td>
                <td>${a.email}</td>
                <td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <a href="auditee.html?ref=${a.ref}" class="small-link">Manage</a>
                        <button onclick="deleteAudit(${index})" class="delete-btn">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    updateStats();
}

// 2. Capture form data and save
function createAudit() {
    const titleVal = document.getElementById('title').value.toUpperCase();
    const periodVal = document.getElementById('period').value;
    const dateVal = document.getElementById('auditDate').value;
    const emailVal = document.getElementById('email').value;
    const deptVal = document.getElementById('dept').value;
    const funcVal = document.getElementById('function').value;
    const typeVal = document.getElementById('type').value;

    // Check mandatory fields
    if (!titleVal || !periodVal || !emailVal) {
        alert("Error: Title, Reporting Period (YYPP), and Email are required.");
        return;
    }

    // Ref: ST0096 / TITLE / YYPP
    const ref = `ST0096/${titleVal}/${periodVal}`;

    const newAudit = {
        ref: ref,
        title: titleVal,
        period: periodVal,
        date: dateVal,
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
    
    // UI Cleanup
    document.getElementById('schedule-modal').style.display = 'none';
    renderSchedule();
    
    // Reset Form
    ['title', 'period', 'auditDate', 'email', 'dept', 'function'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function deleteAudit(index) {
    if(confirm("Confirm: Delete this audit record?")) {
        audits.splice(index, 1);
        localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
        renderSchedule();
    }
}

function updateStats() {
    const totalEl = document.getElementById('count-total');
    if(!totalEl) return;
    totalEl.innerText = audits.length;
    document.getElementById('count-planned').innerText = audits.filter(a => a.status === 'Planned').length;
    document.getElementById('count-open').innerText = audits.filter(a => a.status === 'Open').length;
    document.getElementById('count-closed').innerText = audits.filter(a => a.status === 'Closed').length;
}

function syncToCloud() {
    alert("SAMS Cloud Sync: Data is currently saved to your local browser. GitHub Cloud sync requires a PAT token.");
}

// Start on load
window.onload = renderSchedule;
