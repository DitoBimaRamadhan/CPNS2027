let db = {};
let currentQuizCategory = '';
let currentQuestions = [];
let currentIndex = 0;
let userAnswers = {}; // { questionId: selectedOptionIndex }

// Fetch database on load (Adjusted for GitHub Pages static serving)
fetch('data/database.json')
    .then(res => res.json())
    .then(data => {
        db = data;
        console.log("Database loaded.");
    })
    .catch(err => console.error("Failed to load DB:", err));

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden-section'));
    document.querySelectorAll('main > section').forEach(sec => sec.classList.remove('active-section'));
    document.getElementById(sectionId).classList.remove('hidden-section');
    document.getElementById(sectionId).classList.add('active-section');
}

function loadMaterial(category) {
    const mat = db.materials[category];
    document.getElementById('material-title').innerText = mat.title;
    document.getElementById('material-content').innerHTML = mat.content;
    showSection('material-section');
}

function startQuiz(category) {
    currentQuizCategory = category;
    currentQuestions = db.questions[category] || [];
    currentIndex = 0;
    userAnswers = {};
    
    document.getElementById('quiz-title').innerText = `Latihan Soal ${category.toUpperCase()}`;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    
    if (currentQuestions.length === 0) {
        document.getElementById('quiz-container').innerHTML = '<p>Soal belum tersedia untuk kategori ini.</p>';
        showSection('quiz-section');
        return;
    }
    
    renderQuestion();
    showSection('quiz-section');
}

function renderQuestion() {
    const q = currentQuestions[currentIndex];
    const container = document.getElementById('quiz-container');
    
    document.getElementById('current-question-num').innerText = currentIndex + 1;
    
    let html = `<div class="question-text">${currentIndex + 1}. ${q.text}</div>`;
    
    q.options.forEach((opt, index) => {
        const isChecked = userAnswers[q.id] === index ? 'checked' : '';
        html += `
            <label class="option-label">
                <input type="radio" name="q_${q.id}" value="${index}" onchange="selectOption(${q.id}, ${index})" ${isChecked}>
                ${opt.label}. ${opt.text}
            </label>
        `;
    });
    
    container.innerHTML = html;
    
    document.getElementById('prev-btn').disabled = currentIndex === 0;
    
    if (currentIndex === currentQuestions.length - 1) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'inline-block';
    } else {
        document.getElementById('next-btn').style.display = 'inline-block';
        document.getElementById('submit-btn').style.display = 'none';
    }
}

function selectOption(questionId, optionIndex) {
    userAnswers[questionId] = optionIndex;
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
    }
}

function submitQuiz() {
    let totalScore = 0;
    let discussionHtml = '';
    
    currentQuestions.forEach((q, idx) => {
        const selectedIdx = userAnswers[q.id];
        const hasAnswered = selectedIdx !== undefined;
        let scoreObtained = 0;
        let selectedText = "Tidak dijawab";
        
        if (hasAnswered) {
            scoreObtained = q.options[selectedIdx].score;
            selectedText = `${q.options[selectedIdx].label}. ${q.options[selectedIdx].text}`;
        }
        
        totalScore += scoreObtained;
        
        // Find correct answer (for TWK/TIU it's score 5, for TKP it's max score 5)
        let bestOption = q.options.reduce((prev, current) => (prev.score > current.score) ? prev : current);
        
        let scoreDisplay = currentQuizCategory === 'tkp' ? `(Poin: ${scoreObtained})` : (scoreObtained === 5 ? '(Benar +5)' : '(Salah 0)');
        let colorClass = scoreObtained === 5 ? 'correct-answer' : 'danger';
        
        discussionHtml += `
            <div class="discussion-item">
                <p><strong>Soal ${idx + 1}:</strong> ${q.text}</p>
                <p>Jawaban Anda: <span class="${colorClass}">${selectedText}</span> ${scoreDisplay}</p>
                <p>Jawaban Terbaik: <span class="correct-answer">${bestOption.label}. ${bestOption.text} (Poin 5)</span></p>
                <div class="explanation">
                    <strong>Pembahasan:</strong> ${q.explanation}
                </div>
            </div>
        `;
    });
    
    document.getElementById('final-score').innerText = totalScore;
    document.getElementById('discussion-container').innerHTML = discussionHtml;
    showSection('result-section');
}
