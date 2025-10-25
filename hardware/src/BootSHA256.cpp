#include "BootSHA256.h"
#include <ArduinoJson.h>
#include <EEPROM.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <bearssl/bearssl_hash.h>

#define MAGIC_BYTE_1 0xCA
#define MAGIC_BYTE_2 0xFE
#define ENABLE_FLAG_ADDR 0
#define MAGIC_ADDR_1 1
#define MAGIC_ADDR_2 2

static const char *g_verificationURL = nullptr;
static const char *g_lockdownReportURL = nullptr;
static const char *g_wifiSSID = nullptr;
static const char *g_wifiPassword = nullptr;

static const char *g_deviceName = "ESP8266-Device";
static const char *g_firmwareVer = "v1.0.0";
static const char *g_manufacturerId = "0x00000000";
static const char *g_walletId = "unknown";
static const char *g_appwriteId = "unknown";

#define LOCKDOWN_PARTITION 0x100000

void setWiFiCredentials(const char *ssid, const char *password) {
  g_wifiSSID = ssid;
  g_wifiPassword = password;
}

void setVerificationURL(const char *url) { g_verificationURL = url; }

void setLockdownReportURL(const char *url) { g_lockdownReportURL = url; }

void setDeviceInfo(const char *deviceName, const char *firmwareVer,
                   const char *manufacturerId, const char *walletId,
                   const char *appwriteId) {
  g_deviceName = deviceName;
  g_firmwareVer = firmwareVer;
  g_manufacturerId = manufacturerId;
  g_walletId = walletId;
  g_appwriteId = appwriteId;
}

void calculateFirmwareSHA256(char *hashOutput) {
  Serial.println("\n=== Firmware SHA-256 Hash Calculator ===\n");

  uint32_t sketchSize = ESP.getSketchSize();
  uint32_t sketchStart = 0x0;

  Serial.printf("Sketch Size: %u bytes\n", sketchSize);
  Serial.printf("Reading from flash address: 0x%08X\n\n", sketchStart);

  br_sha256_context ctx;
  br_sha256_init(&ctx);

  const size_t CHUNK_SIZE = 512;
  uint8_t buffer[CHUNK_SIZE];
  uint32_t bytesProcessed = 0;

  Serial.println("Calculating hash...");

  while (bytesProcessed < sketchSize) {
    size_t bytesToRead = min((size_t)(sketchSize - bytesProcessed), CHUNK_SIZE);

    if (ESP.flashRead(sketchStart + bytesProcessed, (uint32_t *)buffer,
                      (bytesToRead + 3) & ~3) == false) {
      Serial.println("ERROR: Flash read failed!");
      return;
    }

    br_sha256_update(&ctx, buffer, bytesToRead);
    bytesProcessed += bytesToRead;

    if (bytesProcessed % 10240 == 0) {
      Serial.printf("Progress: %u/%u bytes\n", bytesProcessed, sketchSize);
    }
  }

  uint8_t hash[32];
  br_sha256_out(&ctx, hash);

  Serial.println("\n--- SHA-256 Hash of Firmware ---");

  for (int i = 0; i < 32; i++) {
    sprintf(hashOutput + (i * 2), "%02x", hash[i]);
    Serial.printf("%02x", hash[i]);
  }
  hashOutput[64] = '\0';

  Serial.println("\n");
}

bool connectWiFi() {
  if (!g_wifiSSID || !g_wifiPassword) {
    Serial.println("ERROR: WiFi credentials not set!");
    return false;
  }

  Serial.printf("Connecting to WiFi: %s\n", g_wifiSSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(g_wifiSSID, g_wifiPassword);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    return true;
  } else {
    Serial.println("WiFi connection failed!");
    return false;
  }
}

