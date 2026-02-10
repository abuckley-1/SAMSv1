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
                <td>${a.period}</td>
                <td>${formatMonth(a.date)}</td>
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

function formatMonth(dateStr) {
    if (!dateStr) return 'TBC';
    const [year, month] = dateStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function createAudit() {
    const titleVal = document.getElementById('title').value.toUpperCase();
    const periodVal = document.getElementById('period').value;
    const monthVal = document.getElementById('auditMonth').value; // Stores as YYYY-MM
    const emailVal = document.getElementById('email').value;
    const deptVal = document.getElementById('dept').value;
    const funcVal = document.getElementById('function').value;
    const typeVal = document.getElementById('type').value;

    if (!titleVal || !periodVal || !emailVal) {
        alert("Required: Title, Period, and Email.");
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
    
    ['title', 'period', 'auditMonth', 'email', 'dept', 'function'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function deleteAudit(index) {
    if(confirm("Confirm: Delete this record?")) {
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
}

window.onload = renderSchedule;
