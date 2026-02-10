// Add a version check to clear old, broken local data if needed
const SAMS_VERSION = "1.2"; 

let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    // Today's date for live comparison
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (audits.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No audits scheduled.</td></tr>';
    } else {
        body.innerHTML = audits.map((a, index) => {
            
            // --- LIVE CALCULATION (FORCED) ---
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
                            <button onclick="deleteAudit(${index})" class="delete-btn">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    updateStats();
}

// Helper to turn 2026-02 into "February 2026"
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
        status: 'Planned', // This is just a placeholder; renderSchedule calculates the live one
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
    // We re-calculate stats based on the same logic used in the table
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;

    const total = audits.length;
    let planned = 0;
    let open = 0;
    let closed = 0;

    audits.forEach(a => {
        if (a.status === 'Closed') { closed++; }
        else if (a.date) {
            const [sy, sm] = a.date.split('-').map(Number);
            if (sy === cy && sm === cm) open++;
            else if (sy > cy || (sy === cy && sm > cm)) planned++;
        } else {
            planned++;
        }
    });

    if(document.getElementById('count-total')) document.getElementById('count-total').innerText = total;
    if(document.getElementById('count-planned')) document.getElementById('count-planned').innerText = planned;
    if(document.getElementById('count-open')) document.getElementById('count-open').innerText = open;
    if(document.getElementById('count-closed')) document.getElementById('count-closed').innerText = closed;
}

window.onload = renderSchedule;
