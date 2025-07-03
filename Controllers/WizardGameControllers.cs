using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

namespace WizardGameAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WizardGameController : ControllerBase
    {
        private readonly ILogger<WizardGameController> _logger;

        // 🔐 Thread-safe collections for security
        private static readonly ConcurrentDictionary<string, DeviceBoundToken> _deviceTokens = new();
        private static readonly ConcurrentDictionary<string, DeviceFingerprint> _deviceFingerprints = new();
        private static readonly ConcurrentDictionary<string, GameSession> _activeSessions = new();

        // 🔐 Security secrets
        private static readonly string DEVICE_SECRET = Environment.GetEnvironmentVariable("DEVICE_SECRET")
            ?? "wizard-device-secret-2024-CHANGE-IN-PRODUCTION";
        private static readonly string MASTER_SECRET = Environment.GetEnvironmentVariable("MASTER_SECRET")
            ?? "wizard-master-secret-2024-CHANGE-IN-PRODUCTION";

        // 🔐 Security constants
        private const int TOKEN_EXPIRY_SECONDS = 120;
        private const int MAX_REQUESTS_PER_MINUTE = 60;

        public WizardGameController(ILogger<WizardGameController> logger)
        {
            _logger = logger;
        }

        // 🎮 Oyun konfigürasyonu
        [HttpGet("config")]
        public IActionResult GetGameConfig()
        {
            var config = new
            {
                maxHearts = 3,
                itemSpawnInterval = 2000,
                bombSpawnInterval = 5000,
                itemScore = 10,
                victoryScore = 500,
                gameWidth = 1536,
                gameHeight = 1024,
                playerStartX = 250,
                playerStartY = 512,
                message = "Wizard Game API Çalışıyor! 🧙‍♂️"
            };

            _logger.LogInformation("🎮 Game config istendi");
            return Ok(config);
        }

        // 🔍 API durumu kontrolü
        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new
            {
                status = "OK",
                message = "Wizard Game API Çalışıyor! 🧙‍♂️",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                version = "1.0.0"
            });
        }

        // 🏹 Ok atışı kaydetme
        [HttpPost("arrow-shot")]
        public IActionResult RecordArrowShot([FromBody] ArrowShotRequest request)
        {
            _logger.LogInformation($"🏹 Ok atışı: velocityX={request.VelocityX}, velocityY={request.VelocityY}");

            return Ok(new
            {
                success = true,
                message = "Ok atışı kaydedildi",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            });
        }

        // 🎯 Item vurma kaydetme
        [HttpPost("item-hit")]
        public IActionResult RecordItemHit([FromBody] ItemHitRequest request)
        {
            _logger.LogInformation($"🎯 Item vuruldu! Yeni skor: {request.NewScore}");

            // Basit skor kontrolü
            if (request.NewScore < 0 || request.NewScore > 10000)
            {
                return BadRequest(new { success = false, message = "Geçersiz skor!" });
            }

            var response = new
            {
                success = true,
                message = "Item hit kaydedildi",
                newScore = request.NewScore,
                isVictory = request.NewScore >= 500
            };

            return Ok(response);
        }

        // 💣 Bomba vurma kaydetme
        [HttpPost("bomb-hit")]
        public IActionResult RecordBombHit([FromBody] BombHitRequest request)
        {
            _logger.LogInformation($"💣 Bomba vuruldu! Kalan can: {request.RemainingHearts}");

            // Can kontrolü
            if (request.RemainingHearts < 0 || request.RemainingHearts > 3)
            {
                return BadRequest(new { success = false, message = "Geçersiz can sayısı!" });
            }

            var response = new
            {
                success = true,
                message = "Bomb hit kaydedildi",
                remainingHearts = request.RemainingHearts,
                isGameOver = request.RemainingHearts <= 0
            };

            return Ok(response);
        }

        // 🔐 Device-bound permission request
        [HttpPost("request-device-permission")]
        public async Task<IActionResult> RequestDevicePermission([FromBody] DevicePermissionRequest request)
        {
            try
            {
                _logger.LogInformation($"🔐 Device permission requested for session: {request.SessionId}");

                // Device fingerprint validation
                var deviceId = CreateDeviceId(request.DeviceFingerprint);
                var tokenData = GenerateDeviceBoundToken(request.SessionId, deviceId, request.GameData);

                // Store token
                var expiresAt = DateTime.UtcNow.AddSeconds(TOKEN_EXPIRY_SECONDS);
                _deviceTokens[tokenData.Token] = new DeviceBoundToken
                {
                    SessionId = request.SessionId,
                    DeviceId = deviceId,
                    ExpectedGameState = request.GameData,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt,
                    IsUsed = false
                };

                // Store device fingerprint
                _deviceFingerprints[deviceId] = new DeviceFingerprint
                {
                    DeviceId = deviceId,
                    Fingerprint = request.DeviceFingerprint,
                    LastSeen = DateTime.UtcNow,
                    SessionId = request.SessionId
                };

                _logger.LogInformation($"✅ Device permission granted: {tokenData.Token[..8]}... for device {deviceId[..8]}...");

                return Ok(new
                {
                    success = true,
                    permissionToken = tokenData.Token,
                    deviceChallenge = tokenData.DeviceChallenge,
                    expiresIn = TOKEN_EXPIRY_SECONDS,
                    serverTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Device permission error");
                return StatusCode(500, new { success = false, reason = "Permission generation failed" });
            }
        }

        // 🔐 Secure action validation
        [HttpPost("validate-secure-action")]
        public IActionResult ValidateSecureAction([FromBody] SecureActionRequest request)
        {
            try
            {
                // Token validation
                var tokenResult = ValidateDeviceBoundToken(request);
                if (!tokenResult.IsValid)
                {
                    _logger.LogWarning($"❌ Token validation failed: {tokenResult.Reason}");
                    return Ok(new { success = false, reason = "Token validation failed", cheatProbability = 99 });
                }

                // Mark token as used
                if (_deviceTokens.TryGetValue(request.PermissionToken, out var tokenData))
                {
                    tokenData.IsUsed = true;
                }

                _logger.LogInformation($"✅ Secure action validated for session {request.SessionId}");

                return Ok(new
                {
                    success = true,
                    message = "Secure validation successful",
                    serverVerification = GenerateServerVerification(request.SessionId)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Secure validation error");
                return Ok(new { success = false, reason = "Validation error", cheatProbability = 85 });
            }
        }

        // 🔧 HELPER METHODS
        private string CreateDeviceId(ClientDeviceFingerprint fingerprint)
        {
            var deviceString = $"{fingerprint.UserAgent}:{fingerprint.ScreenResolution.Width}x{fingerprint.ScreenResolution.Height}:{fingerprint.TimezoneOffset}:{fingerprint.CanvasFingerprint}:{fingerprint.WebGLFingerprint}";

            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(deviceString));
            return Convert.ToHexString(hashBytes)[..32];
        }

        private DeviceBoundTokenData GenerateDeviceBoundToken(string sessionId, string deviceId, WizardGameData gameData)
        {
            var tokenPayload = new
            {
                sessionId = sessionId,
                deviceId = deviceId,
                gameState = new
                {
                    score = gameData.Score,
                    hearts = gameData.Hearts,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                },
                createdAt = DateTime.UtcNow.ToString("O")
            };

            var tokenJson = JsonSerializer.Serialize(tokenPayload);
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(tokenJson));
            var deviceChallenge = GenerateDeviceChallenge(deviceId, sessionId);

            return new DeviceBoundTokenData
            {
                Token = token,
                DeviceChallenge = deviceChallenge
            };
        }

        private string GenerateDeviceChallenge(string deviceId, string sessionId)
        {
            var challengeInput = $"{deviceId}:{sessionId}:{DateTime.UtcNow.Ticks}:{MASTER_SECRET}";
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(challengeInput));
            return Convert.ToHexString(hashBytes)[..16];
        }

        private ValidationResult ValidateDeviceBoundToken(SecureActionRequest request)
        {
            if (!_deviceTokens.TryGetValue(request.PermissionToken, out var tokenData))
                return new ValidationResult(false, "Token not found");

            if (DateTime.UtcNow > tokenData.ExpiresAt)
                return new ValidationResult(false, "Token expired");

            if (tokenData.IsUsed)
                return new ValidationResult(false, "Token already used");

            if (tokenData.SessionId != request.SessionId)
                return new ValidationResult(false, "Session mismatch");

            return new ValidationResult(true, "Token valid");
        }

        private string GenerateServerVerification(string sessionId)
        {
            var verificationInput = $"{sessionId}:{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}:{MASTER_SECRET}";
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(verificationInput));
            return Convert.ToBase64String(hashBytes)[..16];
        }
    }

    // 📝 REQUEST MODELS
    public class ArrowShotRequest
    {
        public double VelocityX { get; set; }
        public double VelocityY { get; set; }
        public string SessionId { get; set; } = "";
    }

    public class ItemHitRequest
    {
        public int NewScore { get; set; }
        public string SessionId { get; set; } = "";
    }

    public class BombHitRequest
    {
        public int RemainingHearts { get; set; }
        public string SessionId { get; set; } = "";
    }

    public class DevicePermissionRequest
    {
        public string SessionId { get; set; } = "";
        public WizardGameData GameData { get; set; } = new();
        public ClientDeviceFingerprint DeviceFingerprint { get; set; } = new();
        public long Timestamp { get; set; }
    }

    public class SecureActionRequest
    {
        public string SessionId { get; set; } = "";
        public string PermissionToken { get; set; } = "";
        public WizardGameData GameData { get; set; } = new();
        public ClientDeviceFingerprint DeviceFingerprint { get; set; } = new();
        public long Timestamp { get; set; }
    }

    public class WizardGameData
    {
        public int Score { get; set; }
        public int Hearts { get; set; }
        public int ItemsHit { get; set; }
        public int BombsHit { get; set; }
        public long GameTime { get; set; }
    }

    public class ClientDeviceFingerprint
    {
        public string UserAgent { get; set; } = "";
        public ScreenResolution ScreenResolution { get; set; } = new();
        public int TimezoneOffset { get; set; }
        public string CanvasFingerprint { get; set; } = "";
        public string WebGLFingerprint { get; set; } = "";
    }

    public class ScreenResolution
    {
        public int Width { get; set; }
        public int Height { get; set; }
    }

    // 🔐 SECURITY MODELS
    public class DeviceBoundToken
    {
        public string SessionId { get; set; } = "";
        public string DeviceId { get; set; } = "";
        public WizardGameData ExpectedGameState { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
    }

    public class DeviceFingerprint
    {
        public string DeviceId { get; set; } = "";
        public ClientDeviceFingerprint Fingerprint { get; set; } = new();
        public DateTime LastSeen { get; set; }
        public string SessionId { get; set; } = "";
    }

    public class DeviceBoundTokenData
    {
        public string Token { get; set; } = "";
        public string DeviceChallenge { get; set; } = "";
    }

    public class GameSession
    {
        public string SessionId { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime LastValidation { get; set; }
        public int TotalScore { get; set; }
        public bool IsTerminated { get; set; }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string Reason { get; set; }

        public ValidationResult(bool isValid, string reason)
        {
            IsValid = isValid;
            Reason = reason;
        }
    }
}