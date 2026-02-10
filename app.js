let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    if (audits.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No audits scheduled.</td></tr>';
    } else {
        body.innerHTML = audits.map((a, index) => `
            <tr>
                <td>${a.ref}</td>
                <td><strong>${a.title}</strong></td>
                <td>${a.period || '---'}</td>
                <td>${formatMonth(a.date)}</td>
                <td>${a.dept || ''} / ${a.func || ''}</td>
                <td>${a.email || ''}</td>
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

// Formats "2026-02" into "February 2026"
function formatMonth(dateStr) {
    if (!dateStr) return 'TBC';
    try {
        const [year, month] = dateStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
        return dateStr; // Fallback if format is weird
    }
}

function createAudit() {
    try {
        const titleVal = document.getElementById('title').value.toUpperCase();
        const periodVal = document.getElementById('period').value;
        const monthVal = document.getElementById('auditMonth').value; 
        const emailVal = document.getElementById('email').value;
        const deptVal = document.getElementById('dept').value;
        const funcVal = document.getElementById('function').value;
        const typeVal = document.getElementById('type').value;

        if (!titleVal || !periodVal) {
            alert("Please provide at least an Audit Title and Reporting Period.");
            return;
        }

        const ref = `ST0096/${titleVal}/${periodVal}`;

        const newAudit = {
            ref: ref,
            title: titleVal,
            period: periodVal,
            date: monthVal,
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
        
        // Reset inputs
        ['title', 'period', 'auditMonth', 'email', 'dept', 'function'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = '';
        });
    } catch (err) {
        console.error("Audit Creation Failed:", err);
        alert("An error occurred. Please check all fields are filled.");
    }
}

function deleteAudit(index) {
    if(confirm("Delete this record?")) {
        audits.splice(index, 1);
        localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
        renderSchedule();
    }
}

function updateStats() {
    const totalEl = document.getElementById('count-total');
    if(totalEl) totalEl.innerText = audits.length;
    
    const plannedEl = document.getElementById('count-planned');
    if(plannedEl) plannedEl.innerText = audits.filter(a => a.status === 'Planned').length;
}

window.onload = renderSchedule;
