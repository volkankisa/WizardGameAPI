// 🔐 DEVICE FINGERPRINTING SYSTEM 
class DeviceFingerprintManager {
    constructor() {
        this.fingerprint = null;
        this.canvasFingerprint = null;
        this.webglFingerprint = null;

        console.log('🔐 DeviceFingerprintManager initializing...');
        this.generateDeviceFingerprint();
    }

    // Canvas fingerprinting - benzersiz canvas çizimi
    generateCanvasFingerprint() {
        try {
            console.log('🎨 Generating canvas fingerprint...');

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;

            // Benzersiz çizim pattern'i
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';

            // Arka plan
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(10, 10, 100, 20);

            // Text layer 1
            ctx.fillStyle = '#4ecdc4';
            ctx.fillText('Wizard fingerprint test 🔒', 15, 15);

            // Text layer 2
            ctx.fillStyle = '#45b7d1';
            ctx.fillText('Security check ✓', 15, 30);

            const fingerprint = canvas.toDataURL();
            console.log(`✅ Canvas fingerprint generated (${fingerprint.length} chars)`);
            return fingerprint;

        } catch (error) {
            console.warn('⚠️ Canvas fingerprinting failed:', error);
            return 'canvas_unavailable_' + Date.now();
        }
    }

    // WebGL fingerprinting - GPU bilgileri
    generateWebGLFingerprint() {
        try {
            console.log('🖥️ Generating WebGL fingerprint...');

            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                console.warn('⚠️ WebGL not available');
                return 'webgl_unavailable';
            }

            // GPU bilgilerini topla
            const info = {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
            };

            const fingerprint = btoa(JSON.stringify(info)).substring(0, 32);
            console.log('✅ WebGL fingerprint generated:', fingerprint);
            return fingerprint;

        } catch (error) {
            console.warn('⚠️ WebGL fingerprinting failed:', error);
            return 'webgl_error_' + Date.now();
        }
    }

    // Ana device fingerprint oluşturma
    generateDeviceFingerprint() {
        console.log('🔐 Generating complete device fingerprint...');

        // Alt sistemleri çalıştır
        this.canvasFingerprint = this.generateCanvasFingerprint();
        this.webglFingerprint = this.generateWebGLFingerprint();

        // Tüm device bilgilerini topla
        this.fingerprint = {
            userAgent: navigator.userAgent,
            screenResolution: {
                width: screen.width,
                height: screen.height
            },
            timezoneOffset: new Date().getTimezoneOffset(),
            canvasFingerprint: this.canvasFingerprint,
            webGLFingerprint: this.webglFingerprint,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            localStorage: typeof Storage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        console.log('✅ Complete device fingerprint generated:');
        console.log('📱 Platform:', this.fingerprint.platform);
        console.log('📺 Screen:', `${this.fingerprint.screenResolution.width}x${this.fingerprint.screenResolution.height}`);
        console.log('🌍 Timezone:', this.fingerprint.timezone);
        console.log('🎨 Canvas length:', this.fingerprint.canvasFingerprint.length);
        console.log('🖥️ WebGL:', this.fingerprint.webGLFingerprint);
    }

    // Frontend için fingerprint al
    getFingerprint() {
        return this.fingerprint;
    }

    // Backend için uyumlu format
    getBackendCompatibleFingerprint() {
        if (!this.fingerprint) {
            console.error('❌ Fingerprint not generated yet');
            return null;
        }

        return {
            UserAgent: this.fingerprint.userAgent,
            ScreenResolution: {
                Width: this.fingerprint.screenResolution.width,
                Height: this.fingerprint.screenResolution.height
            },
            TimezoneOffset: this.fingerprint.timezoneOffset,
            CanvasFingerprint: this.fingerprint.canvasFingerprint,
            WebGLFingerprint: this.fingerprint.webGLFingerprint
        };
    }

    // Test metodu
    testFingerprint() {
        console.log('🧪 Testing device fingerprint...');
        console.log('Complete fingerprint:', this.fingerprint);
        console.log('Backend compatible format:', this.getBackendCompatibleFingerprint());

        return true;
    }
}

// Global olarak kullanılabilir hale getir
window.DeviceFingerprintManager = DeviceFingerprintManager;

// 📸 WIZARD SNAPSHOT PROTECTION SYSTEM
class WizardSnapshotProtection {
    constructor(gameScene) {
        this.scene = gameScene;
        this.interval = 10000; // 10 saniyede bir
        this.snapshotCounter = 0;
        this.isActive = false;
        this.apiClient = null;

        console.log("📸 Wizard Snapshot Protection initialized");
    }

    setAPIClient(apiClient) {
        this.apiClient = apiClient;
        console.log('🔗 API Client connected to snapshot protection');
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        setTimeout(() => {
            this.startSnapshotLoop();
        }, 5000); // 5 saniye sonra başla

        console.log(`📸 Snapshot protection started - First snapshot in 5 seconds`);
    }

    startSnapshotLoop() {
        if (!this.isActive) return;

        this.captureAndValidateSnapshot();

        setTimeout(() => {
            this.startSnapshotLoop();
        }, this.interval);
    }

    async captureAndValidateSnapshot() {
        if (!this.scene.gameActive || !this.isActive || !this.apiClient) return;

        try {
            this.snapshotCounter++;
            const snapshot = this.captureGameState();
            console.log(`📸 Capturing snapshot #${this.snapshotCounter}:`, snapshot);

            // İlk permission al
            await this.apiClient.requestDevicePermission(snapshot);

            // Sonra validate et
            const response = await this.apiClient.validateSecureAction(snapshot);

            if (!response.success) {
                console.log("🚨 CHEAT DETECTED by snapshot protection!");
                console.log(`Reason: ${response.reason}`);
                console.log(`Cheat Probability: ${response.cheatProbability}%`);
                this.handleCheatDetection(response);
            } else {
                console.log(`✅ Snapshot #${this.snapshotCounter} validated successfully`);
            }

        } catch (error) {
            console.error("❌ Snapshot validation error:", error);
        }
    }

