
(() => {
        // --- DATA ---
        const candidates = {
            'head-class': {
                male: [
                    { name: "Dhruv Gediya", logoUrl: "elction/boys/Gediya Dhruv Ashvinbhai.JPG" },
                    { name: "Jainesh Patel", logoUrl: "elction/boys/Patel Jainesh Hiteshbhai.jpg" },
                    { name: "Granth Mepani", logoUrl: "elction/boys/GRANTH MEPANI.jpg" },
                    { name: "Manthan Kapadiya", logoUrl: "elction/boys/Kapadiya Manthan Ashvinbhai.jpg" },
                    { name: "Yash Kalathiya ", logoUrl: "elction/boys/YASH KALATHIYA.jpg" },
                    { name: "Pal Jasani ", logoUrl: "elction/boys/PAL JASANI.jpg" },
                    { name: "Kirsh Bhanderi ", logoUrl: "elction/boys/KRISH BAHNDERI.jpg" },
                    { name: "Vashu Italiya ", logoUrl: "elction/boys/VASU ITALIYA.jpg" },
                    { name: "Divit Akabari ", logoUrl: "elction/boys/DIVIT AKBARI.jpg" }
                ],
                female: [
                    { name: "Deesha Miyani", logoUrl: "elction/girl/Miyani Deesha Jagdishbhai.jpg" },
                    { name: "Krisha Patel", logoUrl: "elction/girl/Patel Krisha Maheshkumar.jpg" },
                    { name: "Mahi Gojariya", logoUrl: "elction/girl/Gojariya Mahi Mukeshbhai.JPG" }
                ]
            }
        };

        const maleVotingIcons = [
            'Logo.png',
            'Logo.png',
            'Logo.png',
            'Logo.png',
            'Logo.png',
            'Logo.png',
            'Logo.png',
            'Logo.png',
            'Logo.png'
            
        ];

        const femaleVotingIcons = [
            'Logo.png',
            'Logo.png',
            'Logo.png'
            
        ];

        const ADMIN_PASSWORD = "admin123";
        let currentCategory = null;
        let categorySessionProgress = {};
        let currentAction = null;

        // --- DOM ELEMENTS ---
        const views = {
            home: document.getElementById('home-view'),
            gender: document.getElementById('gender-selection-view'),
            candidate: document.getElementById('candidate-view'),
            results: document.getElementById('results-view'),
        };
        const genderCategoryTitle = document.getElementById('gender-category-title');
        const genderButtonsContainer = document.getElementById('gender-buttons');
        const candidateCategoryTitle = document.getElementById('candidate-category-title');
        const candidatesListEl = document.getElementById('candidates-list');
        const infoMessageEl = document.getElementById('info-message-candidate');
        const resultsListEl = document.getElementById('results-list');
        const passwordModal = document.getElementById('password-modal');
        const passwordInput = document.getElementById('password-input');
        const cancelPasswordBtn = document.getElementById('cancel-password');
        const submitPasswordBtn = document.getElementById('submit-password');
        const modalTitle = document.getElementById('modal-title');

        // --- VIEW MANAGEMENT ---
        const switchView = (viewToShow) => {
            Object.values(views).forEach(view => view.style.display = 'none');
            views[viewToShow].style.display = 'flex';
        };

        const showHome = () => {
            currentCategory = null;
            categorySessionProgress = {};
            switchView('home');
        };
        
        const showGenderSelection = () => {
            switchView('gender');
            const displayName = "Head Boy/Head Girl";
            genderCategoryTitle.textContent = `Vote for ${displayName}`;
            
            const maleBtn = genderButtonsContainer.querySelector('[data-gender="male"]');
            const femaleBtn = genderButtonsContainer.querySelector('[data-gender="female"]');
            
            // Re-assign class based on category for color consistency
            maleBtn.className = `btn ${currentCategory}`;
            femaleBtn.className = `btn ${currentCategory}`;

            maleBtn.disabled = categorySessionProgress.male || false;
            femaleBtn.disabled = categorySessionProgress.female || false;
        };
        
        const showCandidates = (gender) => {
            switchView('candidate');
            infoMessageEl.classList.remove('visible');
            infoMessageEl.textContent = '';
            const displayName = "Head Boy/Head Girl";
            candidateCategoryTitle.textContent = `Candidates for ${displayName} (${gender})`;
            candidatesListEl.innerHTML = '';
            const candidateObjects = candidates[currentCategory]?.[gender] || [];
            
            if (candidateObjects.length === 0) {
                infoMessageEl.textContent = "No candidates available for this category.";
                infoMessageEl.classList.add('visible');
            }

            const currentVotingIcons = (gender === 'male') ? maleVotingIcons : femaleVotingIcons;
            candidateObjects.forEach((candidate, index) => {
                const card = document.createElement('div');
                card.className = `candidate-card ${currentCategory}`;
                
                card.innerHTML = `
                    <img src="${candidate.logoUrl}" alt="Logo for ${candidate.name}" class="candidate-logo" onerror="this.onerror=null;this.src='https://placehold.co/180x180/CCCCCC/FFFFFF?text=X';">
                    <img src="${currentVotingIcons[index % currentVotingIcons.length]}" alt="Voting Icon" class="voting-icon" onerror="this.onerror=null;this.src='https://placehold.co/70x70/CCCCCC/FFFFFF?text=X';">
                    <div class="candidate-name">${candidate.name}</div>
                    <button class="btn ${currentCategory}">Vote</button>
                `;
                
                card.querySelector('.btn').onclick = () => castVote(gender, candidate.name);
                candidatesListEl.appendChild(card);
            });
        };
        
        const showResults = () => {
            switchView('results');
            renderResults();
        };
        
        // --- DATA & LOGIC ---
        const renderResults = () => {
            const votes = JSON.parse(localStorage.getItem('schoolVotes')) || {};
            resultsListEl.innerHTML = '';
            const categoriesToRender = ['head-class']; 

            let hasResults = false;
            categoriesToRender.forEach(category => {
                const categoryVotes = votes[category];
                if (!categoryVotes || Object.keys(categoryVotes).length === 0) return;
                
                hasResults = true;
                const categoryWrapper = document.createElement('div');
                categoryWrapper.className = `result-category ${category}`;
                const categoryTitle = document.createElement('h3');
                categoryTitle.textContent = "Head Boy/Head Girl";
                categoryWrapper.appendChild(categoryTitle);

                ['male', 'female'].forEach(gender => {
                    const genderVotes = categoryVotes[gender];
                    if (!genderVotes || Object.keys(genderVotes).length === 0) return;

                    const genderGroup = document.createElement('div');
                    genderGroup.className = 'result-gender-group';

                    const genderTitle = document.createElement('h4');
                    genderTitle.textContent = gender.charAt(0).toUpperCase() + gender.slice(1);
                    genderGroup.appendChild(genderTitle);
                    
                    const candidatesContainer = document.createElement('div');
                    candidatesContainer.className = 'result-candidates';
                    
                    const currentCandidates = candidates[category]?.[gender] || [];
                    const sorted = [...currentCandidates].sort((a, b) => (genderVotes[b.name] || 0) - (genderVotes[a.name] || 0));

                    sorted.forEach(candidate => {
                        const count = genderVotes[candidate.name] || 0;
                        const el = document.createElement('div');
                        el.className = 'result-candidate';
                        el.innerHTML = `
                            <span>${candidate.name}</span>
                            <span class="vote-count">${count}</span>
                        `;
                        candidatesContainer.appendChild(el);
                    });
                    
                    genderGroup.appendChild(candidatesContainer);
                    categoryWrapper.appendChild(genderGroup);
                });
                if (categoryWrapper.children.length > 1) {
                    resultsListEl.appendChild(categoryWrapper);
                }
            });

            if (!hasResults) {
                resultsListEl.innerHTML = '<p style="text-align: center; font-size: 1.2rem;">No voting results available yet.</p>';
            }
        };

        const castVote = (gender, name) => {
            let votes = JSON.parse(localStorage.getItem('schoolVotes')) || {};
            if (!votes[currentCategory]) votes[currentCategory] = {};
            if (!votes[currentCategory][gender]) votes[currentCategory][gender] = {};
            votes[currentCategory][gender][name] = (votes[currentCategory][gender][name] || 0) + 1;
            localStorage.setItem('schoolVotes', JSON.stringify(votes));
            
            categorySessionProgress[gender] = true;
            candidatesListEl.innerHTML = ''; // Clear candidates to prevent double voting
            infoMessageEl.classList.add('visible');

            if (categorySessionProgress.male && categorySessionProgress.female) {
                infoMessageEl.textContent = "Thank you! Your votes have been cast.";
                setTimeout(showHome, 2500);
            } else {
                infoMessageEl.textContent = "Vote successful! Please vote for the other gender.";
                setTimeout(showGenderSelection, 2500);
            }
        };

        const resetVotes = () => {
            // A confirmation could be added here if desired
            localStorage.removeItem('schoolVotes');
            showCustomMessage("All votes have been successfully reset.");
            if (views.results.style.display === 'flex') {
                renderResults();
            }
        };
        
        const showCustomMessage = (message) => {
            const existingBox = document.querySelector('.custom-message-box');
            if (existingBox) existingBox.remove();

            const messageBox = document.createElement('div');
            messageBox.className = 'custom-message-box';
            messageBox.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.85); color: white; padding: 15px 25px;
                border-radius: 10px; z-index: 2000; font-size: 1rem; text-align: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); opacity: 0;
                transition: all 0.4s ease;
            `;
            messageBox.textContent = message;
            document.body.appendChild(messageBox);

            setTimeout(() => { messageBox.style.opacity = '1'; messageBox.style.top = '30px'; }, 10);
            setTimeout(() => {
                messageBox.style.opacity = '0';
                messageBox.style.top = '20px';
                messageBox.addEventListener('transitionend', () => messageBox.remove(), { once: true });
            }, 2200);
        };

        const showPasswordModal = (action) => {
            currentAction = action;
            modalTitle.textContent = action === 'view-results' 
                ? "Enter Password to View Results"
                : "Enter Admin Password to Reset Votes";
            passwordInput.value = '';
            passwordModal.classList.add('active');
            passwordInput.focus();
        };

        const hidePasswordModal = () => passwordModal.classList.remove('active');

        const checkPassword = () => {
            if (passwordInput.value.trim() === ADMIN_PASSWORD) {
                hidePasswordModal();
                if (currentAction === 'view-results') showResults();
                else if (currentAction === 'reset-votes') resetVotes();
            } else {
                showCustomMessage("Incorrect password.");
                passwordInput.value = '';
                passwordInput.focus();
            }
        };

        // --- EVENT LISTENERS ---
        document.querySelector('#home-view .button-grid').addEventListener('click', (e) => {
            const categoryButton = e.target.closest('[data-category]');
            if (categoryButton) {
                currentCategory = categoryButton.dataset.category;
                categorySessionProgress = {};
                showGenderSelection();
            }
        });
        
        genderButtonsContainer.addEventListener('click', (e) => {
            const genderButton = e.target.closest('[data-gender]');
            if (genderButton && !genderButton.disabled) {
                showCandidates(genderButton.dataset.gender);
            }
        });
        
        document.querySelector('[data-action="go-home"]').addEventListener('click', showHome);
        document.querySelector('[data-action="go-to-gender-select"]').addEventListener('click', showGenderSelection);
        
        document.getElementById('show-results-btn').addEventListener('click', () => showPasswordModal('view-results'));
        document.getElementById('reset-btn').addEventListener('click', () => showPasswordModal('reset-votes'));
        document.getElementById('results-back-btn').addEventListener('click', showHome);
        
        cancelPasswordBtn.addEventListener('click', hidePasswordModal);
        submitPasswordBtn.addEventListener('click', checkPassword);
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });

        // --- INITIALIZATION ---
        showHome();
    })();