bool verifyHashWithAPI(const char *hash) {
  if (!g_verificationURL) {
    Serial.println("ERROR: Verification URL not set!");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure(); // for testing only — use fingerprint / cert for
                        // production

  HTTPClient http;

  Serial.printf("\nVerifying hash with API: %s\n", g_verificationURL);

  if (!http.begin(client, g_verificationURL)) {
    Serial.println("HTTP begin failed!");
    return false;
  }

  // enable following redirects (use STRICT or FORCE depending on need)
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);

  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["device_id"] = "deployed_esp8266_2";
  doc["firmware_hash"] = hash;

  String payload;
  serializeJson(doc, payload);
  Serial.printf("payload: %s\n", payload.c_str());

  int httpCode = http.POST(payload);

  Serial.printf("HTTP Response code: %d\n", httpCode);

  // debug: print Location header if redirect code returned
  if (httpCode == 301 || httpCode == 302 || httpCode == 307 ||
      httpCode == 308) {
    String loc = http.getLocation();
    Serial.printf("Redirect Location header: %s\n", loc.c_str());
  }

  String response = http.getString();
  Serial.printf("Raw response: [%s]\n", response.c_str());
  Serial.printf("Response length: %d\n", response.length());

  // try parse JSON
  StaticJsonDocument<512> responseDoc;
  DeserializationError error = deserializeJson(responseDoc, response);

  if (error) {
    Serial.printf("JSON parse error: %s\n", error.c_str());
    http.end();
    return false;
  }

  const char *status = responseDoc["status"];
  Serial.printf("Status field: '%s'\n", status ? status : "NULL");

  bool ok = (status && strcmp(status, "success") == 0);

  http.end();
  return ok;
}
// bool verifyHashWithAPI(const char *hash) {
//   if (!g_verificationURL) {
//     Serial.println("ERROR: Verification URL not set!");
//     return false;
//   }
//
//   WiFiClient client;
//   HTTPClient http;
//
//   Serial.printf("\nVerifying hash with API: %s\n", g_verificationURL);
//   if (!http.begin(client, g_verificationURL)) {
//     Serial.println("HTTP begin failed!");
//     return false;
//   }
//
//   http.addHeader("Content-Type", "application/json");
//
//   // StaticJsonDocument<256> doc;
//   // doc["hash"] = hash;
//   // doc["device_id"] = ESP.getChipId();
//   StaticJsonDocument<256> doc;
//   doc["device_id"] =
//       "deployed_esp8266_2";    // Changed from ESP.getChipId() to literal
//       string
//   doc["firmware_hash"] = hash; // Changed from "hash" to "firmware_hash"
//
//   String payload;
//   serializeJson(doc, payload);
//
//   Serial.printf("payload: %s\n", payload.c_str());
//
//   int httpCode = http.POST(payload);
//
//   if (httpCode > 0) {
//     Serial.printf("HTTP Response code: %d\n", httpCode);
//     String response = http.getString();
//     Serial.printf("Raw response: [%s]\n", response.c_str());
//     Serial.printf("Response length: %d\n", response.length());
//
//     StaticJsonDocument<512> responseDoc;
//     DeserializationError error = deserializeJson(responseDoc, response);
//
//     if (error) {
//       Serial.printf("JSON parse error: %s\n", error.c_str());
//       http.end();
//       return false;
//     }
//
//     Serial.println("JSON keys found:");
//     for (JsonPair kv : responseDoc.as<JsonObject>()) {
//       Serial.printf("  Key: '%s', Value: '%s'\n", kv.key().c_str(),
//                     kv.value().as<const char *>());
//     }
//
//     const char *status = responseDoc["status"];
//
//     Serial.printf("Status field: '%s'\n", status ? status : "NULL");
//
//     if (status != nullptr) {
//       Serial.printf("Comparing: '%s' == 'success'\n", status);
//       if (strcmp(status, "success") == 0) {
//         Serial.println("API Verification: SUCCESS");
//         http.end();
//         return true;
//       } else {
//         Serial.printf("API Verification: FAILURE (status=%s)\n", status);
//         http.end();
//         return false;
//       }
//     } else {
//       Serial.println("API Verification: FAILURE (status field is NULL)");
//       http.end();
//       return false;
//     }
//   } else {
//     Serial.printf("HTTP POST failed, error: %s\n",
//                   http.errorToString(httpCode).c_str());
//     http.end();
//     return false;
//   }
// }

