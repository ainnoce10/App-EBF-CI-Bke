#!/usr/bin/env node

/**
 * Test script to validate all three fixes:
 * 1. Tracking code functionality
 * 2. Audio recording and submission
 * 3. Geolocation and position sharing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Test 1: Tracking Code Functionality
async function testTrackingCode() {
  console.log('\n📝 TEST 1: Tracking Code Functionality');
  console.log('=' .repeat(50));
  
  try {
    // First, create a test request
    const testCode = 'EBF_' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    console.log(`Creating test tracking code: ${testCode}`);
    
    // Manually create tracking data
    const trackingData = {
      [testCode]: {
        code: testCode,
        name: 'Test Client',
        phone: '+225 XX XX XX XX XX',
        neighborhood: 'Zone Test',
        latitude: 6.8276,
        longitude: -5.2893,
        inputType: 'text',
        description: 'Test description',
        hasAudio: false,
        hasPhoto: false,
        audioUrl: null,
        photoUrl: null,
        emailId: 'test-email-id',
        createdAt: new Date().toISOString(),
        status: 'submitted'
      }
    };
    
    // Create data directory and save
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const trackingFile = path.join(dataDir, 'tracking.json');
    let existingData = {};
    
    if (fs.existsSync(trackingFile)) {
      existingData = JSON.parse(fs.readFileSync(trackingFile, 'utf-8'));
    }
    
    // Merge new data
    const mergedData = { ...existingData, ...trackingData };
    fs.writeFileSync(trackingFile, JSON.stringify(mergedData, null, 2));
    console.log('✅ Test data saved to tracking.json');
    
    // Now test the API
    const response = await fetch(`${BASE_URL}/api/tracking?code=${testCode}`);
    const result = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, JSON.stringify(result, null, 2));
    
    if (result.success && result.data.trackingCode === testCode) {
      console.log('✅ PASS: Tracking code works correctly');
      return true;
    } else {
      console.log('❌ FAIL: Tracking code not working');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

// Test 2: Audio Recording and Submission
async function testAudioSubmission() {
  console.log('\n🎵 TEST 2: Audio Recording and Submission');
  console.log('=' .repeat(50));
  
  try {
    // Create a test WAV file (simple silence, minimal size)
    // WAV header for 1 second of silence at 44100 Hz
    const sampleRate = 44100;
    const duration = 1; // 1 second
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const dataSize = sampleRate * duration * numChannels * (bitsPerSample / 8);
    const fileSize = 36 + dataSize;
    
    const buffer = Buffer.alloc(44 + dataSize);
    
    // WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    console.log('✅ Created test WAV file');
    
    // Create FormData-like object
    const formData = new FormData();
    formData.append('name', 'Test Audio User');
    formData.append('phone', '+225 12345678');
    formData.append('neighborhood', 'Test Zone');
    formData.append('position', '6.8276, -5.2893');
    formData.append('inputType', 'audio');
    formData.append('audio', new Blob([buffer], { type: 'audio/wav' }), 'test.wav');
    
    console.log('Submitting audio request...');
    
    const response = await fetch(`${BASE_URL}/api/requests`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log(`Response status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    if (result.success && result.trackingCode) {
      console.log(`✅ PASS: Audio submitted successfully with code: ${result.trackingCode}`);
      return true;
    } else {
      console.log('❌ FAIL: Audio submission failed');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

// Test 3: Geolocation Data Saving
async function testGeolocationData() {
  console.log('\n📍 TEST 3: Geolocation Data Saving');
  console.log('=' .repeat(50));
  
  try {
    const testPosition = '6.8276, -5.2893';
    const testCode = 'EBF_' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const formData = new FormData();
    formData.append('name', 'Geolocation Test');
    formData.append('phone', '+225 99999999');
    formData.append('neighborhood', 'GPS Zone');
    formData.append('position', testPosition);
    formData.append('inputType', 'text');
    formData.append('description', 'Testing geolocation');
    
    console.log(`Submitting request with position: ${testPosition}`);
    
    const response = await fetch(`${BASE_URL}/api/requests`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log(`Response status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    if (result.success && result.trackingCode) {
      console.log(`✅ Request created: ${result.trackingCode}`);
      
      // Verify position was saved
      const trackingResponse = await fetch(`${BASE_URL}/api/tracking?code=${result.trackingCode}`);
      const trackingResult = await trackingResponse.json();
      
      if (trackingResult.success && trackingResult.data.latitude && trackingResult.data.longitude) {
        console.log(`✅ PASS: Geolocation saved successfully`);
        console.log(`   Latitude: ${trackingResult.data.latitude}`);
        console.log(`   Longitude: ${trackingResult.data.longitude}`);
        return true;
      } else {
        console.log('❌ FAIL: Geolocation not properly saved');
        return false;
      }
    } else {
      console.log('❌ FAIL: Request submission failed');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 RUNNING ALL TESTS FOR CLIENT FIXES');
  console.log('=' .repeat(50));
  
  const results = {
    'Tracking Code': await testTrackingCode(),
    'Audio Submission': await testAudioSubmission(),
    'Geolocation Data': await testGeolocationData()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  
  let passCount = 0;
  for (const [test, passed] of Object.entries(results)) {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    if (passed) passCount++;
  }
  
  console.log(`\nTotal: ${passCount}/${Object.keys(results).length} tests passed`);
  
  if (passCount === Object.keys(results).length) {
    console.log('\n🎉 ALL FIXES VALIDATED SUCCESSFULLY!\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - REVIEW NEEDED\n');
  }
}

// Run tests
runAllTests().catch(console.error);
