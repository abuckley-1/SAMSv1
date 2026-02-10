let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    if (audits.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No audits scheduled.</td></tr>';
    } else {
        body.innerHTML = audits.map(a => `
            <tr>
                <td>${a.ref}</td>
                <td><strong>${a.title}</strong></td>
                <td>${a.period}</td>
                <td>${a.date || 'TBC'}</td>
                <td>${a.dept} / ${a.func}</td>
                <td>${a.email}</td>
                <td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td>
                <td><a href="auditee.html?ref=${a.ref}" class="small-link">Manage</a></td>
            </tr>
        `).join('');
    }
    updateStats();
}

function createAudit() {
    const titleVal = document.getElementById('title').value.toUpperCase();
    const periodVal = document.getElementById('period').value;
    const dateVal = document.getElementById('auditDate').value;
    const emailVal = document.getElementById('email').value;
    const deptVal = document.getElementById('dept').value;
    const funcVal = document.getElementById('function').value;
    const typeVal = document.getElementById('type').value;

    if (!titleVal || !periodVal || !emailVal) {
        alert("Required: Title, Reporting Period (YYPP), and Auditee Email.");
        return;
    }

    // Ref now uses the Period (e.g., ST0096/WASTE/2602)
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
    
    // Clear inputs
    ['title', 'period', 'auditDate', 'email', 'dept', 'function'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function updateStats() {
    const countTotal = document.getElementById('count-total');
    if(!countTotal) return;
    countTotal.innerText = audits.length;
    document.getElementById('count-planned').innerText = audits.filter(a => a.status === 'Planned').length;
    document.getElementById('count-open').innerText = audits.filter(a => a.status === 'Open').length;
    document.getElementById('count-closed').innerText = audits.filter(a => a.status === 'Closed').length;
}

window.onload = renderSchedule;
