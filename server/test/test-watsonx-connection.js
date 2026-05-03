/**
 * Watsonx Connection Test Script
 * Tests if your watsonx.ai credentials are working
 */

require('dotenv').config();
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

async function testWatsonxConnection() {
  console.log('\n🔍 Testing Watsonx.ai Connection...\n');
  
  // Check environment variables
  console.log('📋 Configuration Check:');
  console.log('  WATSONX_API_KEY:', process.env.WATSONX_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('  WATSONX_PROJECT_ID:', process.env.WATSONX_PROJECT_ID ? '✅ Set' : '❌ Missing');
  console.log('  WATSONX_URL:', process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com');
  
  if (!process.env.WATSONX_API_KEY || !process.env.WATSONX_PROJECT_ID) {
    console.log('\n❌ Missing required credentials. Please check your .env file.\n');
    return;
  }
  
  try {
    console.log('\n🔌 Initializing Watsonx client...');
    
    const watsonxClient = new WatsonXAI({
      version: '2023-05-29',
      serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSONX_API_KEY
      })
    });
    
    console.log('✅ Client initialized successfully\n');
    
    console.log('🚀 Sending test request to Watsonx...');
    console.log('   Model: ibm/granite-3-8b-instruct');
    console.log('   Prompt: "Hello, this is a connection test."\n');
    
    const startTime = Date.now();
    
    const response = await watsonxClient.generateText({
      modelId: 'ibm/granite-3-8b-instruct',
      projectId: process.env.WATSONX_PROJECT_ID,
      input: 'Hello, this is a connection test. Please respond with "Connection successful".',
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
        top_p: 0.9
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Response received!\n');
    console.log('📊 Response Details:');
    console.log('  Duration:', duration + 'ms');
    console.log('  Generated Text:', response.result.generated_text);
    console.log('  Tokens Used:', response.result.generated_token_count || 'N/A');
    console.log('  Model ID:', response.result.model_id);
    
    console.log('\n✅ CONNECTION TEST PASSED! Your Watsonx.ai is working correctly.\n');
    
  } catch (error) {
    console.log('\n❌ CONNECTION TEST FAILED!\n');
    console.error('Error Details:');
    
    if (error.status) {
      console.error('  Status Code:', error.status);
    }
    
    if (error.statusText) {
      console.error('  Status Text:', error.statusText);
    }
    
    if (error.message) {
      console.error('  Message:', error.message);
    }
    
    if (error.body) {
      console.error('  Body:', JSON.stringify(error.body, null, 2));
    }
    
    console.log('\n💡 Common Issues:');
    console.log('  1. Invalid API Key - Check your WATSONX_API_KEY in .env');
    console.log('  2. Invalid Project ID - Verify WATSONX_PROJECT_ID is correct');
    console.log('  3. Network Issues - Check your internet connection');
    console.log('  4. Service URL - Ensure WATSONX_URL matches your region');
    console.log('  5. API Key Permissions - Verify your API key has access to Watsonx.ai');
    console.log('\n');
  }
}

// Run the test
testWatsonxConnection();