    captureGameState() {
        return {
            score: this.scene.score || 0,
            hearts: this.scene.hearts || 3,
            itemsHit: this.scene.itemsHit || 0,
            bombsHit: this.scene.bombsHit || 0,
            gameTime: Date.now() - (this.scene.gameStartTime || Date.now())
        };
    }

    handleCheatDetection(response) {
        console.log("🔨 CHEAT DETECTION TRIGGERED");
        console.log(`Reason: ${response.reason}`);
        console.log(`Cheat Probability: ${response.cheatProbability}%`);

        this.stop();

        // Oyunu durdur
        this.scene.gameActive = false;

        // Cheat detection mesajı göster
        const cheatText = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            `🚨 CHEAT DETECTED 🚨\n\n${response.reason}\n\nProbability: ${response.cheatProbability}%`,
            {
                fontSize: '32px',
                fill: '#ff0000',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        );
        cheatText.setOrigin(0.5);
        cheatText.setDepth(10000);

        // 3 saniye sonra game over
        setTimeout(() => {
            this.scene.handleGameOver();
        }, 3000);
    }

    stop() {
        this.isActive = false;
        console.log("📸 Snapshot Protection stopped");
    }

    getStatus() {
        return {
            isActive: this.isActive,
            snapshotCount: this.snapshotCounter,
            interval: this.interval / 1000 + 's'
        };
    }
}

// Global access
window.WizardSnapshotProtection = WizardSnapshotProtection;


// 🌐 WIZARD GAME API CLIENT
class WizardGameAPI {
    constructor() {
        this.baseURL = 'http://localhost:5117/api/wizardgame';
        this.sessionId = this.generateSessionId();
        this.deviceFingerprint = null;
        console.log('🌐 Wizard Game API Client başlatıldı, Session:', this.sessionId);

        // 🔐 Device fingerprinting'i başlat
        this.initializeDeviceFingerprint();
        this.initializeTokenSystem();
    }

    // 🔐 Device fingerprint'i başlat
    initializeDeviceFingerprint() {
        try {
            this.deviceFingerprint = new DeviceFingerprintManager();
            console.log('✅ Device fingerprint integrated with API client');
        } catch (error) {
            console.error('❌ Device fingerprint initialization failed:', error);
        }
    }

    initializeTokenSystem() {
        this.currentToken = null;
        this.deviceChallenge = null;
        this.tokenExpiresAt = null;
        console.log('🎫 Token system initialized');
    }

