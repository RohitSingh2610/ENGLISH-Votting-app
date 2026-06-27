(() => {
  // ---------- DATA ----------
  const candidates = {
    'head-class': {
      male: [
        { name: "Gohil Dhyey", logoUrl: "elction/boys/GOHIL DHYEY.jpeg" },
        { name: "Patel Vihan", logoUrl: "elction/boys/PATEL VIHAN.jpeg" },
        { name: "Vampariya Daksh", logoUrl: "elction/boys/VAMPARIYA DAKSH.jpeg" }
      ],
      female: [
        { name: "Lapani Shreeja", logoUrl: "elction/girl/LAPANI SHREEJA.jpeg" },
        { name: "Navapariya Hetvi", logoUrl: "elction/girl/NAVAPARIYA HETVI.jpeg" },
        { name: "Parmar Kenvisha", logoUrl: "elction/girl/PARMAR KENVISHA.jpeg" }
      ]
    }
  };

  const maleVotingIcons = [
    'logo/GOHIL DHYEY.png',
    'logo/PATEL VIHAN (2).jpeg',
    'logo/VAMPARIYA DAKSH (2).jpeg'
  ];
  const femaleVotingIcons = [
    'logo/LAPANI SHREEJA (2).jpeg',
    'logo/NAVAPARIYA HETVI.jpg',
    'logo/PARMAR KENVISHA.png'
  ];

  // SVG placeholders
  const getPlaceholderSVG = (text, bg = '#1e3a8a') => 
    `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22 viewBox=%220 0 140 140%22%3E%3Ccircle cx=%2270%22 cy=%2270%22 r=%2268%22 fill=%22${encodeURIComponent(bg)}%22 stroke=%22%233b82f6%22 stroke-width=%222%22/%3E%3Ctext x=%2270%22 y=%2285%22 font-family=%22Inter, sans-serif%22 font-size=%2248%22 font-weight=%22700%22 text-anchor=%22middle%22 fill=%22white%22%3E${text.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;

  const ADMIN_PASSWORD = "admin123";
  let currentCategory = null;
  let categorySessionProgress = {};
  let currentAction = null;

  // DOM refs
  const views = {
    home: document.getElementById('home-view'),
    gender: document.getElementById('gender-selection-view'),
    candidate: document.getElementById('candidate-view'),
    results: document.getElementById('results-view'),
  };
  const genderButtonsContainer = document.getElementById('gender-buttons');
  const candidateCategoryTitle = document.getElementById('candidate-category-title');
  const candidatesListEl = document.getElementById('candidates-list');
  const infoMessageEl = document.getElementById('info-message-candidate');
  const resultsListEl = document.getElementById('results-list');
  const winnerDisplayEl = document.getElementById('winner-display');
  const passwordModal = document.getElementById('password-modal');
  const passwordInput = document.getElementById('password-input');
  const cancelPasswordBtn = document.getElementById('cancel-password');
  const submitPasswordBtn = document.getElementById('submit-password');
  const modalTitle = document.getElementById('modal-title');
  const toastEl = document.getElementById('toast-message');

  // ---------- helpers ----------
  function showView(viewKey) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewKey].classList.add('active');
  }

  function showHome() {
    currentCategory = null;
    categorySessionProgress = {};
    showView('home');
  }

  function showGenderSelection() {
    showView('gender');
    const maleBtn = genderButtonsContainer.querySelector('[data-gender="male"]');
    const femaleBtn = genderButtonsContainer.querySelector('[data-gender="female"]');
    maleBtn.className = 'btn gender-male';
    femaleBtn.className = 'btn gender-female';
    maleBtn.disabled = !!categorySessionProgress.male;
    femaleBtn.disabled = !!categorySessionProgress.female;
  }

  function showCandidates(gender) {
    showView('candidate');
    infoMessageEl.classList.remove('visible');
    infoMessageEl.textContent = '';
    const genderLabel = gender.charAt(0).toUpperCase() + gender.slice(1);
    candidateCategoryTitle.textContent = `👤 Candidates · ${genderLabel}`;
    candidateCategoryTitle.style.cssText = 'font-size:1.8rem; font-weight:700; color:#1e3a8a; margin-bottom:32px;';
    candidatesListEl.innerHTML = '';
    const candidateObjects = candidates[currentCategory]?.[gender] || [];
    if (!candidateObjects.length) {
      infoMessageEl.textContent = '⚠️ No candidates available.';
      infoMessageEl.classList.add('visible');
      return;
    }
    const icons = gender === 'male' ? maleVotingIcons : femaleVotingIcons;
    const genderClass = gender === 'male' ? 'gender-male' : 'gender-female';
    const placeholderBg = gender === 'male' ? '#051b63' : '#9d174d';
    
    candidateObjects.forEach((cand, idx) => {
      const card = document.createElement('div');
      card.className = `candidate-card ${genderClass}`;
      const iconSrc = icons[idx % icons.length] || '';
      const placeholder = getPlaceholderSVG(cand.name, placeholderBg);
      
      card.innerHTML = `
        <img src="${cand.logoUrl}" alt="${cand.name}" class="candidate-logo" loading="lazy" 
             onerror="this.onerror=null;this.src='${placeholder}';" />
        <img src="${iconSrc}" alt="voting icon" class="voting-icon" loading="lazy"
             onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%2228%22 fill=%22%232563eb%22/%3E%3Ctext x=%2230%22 y=%2240%22 font-family=%22Inter, sans-serif%22 font-size=%2230%22 font-weight=%22700%22 text-anchor=%22middle%22 fill=%22white%22%3E✓%3C/text%3E%3C/svg%3E';" />
        <div class="candidate-name">${cand.name}</div>
        <button class="btn ${genderClass}">Vote</button>
      `;
      card.querySelector('.btn').onclick = () => castVote(gender, cand.name);
      candidatesListEl.appendChild(card);
    });
  }

  function castVote(gender, name) {
    let votes = JSON.parse(localStorage.getItem('schoolVotes')) || {};
    if (!votes[currentCategory]) votes[currentCategory] = {};
    if (!votes[currentCategory][gender]) votes[currentCategory][gender] = {};
    votes[currentCategory][gender][name] = (votes[currentCategory][gender][name] || 0) + 1;
    localStorage.setItem('schoolVotes', JSON.stringify(votes));

    categorySessionProgress[gender] = true;
    candidatesListEl.innerHTML = '';
    infoMessageEl.classList.add('visible');

    if (categorySessionProgress.male && categorySessionProgress.female) {
      infoMessageEl.textContent = '✅ Thank you! Both votes recorded.';
      setTimeout(showHome, 2000);
    } else {
      infoMessageEl.textContent = '✔️ Vote cast! Please vote for the other gender.';
      setTimeout(showGenderSelection, 1800);
    }
  }

  function getWinners(votes) {
    const winners = {};
    const categories = ['head-class'];
    
    categories.forEach(cat => {
      const catVotes = votes[cat];
      if (!catVotes) return;
      
      ['male', 'female'].forEach(gender => {
        const gVotes = catVotes[gender];
        if (!gVotes || Object.keys(gVotes).length === 0) return;
        
        const candList = candidates[cat]?.[gender] || [];
        let maxVotes = 0;
        const tiedWinners = [];
        
        // Find max votes
        candList.forEach(c => {
          const count = gVotes[c.name] || 0;
          if (count > maxVotes) {
            maxVotes = count;
          }
        });
        
        // Find all candidates with max votes
        candList.forEach(c => {
          const count = gVotes[c.name] || 0;
          if (count === maxVotes && maxVotes > 0) {
            tiedWinners.push({ ...c, votes: count, gender, category: cat });
          }
        });
        
        if (tiedWinners.length > 0) {
          const key = `${cat}-${gender}`;
          winners[key] = tiedWinners;
        }
      });
    });
    
    return winners;
  }

  function renderResults() {
    const votes = JSON.parse(localStorage.getItem('schoolVotes')) || {};
    resultsListEl.innerHTML = '';
    winnerDisplayEl.innerHTML = '';
    
    // Display winners
    const winners = getWinners(votes);
    const winnerKeys = Object.keys(winners);
    
    if (winnerKeys.length > 0) {
      winnerKeys.forEach(key => {
        const winnerList = winners[key];
        const isTie = winnerList.length > 1;
        const genderLabel = winnerList[0].gender === 'male' ? 'Head Boy' : 'Head Girl';
        
        winnerList.forEach((winner, index) => {
          const placeholder = getPlaceholderSVG(winner.name, winner.gender === 'male' ? '#1e40af' : '#9d174d');
          
          const card = document.createElement('div');
          card.className = `winner-card${isTie ? ' tie-badge' : ''}`;
          
          let trophyIcon = '🏆';
          if (isTie) {
            trophyIcon = index === 0 ? '🏆' : '🥇';
          }
          
          card.innerHTML = `
            <span class="trophy">${trophyIcon}</span>
            <img src="${winner.logoUrl}" alt="${winner.name}" class="winner-avatar" 
                 onerror="this.onerror=null;this.src='${placeholder}';" />
            <div class="winner-info">
              <div class="winner-name">
                ${winner.name}
                ${isTie ? `<span class="tie-label">TIE</span>` : ''}
              </div>
              <div class="winner-role">${genderLabel}</div>
            </div>
            <div class="winner-votes">🎯 ${winner.votes} votes</div>
          `;
          winnerDisplayEl.appendChild(card);
        });
      });
    } else {
      winnerDisplayEl.innerHTML = '<div class="no-winner">🏳️ No votes have been cast yet.</div>';
    }
    
    // Display all results
    const categories = ['head-class'];
    let hasData = false;
    
    categories.forEach(cat => {
      const catVotes = votes[cat];
      if (!catVotes || Object.keys(catVotes).length === 0) return;
      hasData = true;
      
      const wrapper = document.createElement('div');
      wrapper.className = `result-category ${cat}`;
      const title = document.createElement('h3');
      title.innerHTML = '🏅 Head Boy / Head Girl';
      wrapper.appendChild(title);
      
      ['male', 'female'].forEach(gender => {
        const gVotes = catVotes[gender];
        if (!gVotes || Object.keys(gVotes).length === 0) return;
        
        const group = document.createElement('div');
        group.className = 'result-gender-group';
        const h4 = document.createElement('h4');
        h4.innerHTML = gender === 'male' ? '♂ Male' : '♀ Female';
        group.appendChild(h4);
        
        const container = document.createElement('div');
        container.className = 'result-candidates';
        const candList = candidates[cat]?.[gender] || [];
        const sorted = [...candList].sort((a,b) => (gVotes[b.name]||0) - (gVotes[a.name]||0));
        const maxVotes = sorted.length > 0 ? (gVotes[sorted[0]?.name] || 0) : 0;
        
        sorted.forEach(c => {
          const count = gVotes[c.name] || 0;
          const isWinner = count > 0 && count === maxVotes && maxVotes > 0;
          const el = document.createElement('div');
          el.className = `result-candidate${isWinner ? ' winner-highlight' : ''}`;
          el.innerHTML = `
            <span>${isWinner ? '👑 ' : ''}${c.name}</span>
            <span class="vote-count">${count}</span>
          `;
          container.appendChild(el);
        });
        group.appendChild(container);
        wrapper.appendChild(group);
      });
      
      if (wrapper.children.length > 1) resultsListEl.appendChild(wrapper);
    });
    
    if (!hasData) {
      resultsListEl.innerHTML = '<div class="no-results">📭 No votes have been cast yet.</div>';
    }
  }

  function resetVotes() {
    localStorage.removeItem('schoolVotes');
    showToast('🔄 All votes have been reset.');
    if (views.results.classList.contains('active')) renderResults();
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._hideTimer);
    toastEl._hideTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  // password modal
  function showPasswordModal(action) {
    currentAction = action;
    modalTitle.textContent = action === 'view-results' ? '🔑 View Results' : '🛡️ Reset Votes';
    passwordInput.value = '';
    passwordModal.classList.add('active');
    passwordInput.focus();
  }
  function hidePasswordModal() { passwordModal.classList.remove('active'); }
  function checkPassword() {
    if (passwordInput.value.trim() === ADMIN_PASSWORD) {
      hidePasswordModal();
      if (currentAction === 'view-results') { showView('results'); renderResults(); }
      else if (currentAction === 'reset-votes') resetVotes();
    } else {
      showToast('❌ Incorrect password.');
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  // ---------- event binding ----------
  document.querySelector('#home-view .button-grid').addEventListener('click', (e) => {
    const catBtn = e.target.closest('[data-category]');
    if (catBtn) {
      currentCategory = catBtn.dataset.category;
      categorySessionProgress = {};
      showGenderSelection();
    }
  });

  genderButtonsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gender]');
    if (btn && !btn.disabled) showCandidates(btn.dataset.gender);
  });

  document.querySelector('[data-action="go-home"]')?.addEventListener('click', showHome);
  document.querySelector('[data-action="go-to-gender-select"]')?.addEventListener('click', showGenderSelection);

  document.getElementById('show-results-btn').addEventListener('click', () => showPasswordModal('view-results'));
  document.getElementById('reset-btn').addEventListener('click', () => showPasswordModal('reset-votes'));
  document.getElementById('results-back-btn').addEventListener('click', showHome);

  cancelPasswordBtn.addEventListener('click', hidePasswordModal);
  submitPasswordBtn.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPassword(); });

  passwordModal.addEventListener('click', (e) => { if (e.target === passwordModal) hidePasswordModal(); });

  // start
  showHome();
})();