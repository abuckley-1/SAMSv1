let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];
const ADMIN_PASS = "sheq0096";

function checkAdminPassword(action, index = null) {
    const entry = prompt("Enter Admin Password:");
    if (entry === ADMIN_PASS) {
        if (action === 'create') document.getElementById('schedule-modal').style.display = 'flex';
        if (action === 'delete') executeDelete(index);
        if (action === 'issue-initial') issueQuestionnaire(index, 'initial');
        if (action === 'issue-followup') issueQuestionnaire(index, 'followup');
    } else { alert("Access Denied."); }
}

function issueQuestionnaire(index, type) {
    const audit = audits[index];
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + 14); // 2 week window

    audit.workflow = audit.workflow || {};
    audit.workflow[type] = {
        issuedDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        status: 'Issued',
        responses: []
    };

    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    alert(`${type.toUpperCase()} Questionnaire Issued to ${audit.email}. Link valid until ${expiry.toLocaleDateString()}`);
    renderSchedule();
}

function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    body.innerHTML = audits.map((a, index) => {
        let liveStatus = "Planned";
        if (a.date) {
            const [sY, sM] = a.date.split('-').map(Number);
            if (sY < curYear || (sY === curYear && sM < curMonth)) liveStatus = "Overdue";
            else if (sY === curYear && sM === curMonth) liveStatus = "Open";
        }
        if (a.status === 'Closed') liveStatus = "Closed";

        return `
            <tr>
                <td><small>${a.ref}</small></td>
                <td><strong>${a.title}</strong><br><small>${a.dept} / ${a.func}</small></td>
                <td>${formatMonth(a.date)}</td>
                <td><span class="status-pill ${liveStatus.toLowerCase()}">${liveStatus}</span></td>
                <td>
                    <div class="action-zone">
                        <div class="action-group">
                            <span>Initial:</span>
                            <button onclick="checkAdminPassword('issue-initial', ${index})" class="action-btn">Issue Link</button>
                            <a href="auditee.html?ref=${a.ref}&type=initial" class="action-btn view">View Form</a>
                        </div>
                        <div class="action-group">
                            <span>Follow-up:</span>
                            <button onclick="checkAdminPassword('issue-followup', ${index})" class="action-btn">Bespoke Setup</button>
                            <a href="auditee.html?ref=${a.ref}&type=followup" class="action-btn view">View Form</a>
                        </div>
                        <button onclick="checkAdminPassword('delete', ${index})" class="delete-btn" style="margin-top:10px">🗑 Delete Audit</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    updateStats();
}

function createAudit() {
    const titleVal = document.getElementById('title').value.toUpperCase();
    const periodVal = document.getElementById('period').value;
    if (!titleVal || !periodVal) return alert("Missing Info");

    audits.push({
        ref: `ST0096/${titleVal}/${periodVal}`,
        title: titleVal,
        period: periodVal,
        date: document.getElementById('auditMonth').value,
        email: document.getElementById('email').value,
        dept: document.getElementById('dept').value,
        func: document.getElementById('function').value,
        status: 'Planned',
        workflow: {}
    });

    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    document.getElementById('schedule-modal').style.display = 'none';
    renderSchedule();
}

function executeDelete(index) {
    if(confirm("Delete permanently?")) { audits.splice(index, 1); localStorage.setItem('supertram_audit_data', JSON.stringify(audits)); renderSchedule(); }
}

function formatMonth(dateStr) {
    if (!dateStr) return 'TBC';
    const [y, m] = dateStr.split('-');
    return new Date(y, m-1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function updateStats() {
    if(document.getElementById('count-total')) document.getElementById('count-total').innerText = audits.length;
}

window.onload = renderSchedule;