    generateSessionId() {
        return `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 🎮 Oyun konfigürasyonu al
    async getGameConfig() {
        try {
            const response = await fetch(`${this.baseURL}/config`);
            const data = await response.json();
            console.log('✅ Game config alındı:', data);
            return data;
        } catch (error) {
            console.error('❌ Config alma hatası:', error);
            return null;
        }
    }

    // 🔍 API durumu kontrol et
    async getStatus() {
        try {
            const response = await fetch(`${this.baseURL}/status`);
            const data = await response.json();
            console.log('✅ API Status:', data);
            return data;
        } catch (error) {
            console.error('❌ Status alma hatası:', error);
            return null;
        }
    }

    // 🏹 Ok atışını kaydet
    async recordArrowShot(velocityX, velocityY) {
        try {
            const response = await fetch(`${this.baseURL}/arrow-shot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    velocityX: velocityX,
                    velocityY: velocityY,
                    sessionId: this.sessionId
                })
            });
            const data = await response.json();
            console.log('🏹 Ok atışı kaydedildi:', data);
            return data;
        } catch (error) {
            console.error('❌ Ok atışı kaydetme hatası:', error);
            return { success: false };
        }
    }

    // 🎯 Item vurma kaydet
    async recordItemHit(newScore) {
        try {
            const response = await fetch(`${this.baseURL}/item-hit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newScore: newScore,
                    sessionId: this.sessionId
                })
            });
            const data = await response.json();
            console.log('🎯 Item hit kaydedildi:', data);
            return data;
        } catch (error) {
            console.error('❌ Item hit kaydetme hatası:', error);
            return { success: false };
        }
    }

    // 💣 Bomba vurma kaydet
    async recordBombHit(remainingHearts) {
        try {
            const response = await fetch(`${this.baseURL}/bomb-hit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remainingHearts: remainingHearts,
                    sessionId: this.sessionId
                })
            });
            const data = await response.json();
            console.log('💣 Bomb hit kaydedildi:', data);
            return data;
        } catch (error) {
            console.error('❌ Bomb hit kaydetme hatası:', error);
            return { success: false };
        }
    }

    // 🔐 Device permission iste
    async requestDevicePermission(gameData) {
        try {
            const requestData = {
                sessionId: this.sessionId,
                gameData: gameData,
                deviceFingerprint: this.deviceFingerprint.getBackendCompatibleFingerprint(),
                timestamp: Date.now()
            };

            const response = await fetch(`${this.baseURL}/request-device-permission`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.currentToken = data.permissionToken;
                this.deviceChallenge = data.deviceChallenge;

                console.log('🔐 Device permission granted');
                console.log('🎫 Token expires in:', data.expiresIn, 'seconds');
                return data;
            } else {
                console.error('❌ Permission denied:', data.reason);
                throw new Error(data.reason || 'Permission request failed');
            }
        } catch (error) {
            console.error('🚨 Permission request failed:', error);
            throw error;
        }
    }

    // 🔐 Secure action validate et
    async validateSecureAction(gameData) {
        try {
            const requestData = {
                sessionId: this.sessionId,
                permissionToken: this.currentToken,
                gameData: gameData,
                deviceFingerprint: this.deviceFingerprint.getBackendCompatibleFingerprint(),
                timestamp: Date.now()
            };

            const response = await fetch(`${this.baseURL}/validate-secure-action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            console.log('🔐 Secure validation response:', data);

            return data;
        } catch (error) {
            console.error('❌ Secure validation error:', error);
            return { success: false, reason: 'Validation failed', error: error.message };
        }
    }
}

// Global API client
window.wizardAPI = new WizardGameAPI();

// ------------------- Start Scene -------------------

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }



    preload() {
        this.load.image('start-button', 'assets/ui/start-button.png');
        this.load.image('sound-on', 'assets/ui/sound-on-white.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets/ui/sound-off-white.png');  // Ses kapalı ikonu
        this.load.image('start', 'assets/ui/start.png');
        this.load.image('howToButton', 'assets/ui/howToBtn.png')

        this.load.audio('background-music', 'assets/audio/background-music.mp3');
        this.load.audio('button-click', 'assets/audio/button-click.mp3');
    }

    create() {
        this.background = this.add.image(config.width / 2, config.height / 2, 'start')

        // 🌐 API'yi test et - BURAYA EKLE
        window.wizardAPI.getStatus().then(statusData => {
            if (statusData) {
                console.log('🎮 Backend bağlantısı başarılı!', statusData.message);
            } else {
                console.log('❌ Backend bağlantısı başarısız!');
            }
        });

        // Arkaplan müziği başlat
        this.backgroundMusic = this.sound.add('background-music', {
            volume: 0.3,
            loop: true
        });
        this.backgroundMusic.play();

        // Button click sesi
        this.buttonClickSound = this.sound.add('button-click', { volume: 0.7 });

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(config.width - 50, 50, 'sound-on');
        this.soundButton.setDepth(10); // Ses butonunu öne al
        this.soundButton.setOrigin(0.5);
        this.soundButton.setScale(0.15);
        this.soundButton.setInteractive({ useHandCursor: true });

        this.soundButton.on('pointerdown', () => {
            this.isSoundOn = !this.isSoundOn;

            if (this.isSoundOn) {
                this.soundButton.setTexture('sound-on');
                this.sound.mute = false;
            } else {
                this.soundButton.setTexture('sound-off');
                this.sound.mute = true;
            }
        });

        // Parlayan efekt - arka plan için overlay
        let glowGraphics = this.add.graphics();
        glowGraphics.fillStyle(0xffff00, 0.1);
        glowGraphics.fillRect(0, 0, 1000, 600);

        // Glow efekti animasyonu
        this.tweens.add({
            targets: glowGraphics,
            alpha: { from: 0.1, to: 0.2 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Buton
        this.startButton = this.add.image(config.width / 2, config.height / 2 + 150, 'start-button');
        this.startButton.setScale(0.4);
        this.startButton.setInteractive({ useHandCursor: true });
        this.startButton.setDepth(2);


        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [this.startButton],
            scaleX: { from: this.startButton.scaleX, to: this.startButton.scaleX * 1.1 },
            scaleY: { from: this.startButton.scaleY, to: this.startButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        this.startButton.on('pointerover', () => {
            this.startButton.setScale(0.45);
            buttonTween.pause();
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setScale(0.4);
            buttonTween.resume();
        });

        this.startButton.on('pointerdown', () => {
            // Button click sesi çal
            this.buttonClickSound.play();
            this.startButton.disableInteractive();
            this.startButton.setVisible(false);
            // Menü müziğini durdur
            this.backgroundMusic.stop();
            this.scene.start('GameScene');

        });

        this.isPopupOpen = false;
        this.howToPlayBtn = this.add.image(config.width / 2, config.height - 100, 'howToButton')
        this.howToPlayBtn.setScale(0.4)
        this.howToPlayBtn.setInteractive({ useHandCursor: true });

        // Buton efektleri
        this.howToPlayBtn.on('pointerover', () => {
            this.howToPlayBtn.setScale(0.45);
        });

        this.howToPlayBtn.on('pointerout', () => {
            this.howToPlayBtn.setScale(0.4);
        });

        this.howToPlayBtn.on('pointerdown', () => {
            this.openHowToPlayPopup();
        });
    }

    openHowToPlayPopup() {
        this.howToPlayBtn.disableInteractive();
        this.startButton.disableInteractive();
        const popupBg = this.add.rectangle(
            config.width / 2, config.height / 2,
            config.width * 0.9, config.height * 0.6,
            0x000000, 0.85
        ).setScrollFactor(0).setDepth(2000);

        const howToPlayText = this.add.text(
            config.width / 2, config.height / 2,
            '→ Fareyi sürükleyip nişan al:\n→ Büyü topunu fırlat\n→Hedefleri vurarak skor topla, zehir şişelerini vurmaktan kaçın!',
            {
                fontSize: '40px',
                fontFamily: 'monospace',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: config.width * 0.8 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

        const closeText = this.add.text(
            config.width / 2, config.height / 2 + 180,
            'Kapat', {
            fontSize: '35px',
            fontFamily: 'monospace',
            fill: '#ff6666',
            backgroundColor: '#ffffff',
            padding: { x: 12, y: 5 }
        }
        ).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(2002);

        closeText.on('pointerup', () => {
            this.isPopupOpen = false;
            popupBg.destroy();
            howToPlayText.destroy();
            closeText.destroy();
            this.howToPlayBtn.setInteractive();
            this.startButton.setInteractive();
        });
    }

}

// ------------------- GameScene -------------------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('cloud', 'assets/background/cloud.png');
        this.load.image('background', 'assets/background/wizard-castle.png');
        this.load.image('moon', 'assets/background/moon.png');
        this.load.image('raindrop', 'assets/background/raindrop.png');
        this.load.image('fog', 'assets/background/fog.png');
        this.load.image('background-space', 'assets/background/background-space.png')

        this.load.image('item', 'assets/coin.png');
        this.load.image('bomb', 'assets/poison.png');
        this.load.image('fireball-b', 'assets/fireball-b.png');
        this.load.image('fireball-r', 'assets/fireball-r.png');
        this.load.image('fireball-g', 'assets/fireball-g.png');
        this.load.image('player', 'assets/wizard.png');
        this.load.image('explosion', 'assets/explosion.png');
        this.load.image('sound-on', 'assets/ui/sound-on-white.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets/ui/sound-off-white.png');  // Ses kapalı ikonu
        this.load.image('skor-panel', 'assets/ui/score-image.png');
        this.load.image('heart', 'assets/ui/heart.png');
        this.load.image('trophy', 'assets/trophy.png')

        // Tüm ses dosyaları
        this.load.audio('background-music', 'assets/audio/background-music.mp3');
        this.load.audio('coin-sound', 'assets/audio/coin.mp3');
        this.load.audio('bomb-sound', 'assets/audio/explosion.mp3');
        this.load.audio('shoot-sound', 'assets/audio/shoot.mp3');
        this.load.audio('level-complete', 'assets/audio/level-complete.mp3');
        this.load.audio('lightning-sound', 'assets/audio/lightning.mp3');
    }

    create() {
        this.gameActive = true;

        // 🌐 API client'i sahiple - BURAYA EKLE
        this.api = window.wizardAPI;
        this.gameStartTime = Date.now(); // ⏰ Oyun başlangıç zamanı
        console.log('🎮 GameScene API client hazır');

        // API'den config al
        this.api.getGameConfig().then(config => {
            if (config) {
                console.log('📡 Backend config alındı:', config);
                this.backendConfig = config; // Sakla
            }
        });

        // 📸 Snapshot Protection sistemi başlat - BURAYA EKLE
        this.snapshotProtection = new WizardSnapshotProtection(this);
        this.snapshotProtection.setAPIClient(this.api);
        this.snapshotProtection.start();
        
        // Global access
        window.wizardGameScene = this;
        
        console.log('🛡️ All security systems initialized');

        // Arkaplan müziği başlat
        this.backgroundMusic = this.sound.add('background-music', {
            volume: 0.2,
            loop: true
        });
        this.backgroundMusic.play();

        // Ses efektlerini yükle
        this.coinSound = this.sound.add('coin-sound', { volume: 0.1 });
        this.bombSound = this.sound.add('bomb-sound', { volume: 0.6 });
        this.shootSound = this.sound.add('shoot-sound', { volume: 0.4 });
        this.levelCompleteSound = this.sound.add('level-complete', { volume: 0.6 });
        this.lightningSound = this.sound.add('lightning-sound', { volume: 0.7 });

        this.input.keyboard.on('keydown-J', () => {
            this.handleGameWin();
        });

        this.input.keyboard.on('keydown-K', () => {
            this.scene.start('WinScene');
            this.backgroundMusic.stop();
        });

        this.input.keyboard.on('keydown-L', () => {
            this.handleGameOver();
        });

        this.itemSpawnInterval; // item spawn aralığı
        this.itemSpawnTimer = 0;
        this.bombSpawnInterval; // 2 saniyede bir bomba spawn etme
        this.bombSpawnTimer = 0;

        this.score = 0;
        this.initialTime = 15;  // saniye cinsinden başlangıç süresi
        this.hearts = 3; // Oyuncunun canı
        this.arrowsFired = 0;
        this.itemsSpawned = 0;
        this.bombsSpawned = 0;
        this.itemsHit = 0;
        this.bombsHit = 0;
        this.startTime = Date.now();
        this.durationMs;
        this.didWin = false


        this.physics.world.setBounds(0, 0, config.width, config.height); // Oyun alanının sınırlarını ayarla

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(config.width - 50, 50, 'sound-on');
        this.soundButton.setDepth(10); // Ses butonunu öne al
        this.soundButton.setOrigin(0.5);
        this.soundButton.setScale(0.15);
        this.soundButton.setInteractive({ useHandCursor: true });

        this.soundButton.on('pointerdown', () => {
            this.isSoundOn = !this.isSoundOn;

            if (this.isSoundOn) {
                this.soundButton.setTexture('sound-on');
                this.sound.mute = false;
            } else {
                this.soundButton.setTexture('sound-off');
                this.sound.mute = true;
            }
        });



        // Arka plan resmi
        this.background = this.add.image(config.width / 2, config.height / 2, 'background');
        this.background.setDisplaySize(config.width, config.height); // Arka planın boyutunu ayarla

        this.backgroundSpace = this.add.image(config.width / 2, config.height / 2, 'background-space');
        this.backgroundSpace.setDisplaySize(config.width, config.height); // Arka planın boyutunu ayarla
        this.backgroundSpace.setDepth(-1);

        // tam ekran beyaz rectangle (fade için)
        this.fadeRect = this.add
            .rectangle(0, 0, config.width, config.height, 0xffffff)
            .setOrigin(0)
            .setDepth(200);
        this.fadeRect.alpha = 0;

        //Player oluşturma
        this.player = this.physics.add.sprite(250, config.height / 2, 'player');
        this.player.setDisplaySize(300, 300); // Oyuncunun boyutunu ayarla
        this.player.setCollideWorldBounds(true); // Oyuncu dünya sınırlarına çarptığında duracak
        this.player.body.setAllowGravity(false); // Oyuncunun yerçekimi etkisi
        this.player.body.setImmovable(true); // Oyuncu hareket edemeyecek
        this.tweens.add({
            targets: this.player,
            y: this.player.y - 10,        // 10px yukarı çık
            duration: 2000,
            ease: 'Sine.easeInOut', // yumuşak geçiş
            yoyo: true,
            repeat: -1              // sonsuz tekrar
        });

        //gruplar
        this.arrows = this.physics.add.group();
        this.bombs = this.physics.add.group();
        this.items = this.physics.add.group();

        //overlaplar
        this.physics.add.overlap(this.arrows, this.items, this.hitItem, null, this);
        this.physics.add.overlap(this.arrows, this.bombs, this.hitBomb, null, this);

        this.timerText = this.add.text(300, 60, this.initialTime, {
            fontSize: '30px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: '#00ff00',
            strokeThickness: 4,
        })
        this.timerText.setDepth(15)

        // Her saniye bir kere çalışacak bir event oluştur
        this.countdownTimer = this.time.addEvent({
            delay: 1000,                // ms cinsinden: 1 saniye
            callback: () => {
                this.initialTime--;
                this.timerText.setText(this.initialTime);

                if (this.initialTime <= 0) {
                    // Süre bitti: oyun bitti sahnesine ge
                    this.handleGameOver();

                }
            },
            callbackScope: this,
            loop: true
        });

        this.addUIElements(); // UI elementlerini ekle

        this.addBackgroundElements();

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.power = 10;


        this.trajectoryLine = this.add.graphics();
        this.trajectoryLine.setDepth(5); // Çizgiyi öne al


        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.isDragging = true;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                let dragOffsetX = this.dragStartX - pointer.x;
                let dragOffsetY = this.dragStartY - pointer.y;

                let velocityX = dragOffsetX * this.power;
                let velocityY = dragOffsetY * this.power;

                this.drawTrajectory(355, this.game.config.height / 2 - 120, velocityX, velocityY);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.trajectoryLine.clear();

                let dragStopX = pointer.x;
                let dragStopY = pointer.y;

                let dragOffsetX = this.dragStartX - dragStopX;
                let dragOffsetY = this.dragStartY - dragStopY;

                if (dragOffsetX !== 0 && dragOffsetY !== 0) {
                    this.shootArrow(dragOffsetX * this.power, dragOffsetY * this.power);
                }
            }
        });
    }

    update(time, delta) {
        this.items.children.each((item) => {
            if (item.from == 'top' && item.y > config.height + 50) {
                item.destroy();
            } else if (item.from == 'bottom' && item.y < -50) {
                item.destroy();
            }
        });

        this.bombs.children.each((bomb) => {
            if (bomb.from == 'top' && bomb.y > config.height + 50) {
                bomb.destroy();
            } else if (bomb.from == 'bottom' && bomb.y < -50) {
                bomb.destroy();
            }
        });

        //oku gittiği yöne göre döndürme ve kaçan okları silme
        this.arrows.children.each((arrow) => {
            if (arrow.y < -50 || arrow.y > config.height + 50) {
                arrow.destroy();
            }
        });

        switch (this.score) {
            case 0:
                this.setDifficulty('easy');
                break;
            case 100:
                this.setDifficulty('medium');
                break;
            case 200:
                this.setDifficulty('hard');
                break;
            case 300:
                this.setDifficulty('very-hard');
                break;
            default:
                // Diğer durumlar için hiçbir şey yapma
                break;
        }

        // Item spawn etme
        this.itemSpawnTimer += delta;
        if (this.itemSpawnTimer >= this.itemSpawnInterval) {
            if (Phaser.Math.Between(0, 1) === 0) {
                this.addItem("top");
            } else {
                this.addItem("bottom");
            }
            this.itemSpawnTimer = 0;
        }

        // Bomba spawn etme
        this.bombSpawnTimer += delta;
        if (this.bombSpawnTimer >= this.bombSpawnInterval) {
            if (Phaser.Math.Between(0, 1) === 0) {
                this.addBomb("top");
            } else {
                this.addBomb("bottom");
            }
            this.bombSpawnTimer = 0;
        }

        this.clouds.children.iterate((cloud) => {
            cloud.x += 0.2;
            if (cloud.x > config.width + 50) {
                cloud.x = -50;
                cloud.y = Phaser.Math.Between(50, 200);
            }
        });

        this.fogs.children.iterate((fog) => {
            fog.x += 0.2;
            if (fog.x > config.width + 50) {
                fog.x = -50;
                fog.y = Phaser.Math.Between(config.height - 100, config.height);

            }
        });
    }

    addUIElements() {
        // Score image
        this.skor = this.add.image(150, 80, 'skor-panel');
        this.skor.setScale(0.2); // Adjust scale as needed
        this.skor.setOrigin(0.5);
        this.skor.setDepth(15)

        // Score value text
        this.itemScoreText = this.add.text(190, 80, '0', {
            fontSize: '30px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fill: '#d6eaf8',
            stroke: '#5DADE2',
            strokeThickness: 4
        });
        this.itemScoreText.setOrigin(0, 0.5);
        this.itemScoreText.setScrollFactor(0);
        this.itemScoreText.setDepth(15)

        this.heartIcons = [];
        for (let i = 0; i < this.hearts; i++) {
            let heart = this.add.image(120 + i * 30, 160, 'heart');
            heart.setScale(0.1); // İsteğe göre ayarla
            heart.setScrollFactor(0); // Kamerayla sabit kalsın
            heart.setDepth(15)
            this.heartIcons.push(heart);
        }
    }

    addBackgroundElements() {
        //bulutlar
        this.clouds = this.add.group();
        for (let i = 0; i < 3; i++) {
            let cloud = this.add.image(
                Phaser.Math.Between(0, config.width),
                Phaser.Math.Between(0, 75),
                'cloud'
            );
            cloud.setAlpha(0.6);
            cloud.setScale(Phaser.Math.FloatBetween(0.2, 0.6));
            cloud.setDepth(10)
            this.clouds.add(cloud);
        }

        //yıldırım
        this.lightningTimer = this.time.addEvent({
            delay: 10000, // 10 saniye (ms cinsinden)
            callback: this.autoLightning,
            callbackScope: this,
            loop: true
        });

        //sis
        this.fogs = this.add.group();
        for (let i = 0; i < 10; i++) {
            let fog = this.add.image(
                Phaser.Math.Between(0, config.width),
                Phaser.Math.Between(config.height - 50, config.height),
                'fog'
            );
            fog.setAlpha(0.1);
            fog.setScale(Phaser.Math.FloatBetween(0.8, 1.2));
            fog.setDepth(10)
            this.fogs.add(fog);
        }

        //yağmur
        let rainParticles = this.add.particles('raindrop');

        rainParticles.createEmitter({
            x: { min: 0, max: config.width },
            y: 0,
            lifespan: 6000,
            speedX: { min: 0, max: -100 },
            speedY: { min: 500, max: 800 },
            scale: { start: 0.05, end: 0.05 },
            quantity: 1,
            frequency: 500, // Milisaniye cinsinden damla sıklığı (300ms'de bir damla)
            alpha: 0.5,
            blendMode: 'ADD'
        });

        //dolunay
        let moon = this.add.image(config.width - 100, 100, 'moon');
        moon.setScale(0.2);
        moon.setAlpha(0.4);
        moon.setScrollFactor(0); // Kamera hareket ederse sabit kalır
        moon.setDepth(5)
    }

    autoLightning() {
        // Yıldırım sesi çal
        this.lightningSound.play();
        const x = Phaser.Math.Between(50, config.width - 50);
        const y = Phaser.Math.Between(0, 200);
        this.drawLightning(x, y);
    }

    drawLightning(x) {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff); // Beyaz çizgi
        let startX = x;
        let startY = 0;

        for (let i = 0; i < 20; i++) {
            let endX = startX + Phaser.Math.Between(-20, 20);
            let endY = startY + Phaser.Math.Between(10, 30);

            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();

            startX = endX;
            startY = endY;
        }

        // Kısa süre sonra yok et (efekt gibi görünmesi için)
        this.time.delayedCall(100, () => {
            graphics.destroy();
        });
    }

    // Okun gideceği yöne göre çizgi çizme
    drawTrajectory(startX, startY, velocityX, velocityY) {
        this.trajectoryLine.clear();

        const gravity = this.physics.world.gravity.y;
        const timeStep = 0.05;
        const totalTime = 1.5;

        // Güce göre renk hesapla
        let power = Math.sqrt(velocityX ** 2 + velocityY ** 2);
        let color = Phaser.Display.Color.Interpolate.ColorWithColor(
            new Phaser.Display.Color(181, 80, 156), // açık mor
            new Phaser.Display.Color(102, 1, 152),   // koyu mor
            1000,
            Math.min(power, 1000)
        );
        let hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

        this.trajectoryLine.lineStyle(2, 0xffffff, 1);

        // Nokta çizimi
        for (let t = 0; t < totalTime; t += timeStep) {
            let dx = velocityX * t;
            let dy = velocityY * t + 0.5 * gravity * t * t;

            let pointX = startX + dx;
            let pointY = startY + dy;

            // Ekran dışına taşmasın
            if (
                pointX < 0 || pointX > this.game.config.width ||
                pointY < 0 || pointY > this.game.config.height
            ) {
                break;
            }

            this.trajectoryLine.strokeCircle(pointX, pointY, 5); // 2px yarıçaplı nokta
        }
    }

    async shootArrow(x, y) {
        // 🌐 API'ye ok atışını bildir - BURAYA EKLE
        if (this.api) {
            await this.api.recordArrowShot(x, y);
        }
        // Ateş etme sesi çal
        this.shootSound.play();
        let fireballTexture;
        let rnd = Phaser.Math.Between(1, 3)
        switch (rnd) {
            case 1:
                fireballTexture = 'fireball-g'
                break;
            case 2:
                fireballTexture = 'fireball-b'
                break;
            case 3:
                fireballTexture = 'fireball-r'
                break;

        }
        let arrow = this.arrows.create(355, this.game.config.height / 2 - 120, fireballTexture);
        arrow.setScale(0.1);
        arrow.setDepth(101);
        arrow.body.setCircle(275, 275);
        arrow.body.setOffset(0, 0); // Görselin içine göre konumu ayarla
        arrow.setVelocity(x, y);
        arrow.setAngularVelocity(Phaser.Math.Between(-300, 300))


        // SOPA GERİ GİTME ANİMASYONU:
        let originalX = this.player.x;
        this.tweens.add({
            targets: this.player,
            x: originalX - 15,  // 15 piksel geri git
            duration: 80,       // 80ms'de geri git
            ease: 'Power2',
            yoyo: true,         // geri dön
            onComplete: () => {
                this.player.x = originalX; // Orijinal pozisyona kesinlikle dön
            }
        });

        // ATEŞ EFEKTİ EKLE:
        let muzzleFlash = this.add.circle(355, this.game.config.height / 2 - 120, 30, 0xffffff);
        muzzleFlash.setDepth(102);
        muzzleFlash.setAlpha(0.8);

        this.tweens.add({
            targets: muzzleFlash,
            scaleX: { from: 0.5, to: 2 },
            scaleY: { from: 0.5, to: 2 },
            alpha: { from: 0.8, to: 0 },
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                muzzleFlash.destroy();
            }
        });

        this.arrowsFired++;
    }

    // Item ekleme
    addItem(locY) {
        if (!this.gameActive) return;

        let xArray = []; // X koordinatları için bir dizi oluştur
        let y;
        let velocity;
        for (let index = config.width / 2 + 100; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        if (locY == 'top') { //yukarıda spawn olsun ve aşağı doğru gitsin
            y = Phaser.Math.Between(-100, -300);
            velocity = Phaser.Math.Between(100, 300);
        }
        else if (locY == 'bottom') { //aşağıda spawn olsun ve yukarı doğru gitsin
            y = Phaser.Math.Between(config.height + 100, config.height + 300);
            velocity = Phaser.Math.Between(-100, -300);
        }
        else {
            console.error('Geçersiz konum: ' + locY);
            return;
        }
        let item = this.items.create(x, y, 'item');
        item.from = locY; // Itemin konumunu kaydet
        item.scale = 0.2; // Item boyutunu ayarla
        item.setDepth(20);
        item.body.setAllowGravity(false); // Itemlerin yerçekimi etkisi olmasın
        item.setVelocityY(velocity)
        this.itemsSpawned++;
    }

    //bomba ekleme
    addBomb(locY) {
        if (!this.gameActive) return;

        let xArray = []; // X koordinatları için bir dizi oluştur
        let y;
        let velocity;
        for (let index = config.width / 2 + 100; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        if (locY == 'top') { //yukarıda spawn olsun ve aşağı doğru gitsin
            y = Phaser.Math.Between(-100, -300);
            velocity = Phaser.Math.Between(100, 300);
        }
        else if (locY == 'bottom') { //aşağıda spawn olsun ve yukarı doğru gitsin
            y = Phaser.Math.Between(config.height + 100, config.height + 300);
            velocity = Phaser.Math.Between(-100, -300);
        }
        else {
            console.error('Geçersiz konum: ' + locY);
            return;
        }
        let bomb = this.bombs.create(x, y, 'bomb');
        bomb.from = locY; // Bombanın konumunu kaydet
        bomb.setScale(0.15); // Bomba boyutunu ayarla
        bomb.setAngularVelocity(Phaser.Math.Between(-100, 100)); // Bombanın rastgele dönmesini sağla
        bomb.body.setAllowGravity(false); // Bombaların yerçekimi etkisi olmasın
        bomb.setVelocityY(velocity);
        this.bombsSpawned++;
    }

    // Iteme vurma işlemi
    async hitItem(arrow, item) {
        // Coin toplama sesi çal
        this.coinSound.play();
        // 1) Varolan skor mantığı
        this.itemsHit++;
        item.destroy();
        arrow.destroy();
        this.score += 10;
        this.itemScoreText.setText(this.score);

        // 🌐 API'ye item hit bildir - BURAYA EKLE
        if (this.api) {
            const result = await this.api.recordItemHit(this.score);
            if (result && result.isVictory) {
                console.log('🏆 Backend victory onayladı!');
            }
        }

        // 2) Zaman bonusu
        const bonus = 3;
        this.initialTime += bonus;

        // 3) Timer metnine pulse & renk animasyonu
        this.tweens.add({
            targets: this.timerText,
            scale: 1.4,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });

        // Renk geçişi
        this.tweens.addCounter({
            from: 0, to: 100,
            duration: 400,
            onUpdate: tween => {
                const v = tween.getValue();
                const c = Phaser.Display.Color.Interpolate.ColorWithColor(
                    new Phaser.Display.Color(255, 255, 0),  // sarı
                    new Phaser.Display.Color(0, 255, 0),    // yeşil
                    100, v
                );
                const hex = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
                this.timerText.setStyle({ color: '#' + hex.toString(16).padStart(6, '0') });
            },
            onComplete: () => {
                this.timerText.setStyle({ color: '#ffffff' }); // orijinal yeşile dönüş
            }
        });

        // 4) Floating “+Xs” text efekti
        const fx = this.add.text(
            this.timerText.x + this.timerText.width + 8,
            this.timerText.y,
            `+${bonus}s`,
            {
                fontSize: '24px',
                fontFamily: 'monospace',
                fill: '#ffffff',
                stroke: '#00ff00',
                strokeThickness: 3
            }
        )
            .setDepth(20)
            .setOrigin(0, 0.5);

        this.tweens.add({
            targets: fx,
            y: fx.y - 30,    // yukarıya kaydır
            alpha: 0,        // şeffaflaştır
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => fx.destroy()
        });


        if (this.score >= 500) {
            this.handleGameWin();
        }
    }

    //bomba vurma işlemi
    async hitBomb(arrow, bomb) {
        // Bomba patlaması sesi çal
        this.bombSound.play();
        bomb.destroy(); // Bombayı yok et
        arrow.destroy(); // Okun kendisini yok et
        this.bombsHit++;

        if (this.hearts > 0) {
            this.hearts--; // Canı azalt

            // 🌐 API'ye bomb hit bildir - BURAYA EKLE
            if (this.api) {
                const result = await this.api.recordBombHit(this.hearts);
                if (result && result.isGameOver) {
                    console.log('💀 Backend game over onayladı!');
                }
            }

            const heartToRemove = this.heartIcons[this.hearts];

            // Fade-out efekti ile kalbi yok et
            this.tweens.add({
                targets: heartToRemove,
                alpha: 0,
                duration: 300,
                ease: 'Linear',
                onComplete: () => {
                    heartToRemove.destroy();
                }
            });

            // Diziden de çıkar
            this.heartIcons.splice(this.hearts, 1);
        }

        // Patlama efekti oluştur
        let explosion = this.add.image(bomb.x, bomb.y, 'explosion');
        explosion.setScale(0.1);
        explosion.setDepth(10);

        // Patlamayı yavaşça kaybolacak şekilde animasyonla yok et
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            onComplete: () => {
                explosion.destroy();
            }
        });

        // Can 0'a düşerse oyunu bitir
        if (this.hearts <= 0) {
            this.handleGameOver();
        }
    }

    clearScreen() {
        this.items.clear(true, true);
        this.bombs.clear(true, true);
        this.arrows.clear(true, true);
    }

    handleGameOver() {
        this.gameActive = false;
        this.clearScreen();
        this.sound.stopAll();
        this.lightningTimer.remove();
        this.scene.start('GameOverScene', {
            finalScore: this.score,
            heartsLeft: this.hearts,
            arrowsFired: this.arrowsFired,
            itemsSpawned: this.itemsSpawned,
            bombsSpawned: this.bombsSpawned,
            itemsHit: this.itemsHit,
            bombsHit: this.bombsHit,
            durationMs: this.durationMs,
            didWin: this.didWin,
        });
    }

    handleGameWin() {
        // Seviye tamamlama sesi çal
        this.levelCompleteSound.play();
        this.backgroundMusic.stop();
        this.lightningTimer.remove();
        this.countdownTimer.remove();
        // 1) Anında beyazı “yak”
        this.fadeRect.alpha = 1;
        // 2) Arkaplanları değiştir
        this.backgroundSpace.setDepth(100);
        this.player.setDepth(100);
        this.trajectoryLine.setDepth(100);

        // 3) 1 saniyede beyazı fade-out yap
        this.tweens.add({
            targets: this.fadeRect,
            alpha: 0,
            duration: 3000,
            ease: 'Linear'
        });


        this.gameActive = false;
        this.didWin = true;

        this.clearScreen();
        this.trophy = this.physics.add.sprite(config.width / 2 + 200, config.height / 2, 'trophy');
        this.trophy.setDepth(100);
        this.trophy.setScale(0.5)
        this.trophy.body.setAllowGravity(false);

        this.tweens.add({
            targets: this.trophy,
            y: this.trophy.y - 10,         // yukarı ne kadar çıkacağı
            duration: 1000,
            ease: 'Sine.easeInOut',     // yumuşak geçiş eğrisi
            yoyo: true,                 // geri dönsün
            repeat: -1                  // sonsuza kadar
        });

        this.physics.add.overlap(this.arrows, this.trophy, () => {
            this.scene.start('WinScene', {
                finalScore: this.score,
                heartsLeft: this.hearts,
                arrowsFired: this.arrowsFired,
                itemsSpawned: this.itemsSpawned,
                bombsSpawned: this.bombsSpawned,
                itemsHit: this.itemsHit,
                bombsHit: this.bombsHit,
                durationMs: this.durationMs,
                didWin: this.didWin,
            });
        });

    }

    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.itemSpawnInterval = 2000;
                this.bombSpawnInterval = 5000;
                break;
            case 'medium':
                this.itemSpawnInterval = 1500;
                this.bombSpawnInterval = 3000;
                break;
            case 'hard':
                this.itemSpawnInterval = 1500;
                this.bombSpawnInterval = 1500;
                break;
            case 'very-hard':
                this.itemSpawnInterval = 1200;
                this.bombSpawnInterval = 800;
                break;
            default:
                console.error('Geçersiz zorluk seviyesi: ' + level);
        }
    }
}

// ------------------- GameOverScene -------------------
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('game-over', 'assets/ui/gameover-screen.png');
        this.load.image('restart-button', 'assets/ui/restart-red.png');
        this.load.image('score-image', 'assets/ui/score-image.png');    // Ses açık ikonu

        // Ses dosyası
        this.load.audio('game-over-sound', 'assets/audio/game-over.mp3');
        this.load.audio('button-click', 'assets/audio/button-click.mp3');
    }

    init(data) {
        this.finalScore = data.finalScore;
        this.heartsLeft = data.heartsLeft;
        this.arrowsFired = data.arrowsFired;
        this.itemsSpawned = data.itemsSpawned;
        this.bombsSpawned = data.bombsSpawned;
        this.itemsHit = data.itemsHit;
        this.bombsHit = data.bombsHit;
        this.durationMs = data.durationMs;
        this.didWin = data.didWin;
    }

    create() {
        // Game over sesi çal
        this.gameOverSound = this.sound.add('game-over-sound', { volume: 0.5 });
        this.gameOverSound.play();

        this.buttonClickSound = this.sound.add('button-click', { volume: 0.7 });
        // "Game Over" Yazısı
        this.gameOverText = this.add.image(config.width / 2, config.height / 2, 'game-over')
        this.gameOverText.setOrigin(0.5, 0.5);

        //skor yazısı
        this.FinalScoreText = this.add.text(config.width / 2, config.height / 2 + 220, 'Score : ' + this.finalScore, {
            fontSize: '50px',
            fontWeight: 'bold',
            fill: '#fe3a29',
            stroke: '#fe3a29',
            strokeThickness: 4
        });
        this.FinalScoreText.setOrigin(0.5, 0.5);
        this.FinalScoreText.setScrollFactor(0);
        this.FinalScoreText.setDepth(1);

        // tekrar-oyna button
        const restartButton = this.add.image(config.width / 2, config.height - 200, 'restart-button');
        restartButton.setScale(0.3);
        restartButton.setInteractive({ useHandCursor: true });

        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [restartButton],
            scaleX: { from: restartButton.scaleX, to: restartButton.scaleX * 1.1 },
            scaleY: { from: restartButton.scaleY, to: restartButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        restartButton.on('pointerover', () => {
            restartButton.setScale(restartButton.scaleX * 1.1);
            buttonTween.pause();
        });

        restartButton.on('pointerout', () => {
            restartButton.setScale(restartButton.scaleX * 1.1);
            buttonTween.resume();
        });

        restartButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.buttonClickSound.play();
            restartButton.disableInteractive();
            restartButton.setVisible(false);
            this.scene.start('GameScene');

        });
    }
}


class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {
        this.load.image('win', 'assets/ui/win-screen.png');
        this.load.image('restart', 'assets/ui/restart-green.png')

        // Ses dosyası
        this.load.audio('win-sound', 'assets/audio/victory.mp3');
        this.load.audio('button-click', 'assets/audio/button-click.mp3');
    }

    init(data) {
        this.finalScore = data.finalScore;
        this.heartsLeft = data.heartsLeft;
        this.arrowsFired = data.arrowsFired;
        this.itemsSpawned = data.itemsSpawned;
        this.bombsSpawned = data.bombsSpawned;
        this.itemsHit = data.itemsHit;
        this.bombsHit = data.bombsHit;
        this.durationMs = data.durationMs;
        this.didWin = data.didWin;
    }




    create() {
        // Kazanma sesi çal
        this.winSound = this.sound.add('win-sound', { volume: 0.6 });
        this.winSound.play();

        this.buttonClickSound = this.sound.add('button-click', { volume: 0.7 });

        //kazandınız yazısı
        this.winText = this.add.image(config.width / 2, config.height / 2, 'win');

        // tekrar-oyna button
        const restartButton = this.add.image(config.width / 2, config.height - 200, 'restart');
        restartButton.setScale(0.3);
        restartButton.setInteractive({ useHandCursor: true });

        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [restartButton],
            scaleX: { from: restartButton.scaleX, to: restartButton.scaleX * 1.1 },
            scaleY: { from: restartButton.scaleY, to: restartButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.4);
            buttonTween.pause();
        });

        restartButton.on('pointerout', () => {
            restartButton.setScale(0.4);
            buttonTween.resume();
        });

        restartButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.buttonClickSound.play();
            restartButton.disableInteractive();
            restartButton.setVisible(false);
            this.scene.start('GameScene');

        });
    }
}

// ------------------- Config -------------------
const config = {
    type: Phaser.AUTO,
    width: 1536,
    height: 1024,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }, //item düşme hızını değiştirir
            debug: false
        }
    },
    scene: [StartScene, GameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);


//* J -> uzay kısmı K -> win ekranı L -> gameover ekranı 
