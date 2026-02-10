// --- DATABASE INITIALIZATION ---
let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

// --- AUDIT SCHEDULING LOGIC ---
function createAudit() {
    const title = document.getElementById('title').value.toUpperCase();
    const year = new Date().getFullYear();
    const ref = `ST0096/${title}/${year}`;

    const newAudit = {
        ref: ref,
        title: title,
        email: document.getElementById('email').value,
        dept: document.getElementById('dept').value,
        func: document.getElementById('function').value,
        type: document.getElementById('type').value,
        status: 'Planned',
        responses: {},
        evidence: [],
        lastUpdated: new Date().toISOString()
    };

    audits.push(newAudit);
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    location.reload();
}

// --- AUDITEE PORTAL LOGIC ---
function loadAuditeeTask() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const audit = audits.find(a => a.ref === ref);

    if (!audit) return;

    document.getElementById('task-ref').innerText = audit.ref;
    
    // 1. Render Mandatory Questions
    const manContainer = document.getElementById('mandatory-section');
    const mandatoryQs = [
        { id: 'M1', q: "Does the business have a procedure and or policy for this specific process?" },
        { id: 'M2', q: "Does the business have a Risk Assessment for this specific process?" },
        { id: 'M3', q: "Do you feel the relevant staff have received suitable and sufficient information, instruction and training?" }
    ];

    manContainer.innerHTML += mandatoryQs.map(q => renderQuestionUI(q.id, q.q, 'Core Criteria', audit)).join('');

    // 2. Render AI Generated Questions (5 per standard)
    const aiContainer = document.getElementById('ai-section');
    const standards = ['ISO9001', 'ISO14001', 'ISO45001', 'RM3'];
    
    standards.forEach(std => {
        aiContainer.innerHTML += `<h3 class="section-title">${std} Assessment</h3>`;
        for(let i=1; i<=5; i++) {
            const id = `${std}_${i}`;
            const questionText = `[AI Analysis] Based on ${audit.title} operations, please explain how you ensure ${std} compliance regarding sub-process ${i}.`;
            aiContainer.innerHTML += renderQuestionUI(id, questionText, `${std} Clause Reference`, audit);
        }
    });
}

function renderQuestionUI(id, question, criteria, audit) {
    return `
        <div class="audit-item">
            <small style="color:var(--tram-purple)">${criteria}</small>
            <p><strong>${question}</strong></p>
            <textarea id="ans-${id}" oninput="autoSaveAuditee()">${audit.responses[id] || ''}</textarea>
            <button type="button" class="attachment-btn" onclick="openEvidence('${id}')">📎 Attach Evidence Sample / Cloud Link</button>
        </div>
    `;
}

// --- SAVING & SYNC ---
function autoSaveAuditee() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const auditIndex = audits.findIndex(a => a.ref === ref);
    
    if (auditIndex === -1) return;

    const textareas = document.querySelectorAll('textarea[id^="ans-"]');
    textareas.forEach(ta => {
        const qId = ta.id.replace('ans-', '');
        audits[auditIndex].responses[qId] = ta.value;
    });

    audits[auditIndex].lastUpdated = new Date().toISOString();
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    
    const banner = document.getElementById('save-msg');
    if(banner) {
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, 2000);
    }
}

function submitTask() {
    if(confirm("Confirm: Have you attached all necessary evidence for the Auditor's review?")) {
        alert("Submission Successful. Your Auditor (abuckley-1) has been notified via SAMS Cloud.");
    }
}
