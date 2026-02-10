let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

// 1. DYNAMIC STATUS CALCULATOR
function getLiveStatus(audit) {
    // If manually closed or cancelled, respect that
    if (audit.status === 'Closed' || audit.status === 'Cancelled') return audit.status;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS months are 0-11

    if (!audit.date) return 'Planned';

    // date format from <input type="month"> is "YYYY-MM"
    const [scheduledYear, scheduledMonth] = audit.date.split('-').map(Number);

    // LOGIC CHECK
    if (scheduledYear < currentYear || (scheduledYear === currentYear && scheduledMonth < currentMonth)) {
        return 'Overdue';
    } 
    else if (scheduledYear === currentYear && scheduledMonth === currentMonth) {
        return 'Open';
    } 
    else {
        return 'Planned';
    }
}

// 2. DASHBOARD RENDER
function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    if (audits.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No audits scheduled.</td></tr>';
    } else {
        body.innerHTML = audits.map((a, index) => {
            // WE FORCE THE CALCULATION HERE
            const currentStatus = getLiveStatus(a);
            
            return `
                <tr>
                    <td>${a.ref}</td>
                    <td><strong>${a.title}</strong></td>
                    <td>${a.period || '---'}</td>
                    <td>${formatMonth(a.date)}</td>
                    <td>${a.dept || ''} / ${a.func || ''}</td>
                    <td>${a.email || ''}</td>
                    <td><span class="status-pill ${currentStatus.toLowerCase()}">${currentStatus}</span></td>
                    <td>
                        <div style="display:flex; gap:8px;">
                            <a href="auditee.html?ref=${a.ref}" class="small-link">Manage</a>
                            <button onclick="deleteAudit(${index})" class="delete-btn">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
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
    const monthVal = document.getElementById('auditMonth').value; 
    const emailVal = document.getElementById('email').value;
    const deptVal = document.getElementById('dept').value;
    const funcVal = document.getElementById('function').value;
    const typeVal = document.getElementById('type').value;

    if (!titleVal || !periodVal) {
        alert("Title and Period are required.");
        return;
    }

    const newAudit = {
        ref: `ST0096/${titleVal}/${periodVal}`,
        title: titleVal,
        period: periodVal,
        date: monthVal,
        email: emailVal,
        dept: deptVal,
        func: funcVal,
        type: typeVal,
        status: 'Planned', // Default base status
        responses: {},
        lastUpdated: new Date().toISOString()
    };

    audits.push(newAudit);
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    document.getElementById('schedule-modal').style.display = 'none';
    renderSchedule();
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
    if(!totalEl) return;
    
    totalEl.innerText = audits.length;
    // Stats also need to use the live calculation
    document.getElementById('count-planned').innerText = audits.filter(a => getLiveStatus(a) === 'Planned').length;
    document.getElementById('count-open').innerText = audits.filter(a => getLiveStatus(a) === 'Open').length;
    // Assuming Closed is a manual flag we set later
    document.getElementById('count-closed').innerText = audits.filter(a => a.status === 'Closed').length;
}

window.onload = renderSchedule;
