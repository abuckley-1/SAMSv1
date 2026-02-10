// --- DATABASE INITIALIZATION ---
let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

// --- DASHBOARD RENDER ---
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
                    <div style="display:flex; gap:10px;">
                        <a href="auditee.html?ref=${a.ref}" class="small-link">Manage</a>
                        <button onclick="deleteAudit(${index})" class="delete-btn">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    updateStats();
}

// --- CORE FUNCTIONS ---
function createAudit() {
    const titleVal = document.getElementById('title').value.toUpperCase();
    const periodVal = document.getElementById('period').value; // e.g. 2602
    const dateVal = document.getElementById('auditDate').value;
    const emailVal = document.getElementById('email').value;
    const deptVal = document.getElementById('dept').value;
    const funcVal = document.getElementById('function').value;
    const typeVal = document.getElementById('type').value;

    if (!titleVal || !periodVal || !emailVal) {
        alert("Please enter Title, Reporting Period (YYPP), and Auditee Email.");
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
    
    document.getElementById('schedule-modal').style.display = 'none';
    renderSchedule();
    
    // Reset form
    ['title', 'period', 'auditDate', 'email', 'dept', 'function'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function deleteAudit(index) {
    if(confirm("Are you sure you want to delete this audit entry?")) {
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

window.onload = renderSchedule;
