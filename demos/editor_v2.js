import mermaid from '/mermaid.esm.mjs';

/**
 * Mermaid Editor V2 - Core Application Logic
 */
class MermaidEditorV2 {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.lineNumbers = document.getElementById('line-numbers');
        this.templatesToggle = document.getElementById('templates-toggle');
        this.templatesMenu = document.getElementById('templates-menu');
        this.output = document.getElementById('graph-output');
        this.cursorPosDisplay = document.getElementById('cursor-pos');
        this.errorBadge = document.getElementById('error-badge');
        this.predictionBubble = document.getElementById('prediction-bubble');
        this.predictionText = document.getElementById('prediction-text');
        
        this.renderTimeout = null;
        this.isDark = true;
        this.fileHandle = null;

        this.init();
    }

    async init() {
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Outfit',
            suppressErrorRendering: true
        });

        // Set default content
        this.editor.value = "stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]";

        // Event Listeners
        this.editor.addEventListener('input', () => this.onInputChange());
        this.editor.addEventListener('keyup', () => this.updateCursorPos());
        this.editor.addEventListener('click', () => this.updateCursorPos());
        this.editor.addEventListener('scroll', () => {
            this.updatePredictionPosition();
            this.syncScroll();
        });

        this.templatesToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.templatesMenu.classList.toggle('show');
        });

        // Hover logic with delay
        let hideTimeout;
        this.templatesToggle.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            this.templatesMenu.classList.add('show');
        });

        this.templatesToggle.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                if (!this.templatesMenu.matches(':hover')) {
                    this.templatesMenu.classList.remove('show');
                }
            }, 300);
        });

        this.templatesMenu.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });

        this.templatesMenu.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                this.templatesMenu.classList.remove('show');
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!this.templatesToggle.contains(e.target)) {
                this.templatesMenu.classList.remove('show');
            }
        });

        // Initial render
        await this.updatePreview();
        this.updateLineNumbers();
        this.updateCursorPos();
    }

    syncScroll() {
        this.lineNumbers.scrollTop = this.editor.scrollTop;
    }

    updateLineNumbers() {
        const lines = this.editor.value.split('\n');
        const count = lines.length;
        this.lineNumbers.innerHTML = Array.from({ length: count }, (_, i) => `<div style="height: 1.7em;">${i + 1}</div>`).join('');
    }

    onInputChange() {
        clearTimeout(this.renderTimeout);
        this.renderTimeout = setTimeout(() => this.updatePreview(), 300);
        this.updateLineNumbers();
        this.showPredictions();
    }

    async updatePreview() {
        const code = this.editor.value.trim();
        if (!code) return;

        try {
            // Check if Mermaid can parse this
            await mermaid.parse(code);
            
            const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), code);
            this.output.innerHTML = svg;
            this.errorBadge.style.display = 'none';
            this.output.style.opacity = '1';
            
            const svgNode = this.output.querySelector('svg');
            if (svgNode) {
                svgNode.style.maxWidth = '100%';
                svgNode.style.maxHeight = '100%';
                svgNode.style.transition = 'all 0.3s ease';
            }
        } catch (e) {
            console.warn("Render error", e);
            this.errorBadge.style.display = 'flex';
            this.output.style.opacity = '0.3'; // Dim but keep last valid or error svg
        }
    }

    updateCursorPos() {
        const text = this.editor.value;
        const sub = text.substring(0, this.editor.selectionStart);
        const line = sub.split('\n').length;
        const col = sub.split('\n').pop().length + 1;
        this.cursorPosDisplay.innerText = `Line ${line}, Col ${col}`;
        this.updatePredictionPosition();
    }

    updatePredictionPosition() {
        // Simple heuristic for bubble position near cursor
        const { selectionStart } = this.editor;
        const lines = this.editor.value.substring(0, selectionStart).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length;

        const lineHeight = 24;
        const charWidth = 8.5;
        
        const top = 32 + (line * lineHeight) - this.editor.scrollTop;
        const left = 32 + (col * charWidth);

        this.predictionBubble.style.top = `${top + 10}px`;
        this.predictionBubble.style.left = `${left}px`;
    }

    showPredictions() {
        const code = this.editor.value;
        const pos = this.editor.selectionStart;
        const lines = code.substring(0, pos).split('\n');
        const line = lines[lines.length - 1];

        let suggestion = "";
        if (line.includes('-->')) suggestion = "node";
        else if (line.match(/^\s*\w+$/)) suggestion = "--> node";
        else if (line.includes('state')) suggestion = " { [*] --> }";
        else if (line.includes('note')) suggestion = " right of ...";

        if (suggestion) {
            this.predictionText.innerText = `Suggestion: ${suggestion}`;
            this.predictionBubble.classList.add('visible');
        } else {
            this.predictionBubble.classList.remove('visible');
        }
    }

    insertSnippet(type) {
        let snippet = "";
        switch(type) {
            case 'node': snippet = "nodeID[Node Name]"; break;
            case 'decision': snippet = "decID{Decision?}"; break;
            case 'edge': snippet = " --> "; break;
            case 'substate': snippet = "state \"Composite\" as StateId {\n    [*] --> SubState1\n}"; break;
            case 'note': snippet = "note right of StateId\n    Note content\nend note"; break;
        }

        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const text = this.editor.value;
        this.editor.value = text.substring(0, start) + snippet + text.substring(end);
        this.editor.focus();
        this.editor.setSelectionRange(start + snippet.length, start + snippet.length);
        this.onInputChange();
    }

    loadTemplate(type) {
        let tpl = "";
        switch(type) {
            case 'unified_v2':
                tpl = `stateDiagram-v2
    direction TB

    %% Global State Definitions
    state "OPEN" as OPEN
    state "DRAFT" as DRAFT
    state "SUBMITTED" as SUBMITTED
    state "MACRO-STUDY" as MACRO_STUDY
    state "BUSINESS ANALYST" as BUSINESS_ANALYST
    state "INFORMATION NEEDED" as INFORMATION_NEEDED
    state "ACCEPTED" as ACCEPTED
    state "CANDIDACY GATE" as CANDIDACY_GATE
    state "À PRIORISER" as A_PRIORISER
    state "BACKLOG" as BACKLOG
    state "READY" as READY
    state "IN PROGRESS" as IN_PROGRESS
    state "CODE REVIEW" as CODE_REVIEW
    state "WAITING FOR REPRODUCTION" as WAITING_FOR_REPRODUCTION
    state "SUSPENDED" as SUSPENDED
    state "TO DELIVER" as TO_DELIVER
    state "TEST PRODUIT" as TEST_PRODUIT
    state "CCQA" as CCQA
    state "TESTING BLOCKED" as TESTING_BLOCKED
    state "CHECK DOD" as CHECK_DOD
    state "READY FOR RELEASE" as READY_FOR_RELEASE
    state "BE VALIDATED BY OWNER" as BE_VALIDATED_BY_OWNER
    state "REJECTED" as REJECTED
    state "CLOSED" as CLOSED
    state "CLOSED/REJETED" as CLOSED_REJETED

    [*] --> PHASE_QUALIFICATION

    state "Phase 1: Qualification & Analyse" as PHASE_QUALIFICATION {
        OPEN --> DRAFT : Create
        DRAFT --> SUBMITTED : Request submitted
        SUBMITTED --> MACRO_STUDY : Start Macro-study
        INFORMATION_NEEDED --> OPEN : Re-open
        OPEN --> INFORMATION_NEEDED : Need info
    }

    PHASE_QUALIFICATION --> PHASE_DECISION

    state "Phase 2: Décision (Gates)" as PHASE_DECISION {
        MACRO_STUDY --> BUSINESS_ANALYST : A STATUER
        BUSINESS_ANALYST --> ACCEPTED : Accepté
        BUSINESS_ANALYST --> CANDIDACY_GATE : A STATUER EN GATE
    }

    PHASE_DECISION --> PHASE_PRIORITISATION

    state "Phase 3: Priorisation & Backlog" as PHASE_PRIORITISATION {
        ACCEPTED --> A_PRIORISER : à prioriser
        A_PRIORISER --> BACKLOG : Continuous Improvement
        A_PRIORISER --> READY : Smart Improvement
    }

    PHASE_PRIORITISATION --> PHASE_BUILD

    state "Phase 4: Construction (Build)" as PHASE_BUILD {
        IN_PROGRESS --> CODE_REVIEW : Submit to review
        CODE_REVIEW --> IN_PROGRESS : Back to in progress
        IN_PROGRESS --> WAITING_FOR_REPRODUCTION : Test Failed
        WAITING_FOR_REPRODUCTION --> IN_PROGRESS : Occurred again
        IN_PROGRESS --> SUSPENDED : Suspend work
        SUSPENDED --> IN_PROGRESS : Continue work
    }

    PHASE_BUILD --> PHASE_QUALITY

    state "Phase 5: Qualité & Vérification" as PHASE_QUALITY {
        TO_DELIVER --> TEST_PRODUIT : internal test
        TEST_PRODUIT --> CCQA : Submit to CCQA
        CCQA --> TESTING_BLOCKED : Blocker raised
        TESTING_BLOCKED --> CCQA : Blocker fixed
        CCQA --> CHECK_DOD : Validate DOD
        CHECK_DOD --> READY_FOR_RELEASE : Ready
    }

    PHASE_QUALITY --> PHASE_FINAL_VALIDATION

    state "Phase 6: Validation & Clôture" as PHASE_FINAL_VALIDATION {
        READY_FOR_RELEASE --> BE_VALIDATED_BY_OWNER : Validate
        BE_VALIDATED_BY_OWNER --> CLOSED : Done
        REJECTED --> CLOSED : Close
        CLOSED --> CLOSED_REJETED
    }

    PHASE_FINAL_VALIDATION --> [*]`;
                break;
            case 'rfc_v2':
                tpl = `stateDiagram-v2
    direction TB
    state "DRAFT" as DRAFT
    state "SUBMITTED" as SUBMITTED
    state "MACRO-STUDY" as MACRO_STUDY
    state "BUSINESS ANALYST" as BUSINESS_ANALYST
    state "ACCEPTED" as ACCEPTED
    state "À PRIORISER" as A_PRIORISER
    state "BACKLOG" as BACKLOG
    state "IN PROGRESS" as IN_PROGRESS
    state "CODE REVIEW" as CODE_REVIEW
    state "TO DELIVER" as TO_DELIVER
    state "IN TEST" as IN_TEST
    state "TO BE VALIDATED BY CCQA" as TO_BE_VALIDATED_BY_CCQA
    state "CHECK DOD" as CHECK_DOD
    state "READY FOR RELEASE" as READY_FOR_RELEASE
    state "TO BE VALIDATED BY OWNER" as TO_BE_VALIDATED_BY_OWNER
    state "IMPLEMENTATION IN PROGRESS" as IMPLEMENTATION_IN_PROGRESS
    state "CLOSED" as CLOSED
    state "CANDIDACY GATE" as CANDIDACY_GATE
    state "REJECTED" as REJECTED
    state "CLOSED/REJETED" as CLOSED_REJETED

    [*] --> DRAFT : Create
    DRAFT --> SUBMITTED : Request submitted
    SUBMITTED --> MACRO_STUDY : Start Macro-study
    MACRO_STUDY --> BUSINESS_ANALYST : A STATUER
    BUSINESS_ANALYST --> ACCEPTED : Accepté
    BUSINESS_ANALYST --> CANDIDACY_GATE : A STATUER EN GATE
    ACCEPTED --> A_PRIORISER : à prioriser
    A_PRIORISER --> IN_PROGRESS : Accepted as a Smart Improvement
    A_PRIORISER --> BACKLOG : Accepted as a Continuous Improvement
    BACKLOG --> IMPLEMENTATION_IN_PROGRESS : Start work
    IMPLEMENTATION_IN_PROGRESS --> CLOSED : Done
    IN_PROGRESS --> CODE_REVIEW : Submit to review
    CODE_REVIEW --> IN_PROGRESS : Back to in progress
    CODE_REVIEW --> TO_DELIVER : Code review Done
    TO_DELIVER --> IN_TEST : Submit to Product Test
    IN_TEST --> TO_BE_VALIDATED_BY_CCQA : Submit to CCQA TESTS
    TO_BE_VALIDATED_BY_CCQA --> CHECK_DOD : Submit to validate the DOD
    CHECK_DOD --> READY_FOR_RELEASE : Ready for release
    READY_FOR_RELEASE --> TO_BE_VALIDATED_BY_OWNER : To be validated by owner
    TO_BE_VALIDATED_BY_OWNER --> CLOSED : Done
    REJECTED --> DRAFT : Re-Open Request
    REJECTED --> CLOSED_REJETED : Close Issue`;
                break;
            case 'bug_v2':
                tpl = `stateDiagram-v2
    direction TB
    state "OPEN" as OPEN
    state "ACCEPTED" as ACCEPTED
    state "SUSPENDED" as SUSPENDED
    state "IN PROGRESS" as IN_PROGRESS
    state "WAITING FOR REPRODUCTION" as WAITING_FOR_REPRODUCTION
    state "TO DELIVER" as TO_DELIVER
    state "TEST PRODUIT" as TEST_PRODUIT
    state "READY FOR RELEASE" as READY_FOR_RELEASE
    state "TO BE VALIDATED BY CODA" as TO_BE_VALIDATED_BY_CODA
    state "TESTING BLOCKED" as TESTING_BLOCKED
    state "BE VALIDATED BY OWNER" as BE_VALIDATED_BY_OWNER
    state "INFORMATION NEEDED" as INFORMATION_NEEDED
    state "REJECTED" as REJECTED
    state "CLOSED" as CLOSED
    state "CLOSED/REJETED" as CLOSED_REJETED

    [*] --> OPEN : Create
    OPEN --> ACCEPTED : Accept
    OPEN --> REJECTED : Reject
    OPEN --> INFORMATION_NEEDED : Wait for information
    OPEN --> CLOSED_REJETED : Rejected and closed
    INFORMATION_NEEDED --> OPEN : Information sufficient / Re-open
    ACCEPTED --> SUSPENDED : Suspend work
    SUSPENDED --> ACCEPTED : Continue work
    ACCEPTED --> IN_PROGRESS : Start progress
    IN_PROGRESS --> WAITING_FOR_REPRODUCTION : Test Failed
    WAITING_FOR_REPRODUCTION --> IN_PROGRESS : Occurred again
    IN_PROGRESS --> TO_DELIVER : To be delivered
    TO_DELIVER --> TEST_PRODUIT : submit to internal test
    TEST_PRODUIT --> TO_BE_VALIDATED_BY_CODA : Submit to CODA test
    TO_BE_VALIDATED_BY_CODA --> READY_FOR_RELEASE : Ready for release
    TO_BE_VALIDATED_BY_CODA --> TESTING_BLOCKED : Validation blocked
    TESTING_BLOCKED --> TO_BE_VALIDATED_BY_CODA : Blocker raised...
    READY_FOR_RELEASE --> BE_VALIDATED_BY_OWNER : To be validated by owner
    BE_VALIDATED_BY_OWNER --> CLOSED : Test passed / Product defect validated
    REJECTED --> OPEN : Re-open
    REJECTED --> CLOSED : Close`;
                break;
            case 'incident_v2':
                tpl = `stateDiagram-v2
    direction TB
    [*] --> OPEN : Create
    OPEN --> ACCEPTED : Accept
    OPEN --> INFORMATION_NEEDED : Information needed
    OPEN --> IN_PROGRESS : Start progress
    OPEN --> REJECTED : Reject
    OPEN --> CLOSED : Close
    IN_PROGRESS --> SOLVED : Solve
    SOLVED --> IN_PROGRESS : Need more work
    SOLVED --> CLOSED : Close
    REJECTED --> OPEN : Recall open
    REJECTED --> SOLVED : Solve
    CLOSED --> SOLVED : Solve`;
                break;
            case 'rfc':
                tpl = "stateDiagram-v2\n    [*] --> Draft: Create RFC\n    Draft --> PeerReview: Submit for Review\n    PeerReview --> Draft: Resubmit (Changes required)\n    PeerReview --> CAB: Technical Approval\n    state CAB <<choice>>\n    CAB --> Approved: CAB Approved\n    CAB --> Draft: CAB Rejected\n    Approved --> Implementation: Schedule Implementation\n    Implementation --> Testing: PIR\n    Testing --> Closed: Success\n    Testing --> Rollback: Failure\n    Rollback --> Draft: Analyze Failure";
                break;
            case 'incident':
                tpl = "flowchart TD\n    Start([Incident Detected]) --> Detect{Criticality?}\n    Detect -- P1/P2 --> WarRoom[Activate War Room]\n    Detect -- P3/P4 --> Standard[Standard Incident Handling]\n    WarRoom --> Mitigate[Apply Workaround]\n    Mitigate --> Investigate[Root Cause Analysis]\n    Investigate --> Fix[Long-term Fix Implementation]\n    Fix --> Verify[Verification & Monitoring]\n    Verify --> PostMortem[Lessons Learned]\n    PostMortem --> End([Closed])";
                break;
            case 'anomaly':
                tpl = "stateDiagram-v2\n    [*] --> New: Reported\n    New --> Triaged: Analysis\n    Triaged --> InProgress: Confirmed Bug\n    Triaged --> Closed: Not a Bug\n    InProgress --> Fixed: Committed\n    Fixed --> Verified: QA Testing\n    Verified --> [*]: Prod Release\n    Fixed --> InProgress: Regression Found";
                break;
        }
        if (tpl) {
            this.editor.value = tpl;
            this.onInputChange();
        }
    }

    showTemplates() {
        // Fallback or old method
        this.loadTemplate('rfc');
    }

    toggleTheme() {
        this.isDark = !this.isDark;
        document.body.style.filter = this.isDark ? 'none' : 'invert(1) hue-rotate(180deg)';
    }

    downloadSVG() {
        const svg = this.output.innerHTML;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mermaid-editor-v2.svg';
        a.click();
    }

    downloadPNG() {
        const svgElement = this.output.querySelector('svg');
        if (!svgElement) return;

        const xml = new XMLSerializer().serializeToString(svgElement);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const b64Start = 'data:image/svg+xml;base64,';
        const image64 = b64Start + svg64;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = svgElement.clientWidth * 2;
            canvas.height = svgElement.clientHeight * 2;
            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'mermaid-v2.png';
            a.click();
        };
        img.src = image64;
    }

    async saveToFile() {
        try {
            if (!this.fileHandle) {
                this.fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'diagram.mermaid',
                    types: [{
                        description: 'Mermaid Diagram',
                        accept: { 'text/plain': ['.mermaid'] },
                    }],
                });
            }
            const writable = await this.fileHandle.createWritable();
            await writable.write(this.editor.value);
            await writable.close();
        } catch (err) {
            console.error('Save canceled or failed', err);
        }
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new MermaidEditorV2();
});
