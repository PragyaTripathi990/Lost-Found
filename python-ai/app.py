from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import base64
import io
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lost & Found AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CLIP model
logger.info("Loading CLIP model...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
logger.info("CLIP model loaded successfully!")

# Pydantic models
class TextEmbeddingRequest(BaseModel):
    text: str

class ImageEmbeddingRequest(BaseModel):
    image: str  # base64 encoded image

class EmbeddingResponse(BaseModel):
    embedding: list
    success: bool = True

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="OK",
        model_loaded=model is not None
    )

@app.post("/embed-text", response_model=EmbeddingResponse)
async def embed_text(request: TextEmbeddingRequest):
    """Generate text embedding using CLIP"""
    try:
        # Process text
        inputs = processor(text=[request.text], return_tensors="pt", padding=True, truncation=True)
        
        # Get text features
        with torch.no_grad():
            text_features = model.get_text_features(**inputs)
            # Normalize features
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        
        # Convert to list
        embedding = text_features[0].tolist()
        
        logger.info(f"Generated text embedding for: {request.text[:50]}...")
        return EmbeddingResponse(embedding=embedding)
        
    except Exception as e:
        logger.error(f"Error generating text embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text embedding failed: {str(e)}")

@app.post("/embed-image", response_model=EmbeddingResponse)
async def embed_image(request: ImageEmbeddingRequest):
    """Generate image embedding using CLIP"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Process image
        inputs = processor(images=[image], return_tensors="pt")
        
        # Get image features
        with torch.no_grad():
            image_features = model.get_image_features(**inputs)
            # Normalize features
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        
        # Convert to list
        embedding = image_features[0].tolist()
        
        logger.info(f"Generated image embedding for image of size: {image.size}")
        return EmbeddingResponse(embedding=embedding)
        
    except Exception as e:
        logger.error(f"Error generating image embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image embedding failed: {str(e)}")

@app.post("/embed-batch", response_model=dict)
async def embed_batch(requests: list):
    """Generate embeddings for multiple texts and images"""
    try:
        text_embeddings = []
        image_embeddings = []
        
        for request in requests:
            if 'text' in request:
                # Process text
                inputs = processor(text=[request['text']], return_tensors="pt", padding=True, truncation=True)
                with torch.no_grad():
                    text_features = model.get_text_features(**inputs)
                    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
                text_embeddings.append(text_features[0].tolist())
            
            if 'image' in request:
                # Process image
                image_data = base64.b64decode(request['image'])
                image = Image.open(io.BytesIO(image_data))
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                inputs = processor(images=[image], return_tensors="pt")
                with torch.no_grad():
                    image_features = model.get_image_features(**inputs)
                    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                image_embeddings.append(image_features[0].tolist())
        
        return {
            "text_embeddings": text_embeddings,
            "image_embeddings": image_embeddings,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error in batch embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch embedding failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
