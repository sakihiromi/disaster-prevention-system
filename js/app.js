class App {
    constructor() {
        this.currentView = 'home';
        this.isEmergency = false;
        this.historyViewMode = 'list'; // 'list' or 'map'
        this.historyMap = null;
        this.historyMarkers = [];
        this.selectedRegion = 'all'; // 現在選択されている地域
        this.init();
    }

    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);

        // Core Initializations
        MapManager.initHeroMap();
        this.renderChecklist();
        this.renderGuides();
        this.fetchRealData(); // Fetch real JMA earthquake data
        // renderSNS removed - Twitter widget auto-renders
        this.loadContacts();
        this.updateStats();

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            // Simple toggle for now, could be expanded
            this.toggleEmergencyMode();
            // Note: Normally theme toggle should switch light/dark, but reusing debug func for effect or implementing separate dark mode.
            // Let's implement true dark mode toggle if requested, but for now map it to Emergency/Dark feels.
            // OR: Separate Dark Mode vs Emergency Mode. Let's do simple Dark Mode toggle.
            document.body.classList.toggle('dark-mode');
        });

        // Debug / Simulation Button
        const debugBtn = document.getElementById('debug-toggle-status');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                this.toggleEmergencyMode();
            });
        }
    }

    async fetchRealData() {
        // Try to fetch all disaster types from API
        const allAlerts = await DisasterService.fetchAllDisasters();
        if (allAlerts && allAlerts.length > 0) {
            disasterData.alerts = allAlerts;
            console.log("Loaded Disaster Data:", allAlerts.length, "items (24h filtered)");
            console.log("Disaster types:", [...new Set(allAlerts.map(a => a.disasterType))]);
            console.log("History items:", DisasterService.getHistory().length);
        } else {
            console.log("Using Simulation Data");
        }

        // Update Map and Lists
        this.renderAlerts();
        MapManager.refreshAlerts(disasterData.alerts);
        this.renderDisasterList(); // Update SNS page disaster list
    }

    // Render disaster list for SNS/News view (all disaster types)
    renderDisasterList() {
        const container = document.getElementById('jma-earthquake-list');
        if (!container) return;

        const alerts = disasterData.alerts || [];

        if (alerts.length === 0) {
            container.innerHTML = '<p style="color: #666; font-size: 0.9em;">現在、災害情報はありません。</p>';
            return;
        }

        container.innerHTML = alerts.slice(0, 10).map(alert => {
            const icon = alert.icon || 'fa-triangle-exclamation';
            return `
            <div style="border-bottom: 1px solid #eee; padding: 0.75rem 0; cursor: pointer;" 
                 onclick="app.navigate('home'); MapManager.map.flyTo([${alert.lat}, ${alert.lng}], 8);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid ${icon}" style="color: ${alert.color};"></i>
                        <strong style="color: ${alert.color};">${alert.level}</strong>
                    </div>
                    <span style="font-size: 0.85em; color: #666;">${alert.time}</span>
                </div>
                <div style="font-size: 0.85em; color: #555;">${alert.message}</div>
                ${alert.mag ? `<div style="font-size: 0.8em; color: #888;">M${alert.mag}</div>` : ''}
            </div>
        `}).join('');
    }

    // --- SNS Logic (Mock) ---
    renderSNS() {
        const container = document.getElementById('sns-feed-list');
        if (!container) return;

        // Use mock data from data.js
        const tweets = disasterData.snsFeed || [];

        container.innerHTML = tweets.map(t => `
            <div class="sns-card" style="border-bottom: 1px solid #eee; padding: 1rem 0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
                    <div style="font-weight:bold; color:#333;">
                        ${t.user} <span style="font-weight:normal; color:gray; font-size:0.9em;">${t.handle}</span>
                        ${t.verified ? '<i class="fa-solid fa-circle-check" style="color:var(--primary-color); margin-left:4px;"></i>' : ''}
                    </div>
                    <div style="font-size:0.8em; color:gray;">${t.time}</div>
                </div>
                <p style="font-size:0.95rem; line-height:1.5;">${t.text}</p>
                <div style="display:flex; gap:1rem; margin-top:0.5rem; color:gray; font-size:0.85em;">
                    <span><i class="fa-regular fa-comment"></i> 2</span>
                    <span><i class="fa-solid fa-retweet"></i> 15</span>
                    <span><i class="fa-regular fa-heart"></i> 32</span>
                </div>
            </div>
        `).join('');
    }

    // --- Guide Logic ---
    renderGuides() {
        const container = document.getElementById('guide-container');
        if (!container || !disasterData.guides) return;

        const html = disasterData.guides.map(guide => {
            const stepsHtml = guide.steps.map((step, idx) => `
                <li style="margin-bottom: 0.8rem; display: flex; align-items: flex-start; gap: 0.8rem;">
                    <span style="background: ${guide.color}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0;">${idx + 1}</span>
                    <div>
                        <strong style="display:block; color:var(--text-color); margin-bottom:0.2rem;">${step.title}</strong>
                        <span style="font-size:0.9rem; color: #555; line-height: 1.5;">${step.detail}</span>
                    </div>
                </li>
            `).join('');

            return `
                <div class="guide-card">
                    <div style="background: ${guide.color}15; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem; color: ${guide.color};">
                        <i class="fa-solid ${guide.icon}"></i>
                    </div>
                    <h3 style="margin-bottom: 0.5rem; color: #333;">${guide.title}</h3>
                    <p style="color: #666; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6;">${guide.summary}</p>
                    
                    <!-- Statistical Data Point -->
                    <div class="stat-highlight" style="background: #f8f9fa; border-left: 4px solid ${guide.color}; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 0.3rem;">DATA INSIGHT</div>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1rem; font-weight: bold; color: #333;">${guide.statData.label}:</span>
                            <span style="font-size: 1.4rem; font-weight: 800; color: ${guide.color}; font-family: 'Inter', sans-serif;">${guide.statData.value}</span>
                        </div>
                        <p style="font-size: 0.85rem; color: #555; line-height: 1.6;">${guide.statData.description}</p>
                        <div style="text-align: right; font-size: 0.75rem; color: #999; margin-top: 0.5rem;">出典: ${guide.statData.source}</div>
                    </div>

                    <ul style="list-style: none; padding: 0;">
                        ${stepsHtml}
                    </ul>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // --- Navigation ---
    navigate(viewName) {
        // Hide all views
        document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));

        // Show target
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.classList.add('active');

            // Update sidebar active state
            const navItem = document.querySelector(`.nav-links li[onclick*="'${viewName}'"]`);
            if (navItem) navItem.classList.add('active');

            this.currentView = viewName;

            // Resize map if returning home
            if (viewName === 'home' && MapManager.map) {
                setTimeout(() => MapManager.map.invalidateSize(), 100);
            }

            // Initialize history view if navigating to it
            if (viewName === 'history') {
                this.renderHistoryView();
            }
        }
    }

    // --- Region Logic ---
    changeRegion(regionKey) {
        this.selectedRegion = regionKey;
        MapManager.flyToRegion(regionKey);
        // Panel update is handled in flyToRegion via app.showRegionalInfo
        
        // 災害情報一覧と過去の災害情報を更新
        this.renderAlerts();
        if (this.currentView === 'history') {
            this.renderHistoryView();
        }
    }

    // 地域の座標範囲を定義（中心点から約300km以内を対象とする）
    getRegionBounds() {
        return {
            hokkaido: { minLat: 41.0, maxLat: 45.5, minLng: 139.0, maxLng: 146.0 },
            tohoku: { minLat: 37.0, maxLat: 41.5, minLng: 139.0, maxLng: 142.5 },
            kanto: { minLat: 34.5, maxLat: 37.0, minLng: 138.0, maxLng: 141.0 },
            hokuriku: { minLat: 35.5, maxLat: 38.0, minLng: 135.5, maxLng: 138.5 },
            chubu: { minLat: 34.5, maxLat: 36.5, minLng: 136.0, maxLng: 139.0 },
            kansai: { minLat: 33.5, maxLat: 36.0, minLng: 134.0, maxLng: 137.0 },
            chugoku: { minLat: 33.5, maxLat: 35.5, minLng: 130.5, maxLng: 134.5 },
            shikoku: { minLat: 32.5, maxLat: 34.5, minLng: 132.0, maxLng: 135.0 },
            kyushu: { minLat: 30.5, maxLat: 34.0, minLng: 129.0, maxLng: 132.5 }
        };
    }

    // 災害データを選択された地域でフィルタリング
    filterByRegion(alerts) {
        if (this.selectedRegion === 'all' || !this.selectedRegion) {
            return alerts;
        }

        const bounds = this.getRegionBounds()[this.selectedRegion];
        if (!bounds) return alerts;

        return alerts.filter(alert => {
            if (!alert.lat || !alert.lng) return false;
            return alert.lat >= bounds.minLat && 
                   alert.lat <= bounds.maxLat && 
                   alert.lng >= bounds.minLng && 
                   alert.lng <= bounds.maxLng;
        });
    }

    showRegionalInfo(regionKey, alertData = null) {
        const panel = document.getElementById('regional-info-panel');
        const content = panel.querySelector('.info-content');

        if (alertData) {
            // Show Alert Details with appropriate icon
            const icon = alertData.icon || 'fa-circle-exclamation';
            const typeInfo = disasterData.disasterTypes[alertData.disasterType];
            const bgColor = typeInfo ? typeInfo.bgColor : '#fff';

            content.innerHTML = `
                <div style="border-left: 4px solid ${alertData.color}; padding-left: 1rem; background: linear-gradient(90deg, ${bgColor} 0%, transparent 100%); padding: 1rem; border-radius: 0 8px 8px 0;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fa-solid ${icon}" style="color: ${alertData.color}; font-size: 1.2rem;"></i>
                        <h4 style="color:${alertData.color}; margin: 0;">${alertData.type}</h4>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="background: ${alertData.color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem;">${alertData.level}</span>
                        <span style="color: #666; font-size: 0.85rem;"><i class="fa-solid fa-clock"></i> ${alertData.time}</span>
                    </div>
                    <p style="margin-top:0.5rem; font-size:0.9rem; color: #333;">${alertData.message}</p>
                    ${alertData.mag ? `<p style="font-size: 0.85rem; color: #666; margin-top: 0.3rem;">マグニチュード: M${alertData.mag}</p>` : ''}
                </div>
            `;
        } else if (regionKey && regionKey !== 'all') {
            // Show Region Details
            const region = disasterData.regions[regionKey];
            if (region) {
                content.innerHTML = `
                    <h4>${region.name}</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.5rem; font-size:0.9rem;">
                        <div><strong>リスク:</strong> ${region.riskLevel}</div>
                        <div><strong>避難所:</strong> ${region.shelters}ヶ所</div>
                    </div>
                    <p style="margin-top:0.8rem; font-size:0.9rem; color:var(--text-muted);"><i class="fa-solid fa-cloud"></i> ${region.forecast}</p>
                `;
            }
        } else {
            // Default All Japan
            content.innerHTML = `
                <p>現在、全国的に監視体制を強化しています。</p>
                <p style="margin-top:0.5rem; color: var(--text-muted); font-size: 0.9rem;">地図上のマーカーをクリックすると詳細が表示されます。</p>
            `;
        }
    }

    // --- Checklist Logic ---
    renderChecklist() {
        const container = document.getElementById('checklist-container');
        if (!container) return;

        // Load saved state
        const savedState = JSON.parse(localStorage.getItem('checklistState') || '{}');

        // New Detailed Structure
        let currentTotal = 0;
        let currentChecked = 0;

        const html = disasterData.checklists.map(category => {
            const itemsHtml = category.items.map(item => {
                const isChecked = savedState[item.id] || false;
                currentTotal++;
                if (isChecked) currentChecked++;

                return `
                    <div class="check-item">
                        <input type="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''} 
                            onchange="app.toggleCheck('${item.id}')">
                        <div>
                            <div style="font-weight:600;">${item.label}</div>
                            <div style="font-size:0.8em; color:var(--text-muted);">${item.desc}</div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="checklist-category">
                    <h3><i class="fa-solid ${category.icon}"></i> ${category.category}</h3>
                    <div style="background:#f9f9f9; border-radius:12px; padding:0.5rem;">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        this.updateProgress(currentChecked, currentTotal);
    }

    toggleCheck(id) {
        const savedState = JSON.parse(localStorage.getItem('checklistState') || '{}');
        savedState[id] = !savedState[id];
        localStorage.setItem('checklistState', JSON.stringify(savedState));

        // Re-calc stats (Simple reload or optimized calc)
        this.renderChecklist(); // Re-render to update stats broadly
        this.updateStats();
    }

    updateProgress(checked, total) {
        const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
        const bar = document.getElementById('total-progress-bar');
        const text = document.getElementById('total-progress-text');

        if (bar) bar.style.width = `${percent}%`;
        if (text) text.textContent = percent;

        // Also update home stat
        const homeStat = document.getElementById('stat-progress');
        if (homeStat) homeStat.textContent = percent;
    }

    // --- Alerts Logic ---
    renderAlerts() {
        const feed = document.getElementById('alert-feed-container');
        if (!feed) return;

        // 地域フィルタを適用
        const allAlerts = disasterData.alerts || [];
        const filteredAlerts = this.filterByRegion(allAlerts);

        // Count for Home Badge (全体の件数を表示)
        const totalCount = allAlerts.length;
        const statAlerts = document.getElementById('stat-alerts');
        if (statAlerts) statAlerts.textContent = totalCount;

        // 地域ラベルを更新
        const regionLabel = document.getElementById('alerts-region-label');
        if (regionLabel) {
            if (this.selectedRegion === 'all') {
                regionLabel.textContent = '';
            } else {
                const regionInfo = disasterData.regions[this.selectedRegion];
                regionLabel.textContent = `- ${regionInfo?.name || this.selectedRegion}`;
            }
        }

        if (filteredAlerts.length === 0) {
            const regionName = this.selectedRegion === 'all' ? '' : `（${disasterData.regions[this.selectedRegion]?.name || this.selectedRegion}）`;
            feed.innerHTML = `<p>現在、${regionName}警報はありません。</p>`;
            return;
        }

        feed.innerHTML = filteredAlerts.map(alert => {
            const icon = alert.icon || 'fa-circle-exclamation';
            const typeInfo = disasterData.disasterTypes[alert.disasterType];
            const bgColor = typeInfo ? typeInfo.bgColor : '#fff';

            return `
            <div class="alert-card" style="border-left: 5px solid ${alert.color}; background: linear-gradient(135deg, ${bgColor} 0%, #fff 100%); padding:1.5rem; margin-bottom:1rem; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="background: ${alert.color}15; width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${alert.color};">
                        <i class="fa-solid ${icon}" style="font-size: 1.3rem;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="color:${alert.color}; margin: 0;">${alert.type}</h3>
                        <div style="display:flex; justify-content:space-between; margin-top:0.3rem; color:#555; font-size: 0.9rem;">
                            <span><i class="fa-solid fa-clock"></i> ${alert.time}</span>
                            <span style="font-weight:bold; background: ${alert.color}; color: white; padding: 2px 8px; border-radius: 4px;">${alert.level}</span>
                        </div>
                    </div>
                </div>
                <p style="margin-top:1rem; color: #333;">${alert.message}</p>
                <div style="margin-top:0.5rem; font-size:0.85rem; color:#888; display: flex; justify-content: space-between;">
                    <span>エリア: Lat ${alert.lat?.toFixed(2)}, Lng ${alert.lng?.toFixed(2)}</span>
                    <span style="color: ${alert.color};">${alert.source || ''}</span>
                </div>
            </div>
        `}).join('');
    }

    // --- Contacts Logic (Same as before but specific methods) ---
    loadContacts() {
        const list = document.getElementById('contact-list');
        if (!list) return;

        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');

        if (contacts.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted); padding:1rem;">登録がありません。</p>';
            return;
        }

        list.innerHTML = contacts.map((c, index) => `
            <div class="contact-card" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="font-size:1.1rem;">${c.name}</strong> <span style="font-size:0.9em; opacity:0.7">(${c.relation})</span>
                    <div style="font-size: 1.2em; color: var(--primary-color); font-weight:700;"><i class="fa-solid fa-phone"></i> ${c.phone}</div>
                </div>
                <button onclick="app.deleteContact(${index})" style="background:rgba(255,59,48,0.1); color:var(--alert-color); border:none; width:40px; height:40px; border-radius:50%; cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Setup add button listener only once (use simple onclick in HTML or handle properly)
        const btn = document.getElementById('add-contact-btn');
        if (btn) {
            btn.onclick = () => {
                const name = document.getElementById('contact-name').value;
                const rel = document.getElementById('contact-rel').value;
                const tel = document.getElementById('contact-tel').value;
                if (name && tel) this.addContact(name, rel, tel);
            };
        }
    }

    addContact(name, relation, phone) {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        contacts.push({ name, relation, phone });
        localStorage.setItem('contacts', JSON.stringify(contacts));

        // Clear inputs
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-rel').value = '';
        document.getElementById('contact-tel').value = '';

        this.loadContacts();
    }

    deleteContact(index) {
        if (confirm('削除しますか？')) {
            const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
            contacts.splice(index, 1);
            localStorage.setItem('contacts', JSON.stringify(contacts));
            this.loadContacts();
        }
    }

    // --- Safety Logic ---
    handleSafetyStatus(status) {
        const log = document.getElementById('safety-log');
        const msg = status === 'safe'
            ? '<i class="fa-solid fa-check" style="color:var(--success-color)"></i> [無事] が送信されました。'
            : '<i class="fa-solid fa-triangle-exclamation" style="color:var(--alert-color)"></i> [救助要請] が送信されました！';

        const li = document.createElement('li');
        li.innerHTML = `${new Date().toLocaleTimeString()} : ${msg}`;

        // Clear initial placeholder
        if (log.querySelector('li').innerText.includes('まだ送信')) log.innerHTML = '';
        log.prepend(li); // Newest first

        alert("メッセージをシミュレーション送信しました。");
    }

    // --- Utils ---
    updateStats() {
        // Redundant calls wrapped in specific renders, but good for general refresh
        this.renderAlerts();
        // Progress is updated in renderChecklist
    }

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        // const dateStr = now.toLocaleDateString ...
        const el = document.getElementById('current-time');
        if (el) el.textContent = timeStr;
    }

    toggleEmergencyMode() {
        this.isEmergency = !this.isEmergency;
        if (this.isEmergency) {
            document.body.setAttribute('data-theme', 'emergency');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    // --- History View Logic ---

    setHistoryViewMode(mode) {
        this.historyViewMode = mode;

        // Update button styles
        const listBtn = document.getElementById('view-mode-list');
        const mapBtn = document.getElementById('view-mode-map');
        const listView = document.getElementById('history-list-view');
        const mapView = document.getElementById('history-map-view');

        if (mode === 'list') {
            listBtn.style.background = 'var(--primary-color)';
            listBtn.style.color = 'white';
            mapBtn.style.background = '#f9f9f9';
            mapBtn.style.color = '#333';
            listView.style.display = 'block';
            mapView.style.display = 'none';
        } else {
            listBtn.style.background = '#f9f9f9';
            listBtn.style.color = '#333';
            mapBtn.style.background = 'var(--primary-color)';
            mapBtn.style.color = 'white';
            listView.style.display = 'none';
            mapView.style.display = 'block';
            this.initHistoryMap();
        }

        this.renderHistoryView();
    }

    getFilteredHistory() {
        const typeFilter = document.getElementById('history-type-filter')?.value || 'all';
        const periodFilter = parseInt(document.getElementById('history-period-filter')?.value || '30');

        let history = DisasterService.getHistoryByPeriod(periodFilter);

        if (typeFilter !== 'all') {
            history = history.filter(h => h.disasterType === typeFilter);
        }

        // 地域フィルタを適用
        history = this.filterByRegion(history);

        // Sort by timestamp (newest first)
        history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        return history;
    }

    renderHistoryView() {
        const history = this.getFilteredHistory();

        // 地域ラベルを更新
        const regionLabel = document.getElementById('history-region-label');
        if (regionLabel) {
            if (this.selectedRegion === 'all') {
                regionLabel.textContent = '';
            } else {
                const regionInfo = disasterData.regions[this.selectedRegion];
                regionLabel.textContent = `- ${regionInfo?.name || this.selectedRegion}`;
            }
        }

        this.renderHistoryStats(history);

        if (this.historyViewMode === 'list') {
            this.renderHistoryList(history);
        } else {
            this.renderHistoryMap(history);
        }
    }

    renderHistoryStats(history) {
        const container = document.getElementById('history-stats');
        if (!container) return;

        // Count by disaster type
        const typeCounts = {};
        history.forEach(h => {
            const type = h.disasterType || 'unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const types = disasterData.disasterTypes;
        let html = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 12px; color: white; text-align: center;">
                <div style="font-size: 2rem; font-weight: 800;">${history.length}</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">総件数</div>
            </div>
        `;

        Object.entries(typeCounts).forEach(([type, count]) => {
            const typeInfo = types[type];
            if (typeInfo) {
                html += `
                    <div style="background: ${typeInfo.bgColor}; padding: 1rem; border-radius: 12px; text-align: center; border-left: 4px solid ${typeInfo.color};">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                            <i class="fa-solid ${typeInfo.icon}" style="color: ${typeInfo.color};"></i>
                            <span style="font-size: 1.5rem; font-weight: 800; color: ${typeInfo.color};">${count}</span>
                        </div>
                        <div style="font-size: 0.8rem; color: #666;">${typeInfo.name}</div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    }

    renderHistoryList(history) {
        const container = document.getElementById('history-list-view');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">履歴データがありません。</p>';
            return;
        }

        // Group by date
        const groupedByDate = {};
        history.forEach(h => {
            const date = h.dateStr || '不明';
            if (!groupedByDate[date]) groupedByDate[date] = [];
            groupedByDate[date].push(h);
        });

        let html = '';
        Object.entries(groupedByDate).forEach(([date, alerts]) => {
            html += `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1rem; color: #666; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid #eee;">
                        <i class="fa-solid fa-calendar"></i> ${date} (${alerts.length}件)
                    </h3>
            `;

            alerts.forEach(alert => {
                const icon = alert.icon || 'fa-circle-exclamation';
                const typeInfo = disasterData.disasterTypes[alert.disasterType];
                const bgColor = typeInfo ? typeInfo.bgColor : '#fff';

                html += `
                    <div class="alert-card" style="border-left: 5px solid ${alert.color}; background: linear-gradient(135deg, ${bgColor} 0%, #fff 100%); padding: 1rem; margin-bottom: 0.75rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer;"
                         onclick="app.navigate('home'); MapManager.map.flyTo([${alert.lat}, ${alert.lng}], 8);">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="background: ${alert.color}15; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: ${alert.color};">
                                <i class="fa-solid ${icon}" style="font-size: 1.1rem;"></i>
                            </div>
                            <div style="flex: 1;">
                                <h4 style="color: ${alert.color}; margin: 0; font-size: 0.95rem;">${alert.type}</h4>
                                <div style="display: flex; justify-content: space-between; margin-top: 0.2rem; color: #555; font-size: 0.85rem;">
                                    <span><i class="fa-solid fa-clock"></i> ${alert.time}</span>
                                    <span style="font-weight: bold; background: ${alert.color}; color: white; padding: 1px 6px; border-radius: 4px; font-size: 0.8rem;">${alert.level}</span>
                                </div>
                            </div>
                        </div>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #333;">${alert.message}</p>
                    </div>
                `;
            });

            html += '</div>';
        });

        container.innerHTML = html;
    }

    initHistoryMap() {
        const container = document.getElementById('history-map');
        if (!container) return;

        if (!this.historyMap) {
            this.historyMap = L.map('history-map', {
                zoomControl: true,
                attributionControl: false
            }).setView([38.5, 137.0], 5);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(this.historyMap);
        }

        setTimeout(() => {
            this.historyMap.invalidateSize();
        }, 100);
    }

    renderHistoryMap(history) {
        if (!this.historyMap) {
            this.initHistoryMap();
            setTimeout(() => this.renderHistoryMap(history), 200);
            return;
        }

        // Clear existing markers
        this.historyMarkers.forEach(m => this.historyMap.removeLayer(m));
        this.historyMarkers = [];

        // Update count
        const countEl = document.getElementById('history-map-count');
        if (countEl) countEl.textContent = history.length;

        // Add markers for each disaster
        history.forEach(alert => {
            if (!alert.lat || !alert.lng) return;

            const icon = alert.icon || 'fa-circle-exclamation';
            const typeInfo = disasterData.disasterTypes[alert.disasterType];

            // Create marker
            const marker = L.marker([alert.lat, alert.lng], {
                icon: L.divIcon({
                    className: 'history-marker',
                    html: `
                        <div style="
                            background: white;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            border: 3px solid ${alert.color};
                            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: ${alert.color};
                            font-size: 0.9rem;
                        ">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                })
            }).addTo(this.historyMap);

            marker.bindPopup(`
                <div style="font-family: inherit; min-width: 180px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div style="background: ${alert.color}15; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${alert.color};">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <strong style="color: ${alert.color};">${alert.type}</strong>
                    </div>
                    <div style="background: ${alert.color}; color: white; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">${alert.level}</div>
                    <p style="font-size: 0.9em; margin: 6px 0;">${alert.message}</p>
                    <div style="font-size: 0.8em; color: #666;">
                        <i class="fa-solid fa-calendar"></i> ${alert.dateStr || ''} ${alert.time}
                    </div>
                </div>
            `);

            this.historyMarkers.push(marker);

            // Also add a circle to show the area
            if (alert.disasterType === 'earthquake' && alert.mag) {
                const radius = Math.pow(parseFloat(alert.mag), 2) * 5000;
                const circle = L.circle([alert.lat, alert.lng], {
                    color: alert.color,
                    fillColor: alert.color,
                    fillOpacity: 0.1,
                    weight: 1,
                    radius: radius
                }).addTo(this.historyMap);
                this.historyMarkers.push(circle);
            }
        });

        // Render legend
        this.renderHistoryLegend(history);
    }

    renderHistoryLegend(history) {
        const container = document.getElementById('history-map-legend');
        if (!container) return;

        const types = disasterData.disasterTypes;
        const typesInHistory = [...new Set(history.map(h => h.disasterType))];

        let html = '';
        typesInHistory.forEach(type => {
            const typeInfo = types[type];
            if (typeInfo) {
                const count = history.filter(h => h.disasterType === type).length;
                html += `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="background: white; width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${typeInfo.color}; display: flex; align-items: center; justify-content: center; color: ${typeInfo.color};">
                            <i class="fa-solid ${typeInfo.icon}" style="font-size: 0.7rem;"></i>
                        </div>
                        <span>${typeInfo.name} (${count}件)</span>
                    </div>
                `;
            }
        });

        container.innerHTML = html || '<span style="color: #999;">データなし</span>';
    }
}

const app = new App();
