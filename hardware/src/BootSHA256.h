#ifndef BOOT_SHA256_H
#define BOOT_SHA256_H

#include <Arduino.h>

void runBootHashCheck();
void enableBootSHA256();
void disableBootSHA256();

// Configuration - Set these in your main.cpp BEFORE including this header
void setWiFiCredentials(const char *ssid, const char *password);
void setVerificationURL(const char *url);
void setLockdownReportURL(const char *url);

// Device information - Set these before calling runBootHashCheck()
void setDeviceInfo(const char *deviceName, const char *firmwareVer,
                   const char *manufacturerId, const char *walletId,
                   const char *appwriteId);

#endif
