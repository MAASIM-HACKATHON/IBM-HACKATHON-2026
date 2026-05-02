# WatsonX Model Setup Guide

## 🐛 Issue: Model Not Found

**Error**: `Model 'meta-llama/llama-3-8b-instruct' was not found`

This means the model ID in your configuration doesn't match what's available in your WatsonX instance.

---

## 🔍 How to Find Your Available Models

### Option 1: Check WatsonX Console (Recommended)

1. Go to [IBM WatsonX Console](https://dataplatform.cloud.ibm.com/)
2. Navigate to your project
3. Go to **Assets** → **Foundation Models**
4. Look for available models in the list
5. Copy the exact model ID

### Option 2: Use WatsonX API

```bash
# List available models
curl -X GET "https://us-south.ml.cloud.ibm.com/ml/v1/foundation_model_specs?version=2023-05-29" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 🎯 Common WatsonX Models

### IBM Granite Models (Recommended)
```bash
# Granite 3 8B (Best for resume parsing)
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct

# Granite 13B (More powerful, slower)
WATSONX_MODEL_ID=ibm/granite-13b-instruct-v2

# Granite 20B (Most powerful, slowest)
WATSONX_MODEL_ID=ibm/granite-20b-multilingual
```

### Meta Llama Models
```bash
# Llama 3 70B (Very powerful, expensive)
WATSONX_MODEL_ID=meta-llama/llama-3-70b-instruct

# Llama 2 70B (Older, still good)
WATSONX_MODEL_ID=meta-llama/llama-2-70b-chat

# Llama 2 13B (Smaller, faster)
WATSONX_MODEL_ID=meta-llama/llama-2-13b-chat
```

### Mistral Models
```bash
# Mixtral 8x7B (Good balance)
WATSONX_MODEL_ID=mistralai/mixtral-8x7b-instruct-v01

# Mistral 7B (Fast, efficient)
WATSONX_MODEL_ID=mistralai/mistral-7b-instruct-v0-2
```

---

## ✅ Recommended Model for Resume Parsing

### Best Choice: IBM Granite 3 8B Instruct

```bash
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```

**Why Granite?**
- ✅ Optimized for business documents
- ✅ Excellent JSON generation
- ✅ Good instruction following
- ✅ Cost-effective
- ✅ Fast processing
- ✅ Widely available on WatsonX

**Pricing**: ~$0.002 per 1K tokens (check your WatsonX pricing)

---

## 🔧 How to Update Your Configuration

### Step 1: Update .env

```bash
# In server/.env
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```

### Step 2: Restart Server

```bash
cd server
npm run dev
```

### Step 3: Test

Upload a resume and check logs:
```
✅ Watsonx AI client initialized successfully
🤖 Calling Watsonx Granite for resume parsing...
✅ Watsonx response received
```

---

## 🐛 Troubleshooting

### Error: "Model not found"

**Possible causes**:
1. Model ID has typo
2. Model not available in your region
3. Model not enabled in your project
4. Model deprecated/removed

**Solutions**:
1. Check exact model ID in WatsonX console
2. Try alternative model (Granite recommended)
3. Contact IBM support to enable model
4. Use different model from list above

### Error: "Unauthorized" or "Forbidden"

**Possible causes**:
1. API key expired
2. Project ID incorrect
3. Model not authorized for your account

**Solutions**:
1. Regenerate API key in WatsonX console
2. Verify project ID is correct
3. Check model permissions in project settings

### Error: "Rate limit exceeded"

**Possible causes**:
1. Too many requests
2. Free tier limits reached

**Solutions**:
1. Add delay between requests
2. Upgrade to paid tier
3. Enable caching (already done)

---

## 📊 Model Comparison for Resume Parsing

| Model | Speed | Quality | Cost | Recommendation |
|-------|-------|---------|------|----------------|
| **Granite 3 8B** | Fast | Excellent | Low | ⭐ Best for MVP |
| Granite 13B | Medium | Excellent | Medium | Good for production |
| Llama 3 70B | Slow | Excellent | High | Overkill |
| Mixtral 8x7B | Fast | Good | Medium | Alternative |
| Mistral 7B | Very Fast | Good | Low | Budget option |

---

## 🎯 Quick Fix for Your Issue

### Try This First (Granite)

```bash
# In server/.env
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```

Then restart:
```bash
cd server
npm run dev
```

### If Granite Doesn't Work

Try these in order:

1. **Granite 13B**:
   ```bash
   WATSONX_MODEL_ID=ibm/granite-13b-instruct-v2
   ```

2. **Mixtral 8x7B**:
   ```bash
   WATSONX_MODEL_ID=mistralai/mixtral-8x7b-instruct-v01
   ```

3. **Llama 2 13B**:
   ```bash
   WATSONX_MODEL_ID=meta-llama/llama-2-13b-chat
   ```

---

## 💡 How to Check Which Model Works

### Test Script

```bash
# Test Granite
echo "WATSONX_MODEL_ID=ibm/granite-3-8b-instruct" >> server/.env
cd server && npm run dev
# Upload resume, check if it works

# If fails, try Mixtral
echo "WATSONX_MODEL_ID=mistralai/mixtral-8x7b-instruct-v01" >> server/.env
cd server && npm run dev
# Upload resume, check if it works
```

---

## 📝 Update Cost Tracking

After finding your model, update the cost:

```bash
# In server/.env

# For Granite 3 8B
COST_PER_1K_TOKENS=0.002

# For Llama 3 70B
COST_PER_1K_TOKENS=0.004

# For Mixtral 8x7B
COST_PER_1K_TOKENS=0.0015
```

Check your actual WatsonX pricing at:
https://www.ibm.com/products/watsonx-ai/pricing

---

## ✅ Summary

**Problem**: Model ID not found  
**Solution**: Use `ibm/granite-3-8b-instruct`  
**Backup**: Try Mixtral or Llama 2 models  
**How to find**: Check WatsonX console for available models  

**Next Steps**:
1. Update `WATSONX_MODEL_ID` in `.env`
2. Restart server
3. Test with resume upload
4. Verify in logs

---

**Status**: ⚠️ Needs Model Configuration  
**Recommended**: `ibm/granite-3-8b-instruct`  
**Alternative**: `mistralai/mixtral-8x7b-instruct-v01`
