let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];
const ADMIN_PASS = "sheq0096";

function checkAdminPassword(action, index = null) {
    const entry = prompt("Enter Admin Password:");
    if (entry === ADMIN_PASS) {
        if (action === 'create') document.getElementById('schedule-modal').style.display = 'flex';
        if (action === 'delete') executeDelete(index);
        if (action === 'issue-initial') issueQuestionnaire(index);
    } else { alert("Access Denied."); }
}

function issueQuestionnaire(index) {
    const audit = audits[index];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);

    const standards = [
        { name: "ISO 9001", questions: ["Process control measures", "Customer requirement integration", "Resource management", "Documented information control", "Monitoring and measurement"] },
        { name: "ISO 14001", questions: ["Waste stream management", "Environmental aspect identification", "Emergency preparedness", "Spill control measures", "Pollution prevention"] },
        { name: "ISO 45001", questions: ["Hazard identification", "Worker consultation", "PPE compliance", "Incident reporting culture", "Occupational health monitoring"] },
        { name: "RM3", questions: ["Safety culture leadership", "Risk management capability", "Asset management integrity", "Audit and review feedback", "Competence management systems"] }
    ];

    let aiQuestions = [];
    standards.forEach(std => {
        std.questions.forEach(q => {
            aiQuestions.push({
                text: `Regarding ${audit.title}: How do you demonstrate compliance with ${std.name} in relation to ${q}?`,
                standard: std.name
            });
        });
    });

    audit.workflow = audit.workflow || {};
    audit.workflow['initial'] = {
        issuedDate: new Date().toISOString(),
        expiryDate: expiry.toISOString(),
        status: 'Issued',
        aiQuestions: aiQuestions,
        responses: {}
    };
    
    audit.status = "OPEN";
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    alert("Initial Questionnaire Issued. Link valid for 14 days.");
    renderSchedule();
}

function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;
    body.innerHTML = audits.map((a, index) => {
        const statusClass = a.status ? a.status.toLowerCase() : 'planned';
        return `
            <tr>
                <td>${a.ref}</td>
                <td><strong>${a.title}</strong><br>${a.dept} / ${a.func}</td>
                <td>${formatMonth(a.date)}</td>
                <td><span class="status-pill ${statusClass}">${a.status || 'PLANNED'}</span></td>
                <td>
                    <div class="action-zone">
                        <button onclick="checkAdminPassword('issue-initial', ${index})" class="action-btn">Issue Initial Link</button>
                        <a href="auditee.html?ref=${a.ref}" class="action-btn view">Open Portal</a>
                        <button onclick="checkAdminPassword('delete', ${index})" class="delete-btn">🗑</button>
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
    audits.push({
        ref: `ST0096/${titleVal}/${periodVal}`,
        title: titleVal,
        period: periodVal,
        date: document.getElementById('auditMonth').value,
        email: document.getElementById('email').value,
        dept: document.getElementById('dept').value,
        func: document.getElementById('function').value,
        status: 'PLANNED'
    });
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    document.getElementById('schedule-modal').style.display = 'none';
    renderSchedule();
}

function formatMonth(d) { return d ? new Date(d).toLocaleString('default', {month:'long', year:'numeric'}) : 'TBC'; }
function updateStats() { document.getElementById('count-total').innerText = audits.length; }
function executeDelete(i) { if(confirm("Delete?")) { audits.splice(i, 1); localStorage.setItem('supertram_audit_data', JSON.stringify(audits)); renderSchedule(); } }

window.onload = renderSchedule;
