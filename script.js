const auditData = {
    rm3: [
        { id: "SP1", q: "Policy and Leadership: Are safety policies visible at Nunnery Depot?" },
        { id: "OC2", q: "Organisational Structure: Are SHEQ roles clearly defined in the SMS?" },
        { id: "RCS2", q: "Asset Management: Are track inspection intervals being met?" }
    ],
    iso45001: [
        { id: "6.1.2", q: "Hazard Identification: Are PIT area risks documented and mitigated?" }
    ],
    iso9001: [
        { id: "8.4", q: "Contractor Control: Are maintenance contractors' records verified?" }
    ]
};

function updateChecklist() {
    const type = document.getElementById('auditType').value;
    const container = document.getElementById('checklist-container');
    const questions = auditData[type];

    container.innerHTML = questions.map(item => `
        <div class="audit-item">
            <strong>${item.id}</strong>
            <p>${item.q}</p>
            <select class="score-selector">
                <option value="1">Level 1 (Ad-hoc)</option>
                <option value="2">Level 2 (Managed)</option>
                <option value="3" selected>Level 3 (Standardised)</option>
                <option value="4">Level 4 (Predictable)</option>
                <option value="5">Level 5 (Excellent)</option>
            </select>
            <textarea placeholder="Evidence Sample (e.g. Reviewed Doc SUP-7, Sampled 3 records...)"></textarea>
        </div>
    `).join('');
}

function saveAuditProgress() {
    alert("Progress saved to browser. You can now go to the Reports page to finalise.");
}

// Initialize
if (document.getElementById('checklist-container')) {
    window.onload = updateChecklist;
}
