let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];
const ADMIN_PASS = "sheq0096";

// 1. SECURITY: Password Gate for Admin Actions
function checkAdminPassword(action, index = null) {
    const entry = prompt("Enter Admin Password to modify schedule:");
    
    if (entry === ADMIN_PASS) {
        if (action === 'create') {
            document.getElementById('schedule-modal').style.display = 'flex';
        } else if (action === 'delete') {
            executeDelete(index);
        }
    } else {
        alert("Incorrect password. Access denied.");
    }
}

// 2. AUTO-SYNC ENGINE (Saves locally and updates stats)
function triggerSync() {
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    updateStats();
}

// 3. DASHBOARD RENDERER (With Live Status Calculation)
function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (audits.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No audits scheduled.</td></tr>';
    } else {
        body.innerHTML = audits.map((a, index) => {
            // Logic for Dynamic Status
            let liveStatus = "Planned"; 
            if (a.status === 'Closed' || a.status === 'Cancelled') {
                liveStatus = a.status;
            } else if (a.date) {
                const [sYear, sMonth] = a.date.split('-').map(Number);
                if (sYear < currentYear || (sYear === currentYear && sMonth < currentMonth)) {
                    liveStatus = "Overdue";
                } else if (sYear === currentYear && sMonth === currentMonth) {
                    liveStatus = "Open";
                }
            }

            return `
                <tr>
                    <td>${a.ref}</td>
                    <td><strong>${a.title}</strong></td>
                    <td>${a.period || '---'}</td>
                    <td>${formatMonth(a.date)}</td>
                    <td>${a.dept || ''} / ${a.func || ''}</td>
                    <td>${a.email || ''}</td>
                    <td><span class="status-pill ${liveStatus.toLowerCase()}">${liveStatus}</span></td>
                    <td>
                        <div style="display:flex; gap:8px;">
                            <a href="auditee.html?ref=${a.ref}" class="small-link">Manage</a>
                            <button onclick="checkAdminPassword('delete', ${index})" class="delete-btn">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    updateStats();
}

// 4. CREATE NEW AUDIT (Triggered by Modal)
function createAudit() {
    const titleVal = document.getElementById('title').value.toUpperCase();
    const periodVal = document.getElementById('period').value;
    const monthVal = document.getElementById('auditMonth').value; 
    const emailVal = document.getElementById('email').value;

    if (!titleVal || !periodVal) {
        alert("Please provide the Audit Title and Reporting Period.");
        return;
    }

    const newAudit = {
        ref: `ST0096/${titleVal}/${periodVal}`,
        title: titleVal,
        period: periodVal,
        date: monthVal,
        email: emailVal,
        dept: document.getElementById('dept').value,
        func: document.getElementById('function').value,
        type: document.getElementById('type').value,
        status: 'Planned', // Initial placeholder
        responses: {},
        lastUpdated: new Date().toISOString()
    };

    audits.push(newAudit);
    document.getElementById('schedule-modal').style.display = 'none';
    
    triggerSync();
    renderSchedule();
    
    // Clear the form fields
    ['title', 'period', 'auditMonth', 'email', 'dept', 'function'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
}

// 5. DELETE AUDIT (Password Protected)
function executeDelete(index) {
    if(confirm("Are you sure you want to permanently delete this audit?")) {
        audits.splice(index, 1);
        triggerSync();
        renderSchedule();
    }
}

// 6. DATE FORMATTER (e.g., 2026-02 -> February 2026)
function formatMonth(dateStr) {
    if (!dateStr) return 'TBC';
    const [year, month] = dateStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// 7. STATS CALCULATOR
function updateStats() {
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;
    let planned = 0, open = 0, closed = 0;

    audits.forEach(a => {
        if (a.status === 'Closed') {
            closed++;
        } else if (a.date) {
            const [sy, sm] = a.date.split('-').map(Number);
            if (sy === cy && sm === cm) open++;
            else if (sy > cy || (sy === cy && sm > cm)) planned++;
        } else {
            planned++;
        }
    });

    if(document.getElementById('count-total')) document.getElementById('count-total').innerText = audits.length;
    if(document.getElementById('count-planned')) document.getElementById('count-planned').innerText = planned;
    if(document.getElementById('count-open')) document.getElementById('count-open').innerText = open;
    if(document.getElementById('count-closed')) document.getElementById('count-closed').innerText = closed;
}

window.onload = renderSchedule;
