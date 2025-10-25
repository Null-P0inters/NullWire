#include "BootSHA256.h"
#include <Arduino.h>

#define LED_PIN LED_BUILTIN

void setup() {
  Serial.begin(115200);
  delay(2000);

  // Configure WiFi and URLs
  setWiFiCredentials("OPPO A3 Pro 5G", "debjeet123@wifi");
  setVerificationURL("https://nullwireserver-three.vercel.app/verify");
  setLockdownReportURL("http://10.162.128.244:5000/lockdown");

  // Configure device information
  setDeviceInfo("ESP8266-IoT-Device-01", "v2.0.0", "0x79832A5F",
                "9ce22d4f8a3b1e7c5d6a9f2e8b4c1d3a", "hdhs7382kf93jd82ks");

  // This will calculate hash, verify with API, and lock if failed
  runBootHashCheck();

  // If we get here, verification passed!
  Serial.println("\n=== TEST SKETCH 1: Blink ===");
  Serial.println("This code only runs if API verification succeeds!");

  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON - Verified firmware running!");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
