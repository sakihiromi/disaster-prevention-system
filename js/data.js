const disasterData = {
    // リアルタイム警報データ (JMA API から取得)
    // 初期状態は空、app.jsのfetchRealData()で気象庁APIから取得
    alerts: [],

    // 災害タイプ定義
    disasterTypes: {
        earthquake: {
            name: '地震',
            nameEn: 'Earthquake',
            icon: 'fa-house-crack',
            color: '#D50000',
            bgColor: '#FFEBEE'
        },
        heavyRain: {
            name: '大雨',
            nameEn: 'Heavy Rain',
            icon: 'fa-cloud-showers-heavy',
            color: '#1565C0',
            bgColor: '#E3F2FD'
        },
        flood: {
            name: '洪水',
            nameEn: 'Flood',
            icon: 'fa-water',
            color: '#0277BD',
            bgColor: '#E1F5FE'
        },
        heavySnow: {
            name: '大雪',
            nameEn: 'Heavy Snow',
            icon: 'fa-snowflake',
            color: '#4FC3F7',
            bgColor: '#E0F7FA'
        },
        storm: {
            name: '暴風',
            nameEn: 'Storm',
            icon: 'fa-wind',
            color: '#7B1FA2',
            bgColor: '#F3E5F5'
        },
        typhoon: {
            name: '台風',
            nameEn: 'Typhoon',
            icon: 'fa-hurricane',
            color: '#FF6F00',
            bgColor: '#FFF3E0'
        },
        tornado: {
            name: '竜巻',
            nameEn: 'Tornado',
            icon: 'fa-tornado',
            color: '#5D4037',
            bgColor: '#EFEBE9'
        },
        tsunami: {
            name: '津波',
            nameEn: 'Tsunami',
            icon: 'fa-water',
            color: '#2962FF',
            bgColor: '#E8EAF6'
        },
        landslide: {
            name: '土砂災害',
            nameEn: 'Landslide',
            icon: 'fa-mountain',
            color: '#795548',
            bgColor: '#EFEBE9'
        },
        heatwave: {
            name: '高温',
            nameEn: 'Heatwave',
            icon: 'fa-temperature-high',
            color: '#FF5722',
            bgColor: '#FBE9E7'
        }
    },

    // 地域別詳細情報
    // 地域別詳細情報 (Extended)
    regions: {
        "hokkaido": { name: "北海道 (Hokkaido)", coordinates: [43.0667, 141.3500], riskLevel: "Low", shelters: 250, forecast: "雪。路面凍結に注意。" },
        "tohoku": { name: "東北 (Tohoku)", coordinates: [38.2682, 140.8694], riskLevel: "Medium", shelters: 180, forecast: "曇り。" },
        "kanto": { name: "関東 (Kanto)", coordinates: [35.6895, 139.6917], riskLevel: "High", shelters: 500, forecast: "直下型地震への備えを。" },
        "hokuriku": { name: "北陸 (Hokuriku)", coordinates: [36.5613, 136.6562], riskLevel: "Medium", shelters: 120, forecast: "海岸部での強風に注意。" },
        "chubu": { name: "中部 (Chubu)", coordinates: [35.1815, 136.9066], riskLevel: "Medium", shelters: 200, forecast: "山間部は天候変わりやすい。" },
        "kansai": { name: "関西 (Kansai)", coordinates: [34.6937, 135.5023], riskLevel: "Low", shelters: 300, forecast: "晴れ。" },
        "chugoku": { name: "中国 (Chugoku)", coordinates: [34.3853, 132.4553], riskLevel: "Medium", shelters: 150, forecast: "瀬戸内側は穏やか。" },
        "shikoku": { name: "四国 (Shikoku)", coordinates: [33.5597, 133.5311], riskLevel: "High", shelters: 100, forecast: "南海トラフ地震に警戒。" },
        "kyushu": { name: "九州 (Kyushu)", coordinates: [33.5904, 130.4017], riskLevel: "High", shelters: 220, forecast: "台風接近時は早めの避難を。" }
    },


    // 備蓄・防災チェックリスト (カテゴリ別)
    checklists: [
        {
            category: "01. 必需品・食料 (Food & Water)",
            icon: "fa-glass-water",
            items: [
                { id: "f1", label: "飲料水 (1人9リットル)", desc: "3日分 (1日3L)" },
                { id: "f2", label: "非常食 (ごはん・パン)", desc: "調理不要なもの" },
                { id: "f3", label: "缶詰・レトルト", desc: "肉・魚・野菜" },
                { id: "f4", label: "栄養補助食品", desc: "ビタミン補給" }
            ]
        },
        {
            category: "02. 衛生・医療 (Hygiene)",
            icon: "fa-kit-medical",
            items: [
                { id: "h1", label: "簡易トイレ", desc: "最低30回分" },
                { id: "h2", label: "トイレットペーパー", desc: "" },
                { id: "h3", label: "ウェットティッシュ", desc: "全身拭けるタイプ推奨" },
                { id: "h4", label: "常備薬・お薬手帳", desc: "1週間分" },
                { id: "h5", label: "マスク・消毒液", desc: "感染症対策" }
            ]
        },
        {
            category: "03. 装備・ツール (Gear)",
            icon: "fa-screwdriver-wrench",
            items: [
                { id: "g1", label: "懐中電灯・ランタン", desc: "予備電池も含む" },
                { id: "g2", label: "モバイルバッテリー", desc: "大容量タイプ" },
                { id: "g3", label: "携帯ラジオ", desc: "手回し充電式が便利" },
                { id: "g4", label: "現金 (小銭)", desc: "公衆電話用(10円/100円)" }
            ]
        },
        {
            category: "04. 重要書類 (Documents)",
            icon: "fa-file-shield",
            items: [
                { id: "d1", label: "身分証明書のコピー", desc: "免許証・保険証" },
                { id: "d2", label: "緊急連絡先メモ", desc: "スマホ使えない時用" },
                { id: "d3", label: "ハザードマップ", desc: "紙の地図" }
            ]
        }
    ],

    // 災害対応ガイド (統計データ・根拠付き)
    guides: [
        {
            id: "earthquake",
            title: "地震 (Earthquake)",
            icon: "fa-house-crack",
            color: "#D50000", // Red
            summary: "発災直後の10秒と、事前の家具固定が生死を分けます。",
            statData: {
                label: "負傷リスク低減",
                value: "30-50%",
                description: "近年(阪神淡路大震災以降)の地震負傷原因の約30〜50%は「家具の転倒・落下」です。事前の固定でこれを防げます。",
                source: "消防庁データ・震災記録に基づく推計"
            },
            steps: [
                {
                    title: "【発災直後】頭を守る (Drop, Cover, Hold on)",
                    detail: "揺れている間は動けません。無理に火を消そうとせず、まずは机の下へ。頭部損傷は致命傷になりやすい部位No.1です。"
                },
                {
                    title: "【揺れが収まったら】火の元・出口確保",
                    detail: "火災発生時の初期消火は、天井に火が届く前までが限界です。無理ならすぐ避難。"
                },
                {
                    title: "【避難時】ブレーカーを落とす",
                    detail: "通電火災を防ぎます。阪神淡路大震災の火災原因の多くは通電火災でした。"
                }
            ]
        },
        {
            id: "tsunami",
            title: "津波 (Tsunami)",
            icon: "fa-water",
            color: "#2962FF", // Blue
            summary: "「まだ大丈夫」が命取り。一刻も早い高台への避難が必要です。",
            statData: {
                label: "避難成功率の差",
                value: "100% vs 0%",
                description: "東日本大震災の事例において、地震直後に即座に避難を開始した層と、30分後に避難した層では生存率に決定的な差が出ました（津波到達時間に依存）。",
                source: "防災行動シミュレーション・過去災害分析"
            },
            steps: [
                {
                    title: "【原則】遠くではなく「高く」へ",
                    detail: "車は渋滞で動けなくなるリスクが高いです。徒歩で近くの高台・ビル3階以上へ。"
                },
                {
                    title: "【警報】波の高さ数十cmでも人は流される",
                    detail: "「30cm」の津波でも速い流れの中では立っていられません。注意報でも海岸には近づかないでください。"
                }
            ]
        },
        {
            id: "storm",
            title: "台風・水害 (Typhoon/Flood)",
            icon: "fa-cloud-showers-heavy",
            color: "#FF6F00", // Orange
            summary: "暗くなってからの避難は死亡リスクが高まります。",
            statData: {
                label: "屋外避難の危険度",
                value: "夜間は危険増",
                description: "夜間や、既に冠水している道路（水深50cm以上）の歩行避難は、マンホール落下等により死亡リスクが極めて高くなります。",
                source: "過去の水害犠牲者状況分析"
            },
            steps: [
                {
                    title: "【警戒レベル3】高齢者等は避難",
                    detail: "健常者も避難準備を完了させるタイミングです。暗くなる前に移動を開始してください。"
                },
                {
                    title: "【垂直避難】2階以上への待避",
                    detail: "外への避難が危険な場合（夜間・激しい豪雨）は、無理に外に出ず、自宅の2階や崖と反対側の部屋へ移動して命を守ります。"
                }
            ]
        }
    ]
};