void corruptSketchAndLockdown() {
  Serial.println("\nSECURITY VIOLATION DETECTED");
  Serial.println("Corrupting sketch partition...");

  uint32_t corruptAddr = 0x0;
  uint32_t corruptData = 0xDEADBEEF;

  for (int i = 0; i < 10; i++) {
    ESP.flashWrite(corruptAddr + (i * 4), &corruptData, 4);
  }

  Serial.println("Sketch partition corrupted!");
  Serial.println("Entering lockdown mode...");
  Serial.println("Device is now locked. Manual reflashing required.");

  while (true) {
    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
  }
}

// bool reportLockdownToAPI(const char *hash, const char *statusInfo) {
//   if (!g_lockdownReportURL) {
//     Serial.println("WARNING: Lockdown report URL not set, skipping report.");
//     return false;
//   }
//
//   WiFiClient client;
//   HTTPClient http;
//
//   Serial.printf("\nReporting lockdown to API: %s\n", g_lockdownReportURL);
//
//   if (!http.begin(client, g_lockdownReportURL)) {
//     Serial.println("HTTP begin failed for lockdown report!");
//     return false;
//   }
//
//   http.addHeader("Content-Type", "application/json");
//
//   char deviceIdStr[20];
//   sprintf(deviceIdStr, "0x%08X", ESP.getChipId());
//
//   StaticJsonDocument<1024> doc;
//   doc["device_id"] = deviceIdStr;
//   doc["device_name"] = g_deviceName;
//   doc["firmware_ver"] = g_firmwareVer;
//   doc["Manufaturer_id"] = g_manufacturerId;
//   doc["WalletID"] = g_walletId;
//   doc["Apprwrite_id"] = g_appwriteId;
//   doc["Hash"] = hash;
//   doc["status_info"] = statusInfo;
//
//   JsonArray partitionHealth = doc.createNestedArray("partition_health");
//   partitionHealth.add(1);
//   partitionHealth.add(0);
//   partitionHealth.add(1);
//   partitionHealth.add(1);
//
//   String payload;
//   serializeJson(doc, payload);
//
//   Serial.println("Sending lockdown report:");
//   Serial.println(payload);
//
//   int httpCode = http.POST(payload);
//
//   if (httpCode > 0) {
//     Serial.printf("Lockdown report response code: %d\n", httpCode);
//     String response = http.getString();
//     Serial.printf("Response: %s\n", response.c_str());
//     http.end();
//     return true;
//   } else {
//     Serial.printf("Lockdown report failed: %s\n",
//                   http.errorToString(httpCode).c_str());
//     http.end();
//     return false;
//   }
// }
bool reportLockdownToAPI(const char *hash, const char *statusInfo) {
  if (!g_lockdownReportURL) {
    Serial.println("WARNING: Lockdown report URL not set, skipping report.");
    return false;
  }

  // Ensure WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, attempting to reconnect...");
    if (!connectWiFi()) {
      Serial.println("Failed to reconnect to WiFi for lockdown report!");
      return false;
    }
  }

  WiFiClient client;
  HTTPClient http;

  Serial.printf("\nReporting lockdown to API: %s\n", g_lockdownReportURL);

  // Set longer timeout for ESP8266
  http.setTimeout(15000); // 15 seconds

  if (!http.begin(client, g_lockdownReportURL)) {
    Serial.println("HTTP begin failed for lockdown report!");
    return false;
  }

  http.addHeader("Content-Type", "application/json");

  char deviceIdStr[20];
  sprintf(deviceIdStr, "0x%08X", ESP.getChipId());

  StaticJsonDocument<1024> doc;
  doc["device_id"] = deviceIdStr;
  doc["device_name"] = g_deviceName;
  doc["firmware_ver"] = g_firmwareVer;
  doc["Manufaturer_id"] = g_manufacturerId;
  doc["WalletID"] = g_walletId;
  doc["Apprwrite_id"] = g_appwriteId;
  doc["Hash"] = hash;
  doc["status_info"] = statusInfo;

  JsonArray partitionHealth = doc.createNestedArray("partition_health");
  partitionHealth.add(1);
  partitionHealth.add(0);
  partitionHealth.add(1);
  partitionHealth.add(1);

  String payload;
  serializeJson(doc, payload);

  Serial.println("Sending lockdown report:");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("Lockdown report response code: %d\n", httpCode);
    String response = http.getString();
    Serial.printf("Response: %s\n", response.c_str());
    http.end();
    return true;
  } else {
    Serial.printf("Lockdown report failed: %s\n",
                  http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}
bool shouldRunSHA256Check() {
  EEPROM.begin(512);

  if (EEPROM.read(MAGIC_ADDR_1) == MAGIC_BYTE_1 &&
      EEPROM.read(MAGIC_ADDR_2) == MAGIC_BYTE_2) {
    bool enabled = EEPROM.read(ENABLE_FLAG_ADDR) == 1;
    EEPROM.end();
    return enabled;
  }

  EEPROM.write(ENABLE_FLAG_ADDR, 1);
  EEPROM.write(MAGIC_ADDR_1, MAGIC_BYTE_1);
  EEPROM.write(MAGIC_ADDR_2, MAGIC_BYTE_2);
  EEPROM.commit();
  EEPROM.end();
  return true;
}

// void runBootHashCheck() {
//   if (!shouldRunSHA256Check()) {
//     Serial.println("Boot hash check disabled.");
//     return;
//   }
//
//   pinMode(LED_BUILTIN, OUTPUT);
//
//   char hash[65];
//   calculateFirmwareSHA256(hash);
//
//   if (!connectWiFi()) {
//     Serial.println("ERROR: Cannot verify without WiFi!");
//     Serial.println("Defaulting to LOCKDOWN for security.");
//     corruptSketchAndLockdown();
//     return;
//   }
//
//   bool verified = verifyHashWithAPI(hash);
//
//   WiFi.disconnect();
//
//   if (verified) {
//     Serial.println("\nVERIFICATION SUCCESSFUL");
//     Serial.println("Proceeding with sketch execution...\n");
//     delay(1000);
//   } else {
//     Serial.println("\nVERIFICATION FAILED");
//
//     reportLockdownToAPI(
//         hash,
//         "Firmware hash verification failed - Unauthorized firmware
//         detected");
//
//     delay(2000);
//
//     corruptSketchAndLockdown();
//   }
// }
void runBootHashCheck() {
  if (!shouldRunSHA256Check()) {
    Serial.println("Boot hash check disabled.");
    return;
  }

  pinMode(LED_BUILTIN, OUTPUT);

  char hash[65];
  calculateFirmwareSHA256(hash);

  if (!connectWiFi()) {
    Serial.println("ERROR: Cannot verify without WiFi!");
    Serial.println("Defaulting to LOCKDOWN for security.");
    corruptSketchAndLockdown();
    return;
  }

  bool verified = verifyHashWithAPI(hash);

  if (verified) {
    WiFi.disconnect();

    Serial.println("\nVERIFICATION SUCCESSFUL");
    Serial.println("Proceeding with sketch execution...\n");
    delay(1000);
  } else {
    Serial.println("\nâœ—âœ—âœ— VERIFICATION FAILED âœ—âœ—âœ—");

    reportLockdownToAPI(
        hash,
        "Firmware hash verification failed - Unauthorized firmware detected");

    delay(2000);

    WiFi.disconnect();

    corruptSketchAndLockdown();
  }
}

void enableBootSHA256() {
  EEPROM.begin(512);
  EEPROM.write(ENABLE_FLAG_ADDR, 1);
  EEPROM.commit();
  EEPROM.end();
  Serial.println("[BOOT SHA-256] ENABLED");
}

void disableBootSHA256() {
  EEPROM.begin(512);
  EEPROM.write(ENABLE_FLAG_ADDR, 0);
  EEPROM.commit();
  EEPROM.end();
  Serial.println("[BOOT SHA-256] DISABLED");
}
