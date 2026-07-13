import os
import torch

import config
from .base import InferenceEngine
from .cpu_engine import CPUEngine
from .gpu_engine import create_gpu_engine
from .cloud_engine import CloudEngine


def create_engine() -> InferenceEngine:
    # Mode can be 'cloud' (no model download, API-driven) or 'local' (Stable Diffusion)
    mode = os.getenv("SKETCH_ENGINE_MODE", "cloud").lower()
    if mode == "cloud":
        return CloudEngine()

    if config.DEVICE == "cuda" and torch.cuda.is_available():
        return create_gpu_engine()
    return CPUEngine()
