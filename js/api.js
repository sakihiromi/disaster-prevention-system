class DisasterService {
    // 24時間のミリ秒
    static HOURS_24 = 24 * 60 * 60 * 1000;

    // 全ての災害データを取得
    static async fetchAllDisasters() {
        const results = await Promise.all([
            this.fetchEarthquakes(),
            this.fetchWeatherWarnings()
        ]);

        // 結果をフラット化して結合
        const allAlerts = results.flat();

        // タイムスタンプを追加して履歴に保存
        this.saveToHistory(allAlerts);

        // 24時間以内のアラートのみをフィルタリング
        return this.filterRecentAlerts(allAlerts);
    }

    // 24時間以内のアラートのみを返す
    static filterRecentAlerts(alerts) {
        const now = Date.now();
        return alerts.filter(alert => {
            if (!alert.timestamp) return true; // タイムスタンプがない場合は表示
            return (now - alert.timestamp) < this.HOURS_24;
        });
    }

    // 履歴にデータを保存
    static saveToHistory(alerts) {
        try {
            const history = this.getHistory();
            const existingIds = new Set(history.map(h => h.id));

            // 新しいアラートを履歴に追加
            alerts.forEach(alert => {
                if (!existingIds.has(alert.id)) {
                    history.push(alert);
                }
            });

            // 1ヶ月（30日）より古いデータを削除
            const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const filteredHistory = history.filter(h => h.timestamp && h.timestamp > oneMonthAgo);

            localStorage.setItem('disasterHistory', JSON.stringify(filteredHistory));
        } catch (e) {
            console.warn('Failed to save disaster history:', e);
        }
    }

    // 履歴を取得
    static getHistory() {
        try {
            const data = localStorage.getItem('disasterHistory');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('Failed to load disaster history:', e);
            return [];
        }
    }

    // 特定の災害タイプの履歴を取得
    static getHistoryByType(disasterType) {
        return this.getHistory().filter(h => h.disasterType === disasterType);
    }

    // 特定の期間の履歴を取得
    static getHistoryByPeriod(days = 30) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        return this.getHistory().filter(h => h.timestamp && h.timestamp > cutoff);
    }

    // 地震データを取得
    static async fetchEarthquakes() {
        // JMA endpoint (may have CORS issues)
        const jmaUrl = 'https://www.jma.go.jp/bosai/quake/data/list.json';

        // Try direct fetch first, then fallback to CORS proxy
        const urls = [
            jmaUrl,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(jmaUrl)}`
        ];

        for (let url of urls) {
            try {
                console.log(`Attempting to fetch earthquake data from: ${url}`);
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                console.log('Successfully fetched earthquake data:', data.length, 'items');
                return this.parseJMAData(data);
            } catch (error) {
                console.warn(`Failed to fetch from ${url}:`, error);
            }
        }

        console.error('All JMA earthquake data fetch attempts failed.');
        return []; // 実データ取得失敗時は空を返す
    }

    // 気象警報データを取得（気象庁 警報・注意報）
    static async fetchWeatherWarnings() {
        // 気象庁の警報・注意報概況
        const warningUrl = 'https://www.jma.go.jp/bosai/warning/data/warning/000.json';

        const urls = [
            warningUrl,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(warningUrl)}`
        ];

        for (let url of urls) {
            try {
                console.log(`Attempting to fetch weather warnings from: ${url}`);
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                console.log('Successfully fetched weather warning data');
                return this.parseWeatherWarnings(data);
            } catch (error) {
                console.warn(`Failed to fetch weather warnings from ${url}:`, error);
            }
        }

        console.log('Weather warning fetch failed.');
        return []; // 実データ取得失敗時は空を返す
    }

    // 気象警報データをパース
    static parseWeatherWarnings(data) {
        const alerts = [];
        const now = new Date();

        try {
            // 気象庁のwarningデータ構造に基づいてパース
            if (data.areaTypes) {
                data.areaTypes.forEach(areaType => {
                    if (areaType.areas) {
                        areaType.areas.forEach(area => {
                            if (area.warnings) {
                                area.warnings.forEach(warning => {
                                    if (warning.status && warning.status !== '解除') {
                                        const parsed = this.mapWarningToAlert(warning, area, now);
                                        if (parsed) alerts.push(parsed);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.warn('Error parsing weather warnings:', e);
        }

        return alerts.slice(0, 10);
    }

    // 警報タイプをアラートにマッピング
    static mapWarningToAlert(warning, area, now) {
        const warningTypeMap = {
            '大雨': 'heavyRain',
            '洪水': 'flood',
            '大雪': 'heavySnow',
            '暴風': 'storm',
            '暴風雪': 'storm',
            '高潮': 'tsunami',
            '波浪': 'tsunami',
            '土砂災害': 'landslide'
        };

        const typeName = warning.name || '';
        const disasterType = Object.keys(warningTypeMap).find(key => typeName.includes(key));

        if (!disasterType) return null;

        const typeKey = warningTypeMap[disasterType];
        const typeInfo = disasterData.disasterTypes[typeKey];

        // 地域の座標（概算）
        const coords = this.getAreaCoordinates(area.code || area.name);

        return {
            id: `warning_${area.code}_${typeKey}_${Date.now()}`,
            type: `${typeName} (${typeInfo.nameEn})`,
            disasterType: typeKey,
            level: warning.kind || '警報',
            message: `${area.name} ${typeName}`,
            time: this.formatTime(now.toISOString()),
            timestamp: now.getTime(),
            dateStr: this.formatDate(now.toISOString()),
            lat: coords.lat,
            lng: coords.lng,
            radius: 50000,
            color: typeInfo.color,
            icon: typeInfo.icon,
            source: 'JMA (気象庁)'
        };
    }

    // 地域コードから座標を取得（概算）
    static getAreaCoordinates(areaCode) {
        const areaMap = {
            '北海道': { lat: 43.0667, lng: 141.3500 },
            '東北': { lat: 38.2682, lng: 140.8694 },
            '関東': { lat: 35.6895, lng: 139.6917 },
            '北陸': { lat: 36.5613, lng: 136.6562 },
            '中部': { lat: 35.1815, lng: 136.9066 },
            '関西': { lat: 34.6937, lng: 135.5023 },
            '中国': { lat: 34.3853, lng: 132.4553 },
            '四国': { lat: 33.5597, lng: 133.5311 },
            '九州': { lat: 33.5904, lng: 130.4017 }
        };

        // コードに含まれる地域名を探す
        for (const [name, coords] of Object.entries(areaMap)) {
            if (String(areaCode).includes(name)) {
                return coords;
            }
        }

        // デフォルト（東京）
        return { lat: 35.6895, lng: 139.6917 };
    }

    static parseJMAData(data) {
        const types = disasterData.disasterTypes;
        // Take top 10 recent quakes
        return data.slice(0, 10).map((item, index) => {
            const coords = this.parseCoordinates(item.cod);
            const timestamp = new Date(item.at).getTime();
            return {
                id: `jma_${item.ctt}`, // unique id
                type: `地震情報 (${types.earthquake.nameEn})`,
                disasterType: 'earthquake',
                level: `震度${item.maxi}`,
                message: `${item.anm} 深さ${coords.depth}`,
                mag: item.mag, // Add magnitude for intensity calculation
                time: this.formatTime(item.at),
                timestamp: timestamp,
                dateStr: this.formatDate(item.at),
                lat: coords.lat,
                lng: coords.lng,
                radius: this.calculateRadius(item.mag),
                color: this.getSeverityColor(item.maxi),
                icon: types.earthquake.icon,
                source: 'JMA (気象庁)'
            };
        });
    }

    static parseCoordinates(codString) {
        // Format example: +33.0+131.1-10000/
        // Regex to capture lat, lng, depth
        // + or - followed by digits/decimals
        const parts = codString.match(/([+-][\d\.]+)/g);
        if (!parts || parts.length < 2) return { lat: 35.68, lng: 139.76, depth: 'Unknown' };

        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        let depth = 'Unknown';
        if (parts[2]) {
            // -10000 -> 10km
            const meters = Math.abs(parseInt(parts[2]));
            depth = (meters / 1000) + 'km';
        }

        return { lat, lng, depth };
    }

    static formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }

    static formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    static formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('ja-JP', { 
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit' 
        });
    }

    static calculateRadius(mag) {
        // Rough estimate for visualization
        const m = parseFloat(mag);
        if (isNaN(m)) return 20000;
        // Exponential scaling for visual impact
        return Math.pow(m, 3) * 300;
    }

    static getSeverityColor(maxi) {
        const intensity = parseInt(maxi);
        if (isNaN(intensity)) {
            // Handle "5+" "6-" etc if string
            if (maxi.includes('5')) return '#FFD600'; // Yellow/Orange
            if (maxi.includes('6') || maxi.includes('7')) return '#D50000'; // Red
            return '#2962FF'; // Blueish for smaller
        }
        if (intensity >= 5) return '#D50000'; // Red - Severe
        if (intensity >= 3) return '#FFD600'; // Warning
        return '#2962FF'; // Info
    }
}
